import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/connection"
import { Category } from "@/lib/db/models"
import { logAudit, getChangedFields } from "@/lib/audit"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const categories = await Category.find({ shop: session.user.shop })
      .sort({ name: 1 })
      .lean()

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name } = await request.json()
    if (!name) {
      return NextResponse.json({ error: "Category name required" }, { status: 400 })
    }

    await connectDB()

    const existing = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, "i") },
      shop: session.user.shop 
    })

    if (existing) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 })
    }

    const category = await Category.create({
      name,
      shop: session.user.shop,
    })

    await logAudit({
      action: "create",
      entity: "category",
      entityId: category._id.toString(),
      metadata: { name: category.name },
      request,
    })

    return NextResponse.json({ success: true, category })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
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
      return NextResponse.json({ error: "Category ID required" }, { status: 400 })
    }

    await connectDB()

    const deletedCategory = await Category.findOneAndDelete({ _id: id, shop: session.user.shop }).lean()

    if (!deletedCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    await logAudit({
      action: "delete",
      entity: "category",
      entityId: id,
      metadata: { name: (deletedCategory as any).name },
      request,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
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
    const { name } = await request.json()

    if (!id || !name) {
      return NextResponse.json({ error: "Category ID and name required" }, { status: 400 })
    }

    await connectDB()

    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      shop: session.user.shop,
      _id: { $ne: id }
    })

    if (existing) {
      return NextResponse.json({ error: "Category name already exists" }, { status: 400 })
    }

    const originalCategory = await Category.findOne({
      _id: id,
      shop: session.user.shop,
    }).lean()

    const category = await Category.findOneAndUpdate(
      { _id: id, shop: session.user.shop },
      { name },
      { new: true }
    )

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    await logAudit({
      action: "update",
      entity: "category",
      entityId: id,
      changes: getChangedFields(originalCategory as any, { name }),
      request,
    })

    return NextResponse.json({ success: true, category })
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}