import mongoose, { Schema, Document, Model } from "mongoose"

export interface IShop extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  slug: string
  type: string
  logo?: string
  coverImage?: string
  description?: string
  phone?: string
  email?: string
  address?: string
  currency: string
  locale: string
  taxRate: number
  receiptSettings: {
    showLogo: boolean
    showAddress: boolean
    showPhone: boolean
    footerMessage: string
    terms: string
  }
  businessHours?: {
    [key: string]: { open: string; close: string; closed: boolean }
  }
  owner: mongoose.Types.ObjectId
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ShopSchema = new Schema<IShop>(
  {
    name: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    type: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    description: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
    currency: {
      type: String,
      default: "GHS",
    },
    locale: {
      type: String,
      default: "en-GH",
    },
    taxRate: {
      type: Number,
      default: 0,
    },
    receiptSettings: {
      showLogo: { type: Boolean, default: true },
      showAddress: { type: Boolean, default: true },
      showPhone: { type: Boolean, default: true },
      footerMessage: { type: String, default: "Thank you for your business!" },
      terms: { type: String, default: "" },
    },
    businessHours: {
      type: Map,
      of: new Schema(
        {
          open: String,
          close: String,
          closed: Boolean,
        },
        { _id: false }
      ),
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

ShopSchema.index({ owner: 1 })

export const Shop: Model<IShop> =
  mongoose.models.Shop || mongoose.model<IShop>("Shop", ShopSchema)