import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db/connection"
import { User, Shop } from "@/lib/db/models"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"

const DEFAULT_SHOP_SLUG = "default-shop"

async function getOrCreateDefaultShop() {
  let shop = await Shop.findOne({ slug: DEFAULT_SHOP_SLUG })
  
  if (!shop) {
    shop = await Shop.create({
      name: "Main Store",
      slug: DEFAULT_SHOP_SLUG,
      type: "supermarket",
      phone: "+233 50 000 0000",
      email: "store@stockmanage.com",
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
  }
  
  return shop
}

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
    const { name, email, phone, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400, headers }
      )
    }

    // Connect to database
    await connectDB()

    // Check existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400, headers }
      )
    }

    // Get or create shop
    let shop
    try {
      shop = await getOrCreateDefaultShop()
    } catch (shopError) {
      console.error("Shop error:", shopError)
      // Continue without shop if it fails
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const userData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone?.trim() || "",
      role: "pending",
      isActive: true,
      isApproved: false,
    }

    // Add shop if available
    if (shop && shop._id) {
      userData.shop = shop._id
    }

    await User.create(userData)

    return NextResponse.json(
      { success: true, message: "Account created. Waiting for admin approval." },
      { headers }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500, headers }
    )
  }
}