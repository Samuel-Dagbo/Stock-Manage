import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/connection"
import { Product } from "@/lib/db/models"
import { logAudit, getChangedFields } from "@/lib/audit"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await connectDB()

    const product = await Product.findOne({
      _id: id,
      shop: session.user.shop,
    }).populate("category", "name").populate("supplier", "name")

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    await connectDB()

    const originalProduct = await Product.findOne({
      _id: id,
      shop: session.user.shop,
    }).lean()

    const product = await Product.findOneAndUpdate(
      { _id: id, shop: session.user.shop },
      { $set: body },
      { new: true }
    )

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    await logAudit({
      action: "update",
      entity: "product",
      entityId: id,
      changes: getChangedFields(originalProduct as any, body),
      request,
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
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