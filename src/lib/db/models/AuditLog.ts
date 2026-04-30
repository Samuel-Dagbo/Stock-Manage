import mongoose, { Schema, Document } from "mongoose"

export interface IAuditLog extends Document {
  shop: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  action: "create" | "update" | "delete" | "login" | "logout" | "sale" | "stock_adjust" | "approve" | "reject"
  entity: "user" | "product" | "category" | "customer" | "supplier" | "expense" | "sale" | "shop" | "inventory" | "inventory_movement"
  entityId?: string
  changes?: Record<string, { from: any; to: any }>
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: {
      type: String,
      enum: ["create", "update", "delete", "login", "logout", "sale", "stock_adjust", "approve", "reject"],
      required: true,
      index: true,
    },
    entity: {
      type: String,
      enum: ["user", "product", "category", "customer", "supplier", "expense", "sale", "shop", "inventory", "inventory_movement"],
      required: true,
      index: true,
    },
    entityId: { type: String, index: true },
    changes: { type: Schema.Types.Mixed },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

AuditLogSchema.index({ shop: 1, createdAt: -1 })
AuditLogSchema.index({ shop: 1, entity: 1, entityId: 1 })

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema)