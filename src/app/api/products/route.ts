import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/connection"
import { Product, Category } from "@/lib/db/models"
import { logAudit, getChangedFields } from "@/lib/audit"

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  category: z.string().optional(),
  images: z.array(z.string()).optional().default([]),
  hasVariants: z.boolean().optional().default(false),
  variants: z.array(z.any()).optional().default([]),
  basePrice: z.number().min(0).optional().default(0),
  costPrice: z.number().min(0).optional().default(0),
  sellingPrice: z.number().min(0, "Selling price must be positive"),
  stockQuantity: z.number().min(0).optional().default(0),
  reorderLevel: z.number().min(0).optional().default(10),
  unit: z.string().optional().default("piece"),
  isActive: z.boolean().optional().default(true),
})

const updateSchema = productSchema.partial()

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
    const category = searchParams.get("category")

    await connectDB()

    const query: Record<string, unknown> = { shop: session.user.shop }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
      ]
    }

    if (category && category !== "all") {
      query.category = category
    }

    const [products, total, categories] = await Promise.all([
      Product.find(query)
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
      Category.find({ shop: session.user.shop }).sort({ name: 1 }).lean(),
    ])

    const formattedProducts = products.map((p: any) => ({
      _id: p._id,
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      category: p.category,
      images: Array.isArray(p.images) ? p.images : [],
      hasVariants: p.hasVariants || false,
      variants: p.variants || [],
      basePrice: p.basePrice || 0,
      costPrice: p.costPrice || 0,
      sellingPrice: p.sellingPrice || 0,
      stockQuantity: p.stockQuantity || 0,
      reorderLevel: p.reorderLevel || 10,
      unit: p.unit || "piece",
      isActive: p.isActive !== false,
    }))

    return NextResponse.json({
      products: formattedProducts,
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const validation = productSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const existingProduct = await Product.findOne({
      shop: session.user.shop,
      $or: [{ sku: body.sku }, { barcode: body.barcode?.filter(Boolean).length ? body.barcode : null }],
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: "Product with this SKU or barcode already exists" },
        { status: 400 }
      )
    }

    await connectDB()

    const product = await Product.create({
      ...validation.data,
      shop: session.user.shop,
    })

    await logAudit({
      action: "create",
      entity: "product",
      entityId: product._id.toString(),
      metadata: { name: product.name, sku: product.sku },
      request,
    })

    return NextResponse.json({ success: true, product }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 })
    }

    const body = await request.json()

    const validation = updateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      )
    }

    await connectDB()

    const originalProduct = await Product.findOne({
      _id: id,
      shop: session.user.shop,
    }).lean()

    const product = await Product.findOneAndUpdate(
      { _id: id, shop: session.user.shop },
      { $set: validation.data },
      { new: true }
    )

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    await logAudit({
      action: "update",
      entity: "product",
      entityId: id,
      changes: getChangedFields(originalProduct as any, validation.data),
      request,
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 })
    }

    await connectDB()

    const product = await Product.findOneAndDelete({
      _id: id,
      shop: session.user.shop,
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    await logAudit({
      action: "delete",
      entity: "product",
      entityId: id,
      metadata: { name: product.name, sku: product.sku },
      request,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}