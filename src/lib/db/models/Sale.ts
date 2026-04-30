import mongoose, { Schema, Document, Model } from "mongoose"

export interface ISaleItem {
  product: mongoose.Types.ObjectId
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  costPrice: number
  discount: number
  total: number
  variantName?: string
}

export interface ISale extends Document {
  _id: mongoose.Types.ObjectId
  receiptNumber: string
  shop: mongoose.Types.ObjectId
  customer?: mongoose.Types.ObjectId
  cashier: mongoose.Types.ObjectId
  items: ISaleItem[]
  subtotal: number
  discountType: "percentage" | "fixed"
  discountValue: number
  discountAmount: number
  taxRate: number
  taxAmount: number
  total: number
  amountPaid: number
  change: number
  paymentMethod: "cash" | "momo" | "card" | "mixed"
  paymentDetails?: {
    provider?: string
    transactionId?: string
    phone?: string
  }
  status: "completed" | "refunded" | "partial"
  refundedAmount?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const SaleSchema = new Schema<ISale>(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
    },
    cashier: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        productName: String,
        sku: String,
        quantity: Number,
        unitPrice: Number,
        costPrice: Number,
        discount: Number,
        total: Number,
        variantName: String,
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    discountValue: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    change: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "momo", "card", "mixed"],
      required: true,
    },
    paymentDetails: {
      provider: String,
      transactionId: String,
      phone: String,
    },
    status: {
      type: String,
      enum: ["completed", "refunded", "partial"],
      default: "completed",
    },
    refundedAmount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

SaleSchema.index({ shop: 1, createdAt: -1 })
SaleSchema.index({ customer: 1 })
SaleSchema.index({ cashier: 1 })

export const Sale: Model<ISale> =
  mongoose.models.Sale || mongoose.model<ISale>("Sale", SaleSchema)