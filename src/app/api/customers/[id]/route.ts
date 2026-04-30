import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/connection"
import { Customer } from "@/lib/db/models"
import { logAudit, getChangedFields } from "@/lib/audit"

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

    const originalCustomer = await Customer.findOne({
      _id: id,
      shop: session.user.shop,
    }).lean()

    const customer = await Customer.findOneAndUpdate(
      { _id: id, shop: session.user.shop },
      { $set: body },
      { new: true }
    )

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    await logAudit({
      action: "update",
      entity: "customer",
      entityId: id,
      changes: getChangedFields(originalCustomer as any, body),
      request,
    })

    return NextResponse.json({ success: true, customer })
  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
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

    const customer = await Customer.findOneAndDelete({
      _id: id,
      shop: session.user.shop,
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    await logAudit({
      action: "delete",
      entity: "customer",
      entityId: id,
      metadata: { name: customer.name, email: customer.email },
      request,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting customer:", error)
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
}