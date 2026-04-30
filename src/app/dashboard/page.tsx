"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AppLayout } from "@/components/shared/app-layout"
import { StatCard } from "@/components/shared/stat-card"
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
  PieChart,
  Pie,
  Cell
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
          <div key={i} className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="mt-3 space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-28" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border">
          <div className="p-5 pb-3 border-b"><Skeleton className="h-4 w-32" /></div>
          <div className="p-5"><Skeleton className="h-64 w-full rounded-lg" /></div>
        </div>
        <div className="rounded-xl border border-border">
          <div className="p-5 pb-3 border-b"><Skeleton className="h-4 w-32" /></div>
          <div className="p-5"><Skeleton className="h-64 w-full rounded-lg" /></div>
        </div>
      </div>
    </div>
  )
}

const chartTooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  boxShadow: "var(--shadow-md)",
  fontSize: "12px",
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
        const thisWeekSales = sales.filter((s: any) => {
          const d = new Date(s.createdAt)
          return d >= lastWeekStart && s.status === "completed"
        })
        const prevWeekSales = sales.filter((s: any) => {
          const d = new Date(s.createdAt)
          return d >= prevWeekStart && d < lastWeekStart && s.status === "completed"
        })

        const todayRevenue = todaySales.reduce((sum: number, s: any) => sum + s.total, 0)
        const prevDayRevenue = prevDaySales.reduce((sum: number, s: any) => sum + s.total, 0)

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
        const paymentColors: Record<string, string> = { cash: "#059669", momo: "#7c3aed", card: "#d97706" }
        const paymentBreakdown = Object.entries(paymentTotals).map(([method, amount]) => ({
          name: method.charAt(0).toUpperCase() + method.slice(1),
          value: Math.round((amount / totalPayment) * 100),
          color: paymentColors[method] || "#6b7280"
        }))

        setData({
          revenue: todayRevenue,
          orders: todaySales.length,
          products: products.length,
          customers: customersData.customers?.length || 0,
          revenueChange: calculateChange(todayRevenue, prevDayRevenue),
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
            <h2 className="text-xl font-semibold tracking-tight">Welcome back</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Here&apos;s what&apos;s happening with your store today.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/reports">
              <Button variant="outline" size="sm" className="gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Reports
              </Button>
            </Link>
            <Link href="/pos">
              <Button size="sm" className="gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                New Sale
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(data.revenue)}
            change={data.revenueChange}
            trend={data.revenue > 0 ? "up" : "neutral"}
            icon={DollarSign}
          />
          <StatCard
            title="Orders Today"
            value={data.orders.toString()}
            change={data.ordersChange}
            trend="up"
            icon={ShoppingCart}
            iconClassName="bg-info-subtle text-info"
          />
          <StatCard
            title="Total Products"
            value={data.products.toString()}
            icon={Package}
            iconClassName="bg-warning-subtle text-warning"
          />
          <StatCard
            title="Total Customers"
            value={data.customers.toString()}
            icon={Users}
            iconClassName="bg-[#f0f0ff] dark:bg-[#1a1040] text-[#7c3aed]"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-primary-subtle flex items-center justify-center">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>Last 7 days</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chartData.length > 0 ? data.chartData : [{ name: "No Data", revenue: 0, orders: 0 }]}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-[#f0f0ff] dark:bg-[#1a1040] flex items-center justify-center">
                    <Target className="h-3.5 w-3.5 text-[#7c3aed]" />
                  </div>
                  <div>
                    <CardTitle>Top Products</CardTitle>
                    <CardDescription>Best selling items</CardDescription>
                  </div>
                </div>
                <Link href="/reports">
                  <Button variant="ghost" size="sm" className="text-muted-foreground text-[12px] gap-1">
                    View All <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {data.topProducts.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No sales data yet"
                  description="Start making sales to see top products"
                />
              ) : (
                <div className="h-64 w-full -ml-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topProducts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                      <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                      <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: "var(--foreground)", fontWeight: 600 }} />
                      <Bar dataKey="revenue" fill="var(--chart-2)" radius={[0, 3, 3, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-warning-subtle flex items-center justify-center">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                  </div>
                  <div>
                    <CardTitle>Low Stock Alerts</CardTitle>
                    <CardDescription>{data.lowStockItems.length} items need restocking</CardDescription>
                  </div>
                </div>
                <Link href="/inventory">
                  <Button variant="ghost" size="sm" className="text-muted-foreground text-[12px] gap-1">
                    Manage <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {data.lowStockItems.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="All stock levels are healthy"
                  description="No items below reorder level"
                />
              ) : (
                <div className="space-y-2">
                  {data.lowStockItems.slice(0, 4).map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-warning-subtle flex items-center justify-center">
                          <Package className="h-4 w-4 text-warning" />
                        </div>
                        <div>
                          <p className="text-[13px] font-medium">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground">Reorder at {item.reorder}+ units</p>
                        </div>
                      </div>
                      <Badge variant="warning">{item.current} left</Badge>
                    </div>
                  ))}
                  {data.lowStockItems.length > 4 && (
                    <Link href="/inventory" className="block pt-1">
                      <Button variant="outline" size="sm" className="w-full text-[12px] gap-1">
                        View {data.lowStockItems.length - 4} more items
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-info-subtle flex items-center justify-center">
                    <CreditCard className="h-3.5 w-3.5 text-info" />
                  </div>
                  <div>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Breakdown by method</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {data.paymentBreakdown.length === 0 ? (
                <EmptyState
                  icon={CreditCard}
                  title="No payment data yet"
                  description="Complete sales to see payment breakdown"
                />
              ) : (
                <div className="space-y-3">
                  {data.paymentBreakdown.map((method, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-medium">{method.name}</span>
                        <span className="text-[13px] font-semibold">{method.value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
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

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-success-subtle flex items-center justify-center">
                  <Receipt className="h-3.5 w-3.5 text-success" />
                </div>
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest sales activity</CardDescription>
                </div>
              </div>
              <Link href="/sales">
                <Button variant="ghost" size="sm" className="text-muted-foreground text-[12px] gap-1">
                  View All <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentSales.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No recent transactions"
                description="Start by making your first sale"
                action={
                  <Link href="/pos">
                    <Button size="sm" className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      New Sale
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="divide-y divide-border">
                {data.recentSales.map((transaction, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-primary-subtle flex items-center justify-center">
                        <ShoppingCart className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium font-mono">{transaction.receiptNumber}</p>
                        <p className="text-[11px] text-muted-foreground">{transaction.customer}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-semibold">{formatCurrency(transaction.total)}</p>
                      <Badge variant="success" className="text-[10px]">
                        {transaction.status}
                      </Badge>
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
