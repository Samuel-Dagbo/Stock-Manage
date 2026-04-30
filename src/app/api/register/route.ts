import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db/connection"
import { User, Shop } from "@/lib/db/models"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"

export async function POST(request: Request) {
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
    const body = await request.json()
    const { name, email, phone, password, shopName, shopType } = body

    if (!name || !email || !password || !shopName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400, headers }
      )
    }

    await connectDB()

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400, headers }
      )
    }

    const shop = await Shop.create({
      name: shopName,
      slug: shopName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
      type: shopType || "shop",
      phone: phone || "",
      email: email,
      currency: "GHS",
      locale: "en-GH",
      taxRate: 15,
      isActive: true,
      receiptSettings: {
        showLogo: true,
        showAddress: true,
        showPhone: true,
        footerMessage: "Thank you for your business!",
        terms: "No refunds on opened items",
      },
    })

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || "",
      role: "owner",
      shop: shop._id,
      isActive: true,
      isApproved: false,
    })

    shop.owner = user._id
    await shop.save()

    return NextResponse.json({
      success: true,
      message: "Account created. Waiting for approval.",
      userId: user._id,
    }, { headers })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500, headers }
    )
  }
}