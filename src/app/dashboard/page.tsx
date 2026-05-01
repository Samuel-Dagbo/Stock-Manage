"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AppLayout } from "@/components/shared/app-layout"
import { EmptyState } from "@/components/shared/empty-state"
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Plus,
  Clock,
  AlertTriangle,
  Receipt,
  ChevronRight,
  ArrowRight,
  CreditCard,
  Zap,
  Target,
  BarChart3,
  Activity,
} from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

interface TopProduct {
  name: string
  sales: number
  revenue: number
  stock: number
}

interface RecentSale {
  receiptNumber: string
  customer: string
  total: number
  createdAt: string
  status: string
}

interface ChartData {
  name: string
  revenue: number
  orders: number
}

interface DashboardData {
  revenue: number
  orders: number
  products: number
  customers: number
  revenueChange: number
  ordersChange: number
  loading: boolean
  chartData: ChartData[]
  topProducts: TopProduct[]
  lowStockItems: any[]
  recentSales: RecentSale[]
  paymentBreakdown: { name: string; value: number; color: string }[]
}

function generateChartDataFromSales(sales: any[]): ChartData[] {
  const last7Days: ChartData[] = []
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    const daySales = sales.filter((s: any) => {
      const saleDate = new Date(s.createdAt)
      return saleDate >= date && saleDate < nextDate && s.status === "completed"
    })

    last7Days.push({
      name: dayNames[date.getDay()],
      revenue: daySales.reduce((sum: number, s: any) => sum + s.total, 0),
      orders: daySales.length,
    })
  }

  return last7Days
}

function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

const chartTooltipStyle: React.CSSProperties = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  boxShadow: "var(--shadow-lg)",
  fontSize: "12px",
  padding: "0.75rem 1rem",
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div style={chartTooltipStyle}>
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-muted-foreground" style={{ color: entry.color }}>
            {entry.name === "revenue" ? "Revenue" : "Orders"}: {entry.name === "revenue" ? formatCurrency(entry.value) : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    revenue: 0,
    orders: 0,
    products: 0,
    customers: 0,
    revenueChange: 0,
    ordersChange: 0,
    loading: true,
    chartData: [],
    topProducts: [],
    lowStockItems: [],
    recentSales: [],
    paymentBreakdown: []
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [salesRes, productsRes, customersRes] = await Promise.all([
          fetch("/api/sales"),
          fetch("/api/products"),
          fetch("/api/customers")
        ])

        const salesData = await salesRes.json()
        const productsData = await productsRes.json()
        const customersData = await customersRes.json()

        const sales = salesData.sales || []
        const products = productsData.products || []

        const now = new Date()
        now.setHours(0, 0, 0, 0)

        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)

        const lastWeekStart = new Date(now)
        lastWeekStart.setDate(lastWeekStart.getDate() - 7)

        const prevWeekStart = new Date(now)
        prevWeekStart.setDate(prevWeekStart.getDate() - 14)

        const todaySales = sales.filter((s: any) => new Date(s.createdAt) >= now && s.status === "completed")
        const prevDaySales = sales.filter((s: any) => {
          const d = new Date(s.createdAt)
          return d >= yesterday && d < now && s.status === "completed"
        })
        
        const lowStock = products.filter((p: any) => p.stockQuantity <= p.reorderLevel).slice(0, 5)

        const productSales: Record<string, { sales: number; revenue: number }> = {}
        sales.forEach((sale: any) => {
          if (sale.status === "completed") {
            sale.items?.forEach((item: any) => {
              if (!productSales[item.productName]) {
                productSales[item.productName] = { sales: 0, revenue: 0 }
              }
              productSales[item.productName].sales += item.quantity
              productSales[item.productName].revenue += item.total
            })
          }
        })

        const top5 = Object.entries(productSales)
          .map(([name, d]) => ({
            name,
            sales: d.sales,
            revenue: d.revenue,
            stock: products.find((p: any) => p.name === name)?.stockQuantity || 0
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)

        const chartData = generateChartDataFromSales(sales)

        const paymentTotals: Record<string, number> = {}
        sales.filter((s: any) => s.status === "completed").forEach((s: any) => {
          paymentTotals[s.paymentMethod] = (paymentTotals[s.paymentMethod] || 0) + s.total
        })
        const totalPayment = Object.values(paymentTotals).reduce((a, b) => a + b, 0) || 1
        const paymentColors: Record<string, string> = { cash: "#059669", momo: "#8b5cf6", card: "#f59e0b" }
        const paymentBreakdown = Object.entries(paymentTotals).map(([method, amount]) => ({
          name: method.charAt(0).toUpperCase() + method.slice(1),
          value: Math.round((amount / totalPayment) * 100),
          color: paymentColors[method] || "#6b7280"
        }))

        setData({
          revenue: todaySales.reduce((sum: number, s: any) => sum + s.total, 0),
          orders: todaySales.length,
          products: products.length,
          customers: customersData.customers?.length || 0,
          revenueChange: calculateChange(todaySales.reduce((sum: number, s: any) => sum + s.total, 0), prevDaySales.reduce((sum: number, s: any) => sum + s.total, 0)),
          ordersChange: calculateChange(todaySales.length, prevDaySales.length),
          loading: false,
          chartData,
          topProducts: top5,
          lowStockItems: lowStock.map((p: any) => ({
            name: p.name,
            current: p.stockQuantity,
            reorder: p.reorderLevel
          })),
          recentSales: sales.slice(0, 5).map((s: any) => ({
            receiptNumber: s.receiptNumber,
            customer: s.customer?.name || "Walk-in Customer",
            total: s.total,
            createdAt: s.createdAt,
            status: s.status
          })),
          paymentBreakdown
        })
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        setData(prev => ({ ...prev, loading: false }))
      }
    }

    fetchData()
  }, [])

  if (data.loading) {
    return (
      <AppLayout title="Dashboard">
        <DashboardSkeleton />
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Here&apos;s what&apos;s happening with your store today.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/reports">
              <Button variant="outline" size="sm" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Reports
              </Button>
            </Link>
            <Link href="/pos">
              <Button size="sm" className="gap-2 shadow-glow hover:shadow-glow-soft">
                <Zap className="h-4 w-4" />
                New Sale
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-card/60 backdrop-blur-sm p-6 hover:bg-card/80 hover:shadow-lg hover:border-border/40 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
            
            <div className="flex items-center justify-between relative z-10">
              <div className="h-12 w-12 rounded-xl bg-primary-subtle flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              {data.revenueChange !== 0 && (
                <Badge variant={data.revenueChange > 0 ? "success" : "destructive"} className="text-xs shadow-sm">
                  {data.revenueChange > 0 ? "+" : ""}{data.revenueChange.toFixed(1)}%
                </Badge>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Today&apos;s Revenue</p>
              <p className="text-3xl font-bold mt-1 tracking-tight">{formatCurrency(data.revenue)}</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm p-6 hover:bg-card hover:shadow-xl hover:border-border transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-info/15 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-info/5 rounded-full blur-2xl" />
            
            <div className="flex items-center justify-between relative z-10">
              <div className="h-12 w-12 rounded-xl bg-info-subtle flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="h-6 w-6 text-info" />
              </div>
              {data.ordersChange !== 0 && (
                <Badge variant={data.ordersChange > 0 ? "success" : "destructive"} className="text-xs shadow-sm">
                  {data.ordersChange > 0 ? "+" : ""}{data.ordersChange.toFixed(1)}%
                </Badge>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Orders Today</p>
              <p className="text-3xl font-bold mt-1 tracking-tight">{data.orders}</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm p-6 hover:bg-card hover:shadow-xl hover:border-border transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-warning/15 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-warning/5 rounded-full blur-2xl" />
            
            <div className="flex items-center justify-between relative z-10">
              <div className="h-12 w-12 rounded-xl bg-warning-subtle flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Package className="h-6 w-6 text-warning" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-3xl font-bold mt-1 tracking-tight">{data.products}</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm p-6 hover:bg-card hover:shadow-xl hover:border-border transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#8b5cf6]/15 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#8b5cf6]/5 rounded-full blur-2xl" />
            
            <div className="flex items-center justify-between relative z-10">
              <div className="h-12 w-12 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-[#8b5cf6]" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-3xl font-bold mt-1 tracking-tight">{data.customers}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary-subtle flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Revenue Overview</CardTitle>
                    <CardDescription className="text-xs">Last 7 days performance</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chartData.length > 0 ? data.chartData : [{ name: "No Data", revenue: 0, orders: 0 }]}>
                    <defs>
                      <linearGradient id="colorRevenueNew" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `₵${value}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--primary)"
                      strokeWidth={2.5}
                      fill="url(#colorRevenueNew)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-[#8b5cf6]" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Top Products</CardTitle>
                    <CardDescription className="text-xs">Best selling items this week</CardDescription>
                  </div>
                </div>
                <Link href="/reports">
                  <Button variant="ghost" size="sm" className="text-muted-foreground text-xs gap-1">
                    View All <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {data.topProducts.length === 0 ? (
                <div className="h-80 flex items-center justify-center">
                  <EmptyState
                    icon={Package}
                    title="No sales data yet"
                    description="Start making sales to see top products"
                  />
                </div>
              ) : (
                <div className="h-80 w-full -ml-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topProducts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.5} />
                      <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `₵${value}`} />
                      <YAxis dataKey="name" type="category" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: "var(--foreground)", fontWeight: 600 }} formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="revenue" fill="var(--chart-2)" radius={[0, 6, 6, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-warning-subtle flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Low Stock Alerts</CardTitle>
                    <CardDescription className="text-xs">{data.lowStockItems.length} items need restocking</CardDescription>
                  </div>
                </div>
                <Link href="/inventory">
                  <Button variant="ghost" size="sm" className="text-muted-foreground text-xs gap-1">
                    Manage <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {data.lowStockItems.length === 0 ? (
                <div className="h-48 flex items-center justify-center">
                  <EmptyState
                    icon={TrendingUp}
                    title="All stock levels healthy"
                    description="No items below reorder level"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {data.lowStockItems.slice(0, 4).map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-warning-subtle flex items-center justify-center">
                          <Package className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Reorder at {item.reorder}+ units</p>
                        </div>
                      </div>
                      <Badge variant="warning" className="text-xs">{item.current} left</Badge>
                    </div>
                  ))}
                  {data.lowStockItems.length > 4 && (
                    <Link href="/inventory" className="block pt-2">
                      <Button variant="outline" size="sm" className="w-full text-xs gap-2">
                        View {data.lowStockItems.length - 4} more items
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-info-subtle flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Payment Methods</CardTitle>
                    <CardDescription className="text-xs">Breakdown by method</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {data.paymentBreakdown.length === 0 ? (
                <div className="h-48 flex items-center justify-center">
                  <EmptyState
                    icon={CreditCard}
                    title="No payment data yet"
                    description="Complete sales to see payment breakdown"
                  />
                </div>
              ) : (
                <div className="space-y-5">
                  {data.paymentBreakdown.map((method, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{method.name}</span>
                        <span className="font-bold">{method.value}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${method.value}%`, backgroundColor: method.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-success-subtle flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-success" />
                </div>
                <div>
                  <CardTitle className="text-base">Recent Transactions</CardTitle>
                  <CardDescription className="text-xs">Latest sales activity</CardDescription>
                </div>
              </div>
              <Link href="/sales">
                <Button variant="ghost" size="sm" className="text-muted-foreground text-xs gap-1">
                  View All <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentSales.length === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <EmptyState
                  icon={Receipt}
                  title="No recent transactions"
                  description="Start by making your first sale"
                  action={
                    <Link href="/pos">
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Sale
                      </Button>
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {data.recentSales.map((transaction, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0 hover:bg-secondary/30 transition-colors px-3 -mx-3 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary-subtle flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold font-mono">{transaction.receiptNumber}</p>
                        <p className="text-sm text-muted-foreground">{transaction.customer}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(transaction.total)}</p>
                      <Badge variant="success" className="text-[10px] mt-1">{transaction.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}