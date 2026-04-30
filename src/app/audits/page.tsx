"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Download,
  Filter,
  Eye,
  EyeOff,
  Clock,
  User,
  Package,
  Receipt,
  Users,
  ShoppingBag,
  Wallet,
  LogIn,
  LogOut,
  Settings,
  Trash2,
} from "lucide-react"
import { AppLayout } from "@/components/shared/app-layout"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

const actions = [
  { value: "all", label: "All Actions" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "sale", label: "Sale" },
  { value: "stock_adjust", label: "Stock Adjust" },
]

const entities = [
  { value: "all", label: "All Entities" },
  { value: "product", label: "Products" },
  { value: "sale", label: "Sales" },
  { value: "customer", label: "Customers" },
  { value: "supplier", label: "Suppliers" },
  { value: "expense", label: "Expenses" },
  { value: "category", label: "Categories" },
  { value: "user", label: "Users" },
]

const actionColors: Record<string, string> = {
  create: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  update: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  delete: "bg-red-500/10 text-red-600 border-red-500/20",
  login: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  logout: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  sale: "bg-primary/10 text-primary border-primary/20",
  stock_adjust: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  approve: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  reject: "bg-red-500/10 text-red-600 border-red-500/20",
}

const entityIcons: Record<string, any> = {
  product: Package,
  sale: Receipt,
  customer: Users,
  supplier: ShoppingBag,
  expense: Wallet,
  category: Package,
  user: User,
  inventory: Package,
  shop: Settings,
}

interface AuditLog {
  _id: string
  action: string
  entity: string
  entityId?: string
  changes?: Record<string, { from: any; to: any }>
  metadata?: Record<string, any>
  ipAddress?: string
  createdAt: string
  user?: {
    name: string
    email: string
  }
}

export default function AuditsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAction, setSelectedAction] = useState("all")
  const [selectedEntity, setSelectedEntity] = useState("all")
  const [selectedDateRange, setSelectedDateRange] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showChanges, setShowChanges] = useState<Set<string>>(new Set())
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  useEffect(() => {
    fetchLogs()
  }, [selectedAction, selectedEntity, selectedDateRange, page])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      let startDate: string | undefined
      let endDate: string | undefined
      
      if (selectedDateRange === "today") {
        const today = new Date()
        startDate = today.toISOString().split("T")[0]
        endDate = startDate
      } else if (selectedDateRange === "week") {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        startDate = weekAgo.toISOString().split("T")[0]
      } else if (selectedDateRange === "month") {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        startDate = monthAgo.toISOString().split("T")[0]
      }

      const params = new URLSearchParams()
      params.set("page", page.toString())
      if (selectedAction !== "all") params.set("action", selectedAction)
      if (selectedEntity !== "all") params.set("entity", selectedEntity)
      if (startDate) params.set("startDate", startDate)
      if (endDate) params.set("endDate", endDate)

      const res = await fetch(`/api/audits?${params}`)
      const data = await res.json()
      setLogs(data.logs || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (error) {
      console.error("Failed to fetch audits:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleChanges = (id: string) => {
    setExpandedLog(expandedLog === id ? null : id)
  }

  const getChangeCount = (changes?: Record<string, { from: any; to: any }>) => {
    if (!changes) return 0
    return Object.keys(changes).length
  }

  return (
    <AppLayout title="Audit Logs">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Activity Logs
              </CardTitle>
              
              <div className="flex flex-wrap items-center gap-2">
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    {actions.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        {action.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Entity" />
                  </SelectTrigger>
                  <SelectContent>
                    {entities.map((entity) => (
                      <SelectItem key={entity.value} value={entity.value}>
                        {entity.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium">No audit logs found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => {
                  const Icon = entityIcons[log.entity] || Settings
                  const changeCount = getChangeCount(log.changes)
                  
                  return (
                    <div
                      key={log._id}
                      className="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                            actionColors[log.action] || "bg-muted"
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>
                          
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className={cn(
                                "text-xs",
                                actionColors[log.action] || "bg-muted"
                              )}>
                                {log.action}
                              </Badge>
                              <span className="font-medium capitalize">{log.entity}</span>
                              {log.metadata?.name && (
                                <span className="text-muted-foreground text-sm">
                                  - {log.metadata.name}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {log.user?.name || "Unknown"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(log.createdAt).toLocaleString()}
                              </span>
                              {log.ipAddress && (
                                <span className="text-xs hidden sm:inline">
                                  IP: {log.ipAddress}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {changeCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {changeCount} change{changeCount !== 1 ? "s" : ""}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleChanges(log._id)}
                          >
                            {expandedLog === log._id ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {expandedLog === log._id && log.changes && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm font-medium mb-2">Changes</p>
                          <div className="space-y-2">
                            {Object.entries(log.changes).map(([key, change]: [string, any]) => (
                              <div
                                key={key}
                                className="flex items-center gap-4 text-sm"
                              >
                                <span className="font-medium w-24 shrink-0 capitalize">
                                  {key}:
                                </span>
                                <span className="text-muted-foreground line-through text-xs">
                                  {JSON.stringify(change.from)}
                                </span>
                                <span className="text-primary">→</span>
                                <span className="text-green-600 text-xs">
                                  {JSON.stringify(change.to)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {!loading && logs.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}