import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth/config"
import { connectDB } from "@/lib/db/connection"
import { Expense } from "@/lib/db/models"
import { logAudit, getChangedFields } from "@/lib/audit"

const expenseCategories = [
  "supplies",
  "utilities",
  "rent",
  "salaries",
  "marketing",
  "maintenance",
  "transportation",
  "other",
] as const

const createExpenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0.01, "Amount must be positive"),
  category: z.enum(expenseCategories),
  date: z.string().or(z.date()).optional(),
  notes: z.string().optional().default(""),
})

const updateExpenseSchema = createExpenseSchema.partial()

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || ""
    const search = searchParams.get("search") || ""
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)

    await connectDB()

    const query: Record<string, unknown> = { shop: session.user.shop }

    if (category && category !== "all") {
      query.category = category
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ]
    }

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {}
      if (startDate) dateFilter.$gte = new Date(startDate)
      if (endDate) dateFilter.$lte = new Date(endDate + "T23:59:59.999Z")
      query.date = dateFilter
    }

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .populate("recordedBy", "name")
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Expense.countDocuments(query),
    ])

    const expensesTotal = expenses.reduce((sum, e) => sum + e.amount, 0)

    return NextResponse.json({
      expenses,
      total: expensesTotal,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error fetching expenses:", error)
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const validation = createExpenseSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      )
    }

    await connectDB()

    const expense = await Expense.create({
      description: validation.data.description,
      amount: validation.data.amount,
      category: validation.data.category,
      date: validation.data.date ? new Date(validation.data.date) : new Date(),
      notes: validation.data.notes,
      shop: session.user.shop,
      recordedBy: session.user.id,
    })

    await logAudit({
      action: "create",
      entity: "expense",
      entityId: expense._id.toString(),
      metadata: { description: expense.description, amount: expense.amount, category: expense.category },
      request,
    })

    return NextResponse.json({ success: true, expense }, { status: 201 })
  } catch (error) {
    console.error("Error creating expense:", error)
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Expense ID required" }, { status: 400 })
    }

    const body = await request.json()

    const validation = updateExpenseSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = { ...validation.data }
    if (validation.data.date) {
      updateData.date = new Date(validation.data.date as unknown as string)
    }

    await connectDB()

    const originalExpense = await Expense.findOne({
      _id: id,
      shop: session.user.shop,
    }).lean()

    const expense = await Expense.findOneAndUpdate(
      { _id: id, shop: session.user.shop },
      { $set: updateData },
      { new: true }
    )

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    await logAudit({
      action: "update",
      entity: "expense",
      entityId: id,
      changes: getChangedFields(originalExpense as any, updateData),
      request,
    })

    return NextResponse.json({ success: true, expense })
  } catch (error) {
    console.error("Error updating expense:", error)
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Expense ID required" }, { status: 400 })
    }

    await connectDB()

    const expense = await Expense.findOneAndDelete({
      _id: id,
      shop: session.user.shop,
    })

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    await logAudit({
      action: "delete",
      entity: "expense",
      entityId: id,
      metadata: { description: expense.description, amount: expense.amount },
      request,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting expense:", error)
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 })
  }
}