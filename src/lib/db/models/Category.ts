import mongoose, { Schema, Document, Model } from "mongoose"

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  shop: mongoose.Types.ObjectId
  parentCategory?: mongoose.Types.ObjectId
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
    },
    icon: {
      type: String,
    },
    color: {
      type: String,
      default: "#059669",
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
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

CategorySchema.index({ shop: 1 })
CategorySchema.index({ slug: 1, shop: 1 })

export const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema)