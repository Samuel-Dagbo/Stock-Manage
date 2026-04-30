import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/connection"
import { Product, InventoryMovement } from "@/lib/db/models"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const movements = await InventoryMovement.find({ shop: session.user.shop })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    const movementsWithProduct = await Promise.all(
      movements.map(async (m) => {
        const product = await Product.findById(m.product).lean()
        return {
          _id: m._id,
          productId: m.product,
          productName: product?.name || "Unknown Product",
          type: m.type,
          quantity: m.quantity,
          reference: m.reference,
          date: m.createdAt,
        }
      })
    )

    return NextResponse.json({ movements: movementsWithProduct })
  } catch (error) {
    console.error("Error fetching stock movements:", error)
    return NextResponse.json({ error: "Failed to fetch movements" }, { status: 500 })
  }
}