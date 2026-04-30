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

    const allUsers = await User.find({
      _id: { $ne: session.user.id },
    }).select("name email role isActive isApproved createdAt phone")

    return NextResponse.json({
      pending: pendingUsers,
      users: allUsers,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}