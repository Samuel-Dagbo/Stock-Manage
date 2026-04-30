"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  Loader2,
  MessageCircle,
  Users,
  DollarSign,
  UserPlus,
  ChevronRight,
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
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

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
          <Card key={i} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-32" />
                </div>
                <Skeleton className="h-14 w-14 rounded-2xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color, gradient, delay }: {
  title: string, value: string, icon: any, color: string, gradient: string, delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="border-0 shadow-md card-hover overflow-hidden relative">
        <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
        <CardContent className="p-6 relative">
          <div className={`h-14 w-14 rounded-2xl ${gradient} flex items-center justify-center shadow-lg`}>
            <Icon className={`h-7 w-7 ${color}`} />
          </div>
          <div className="mt-5">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Customers</h2>
            <p className="text-muted-foreground">Manage your customer database</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25">
            <UserPlus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Customers"
            value={customers.length.toString()}
            icon={Users}
            color="text-primary"
            gradient="bg-gradient-to-br from-primary/20 to-primary/5"
            delay={0.1}
          />
          <StatCard
            title="With Phone"
            value={customers.filter(c => c.phone).length.toString()}
            icon={Phone}
            color="text-emerald-600"
            gradient="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5"
            delay={0.15}
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0))}
            icon={DollarSign}
            color="text-violet-600"
            gradient="bg-gradient-to-br from-violet-500/20 to-violet-500/5"
            delay={0.2}
          />
        </div>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search customers by name, email or phone..."
                className="pl-11 h-11 bg-muted/50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {customers.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Users className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No customers yet</h3>
              <p className="text-muted-foreground mb-4">Start building your customer database</p>
              <Button onClick={() => setShowAddModal(true)} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add First Customer
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customers.map((customer, i) => (
              <motion.div
                key={customer._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-0 shadow-md card-hover overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.email || "No email"}</p>
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
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => {
                            setSelectedCustomer(customer)
                            setShowDeleteModal(true)
                          }}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-2 mb-4">
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {customer.phone}
                        </div>
                      )}
                      {customer.whatsapp && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MessageCircle className="h-4 w-4" />
                          {customer.whatsapp}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t flex items-center gap-3">
                      <div className="flex-1 bg-primary/5 rounded-xl px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Heart className="h-3 w-3 text-primary" />
                          <p className="text-xs text-muted-foreground">Points</p>
                        </div>
                        <p className="font-bold text-lg text-primary">{customer.loyaltyPoints || 0}</p>
                      </div>
                      <div className="flex-1 bg-emerald-500/5 rounded-xl px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Sparkles className="h-3 w-3 text-emerald-600" />
                          <p className="text-xs text-muted-foreground">Spent</p>
                        </div>
                        <p className="font-bold text-lg text-emerald-600">{formatCurrency(customer.totalSpent || 0)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {showAddModal && (
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <UserPlus className="h-5 w-5 text-primary" />
                    </div>
                    Add Customer
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Name *</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Customer name" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="email@example.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone</Label>
                    <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+233..." />
                  </div>
                  <div className="grid gap-2">
                    <Label>WhatsApp Number</Label>
                    <Input value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} placeholder="+233..." />
                  </div>
                  <div className="grid gap-2">
                    <Label>Address</Label>
                    <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Customer address" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={saving || !formData.name}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Customer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showEditModal && (
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Edit className="h-5 w-5 text-primary" />
                    </div>
                    Edit Customer
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Name *</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone</Label>
                    <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>WhatsApp Number</Label>
                    <Input value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Address</Label>
                    <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                  <Button onClick={handleUpdate} disabled={saving || !formData.name}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDeleteModal && (
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Delete Customer</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-muted-foreground">Are you sure you want to delete <strong>{selectedCustomer?.name}</strong>? This action cannot be undone.</p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Delete Customer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}