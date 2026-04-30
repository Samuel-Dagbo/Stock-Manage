"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AppLayout } from "@/components/shared/app-layout"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Clock,
  AlertTriangle,
  Activity,
  Target,
  Zap,
  CreditCard,
  MoreHorizontal,
  ChevronRight,
  ArrowRight,
  Package2,
  Receipt,
  TrendingDown as DownIcon,
  CircleDot
} from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { motion } from "framer-motion"
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

interface DashboardMetrics {
  revenue: number
  orders: number
  products: number
  customers: number
  revenueChange: number
  ordersChange: number
  productsChange: number
  customersChange: number
}

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

const COLORS = ["#059669", "#8b5cf6", "#f59e0b", "#ef4444", "#3b82f6"]

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

    const daySales = sales.filter((s) => {
      const saleDate = new Date(s.createdAt)
      return saleDate >= date && saleDate < nextDate && s.status === "completed"
    })

    last7Days.push({
      name: dayNames[date.getDay()],
      revenue: daySales.reduce((sum, s) => sum + s.total, 0),
      orders: daySales.length,
    })
  }

  return last7Days
}

function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="relative overflow-hidden border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="mt-5 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4 border-b">
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="pt-4">
            <Skeleton className="h-64 w-full rounded-xl" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4 border-b">
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardHeader className="pb-4 border-b border-amber-200/50 dark:border-amber-800/50">
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-amber-200/50 dark:border-amber-800/50">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4 border-b">
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  change: number
  trend: "up" | "down" | "neutral"
  icon: any
  color: string
  bgGradient: string
  delay?: number
}

function MetricCard({ title, value, change, trend, icon: Icon, color, bgGradient, delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="relative overflow-hidden border-0 shadow-md card-hover">
        <div className={`absolute top-0 right-0 w-32 h-32 ${bgGradient} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div className={`h-14 w-14 rounded-2xl ${bgGradient} flex items-center justify-center shadow-lg`}>
              <Icon className={`h-7 w-7 ${color}`} />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              trend === "up" ? "text-emerald-600 dark:text-emerald-400" :
              trend === "down" ? "text-rose-600 dark:text-rose-400" :
              "text-muted-foreground"
            }`}>
              {trend === "up" ? <ArrowUpRight className="h-4 w-4" /> :
               trend === "down" ? <ArrowDownRight className="h-4 w-4" /> :
               <CircleDot className="h-3 w-3" />}
              {Math.abs(change)}%
            </div>
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

function StatCard({ title, value, subtitle, icon: Icon, color }: { title: string, value: string, subtitle: string, icon: any, color: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-border/50">
      <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
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
        const weekRevenue = thisWeekSales.reduce((sum: number, s: any) => sum + s.total, 0)
        const prevWeekRevenue = prevWeekSales.reduce((sum: number, s: any) => sum + s.total, 0)

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
          .map(([name, data]) => ({
            name,
            sales: data.sales,
            revenue: data.revenue,
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
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              Welcome back! 👋
              <motion.span
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                👋
              </motion.span>
            </h2>
            <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your store today.</p>
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last updated: Just now</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/reports">
              <Button variant="outline" className="gap-2">
                <Activity className="h-4 w-4" />
                Reports
              </Button>
            </Link>
            <Link href="/pos">
              <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25">
                <Zap className="h-4 w-4" />
                New Sale
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Today's Revenue"
            value={formatCurrency(data.revenue)}
            change={data.revenueChange}
            trend={data.revenue > 0 ? "up" : "neutral"}
            icon={DollarSign}
            color="text-primary"
            bgGradient="bg-gradient-to-br from-primary/20 to-primary/5"
            delay={0.1}
          />
          <MetricCard
            title="Orders Today"
            value={data.orders.toString()}
            change={data.ordersChange}
            trend="up"
            icon={ShoppingCart}
            color="text-violet-600"
            bgGradient="bg-gradient-to-br from-violet-500/20 to-violet-500/5"
            delay={0.15}
          />
          <MetricCard
            title="Total Products"
            value={data.products.toString()}
            change={0}
            trend="neutral"
            icon={Package}
            color="text-amber-600"
            bgGradient="bg-gradient-to-br from-amber-500/20 to-amber-500/5"
            delay={0.2}
          />
          <MetricCard
            title="Total Customers"
            value={data.customers.toString()}
            change={0}
            trend="up"
            icon={Users}
            color="text-cyan-600"
            bgGradient="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5"
            delay={0.25}
          />
        </motion.div>

        <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
          <Card className="border-0 shadow-md overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  Revenue Overview
                </CardTitle>
                <CardDescription>Sales performance this week</CardDescription>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Last 7 Days
              </Badge>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chartData.length > 0 ? data.chartData : [{ name: "No Data", revenue: 0, orders: 0 }]}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                    <XAxis dataKey="name" className="text-xs" tick={{ fill: 'var(--muted-foreground)' }} />
                    <YAxis className="text-xs" tick={{ fill: 'var(--muted-foreground)' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.75rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      labelStyle={{ color: 'var(--foreground)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#059669"
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b bg-gradient-to-r from-violet-500/5 to-transparent">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Target className="h-4 w-4 text-violet-600" />
                  </div>
                  Top Products
                </CardTitle>
                <CardDescription>Best selling items this week</CardDescription>
              </div>
              <Link href="/reports">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topProducts.length > 0 ? data.topProducts : [{ name: "No Data", sales: 0, revenue: 0, stock: 0 }]} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                    <XAxis type="number" className="text-xs" tick={{ fill: 'var(--muted-foreground)' }} />
                    <YAxis dataKey="name" type="category" className="text-xs" tick={{ fill: 'var(--muted-foreground)' }} width={120} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.75rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      labelStyle={{ color: 'var(--foreground)' }}
                    />
                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
          <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/20 dark:to-orange-950/20 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-amber-200/50 dark:border-amber-800/50">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="relative flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-amber-500 animate-pulse" />
                  </div>
                  Low Stock Alerts
                </CardTitle>
                <CardDescription>Items that need restocking</CardDescription>
              </div>
              <Link href="/inventory">
                <Button variant="ghost" size="sm" className="text-amber-600">
                  Manage <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {data.lowStockItems.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-8 text-center"
                  >
                    <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                      <TrendingUp className="h-8 w-8 text-emerald-500" />
                    </div>
                    <p className="font-medium text-emerald-600 dark:text-emerald-400">All stock levels are healthy!</p>
                    <p className="text-sm text-muted-foreground mt-1">No items below reorder level</p>
                  </motion.div>
                ) : (
                  <>
                    {data.lowStockItems.slice(0, 4).map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-black/20 border border-amber-200/50 dark:border-amber-800/50 hover:bg-white/80 dark:hover:bg-black/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Reorder at {item.reorder}+ units</p>
                          </div>
                        </div>
                        <Badge className="bg-amber-500 text-white shadow-sm">
                          {item.current} left
                        </Badge>
                      </motion.div>
                    ))}
                    {data.lowStockItems.length > 4 && (
                      <Link href="/inventory" className="block mt-2">
                        <Button variant="outline" className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/30">
                          View {data.lowStockItems.length - 4} more items
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b bg-gradient-to-r from-cyan-500/5 to-transparent">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-cyan-600" />
                  </div>
                  Quick Actions
                </CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "New Sale", icon: ShoppingCart, href: "/pos", color: "from-primary to-primary/80", iconColor: "text-white", description: "Process sale" },
                  { label: "Add Product", icon: Package, href: "/products", color: "from-violet-500 to-violet-600", iconColor: "text-white", description: "Add new item" },
                  { label: "Add Customer", icon: Users, href: "/customers", color: "from-amber-500 to-amber-600", iconColor: "text-white", description: "New customer" },
                  { label: "Record Expense", icon: DollarSign, href: "/expenses", color: "from-cyan-500 to-cyan-600", iconColor: "text-white", description: "Track spending" },
                ].map((action, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link href={action.href}>
                      <Card className="h-full p-4 hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer group">
                        <div className="flex flex-col items-center text-center gap-3">
                          <span className={`h-12 w-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                            <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                          </span>
                          <div>
                            <p className="font-medium text-sm">{action.label}</p>
                            <p className="text-xs text-muted-foreground">{action.description}</p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{data.orders}</p>
                    <p className="text-xs text-muted-foreground">Orders Today</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-violet-600">{data.topProducts.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Top Products</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600">{data.lowStockItems.length}</p>
                    <p className="text-xs text-muted-foreground">Low Stock</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-0 shadow-md overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b bg-gradient-to-r from-emerald-500/5 to-transparent">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Receipt className="h-4 w-4 text-emerald-600" />
                  </div>
                  Recent Transactions
                </CardTitle>
                <CardDescription>Latest sales and activity</CardDescription>
              </div>
              <Link href="/sales">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              {data.recentSales.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No recent transactions</p>
                  <p className="text-sm text-muted-foreground">Start by making your first sale</p>
                  <Link href="/pos">
                    <Button className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      New Sale
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {data.recentSales.map((transaction, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between py-4 first:pt-0 last:pb-0 hover:bg-muted/30 -mx-4 px-4 transition-colors rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <ShoppingCart className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium font-mono text-sm">{transaction.receiptNumber}</p>
                          <p className="text-sm text-muted-foreground">{transaction.customer}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(transaction.total)}</p>
                        <Badge className="text-xs bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/20">
                          {transaction.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  )
}
