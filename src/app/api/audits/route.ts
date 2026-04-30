import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/connection"
import { AuditLog, User } from "@/lib/db/models"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action") || ""
    const entity = searchParams.get("entity") || ""
    const search = searchParams.get("search") || ""
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)

    await connectDB()

    const query: Record<string, unknown> = { shop: session.user.shop }

    if (action && action !== "all") {
      query.action = action
    }

    if (entity && entity !== "all") {
      query.entity = entity
    }

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {}
      if (startDate) dateFilter.$gte = new Date(startDate)
      if (endDate) dateFilter.$lte = new Date(endDate + "T23:59:59.999Z")
      query.createdAt = dateFilter
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query),
    ])

    const formattedLogs = logs.map((log: any) => ({
      _id: log._id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      changes: log.changes,
      metadata: log.metadata,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt,
      user: log.user
        ? {
            name: log.user.name,
            email: log.user.email,
          }
        : null,
    }))

    return NextResponse.json({
      logs: formattedLogs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 })
  }
}