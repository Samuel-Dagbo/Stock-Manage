"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency, formatDate } from "@/lib/utils"
import { AppLayout } from "@/components/shared/app-layout"
import { StatCard } from "@/components/shared/stat-card"
import { SearchInput } from "@/components/shared/search-input"
import { EmptyState } from "@/components/shared/empty-state"
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Wallet,
  Receipt,
  Calendar,
  Edit,
  X,
  Loader2,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Download,
  Filter,
  FileText,
  jsPDF,
  autoTable,
  format,
} from "@/components/ui/exports"
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

const categoryLabel: Record<string, string> = {
  rent: "Rent",
  utilities: "Utilities",
  salaries: "Salaries",
  supplies: "Supplies",
  maintenance: "Maintenance",
  marketing: "Marketing",
  other: "Other",
}

function ExpensesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
                <div className="h-4 w-16 rounded-lg bg-muted animate-pulse" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-24 rounded-lg bg-muted animate-pulse" />
                <div className="h-8 w-32 rounded-lg bg-muted animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="h-64 bg-muted rounded-xl animate-pulse" />
        </CardContent>
      </Card>
    </div>
  )
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
          description: formData.description,
          amount: parseFloat(formData.amount),
          category: formData.category,
          date: formData.date,
          notes: formData.notes,
        }),
      })
      if (res.ok) {
        setShowAddModal(false)
        setFormData({ description: "", amount: "", category: "other", date: new Date().toISOString().split("T")[0], notes: "" })
        fetchExpenses()
      }
    } catch (error) {
      console.error("Failed to save expense:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedExpense) return
    setSaving(true)
    try {
      const res = await fetch(`/api/expenses?id=${selectedExpense._id}`, { method: "DELETE" })
      if (res.ok) {
        setShowDeleteModal(false)
        setSelectedExpense(null)
        fetchExpenses()
      }
    } catch (error) {
      console.error("Failed to delete expense:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text("Expenses Report", 105, 20, { align: "center" })
    doc.setFontSize(12)
    doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy")}`, 105, 30, { align: "center" })

    const tableData = expenses.map(expense => [
      expense.description,
      categoryLabel[expense.category] || expense.category,
      formatCurrency(expense.amount),
      formatDate(expense.date),
      expense.notes.substring(0, 30) + (expense.notes.length > 30 ? "..." : ""),
    ])

    autoTable(doc, {
      startY: 40,
      head: [["Description", "Category", "Amount", "Date", "Notes"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [99, 102, 241] },
    })

    const finalY = (doc as any).lastAutoTable.finalY || 40
    doc.setFontSize(14)
    doc.text(`Total Expenses: ${formatCurrency(total)}`, 140, finalY + 20)

    doc.save(`expenses-report-${format(new Date(), "yyyy-MM-dd")}.pdf`)
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter
    const matchesSearch = expense.description.toLowerCase().includes(search.toLowerCase()) ||
                          expense.notes.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <AppLayout title="Expenses">
        <ExpensesSkeleton />
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Expenses">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Expenses"
            value={formatCurrency(total)}
            icon={Wallet}
            iconClassName="bg-primary/10 text-primary"
          />
          <StatCard
            title="This Month"
            value={formatCurrency(total * 0.7)}
            icon={Receipt}
            iconClassName="bg-info/10 text-info"
            trend="up"
            change={12.5}
          />
          <StatCard
            title="Avg. Per Category"
            value={formatCurrency(total / categories.length)}
            icon={DollarSign}
            iconClassName="bg-warning/10 text-warning"
          />
        </div>

        {/* Filters */}
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search expenses..."
                />
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[160px] text-sm">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{categoryLabel[cat]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="gap-2 text-sm" onClick={handleExportPDF}>
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button size="sm" className="gap-2 rounded-xl" onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4" />
                  Add Expense
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="p-0">
              <EmptyState
                icon={Wallet}
                title="No expenses yet"
                description="Add expenses to track your business spending"
                action={
                  <Button size="sm" className="gap-2 rounded-xl" onClick={() => setShowAddModal(true)}>
                    <Plus className="h-4 w-4" />
                    Add Expense
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map((expense) => (
              <Card key={expense._id} className="border-border/60 hover:shadow-card-hover transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center",
                        "bg-gradient-to-br",
                        expense.category === "rent" && "from-destructive/20 to-destructive/10",
                        expense.category === "utilities" && "from-info/20 to-info/10",
                        expense.category === "salaries" && "from-success/20 to-success/10",
                        expense.category === "supplies" && "from-warning/20 to-warning/10",
                        expense.category === "maintenance" && "from-info/20 to-info/10",
                        expense.category === "marketing" && "from-secondary/20 to-secondary/10",
                        expense.category === "other" && "from-muted/20 to-muted/10"
                      )}>
                        <Wallet className={cn(
                          "h-6 w-6",
                          expense.category === "rent" && "text-destructive",
                          expense.category === "utilities" && "text-info",
                          expense.category === "salaries" && "text-success",
                          expense.category === "supplies" && "text-warning",
                          expense.category === "maintenance" && "text-info",
                          expense.category === "marketing" && "text-secondary",
                          expense.category === "other" && "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{expense.description}</h3>
                        <p className="text-xs text-muted-foreground">{categoryLabel[expense.category]} • {formatDate(expense.date)}</p>
                        {expense.notes && (
                          <p className="text-xs text-muted-foreground/70 mt-1">{expense.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{formatCurrency(expense.amount)}</p>
                      <Badge variant={categoryVariant[expense.category]} className="text-[10px] mt-1">
                        {categoryLabel[expense.category]}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-[11px]"
                      onClick={() => {
                        setSelectedExpense(expense)
                        setShowDeleteModal(true)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Expense Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Add Expense</DialogTitle>
              <DialogDescription>Record a new business expense</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Description *</Label>
                <Input
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What was this expense for?"
                  className="text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Amount *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="pl-9 text-sm"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Category</Label>
                <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{categoryLabel[cat]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Notes</Label>
                <Input
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  className="text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" className="text-sm" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button size="sm" className="text-sm" onClick={handleSave} disabled={saving || !formData.description || !formData.amount}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Expense
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Delete Expense</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete the expense <span className="font-medium text-foreground">"{selectedExpense?.description}"</span>? This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" className="text-sm" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button size="sm" variant="destructive" className="text-sm" onClick={handleDelete} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
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
