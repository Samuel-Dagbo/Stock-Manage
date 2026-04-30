import { AuditLog } from "@/lib/db/models/AuditLog"
import { auth } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/connection"

type AuditAction = "create" | "update" | "delete" | "login" | "logout" | "sale" | "stock_adjust" | "approve" | "reject"
type AuditEntity = "user" | "product" | "category" | "customer" | "supplier" | "expense" | "sale" | "shop" | "inventory" | "inventory_movement"

interface AuditLogParams {
  action: AuditAction
  entity: AuditEntity
  entityId?: string
  changes?: Record<string, { from: any; to: any }>
  metadata?: Record<string, any>
  request?: Request
}

export async function logAudit({
  action,
  entity,
  entityId,
  changes,
  metadata,
  request,
}: AuditLogParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) return

    await connectDB()

    await AuditLog.create({
      shop: session.user.shop,
      user: session.user.id,
      action,
      entity,
      entityId,
      changes,
      metadata,
      ipAddress: request?.headers.get("x-forwarded-for")?.split(",")[0] ||
                 request?.headers.get("x-real-ip") ||
                 "unknown",
      userAgent: request?.headers.get("user-agent") || "unknown",
    })
  } catch (error) {
    console.error("Failed to create audit log:", error)
  }
}

export function getChangedFields<T extends Record<string, any>>(
  original: T,
  updated: Partial<T>
): Record<string, { from: any; to: any }> {
  const changes: Record<string, { from: any; to: any }> = {}

  for (const key in updated) {
    if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
      changes[key] = {
        from: original[key],
        to: updated[key],
      }
    }
  }

  return changes
}