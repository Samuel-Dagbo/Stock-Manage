import mongoose, { Schema, Document, Model } from "mongoose"

export interface ICustomer extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email?: string
  phone: string
  whatsapp?: string
  address?: string
  loyaltyPoints: number
  totalSpent: number
  totalOrders: number
  shop: mongoose.Types.ObjectId
  notes?: string
  tags?: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
    },
    address: {
      type: String,
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    notes: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

CustomerSchema.index({ shop: 1 })
CustomerSchema.index({ phone: 1, shop: 1 })

export const Customer: Model<ICustomer> =
  mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema)