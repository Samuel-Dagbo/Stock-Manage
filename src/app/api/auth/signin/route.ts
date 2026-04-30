import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/connection"
import { User } from "@/lib/db/models"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { compare } from "bcryptjs"
import { signIn } from "@/lib/auth/config"

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
             request.headers.get("x-real-ip") ||
             "unknown"
  
  const loginKey = getRateLimitKey(ip, "/api/auth/signin")
  const result = rateLimit(loginKey, 10, 60 * 1000)
  
  if (!result.success) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": result.resetAt.toString(),
        },
      }
    )
  }

  const body = await request.json()
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    )
  }

  try {
    await connectDB()

    const user = await User.findOne({ email }).populate("shop")

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    const isValid = await compare(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    if (!user.isApproved) {
      return NextResponse.json(
        { error: "pending_approval" },
        { status: 403 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "account_inactive" },
        { status: 403 }
      )
    }

    await signIn("credentials", { email, password, redirect: false })

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        shop: (user.shop as unknown as { _id: { toString: () => string } })?._id?.toString() || "",
      },
    })
  } catch (error: any) {
    if (error.message === "pending_approval" || error.message === "account_inactive") {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "An error occurred during sign in" },
      { status: 500 }
    )
  }
}