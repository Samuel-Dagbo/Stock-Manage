"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
  Loader2,
  Truck,
  Package,
  Contact
} from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AppLayout } from "@/components/shared/app-layout"

interface Supplier {
  _id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  notes: string
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