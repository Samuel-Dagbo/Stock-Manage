import mongoose, { Schema, Document, Model } from "mongoose"

export interface ISupplier extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email?: string
  phone: string
  whatsapp?: string
  address?: string
  contactPerson?: string
  notes?: string
  shop: mongoose.Types.ObjectId
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const SupplierSchema = new Schema<ISupplier>(
  {
    name: {
      type: String,
      required: [true, "Supplier name is required"],
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
    contactPerson: {
      type: String,
    },
    notes: {
      type: String,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
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

SupplierSchema.index({ shop: 1 })
SupplierSchema.index({ name: "text" })

export const Supplier: Model<ISupplier> =
  mongoose.models.Supplier ||
  mongoose.model<ISupplier>("Supplier", SupplierSchema)