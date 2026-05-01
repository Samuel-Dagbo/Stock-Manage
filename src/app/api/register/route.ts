import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db/connection"
import { User } from "@/lib/db/models"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"

export async function POST(request: Request) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  const key = getRateLimitKey(ip, "/api/register")
  const { success, remaining, resetAt } = rateLimit(key, 5, 60000)

  const headers = {
    "X-RateLimit-Limit": "5",
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": resetAt.toString(),
  }

  if (!success) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429, headers }
    )
  }

  try {
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400, headers }
      )
    }

    const { name, email, phone, password } = body

    // Validate
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400, headers }
      )
    }

    // Connect to database
    await connectDB()

    // Check if email exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400, headers }
      )
    }

    // Check if any users exist - first user becomes admin
    const userCount = await User.countDocuments()
    const role = userCount === 0 ? "admin" : "pending"
    const isApproved = userCount === 0

    // Create user
    const hashedPassword = await bcrypt.hash(password, 12)
    
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone?.trim() || "",
      role: role,
      isActive: true,
      isApproved: isApproved,
    })

    const message = userCount === 0 
      ? "Admin account created. You can now access the dashboard."
      : "Account created. Waiting for admin approval."

    return NextResponse.json(
      { success: true, message, role: role },
      { headers }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Unable to create account. Please try again." },
      { status: 500, headers }
    )
  }
}