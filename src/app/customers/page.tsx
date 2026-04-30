"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MoreHorizontal,
  Edit,
  Trash2,
  User,
  Phone,
  Loader2,
  MessageCircle,
  Users,
  DollarSign,
  UserPlus,
  Heart,
  Sparkles
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/utils"
import { AppLayout } from "@/components/shared/app-layout"
import { StatCard } from "@/components/shared/stat-card"
import { SearchInput } from "@/components/shared/search-input"
import { EmptyState } from "@/components/shared/empty-state"

interface Customer {
  _id: string
  name: string
  email: string
  phone: string
  whatsapp: string
  address: string
  loyaltyPoints: number
  totalSpent: number
}

function CustomersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
  })

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set("search", searchQuery)
      const res = await fetch(`/api/customers?${params}`)
      const data = await res.json()
      setCustomers(data.customers || [])
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [searchQuery])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setShowAddModal(false)
        setFormData({ name: "", email: "", phone: "", whatsapp: "", address: "" })
        fetchCustomers()
      }
    } catch (error) {
      console.error("Failed to save customer:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedCustomer) return
    setSaving(true)
    try {
      const res = await fetch(`/api/customers?id=${selectedCustomer._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setShowEditModal(false)
        fetchCustomers()
      }
    } catch (error) {
      console.error("Failed to update customer:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCustomer) return
    setSaving(true)
    try {
      const res = await fetch(`/api/customers?id=${selectedCustomer._id}`, { method: "DELETE" })
      if (res.ok) {
        setShowDeleteModal(false)
        fetchCustomers()
      }
    } catch (error) {
      console.error("Failed to delete customer:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Customers">
        <CustomersSkeleton />
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Customers">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button size="sm" className="gap-1.5" onClick={() => setShowAddModal(true)}>
            <UserPlus className="h-3.5 w-3.5" />
            Add Customer
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Customers"
            value={customers.length.toString()}
            icon={Users}
          />
          <StatCard
            title="With Phone"
            value={customers.filter(c => c.phone).length.toString()}
            icon={Phone}
            iconClassName="bg-success-subtle text-success"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0))}
            icon={DollarSign}
          />
        </div>

        <Card>
          <CardContent className="p-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search customers by name, email or phone..."
            />
          </CardContent>
        </Card>

        {customers.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={Users}
                title="No customers yet"
                description="Start building your customer database"
                action={
                  <Button size="sm" className="gap-1.5" onClick={() => setShowAddModal(true)}>
                    <UserPlus className="h-3.5 w-3.5" />
                    Add First Customer
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customers.map((customer) => (
              <Card key={customer._id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary-subtle flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{customer.name}</p>
                        <p className="text-[13px] text-muted-foreground">{customer.email || "No email"}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedCustomer(customer)
                          setFormData({
                            name: customer.name,
                            email: customer.email,
                            phone: customer.phone,
                            whatsapp: customer.whatsapp,
                            address: customer.address,
                          })
                          setShowEditModal(true)
                        }}>
                          <Edit className="mr-2 h-3.5 w-3.5" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => {
                          setSelectedCustomer(customer)
                          setShowDeleteModal(true)
                        }}>
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        {customer.phone}
                      </div>
                    )}
                    {customer.whatsapp && (
                      <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {customer.whatsapp}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border/50 flex items-center gap-3">
                    <div className="flex-1 rounded-lg bg-primary-subtle px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Heart className="h-3 w-3 text-primary" />
                        <p className="text-[11px] text-muted-foreground">Points</p>
                      </div>
                      <p className="text-sm font-bold text-primary">{customer.loyaltyPoints || 0}</p>
                    </div>
                    <div className="flex-1 rounded-lg bg-success-subtle px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Sparkles className="h-3 w-3 text-success" />
                        <p className="text-[11px] text-muted-foreground">Spent</p>
                      </div>
                      <p className="text-sm font-bold text-success">{formatCurrency(customer.totalSpent || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary-subtle flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-primary" />
                </div>
                Add Customer
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="text-[13px]">Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Customer name" />
              </div>
              <div className="grid gap-2">
                <Label className="text-[13px]">Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="email@example.com" />
              </div>
              <div className="grid gap-2">
                <Label className="text-[13px]">Phone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+233..." />
              </div>
              <div className="grid gap-2">
                <Label className="text-[13px]">WhatsApp Number</Label>
                <Input value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} placeholder="+233..." />
              </div>
              <div className="grid gap-2">
                <Label className="text-[13px]">Address</Label>
                <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Customer address" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={saving || !formData.name} className="gap-1.5">
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Add Customer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary-subtle flex items-center justify-center">
                  <Edit className="h-4 w-4 text-primary" />
                </div>
                Edit Customer
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="text-[13px]">Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label className="text-[13px]">Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label className="text-[13px]">Phone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label className="text-[13px]">WhatsApp Number</Label>
                <Input value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label className="text-[13px]">Address</Label>
                <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button size="sm" onClick={handleUpdate} disabled={saving || !formData.name} className="gap-1.5">
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Customer</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-[13px] text-muted-foreground">Are you sure you want to delete <strong>{selectedCustomer?.name}</strong>? This action cannot be undone.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={saving} className="gap-1.5">
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Delete Customer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
