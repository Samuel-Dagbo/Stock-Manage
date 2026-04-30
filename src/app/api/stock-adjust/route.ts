import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/connection"
import { Product, InventoryMovement } from "@/lib/db/models"
import { logAudit } from "@/lib/audit"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { productId, type, quantity, reason } = body

    if (!productId || !type || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectDB()

    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    let newQuantity = product.stockQuantity
    let changeAmount = 0
    const prevQty = product.stockQuantity

    if (type === "stock_in") {
      newQuantity = product.stockQuantity + parseInt(quantity)
      changeAmount = parseInt(quantity)
    } else if (type === "stock_out") {
      newQuantity = Math.max(0, product.stockQuantity - parseInt(quantity))
      changeAmount = -parseInt(quantity)
    } else if (type === "adjustment") {
      const qty = parseInt(quantity)
      newQuantity = Math.max(0, product.stockQuantity + qty)
      changeAmount = qty
    }

    await Product.findByIdAndUpdate(productId, { stockQuantity: newQuantity })

    const reference = `ADJ-${Date.now().toString(36).toUpperCase()}`
    const movement = await InventoryMovement.create({
      product: productId,
      shop: session.user.shop,
      type,
      quantity: changeAmount,
      previousQuantity: prevQty,
      newQuantity,
      reference,
      reason: reason || "",
      performedBy: session.user.id,
    })

    await logAudit({
      action: "stock_adjust",
      entity: "inventory_movement",
      entityId: movement._id.toString(),
      metadata: { productId, type, quantity: changeAmount, prevQty, newQuantity, reason },
      request: req,
    })

    return NextResponse.json({ 
      success: true, 
      movement,
      newQuantity 
    })
  } catch (error) {
    console.error("Error adjusting stock:", error)
    return NextResponse.json({ error: "Failed to adjust stock" }, { status: 500 })
  }
}