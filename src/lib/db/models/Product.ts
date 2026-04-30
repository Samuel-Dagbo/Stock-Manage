import mongoose, { Schema, Document, Model } from "mongoose"

export interface IProductVariant {
  name: string
  sku: string
  barcode?: string
  price: number
  costPrice: number
  quantity: number
  attributes?: Record<string, string>
}

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  slug: string
  description?: string
  sku: string
  barcode?: string
  category: mongoose.Types.ObjectId
  supplier?: mongoose.Types.ObjectId
  shop: mongoose.Types.ObjectId
  images: string[]
  variants: IProductVariant[]
  hasVariants: boolean
  basePrice: number
  costPrice: number
  sellingPrice: number
  stockQuantity: number
  unit: string
  reorderLevel: number
  expiryDate?: Date
  isActive: boolean
  allowNegativeStock: boolean
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
    },
    sku: {
      type: String,
      required: true,
    },
    barcode: {
      type: String,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    variants: {
      type: [new Schema({
        name: String,
        sku: String,
        barcode: String,
        price: Number,
        costPrice: Number,
        quantity: Number,
        attributes: Map,
      }, { _id: false })],
      default: [],
    },
    hasVariants: {
      type: Boolean,
      default: false,
    },
    basePrice: {
      type: Number,
      default: 0,
    },
    costPrice: {
      type: Number,
      default: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
    stockQuantity: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: "piece",
    },
    reorderLevel: {
      type: Number,
      default: 10,
    },
    expiryDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    allowNegativeStock: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

ProductSchema.index({ shop: 1 })
ProductSchema.index({ sku: 1, shop: 1 })
ProductSchema.index({ barcode: 1, shop: 1 })
ProductSchema.index({ category: 1 })
ProductSchema.index({ name: "text", description: "text" })

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)