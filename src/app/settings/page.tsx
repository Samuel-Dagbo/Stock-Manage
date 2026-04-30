"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AppLayout } from "@/components/shared/app-layout"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Store, 
  User, 
  Bell, 
  Shield, 
  CreditCard,
  Upload,
  Save,
  Loader2,
  Users,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Trash2,
  UserPlus
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PendingUser {
  _id: string
  name: string
  email: string
  phone?: string
  createdAt: string
}

interface UserItem {
  _id: string
  name: string
  email: string
  role: string
  isActive: boolean
  isApproved: boolean
  createdAt: string
}

export default function SettingsPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [allUsers, setAllUsers] = useState<UserItem[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const defaultSettings = {
    shopName: "My Shop",
    shopType: "retail",
    phone: "+233 50 123 4567",
    email: "myshop@example.com",
    address: "123 Main Street, Accra",
    currency: "GHS",
    taxRate: 15,
    timezone: "Africa/Accra",
    notifications: {
      lowStock: true,
      dailySales: true,
      newCustomer: false,
      orders: true,
    },
  }

  const [settings, setSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("stock-manage-settings")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return defaultSettings
        }
      }
    }
    return defaultSettings
  })

  const [loading, setLoading] = useState(false)

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users")
      const data = await res.json()
      setPendingUsers(data.pending || [])
      setAllUsers(data.users || [])
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleUserAction = async (userId: string, action: string, role?: string) => {
    setActionLoading(userId)
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, role }),
      })
      
      if (res.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error("Action failed:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return <Badge className="bg-primary">Owner</Badge>
      case "manager":
        return <Badge className="bg-violet-500">Manager</Badge>
      case "staff":
        return <Badge className="bg-slate-500">Staff</Badge>
      case "cashier":
        return <Badge className="bg-amber-500">Cashier</Badge>
      default:
        return <Badge>{role}</Badge>
    }
  }
  const handleSave = async () => {
    setLoading(true)
    try {
      localStorage.setItem("stock-manage-settings", JSON.stringify(settings))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Failed to save settings:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout title="Settings">
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Settings</h2>
            <p className="text-muted-foreground">Manage your shop settings and preferences</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={loading}
            className={saveSuccess ? "bg-emerald-500 hover:bg-emerald-600" : ""}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Shop Information</CardTitle>
                <CardDescription>Basic information about your business</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shopName">Shop Name</Label>
                <Input
                  id="shopName"
                  value={settings.shopName}
                  onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopType">Business Type</Label>
                <Select value={settings.shopType} onValueChange={(v) => setSettings({ ...settings, shopType: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail Shop</SelectItem>
                    <SelectItem value="supermarket">Supermarket</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="boutique">Boutique</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="wholesale">Wholesale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <CardTitle className="text-base">Regional Settings</CardTitle>
                <CardDescription>Currency, tax, and location settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={settings.currency} onValueChange={(v) => setSettings({ ...settings, currency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GHS">GHS - Ghana Cedis</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={settings.timezone} onValueChange={(v) => setSettings({ ...settings, timezone: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Accra">Africa/Accra (GMT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-base">Notifications</CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Low Stock Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified when products are running low</p>
              </div>
              <Switch
                checked={settings.notifications.lowStock}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, lowStock: checked }
                })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily Sales Report</p>
                <p className="text-sm text-muted-foreground">Receive daily sales summary via email</p>
              </div>
              <Switch
                checked={settings.notifications.dailySales}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, dailySales: checked }
                })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Customer Notifications</p>
                <p className="text-sm text-muted-foreground">Get notified when new customers register</p>
              </div>
              <Switch
                checked={settings.notifications.newCustomer}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, newCustomer: checked }
                })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Order Notifications</p>
                <p className="text-sm text-muted-foreground">Receive alerts for new orders</p>
              </div>
              <Switch
                checked={settings.notifications.orders}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, orders: checked }
                })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <CardTitle className="text-base">Security</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Button variant="outline">Enable</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-muted-foreground">Update your account password</p>
              </div>
              <Button variant="outline">Change</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Upload className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Export All Data</p>
                <p className="text-sm text-muted-foreground">Download all your data as CSV</p>
              </div>
              <Button variant="outline">Export</Button>
            </div>
          </CardContent>
</Card>

        {/* User Management Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">User Management</CardTitle>
                <CardDescription>Manage staff accounts and approvals</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pending Users */}
            {pendingUsers.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm">Pending Approval</h3>
                  <Badge variant="warning">{pendingUsers.length}</Badge>
                </div>
                <div className="space-y-3">
                  {pendingUsers.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-4 rounded-lg border border-warning/30 bg-warning/5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-warning/20 flex items-center justify-center">
                          <User className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUserAction(user._id, "approve", "staff")}
                          disabled={actionLoading === user._id}
                        >
                          {actionLoading === user._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUserAction(user._id, "reject")}
                          disabled={actionLoading === user._id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Users */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm">All Staff</h3>
                <Badge variant="secondary">{allUsers.length}</Badge>
              </div>
              
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : allUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No other users yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allUsers.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getRoleBadge(user.role)}
                        <Badge variant={user.isActive ? "success" : "destructive"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUserAction(user._id, user.isActive ? "deactivate" : "activate")}>
                              {user.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Select>
                                <SelectTrigger className="h-auto p-0 text-sm border-0">
                                  Change Role
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="manager" onClick={() => handleUserAction(user._id, "approve", "manager")}>Manager</SelectItem>
                                  <SelectItem value="cashier" onClick={() => handleUserAction(user._id, "approve", "cashier")}>Cashier</SelectItem>
                                  <SelectItem value="staff" onClick={() => handleUserAction(user._id, "approve", "staff")}>Staff</SelectItem>
                                </SelectContent>
                              </Select>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleUserAction(user._id, "reject")}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}