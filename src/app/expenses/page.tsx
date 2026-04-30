"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Wallet,
  Loader2,
  Calendar,
  Receipt,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency, formatDate } from "@/lib/utils"
import { AppLayout } from "@/components/shared/app-layout"
import { StatCard } from "@/components/shared/stat-card"
import { SearchInput } from "@/components/shared/search-input"
import { EmptyState } from "@/components/shared/empty-state"

interface Expense {
  _id: string
  description: string
  amount: number
  category: string
  date: string
  notes: string
}

const categories = ["rent", "utilities", "salaries", "supplies", "maintenance", "marketing", "other"]

const categoryVariant: Record<string, "destructive" | "info" | "success" | "warning" | "secondary"> = {
  rent: "destructive",
  utilities: "info",
  salaries: "success",
  supplies: "warning",
  maintenance: "info",
  marketing: "secondary",
  other: "secondary",
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [search, setSearch] = useState("")

  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "other",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const fetchExpenses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (categoryFilter !== "all") params.set("category", categoryFilter)
      const res = await fetch(`/api/expenses?${params}`)
      const data = await res.json()
      setExpenses(data.expenses || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Failed to fetch expenses:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [categoryFilter])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      })
      if (res.ok) {
        setShowAddModal(false)
        setFormData({
          description: "",
          amount: "",
          category: "other",
          date: new Date().toISOString().split("T")[0],
          notes: "",
        })
        fetchExpenses()
      }
    } catch (error) {
      console.error("Failed to save expense:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchExpenses()
      }
    } catch (error) {
      console.error("Failed to delete expense:", error)
    } finally {
      setSaving(false)
      setShowDeleteModal(false)
    }
  }

  const filteredExpenses = expenses.filter((e) =>
    e.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppLayout title="Expenses">
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <Button size="sm" className="gap-1.5" onClick={() => setShowAddModal(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add Expense
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Total Expenses"
            value={formatCurrency(total)}
            icon={Wallet}
            iconClassName="bg-destructive/10 text-destructive"
          />
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search expenses..."
                className="flex-1"
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    </td>
                  </tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        icon={Receipt}
                        title="No expenses found"
                        description="Add your first expense or adjust your filters."
                      />
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr key={expense._id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(expense.date)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[13px] font-medium">{expense.description}</p>
                        {expense.notes && <p className="text-[11px] text-muted-foreground mt-0.5">{expense.notes}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={categoryVariant[expense.category] || "secondary"}>
                          {expense.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-[13px] font-medium">{formatCurrency(expense.amount)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive text-[13px]"
                                onClick={() => {
                                  setSelectedExpense(expense)
                                  setShowDeleteModal(true)
                                }}
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="text-[13px]">Description *</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Shop rent"
                  className="text-[13px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-[13px]">Amount *</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="text-[13px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[13px]">Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger className="text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-[13px]">Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="text-[13px]"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-[13px]">Notes</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes"
                  className="text-[13px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={saving || !formData.description || !formData.amount}>
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Add Expense
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Expense</DialogTitle>
            </DialogHeader>
            <p className="py-4 text-[13px]">Are you sure you want to delete this expense?</p>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedExpense!._id)} disabled={saving}>
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
