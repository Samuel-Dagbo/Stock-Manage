import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/connection"
import mongoose from "mongoose"
import { Sale, Product, Customer } from "@/lib/db/models"
import { logAudit, getChangedFields } from "@/lib/audit"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"

const saleItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.number().min(0, "Price must be positive"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  total: z.number().min(0, "Total must be positive"),
})

const createSaleSchema = z.object({
  items: z.array(saleItemSchema).min(1, "At least one item is required"),
  subtotal: z.number().min(0),
  discountAmount: z.number().min(0).optional().default(0),
  taxAmount: z.number().min(0).optional().default(0),
  total: z.number().min(0),
  paymentMethod: z.enum(["cash", "momo", "card"]).optional().default("cash"),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
    const status = searchParams.get("status")
    const dateFilter = searchParams.get("date")

    await connectDB()

    const query: Record<string, unknown> = { shop: session.user.shop }

    if (status && status !== "all") {
      query.status = status
    }

    if (dateFilter && dateFilter !== "all") {
      const now = new Date()
      let startDate: Date

      switch (dateFilter) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case "yesterday":
          startDate = new Date(now.setDate(now.getDate() - 1))
          startDate.setHours(0, 0, 0, 0)
          break
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7))
          break
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1))
          break
        default:
          startDate = new Date(0)
      }

      query.createdAt = { $gte: startDate }
    }

    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate("customer", "name")
        .populate("cashier", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Sale.countDocuments(query),
    ])

    const salesWithItems = sales.map(sale => ({
      _id: sale._id,
      receiptNumber: sale.receiptNumber,
      customer: sale.customer ? { name: (sale.customer as unknown as { name: string }).name } : null,
      items: sale.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.unitPrice,
        total: item.total,
      })),
      subtotal: sale.subtotal,
      tax: sale.taxAmount,
      discount: sale.discountAmount,
      total: sale.total,
      paymentMethod: sale.paymentMethod,
      status: sale.status,
      createdAt: sale.createdAt,
    }))

    return NextResponse.json({
      sales: salesWithItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching sales:", error)
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
             request.headers.get("x-real-ip") ||
             "unknown"
  const rateLimitKey = getRateLimitKey(ip, "/api/sales")
  const rateResult = rateLimit(rateLimitKey, 30, 60 * 1000)
  
  if (!rateResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()

    const validation = createSaleSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { items, subtotal, discountAmount, taxAmount, total, paymentMethod, customerId } = validation.data

    await connectDB()

    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    const receiptNumber = `RCP-${year}${month}-${random}`

    const mongoSession = await mongoose.startSession()
    mongoSession.startTransaction()

    try {
      for (const item of items) {
        const product = await Product.findOne({
          _id: item.productId,
          shop: session.user.shop,
        }).session(mongoSession)

        if (!product) {
          throw new Error(`Product not found: ${item.name}`)
        }

        if (product.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${item.name}. Available: ${product.stockQuantity}`)
        }

        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stockQuantity: -item.quantity } },
          { session: mongoSession }
        )
      }

      const sale = await Sale.create(
        [
          {
            receiptNumber,
            shop: session.user.shop,
            customer: customerId || undefined,
            cashier: session.user.id,
            items: items.map(item => ({
              product: item.productId,
              productName: item.name,
              sku: item.sku,
              quantity: item.quantity,
              unitPrice: item.price,
              costPrice: 0,
              discount: 0,
              total: item.total,
            })),
            subtotal,
            discountType: "percentage",
            discountValue: 0,
            discountAmount: discountAmount || 0,
            taxRate: 15,
            taxAmount: taxAmount || 0,
            total,
            amountPaid: total,
            change: 0,
            paymentMethod,
            status: "completed",
          },
        ],
        { session: mongoSession }
      )

      if (customerId) {
        await Customer.findByIdAndUpdate(
          customerId,
          {
            $inc: {
              totalSpent: total,
              loyaltyPoints: Math.floor(total / 10),
            },
          },
          { session: mongoSession }
        )
      }

      await mongoSession.commitTransaction()

      await logAudit({
        action: "create",
        entity: "sale",
        entityId: sale[0]._id.toString(),
        metadata: { receiptNumber, total, itemCount: items.length, paymentMethod },
        request,
      })

      return NextResponse.json({ success: true, sale: sale[0] }, { status: 201 })
    } catch (error) {
      await mongoSession.abortTransaction()
      throw error
    } finally {
      mongoSession.endSession()
    }
  } catch (error: any) {
    console.error("Error creating sale:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create sale" },
      { status: 500 }
    )
  }
}