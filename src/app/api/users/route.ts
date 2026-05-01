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

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await connectDB()

    const pendingUsers = await User.find({
      role: "pending",
    }).select("name email phone createdAt")

    const allUsers = await User.find({}).select("name email role isActive isApproved createdAt phone")

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

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { userId, action, role } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectDB()

    switch (action) {
      case "approve": {
        await User.findByIdAndUpdate(userId, {
          role: role || "staff",
          isApproved: true,
        })
        break
      }
      case "reject": {
        await User.findByIdAndDelete(userId)
        break
      }
      case "deactivate": {
        await User.findByIdAndUpdate(userId, { isActive: false })
        break
      }
      case "activate": {
        await User.findByIdAndUpdate(userId, { isActive: true })
        break
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}