import mongoose, { Schema, Document, Model } from "mongoose"

export interface IInventoryMovement extends Document {
  _id: mongoose.Types.ObjectId
  product: mongoose.Types.ObjectId
  shop: mongoose.Types.ObjectId
  type: "stock_in" | "stock_out" | "adjustment" | "sale" | "return"
  quantity: number
  previousQuantity: number
  newQuantity: number
  reference?: string
  reason?: string
  performedBy: mongoose.Types.ObjectId
  createdAt: Date
}

const InventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    type: {
      type: String,
      enum: ["stock_in", "stock_out", "adjustment", "sale", "return"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    reference: {
      type: String,
    },
    reason: {
      type: String,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

InventoryMovementSchema.index({ product: 1 })
InventoryMovementSchema.index({ shop: 1 })
InventoryMovementSchema.index({ createdAt: -1 })

export const InventoryMovement: Model<IInventoryMovement> =
  mongoose.models.InventoryMovement ||
  mongoose.model<IInventoryMovement>(
    "InventoryMovement",
    InventoryMovementSchema
  )