import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/connection"
import { Supplier } from "@/lib/db/models"
import { logAudit, getChangedFields } from "@/lib/audit"

const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  contactPerson: z.string().optional().default(""),
  email: z.string().email("Invalid email address").optional().or(z.literal("")).default(""),
  phone: z.string().optional().default(""),
  address: z.string().optional().default(""),
  notes: z.string().optional().default(""),
})

const updateSupplierSchema = supplierSchema.partial()

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

    await connectDB()

    const query: Record<string, unknown> = { shop: session.user.shop }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { contactPerson: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ]
    }

    const [suppliers, total] = await Promise.all([
      Supplier.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Supplier.countDocuments(query),
    ])

    return NextResponse.json({
      suppliers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const validation = supplierSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const existingSupplier = await Supplier.findOne({
      shop: session.user.shop,
      name: body.name,
    })

    if (existingSupplier) {
      return NextResponse.json(
        { error: "Supplier with this name already exists" },
        { status: 400 }
      )
    }

    await connectDB()

    const supplier = await Supplier.create({
      ...validation.data,
      shop: session.user.shop,
    })

    await logAudit({
      action: "create",
      entity: "supplier",
      entityId: supplier._id.toString(),
      metadata: { name: supplier.name, email: supplier.email },
      request,
    })

    return NextResponse.json({ success: true, supplier }, { status: 201 })
  } catch (error) {
    console.error("Error creating supplier:", error)
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 })
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
      return NextResponse.json({ error: "Supplier ID required" }, { status: 400 })
    }

    const body = await request.json()

    const validation = updateSupplierSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      )
    }

    await connectDB()

    const originalSupplier = await Supplier.findOne({
      _id: id,
      shop: session.user.shop,
    }).lean()

    const supplier = await Supplier.findOneAndUpdate(
      { _id: id, shop: session.user.shop },
      { $set: validation.data },
      { new: true }
    )

    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }

    await logAudit({
      action: "update",
      entity: "supplier",
      entityId: id,
      changes: getChangedFields(originalSupplier as any, validation.data),
      request,
    })

    return NextResponse.json({ success: true, supplier })
  } catch (error) {
    console.error("Error updating supplier:", error)
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 })
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
      return NextResponse.json({ error: "Supplier ID required" }, { status: 400 })
    }

    await connectDB()

    const supplier = await Supplier.findOneAndDelete({
      _id: id,
      shop: session.user.shop,
    })

    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }

    await logAudit({
      action: "delete",
      entity: "supplier",
      entityId: id,
      metadata: { name: supplier.name, email: supplier.email },
      request,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting supplier:", error)
    return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 })
  }
}