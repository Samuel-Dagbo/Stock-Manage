import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/connection"
import { User } from "@/lib/db/models"
import { compare } from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isValid = await compare(password, user.password)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (!user.isApproved) {
      return NextResponse.json({ status: "pending" }, { status: 403 })
    }

    if (!user.isActive) {
      return NextResponse.json({ status: "inactive" }, { status: 403 })
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("Check status error:", error)
    return NextResponse.json({ error: "Error checking status" }, { status: 500 })
  }
}