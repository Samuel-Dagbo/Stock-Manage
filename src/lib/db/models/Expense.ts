import mongoose, { Schema, Document, Model } from "mongoose"

export interface IExpense extends Document {
  _id: mongoose.Types.ObjectId
  description: string
  amount: number
  category: string
  shop: mongoose.Types.ObjectId
  recordedBy: mongoose.Types.ObjectId
  supplier?: mongoose.Types.ObjectId
  receipt?: string
  date: Date
  isRecurring: boolean
  recurringInterval?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const ExpenseSchema = new Schema<IExpense>(
  {
    description: {
      type: String,
      required: [true, "Expense description is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
    },
    receipt: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringInterval: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

ExpenseSchema.index({ shop: 1 })
ExpenseSchema.index({ category: 1 })
ExpenseSchema.index({ date: -1 })

export const Expense: Model<IExpense> =
  mongoose.models.Expense ||
  mongoose.model<IExpense>("Expense", ExpenseSchema)