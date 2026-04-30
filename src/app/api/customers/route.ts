import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/connection"
import { Customer } from "@/lib/db/models"
import { logAudit } from "@/lib/audit"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    await connectDB()

    const query: Record<string, unknown> = { shop: session.user.shop }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ]
    }

    const total = await Customer.countDocuments(query)
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return NextResponse.json({
      customers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, whatsapp, address } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    await connectDB()

    const customer = await Customer.create({
      name,
      email: email || "",
      phone: phone || "",
      whatsapp: whatsapp || "",
      address: address || "",
      loyaltyPoints: 0,
      totalSpent: 0,
      shop: session.user.shop,
    })

    await logAudit({
      action: "create",
      entity: "customer",
      entityId: customer._id.toString(),
      metadata: { name: customer.name, email: customer.email },
      request,
    })

    return NextResponse.json({ success: true, customer })
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}