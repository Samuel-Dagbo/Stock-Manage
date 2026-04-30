import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/connection"
import { User } from "@/lib/db/models"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get pending users for the same shop
    const pendingUsers = await User.find({
      shop: session.user.shop,
      role: "pending",
    }).select("name email phone createdAt")

    // Get all users for the shop (except current user)
    const allUsers = await User.find({
      shop: session.user.shop,
      _id: { $ne: session.user.id },
    }).select("name email role isActive isApproved createdAt")

    return NextResponse.json({
      pending: pendingUsers,
      users: allUsers,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId, action, role } = body

    await connectDB()

    if (action === "approve") {
      await User.findByIdAndUpdate(userId, {
        isApproved: true,
        role: role || "staff",
      })
      return NextResponse.json({ success: true, message: "User approved" })
    }

    if (action === "reject") {
      await User.findByIdAndDelete(userId)
      return NextResponse.json({ success: true, message: "User rejected" })
    }

    if (action === "deactivate") {
      await User.findByIdAndUpdate(userId, { isActive: false })
      return NextResponse.json({ success: true, message: "User deactivated" })
    }

    if (action === "activate") {
      await User.findByIdAndUpdate(userId, { isActive: true })
      return NextResponse.json({ success: true, message: "User activated" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}