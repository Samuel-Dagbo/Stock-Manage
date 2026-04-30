"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  User,
  Phone,
  Mail,
  MapPin,
  Truck,
  Package,
  Contact,
  CheckCircle2,
  X,
  Loader2,
  Building2,
  Star,
  DollarSign,
  Users,
  Calendar,
  FileText,
  Download,
  Filter,
  ArrowRight,
  ChevronDown,
  Badge as BadgeIcon,
  CreditCard,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  BoxIcon,
  AlertTriangle,
  XCircle,
  ShoppingCart,
  Receipt,
  Eye,
  Printer,
  jsPDF,
  autoTable,
  format,
  formatCurrency,
  formatDateTime,
  formatRelativeTime,
  AppLayout,
  StatCard,
  SearchInput,
  EmptyState,
} from "@/components/ui/exports"
import { formatCurrency, formatDateTime, formatRelativeTime } from "@/lib/utils"
import { AppLayout } from "@/components/shared/app-layout"
import { StatCard } from "@/components/shared/stat-card"
import { SearchInput } from "@/components/shared/search-input"
import { EmptyState } from "@/components/shared/empty-state"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"

interface Supplier {
  _id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  notes: string
}

function SuppliersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  })

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set("search", searchQuery)
      const res = await fetch(`/api/suppliers?${params}`)
      const data = await res.json()
      setSuppliers(data.suppliers || [])
    } catch (error) {
      console.error("Failed to fetch suppliers:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [searchQuery])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setShowAddModal(false)
        setFormData({ name: "", contactPerson: "", email: "", phone: "", address: "", notes: "" })
        fetchSuppliers()
      }
    } catch (error) {
      console.error("Failed to save supplier:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedSupplier) return
    setSaving(true)
    try {
      const res = await fetch(`/api/suppliers?id=${selectedSupplier._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setShowEditModal(false)
        setSelectedSupplier(null)
        setFormData({ name: "", contactPerson: "", email: "", phone: "", address: "", notes: "" })
        fetchSuppliers()
      }
    } catch (error) {
      console.error("Failed to update supplier:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedSupplier) return
    try {
      const res = await fetch(`/api/suppliers?id=${selectedSupplier._id}`, { method: "DELETE" })
      if (res.ok) {
        setShowDeleteModal(false)
        setSelectedSupplier(null)
        fetchSuppliers()
      }
    } catch (error) {
      console.error("Failed to delete supplier:", error)
    }
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text("Suppliers Report", 105, 20, { align: "center" })
    doc.setFontSize(12)
    doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy")}`, 105, 30, { align: "center" })

    const tableData = suppliers.map(supplier => [
      supplier.name,
      supplier.contactPerson,
      supplier.phone,
      supplier.email,
      supplier.address.substring(0, 30) + (supplier.address.length > 30 ? "..." : ""),
    ])

    autoTable(doc, {
      startY: 40,
      head: [["Name", "Contact", "Phone", "Email", "Address"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [99, 102, 241] },
    })

    doc.save(`suppliers-report-${format(new Date(), "yyyy-MM-dd")}.pdf`)
  }

  if (loading) {
    return (
      <AppLayout title="Suppliers">
        <SuppliersSkeleton />
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Suppliers">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your supplier relationships</p>
          </div>
          <Button size="sm" className="gap-2 rounded-xl" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            Add Supplier
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Suppliers"
            value={suppliers.length.toString()}
            icon={Building2}
            iconClassName="bg-primary/10 text-primary"
          />
          <StatCard
            title="Active Orders"
            value="12"
            icon={Package}
            iconClassName="bg-info/10 text-info"
          />
          <StatCard
            title="This Month"
            value={formatCurrency(45000)}
            icon={DollarSign}
            iconClassName="bg-success/10 text-success"
          />
        </div>

        {/* Search & Actions */}
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search suppliers..."
                />
              </div>
              <Button variant="outline" size="sm" className="gap-2 text-sm" onClick={handleExportPDF}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers List */}
        {suppliers.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="p-0">
              <EmptyState
                icon={Building2}
                title="No suppliers yet"
                description="Add suppliers to manage your procurement"
                action={
                  <Button size="sm" className="gap-2 rounded-xl" onClick={() => setShowAddModal(true)}>
                    <Plus className="h-4 w-4" />
                    Add Supplier
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((supplier) => (
              <Card key={supplier._id} className="border-border/60 hover:shadow-card-hover transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{supplier.name}</h3>
                        <p className="text-xs text-muted-foreground">{supplier.contactPerson}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedSupplier(supplier)
                          setFormData({
                            name: supplier.name,
                            contactPerson: supplier.contactPerson,
                            email: supplier.email,
                            phone: supplier.phone,
                            address: supplier.address,
                            notes: supplier.notes,
                          })
                          setShowEditModal(true)
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedSupplier(supplier)
                          setShowDeleteModal(true)
                        }} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{supplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                    {supplier.address && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs truncate">{supplier.address}</span>
                      </div>
                    )}
                    {supplier.notes && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs truncate">{supplier.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/60 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1 text-sm">
                      <Package className="h-4 w-4" />
                      Orders
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1 text-sm">
                      <FileText className="h-4 w-4" />
                      History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Supplier Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Add Supplier</DialogTitle>
              <DialogDescription>Enter supplier details below</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Company Name *</Label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Supplier Company Name"
                  className="text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Contact Person *</Label>
                <Input
                  value={formData.contactPerson}
                  onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Contact Person Name"
                  className="text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Phone *</Label>
                <Input
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+233 123 456 789"
                  className="text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@supplier.com"
                  className="text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Address</Label>
                <Input
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main Street, Accra"
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
              <Button size="sm" className="text-sm" onClick={handleSave} disabled={saving || !formData.name || !formData.contactPerson || !formData.phone}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Supplier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Supplier Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Edit Supplier</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Company Name</Label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Contact Person</Label>
                <Input
                  value={formData.contactPerson}
                  onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Address</Label>
                <Input
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Notes</Label>
                <Input
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" className="text-sm" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button size="sm" className="text-sm" onClick={handleUpdate} disabled={saving || !formData.name}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Delete Supplier</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete <span className="font-medium text-foreground">{selectedSupplier?.name}</span>? This action cannot be undone.
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


export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  })

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set("search", searchQuery)
      const res = await fetch(`/api/suppliers?${params}`)
      const data = await res.json()
      setSuppliers(data.suppliers || [])
    } catch (error) {
      console.error("Failed to fetch suppliers:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [searchQuery])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setShowAddModal(false)
        setFormData({ name: "", contactPerson: "", email: "", phone: "", address: "", notes: "" })
        fetchSuppliers()
      }
    } catch (error) {
      console.error("Failed to save supplier:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedSupplier) return
    setSaving(true)
    try {
      const res = await fetch(`/api/suppliers?id=${selectedSupplier._id}`, { method: "DELETE" })
      if (res.ok) {
        setShowDeleteModal(false)
        fetchSuppliers()
      }
    } catch (error) {
      console.error("Failed to delete supplier:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout title="Suppliers">
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Suppliers</h2>
          <p className="text-muted-foreground">Manage your suppliers and vendors</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Suppliers</p>
                <p className="text-3xl font-bold tracking-tight">{suppliers.length}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Truck className="h-7 w-7 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">With Phone</p>
                <p className="text-3xl font-bold tracking-tight">{suppliers.filter(s => s.phone).length}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center">
                <Phone className="h-7 w-7 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">With Email</p>
                <p className="text-3xl font-bold tracking-tight">{suppliers.filter(s => s.email).length}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 flex items-center justify-center">
                <Mail className="h-7 w-7 text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search suppliers by name, email or phone..."
              className="pl-10 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Supplier</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Contact Person</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    No suppliers found
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier._id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-amber-500" />
                        </div>
                        <span className="font-medium">{supplier.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{supplier.contactPerson || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {supplier.phone && <p className="text-sm flex items-center gap-1"><Phone className="h-3 w-3" /> {supplier.phone}</p>}
                        {supplier.email && <p className="text-sm flex items-center gap-1"><Mail className="h-3 w-3" /> {supplier.email}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{supplier.address || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-destructive" onClick={() => {
                              setSelectedSupplier(supplier)
                              setShowDeleteModal(true)
                            }}>
                              <Trash2 className="mr-2 h-4 w-4" />
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

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Supplier</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Supplier Name *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Contact Person</Label>
              <Input value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Address</Label>
              <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Input value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !formData.name}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Supplier</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to delete <strong>{selectedSupplier?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
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