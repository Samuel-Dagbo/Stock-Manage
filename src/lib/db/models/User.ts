import mongoose, { Schema, Document, Model } from "mongoose"

export type UserRole = "admin" | "sales" | "manager" | "cashier" | "staff" | "pending"

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  password: string
  name: string
  role: UserRole
  shop: mongoose.Types.ObjectId
  isActive: boolean
  isApproved: boolean
  phone?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    role: {
      type: String,
enum: ["admin", "sales", "manager", "cashier", "staff", "pending"],
    default: "pending",
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
    },
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

UserSchema.index({ shop: 1 })

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema)