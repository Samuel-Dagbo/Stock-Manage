"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AppLayout } from "@/components/shared/app-layout"
import { StatCard } from "@/components/shared/stat-card"
import { EmptyState } from "@/components/shared/empty-state"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Download,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  FileText,
  PieChart as PieChartIcon,
  TrendingUp as TrendIcon,
  Activity,
  Calendar,
  ArrowRight,
  Plus,
  Search,
  Filter,
  jsPDF,
  autoTable,
  format,
  formatCurrency,
  formatDateTime,
  formatRelativeTime,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
  subYears,
  isWithinInterval,
} from "@/components/ui/exports"
import { formatCurrency, formatDateTime, formatRelativeTime } from "@/lib/utils"
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
  Cell,
  LineChart,
  Line
} from "recharts"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
  subYears,
  isWithinInterval,
} from "date-fns"

type PeriodType = "today" | "week" | "month" | "year"

interface Sale {
  _id: string
  receiptNumber: string
  customer: { name: string } | null
  items: { quantity: number; productName: string; price: number; total: number }[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: string
  status: string
  createdAt: string
}

interface Product {
  _id: string
  name: string
  sku: string
  stockQuantity: number
  category: { name: string }
  sellingPrice: number
}

interface DashboardMetrics {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  totalCustomers: number
  revenueChange: number
  ordersChange: number
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-72 w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-72 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

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

export default function ReportsPage() {
  const [period, setPeriod] = useState<PeriodType>("month")
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    totalCustomers: 0,
    revenueChange: 0,
    ordersChange: 0,
  })
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [chartData, setChartData] = useState<any[]>([])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [salesRes, productsRes, metricsRes] = await Promise.all([
        fetch("/api/sales"),
        fetch("/api/products"),
        fetch("/api/metrics"),
      ])
      const salesData = await salesRes.json()
      const productsData = await productsRes.json()
      const metricsData = await metricsRes.json()
      setSales(salesData.sales || [])
      setProducts(productsData.products || [])
      setMetrics(metricsData)
      generateChartData(salesData.sales || [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const generateChartData = (sales: Sale[]) => {
    const now = new Date()
    let data: any[] = []

    switch (period) {
      case "today":
        for (let i = 0; i < 24; i++) {
          const hourSales = sales.filter((s: Sale) => {
            const saleDate = new Date(s.createdAt)
            return saleDate.getHours() === i && saleDate.toDateString() === now.toDateString()
          })
          data.push({
            name: `${i}:00`,
            revenue: hourSales.reduce((sum: number, s: Sale) => sum + s.total, 0),
            orders: hourSales.length,
          })
        }
        break
      case "week":
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const daySales = sales.filter((s: Sale) => {
            const saleDate = new Date(s.createdAt)
            return saleDate.toDateString() === date.toDateString()
          })
          data.push({
            name: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
            revenue: daySales.reduce((sum: number, s: Sale) => sum + s.total, 0),
            orders: daySales.length,
          })
        }
        break
      case "month":
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        for (let i = 0; i < daysInMonth; i++) {
          const date = new Date(now.getFullYear(), now.getMonth(), i + 1)
          const daySales = sales.filter((s: Sale) => {
            const saleDate = new Date(s.createdAt)
            return saleDate.toDateString() === date.toDateString()
          })
          data.push({
            name: (i + 1).toString(),
            revenue: daySales.reduce((sum: number, s: Sale) => sum + s.total, 0),
            orders: daySales.length,
          })
        }
        break
      case "year":
        for (let i = 0; i < 12; i++) {
          const monthSales = sales.filter((s: Sale) => {
            const saleDate = new Date(s.createdAt)
            return saleDate.getMonth() === i && saleDate.getFullYear() === now.getFullYear()
          })
          data.push({
            name: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
            revenue: monthSales.reduce((sum: number, s: Sale) => sum + s.total, 0),
            orders: monthSales.length,
          })
        }
        break
    }
    setChartData(data)
  }

  useEffect(() => {
    generateChartData(sales)
  }, [period, sales])

  const topProducts = useMemo(() => {
    const productSales: Record<string, { revenue: number; quantity: number }> = {}
    sales.forEach((sale: Sale) => {
      sale.items.forEach((item) => {
        if (!productSales[item.productName]) {
          productSales[item.productName] = { revenue: 0, quantity: 0 }
        }
        productSales[item.productName].revenue += item.total
        productSales[item.productName].quantity += item.quantity
      })
    })
    return Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }, [sales])

  const categoryData = useMemo(() => {
    const categorySales: Record<string, number> = {}
    sales.forEach((sale: Sale) => {
      sale.items.forEach((item) => {
        const product = products.find((p: Product) => p.name === item.productName)
        const category = product?.category?.name || "Other"
        if (!categorySales[category]) {
          categorySales[category] = 0
        }
        categorySales[category] += item.total
      })
    })
    return Object.entries(categorySales).map(([name, value]) => ({ name, value }))
  }, [sales, products])

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text("Sales Report", 105, 20, { align: "center" })
    doc.setFontSize(12)
    doc.text(`Period: ${period.charAt(0).toUpperCase() + period.slice(1)}`, 105, 30, { align: "center" })
    doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy")}`, 105, 40, { align: "center" })

    const tableData = sales.slice(0, 50).map((sale: Sale) => [
      sale.receiptNumber,
      sale.customer?.name || "Walk-in",
      formatDateTime(sale.createdAt),
      formatCurrency(sale.total),
      sale.paymentMethod,
    ])

    autoTable(doc, {
      startY: 50,
      head: [["Receipt", "Customer", "Date", "Total", "Payment"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [99, 102, 241] },
    })

    const finalY = (doc as any).lastAutoTable.finalY || 50
    doc.setFontSize(12)
    doc.text(`Total Revenue: ${formatCurrency(metrics.totalRevenue)}`, 140, finalY + 20)
    doc.text(`Total Orders: ${metrics.totalOrders}`, 140, finalY + 30)

    doc.save(`sales-report-${format(new Date(), "yyyy-MM-dd")}.pdf`)
  }

  if (loading) {
    return (
      <AppLayout title="Reports">
        <ReportsSkeleton />
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">Track your business performance</p>
          </div>
          <div className="flex gap-3">
            <Select value={period} onValueChange={(v: PeriodType) => setPeriod(v)}>
              <SelectTrigger className="w-[140px] text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2 text-sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(metrics.totalRevenue)}
            change={metrics.revenueChange}
            trend={metrics.revenueChange > 0 ? "up" : "down"}
            icon={DollarSign}
            iconClassName="bg-primary/10 text-primary"
          />
          <StatCard
            title="Total Orders"
            value={metrics.totalOrders.toString()}
            change={metrics.ordersChange}
            trend={metrics.ordersChange > 0 ? "up" : "down"}
            icon={ShoppingCart}
            iconClassName="bg-info/10 text-info"
          />
          <StatCard
            title="Avg Order Value"
            value={formatCurrency(metrics.avgOrderValue)}
            icon={Package}
            iconClassName="bg-warning/10 text-warning"
          />
          <StatCard
            title="Total Customers"
            value={metrics.totalCustomers.toString()}
            icon={Users}
            iconClassName="bg-success/10 text-success"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Revenue Overview</CardTitle>
                        <CardDescription className="text-xs">{period.charAt(0).toUpperCase() + period.slice(1)} performance</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-72 w-full -ml-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                        <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `₵${value}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-[#8b5cf6]" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Orders Trend</CardTitle>
                        <CardDescription className="text-xs">Daily order volume</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-72 w-full -ml-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                        <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="orders" stroke="var(--chart-2)" strokeWidth={2.5} dot={{ fill: "var(--chart-2)", strokeWidth: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-success/10 flex items-center justify-center">
                      <Package className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Top Selling Products</CardTitle>
                      <CardDescription className="text-xs">Best performing items</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full -ml-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.5} />
                      <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `₵${value}`} />
                      <YAxis dataKey="name" type="category" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                      <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: "var(--foreground)", fontWeight: 600 }} formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="revenue" fill="var(--chart-2)" radius={[0, 4, 4, 0]} barSize={25} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-info/10 flex items-center justify-center">
                      <Package className="h-4 w-4 text-info" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Product Performance</CardTitle>
                      <CardDescription className="text-xs">Sales by product</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.5} />
                      <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `₵${value}`} />
                      <YAxis dataKey="name" type="category" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                      <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: "var(--foreground)", fontWeight: 600 }} formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="revenue" fill="var(--chart-3)" radius={[0, 4, 4, 0]} barSize={25} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-warning/10 flex items-center justify-center">
                      <PieChartIcon className="h-4 w-4 text-warning" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Sales by Category</CardTitle>
                      <CardDescription className="text-xs">Revenue distribution</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => formatCurrency(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}


interface Product {
  _id: string
  name: string
  sku: string
  stockQuantity: number
  category: { name: string }
  sellingPrice: number
}

interface DashboardMetrics {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  totalCustomers: number
  revenueChange: number
  ordersChange: number
}

const chartTooltipStyle = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '0.5rem',
  boxShadow: 'var(--shadow-md)',
  fontSize: '12px',
}

function formatPeriodLabel(period: PeriodType): string {
  switch (period) {
    case "today": return "Today"
    case "week": return "This Week"
    case "month": return "This Month"
    case "year": return "This Year"
  }
}

function getDateRange(period: PeriodType): { start: Date; end: Date; compareStart: Date; compareEnd: Date } {
  const now = new Date()
  let start: Date, end: Date, compareStart: Date, compareEnd: Date

  switch (period) {
    case "today":
      start = startOfDay(now)
      end = endOfDay(now)
      compareStart = startOfDay(subDays(now, 1))
      compareEnd = endOfDay(subDays(now, 1))
      break
    case "week":
      start = startOfWeek(now, { weekStartsOn: 1 })
      end = endOfWeek(now, { weekStartsOn: 1 })
      compareStart = startOfWeek(subDays(now, 7), { weekStartsOn: 1 })
      compareEnd = endOfWeek(subDays(now, 7), { weekStartsOn: 1 })
      break
    case "month":
      start = startOfMonth(now)
      end = endOfMonth(now)
      compareStart = startOfMonth(subMonths(now, 1))
      compareEnd = endOfMonth(subMonths(now, 1))
      break
    case "year":
      start = startOfYear(now)
      end = endOfYear(now)
      compareStart = startOfYear(subYears(now, 1))
      compareEnd = endOfYear(subYears(now, 1))
      break
  }

  return { start, end, compareStart, compareEnd }
}

function filterSalesByPeriod(sales: Sale[], period: PeriodType): Sale[] {
  const { start, end } = getDateRange(period)
  return sales.filter(sale => {
    const saleDate = new Date(sale.createdAt)
    return isWithinInterval(saleDate, { start, end })
  })
}

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={chartTooltipStyle} className="p-3">
        <p className="font-medium text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-[13px]" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-[140px]" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-4 w-14" />
            </div>
            <div className="mt-3 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<PeriodType>("month")
  const [loading, setLoading] = useState(true)
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customerCount, setCustomerCount] = useState(0)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [salesRes, productsRes, customersRes] = await Promise.all([
          fetch("/api/sales"),
          fetch("/api/products"),
          fetch("/api/customers")
        ])

        const salesData = await salesRes.json()
        const productsData = await productsRes.json()
        const customersData = await customersRes.json()

        setSales(salesData.sales || [])
        setProducts(productsData.products || [])
        setCustomerCount(customersData.customers?.length || 0)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredSales = useMemo(() => filterSalesByPeriod(sales, period), [sales, period])

  const metrics = useMemo((): DashboardMetrics => {
    const { compareStart, compareEnd } = getDateRange(period)

    const currentRevenue = filteredSales
      .filter(s => s.status !== "refunded")
      .reduce((sum, s) => sum + s.total, 0)

    const previousSales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt)
      return isWithinInterval(saleDate, { start: compareStart, end: compareEnd }) && sale.status !== "refunded"
    })
    const previousRevenue = previousSales.reduce((sum, s) => sum + s.total, 0)

    const currentOrders = filteredSales.filter(s => s.status === "completed").length
    const previousOrders = previousSales.filter(s => s.status === "completed").length

    return {
      totalRevenue: currentRevenue,
      totalOrders: currentOrders,
      avgOrderValue: currentOrders > 0 ? currentRevenue / currentOrders : 0,
      totalCustomers: customerCount,
      revenueChange: calculatePercentageChange(currentRevenue, previousRevenue),
      ordersChange: calculatePercentageChange(currentOrders, previousOrders),
    }
  }, [filteredSales, sales, period, customerCount])

  const chartData = useMemo(() => {
    if (period === "today") {
      const hourlyData = Array.from({ length: 12 }, (_, i) => {
        const hour = i + 8
        const hourSales = filteredSales.filter(s => {
          const saleHour = new Date(s.createdAt).getHours()
          return saleHour >= hour && saleHour < hour + 1
        })
        return {
          label: `${hour}:00`,
          revenue: hourSales.reduce((sum, s) => sum + s.total, 0),
          orders: hourSales.length
        }
      })
      return { data: hourlyData, xKey: "label", revenueKey: "revenue" }
    } else if (period === "week") {
      const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      const dailyData = dayNames.map((day, i) => {
        const daySales = filteredSales.filter(s => {
          const saleDay = new Date(s.createdAt).getDay()
          return saleDay === (i + 1) % 7
        })
        return {
          label: day,
          revenue: daySales.reduce((sum, s) => sum + s.total, 0),
          orders: daySales.length
        }
      })
      return { data: dailyData, xKey: "label", revenueKey: "revenue" }
    } else if (period === "month") {
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
      const dailyData = Array.from({ length: Math.min(daysInMonth, 31) }, (_, i) => {
        const day = i + 1
        const daySales = filteredSales.filter(s => new Date(s.createdAt).getDate() === day)
        return {
          label: `${day}`,
          revenue: daySales.reduce((sum, s) => sum + s.total, 0),
          orders: daySales.length
        }
      })
      return { data: dailyData, xKey: "label", revenueKey: "revenue" }
    } else {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const monthlyData = monthNames.map((month, i) => {
        const monthSales = filteredSales.filter(s => new Date(s.createdAt).getMonth() === i)
        return {
          label: month,
          revenue: monthSales.reduce((sum, s) => sum + s.total, 0),
          orders: monthSales.length
        }
      })
      return { data: monthlyData, xKey: "label", revenueKey: "revenue" }
    }
  }, [filteredSales, period])

  const paymentMethodData = useMemo(() => {
    const totals = { cash: 0, momo: 0, card: 0 }
    filteredSales.forEach(sale => {
      if (sale.status !== "refunded") {
        totals[sale.paymentMethod as keyof typeof totals] =
          (totals[sale.paymentMethod as keyof typeof totals] || 0) + sale.total
      }
    })
    const total = Object.values(totals).reduce((a, b) => a + b, 0) || 1
    return [
      { name: "Cash", value: Math.round((totals.cash / total) * 100), color: "#059669", amount: totals.cash },
      { name: "Mobile Money", value: Math.round((totals.momo / total) * 100), color: "#8b5cf6", amount: totals.momo },
      { name: "Card", value: Math.round((totals.card / total) * 100), color: "#f59e0b", amount: totals.card },
    ]
  }, [filteredSales])

  const topProductsData = useMemo(() => {
    const productSales: Record<string, { revenue: number; units: number }> = {}
    filteredSales.forEach(sale => {
      sale.items?.forEach(item => {
        if (!productSales[item.productName]) {
          productSales[item.productName] = { revenue: 0, units: 0 }
        }
        productSales[item.productName].revenue += item.total
        productSales[item.productName].units += item.quantity
      })
    })
    return Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }, [filteredSales])

  const handleExportCSV = () => {
    const headers = ["Date", "Receipt #", "Customer", "Items", "Subtotal", "Tax", "Discount", "Total", "Payment", "Status"]
    const rows = filteredSales.map(sale => [
      format(new Date(sale.createdAt), "yyyy-MM-dd HH:mm"),
      sale.receiptNumber,
      sale.customer?.name || "Walk-in",
      sale.items.length,
      sale.subtotal.toFixed(2),
      sale.tax.toFixed(2),
      sale.discount.toFixed(2),
      sale.total.toFixed(2),
      sale.paymentMethod,
      sale.status
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `sales-report-${period}-${format(new Date(), "yyyy-MM-dd")}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.setTextColor(5, 150, 105)
    doc.text("Sales Report", 14, 22)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Period: ${formatPeriodLabel(period)} - Generated: ${format(new Date(), "yyyy-MM-dd HH:mm")}`, 14, 30)

    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.text("Summary", 14, 45)

    doc.setFontSize(10)
    doc.text(`Total Revenue: ${formatCurrency(metrics.totalRevenue)}`, 14, 55)
    doc.text(`Total Orders: ${metrics.totalOrders}`, 14, 62)
    doc.text(`Average Order Value: ${formatCurrency(metrics.avgOrderValue)}`, 14, 69)

    doc.setFontSize(14)
    doc.text("Top Products", 14, 85)

    autoTable(doc, {
      startY: 90,
      head: [["Product", "Units Sold", "Revenue"]],
      body: topProductsData.map(p => [p.name, p.units, formatCurrency(p.revenue)]),
      theme: "striped",
      headStyles: { fillColor: [5, 150, 105] }
    })

    const finalY = (doc as any).lastAutoTable?.finalY || 140

    doc.setFontSize(14)
    doc.text("Payment Methods", 14, finalY + 15)

    autoTable(doc, {
      startY: finalY + 20,
      head: [["Method", "Percentage", "Amount"]],
      body: paymentMethodData.map(p => [p.name, `${p.value}%`, formatCurrency(p.amount)]),
      theme: "striped",
      headStyles: { fillColor: [5, 150, 105] }
    })

    doc.save(`sales-report-${period}-${format(new Date(), "yyyy-MM-dd")}.pdf`)
  }

  if (loading) {
    return (
      <AppLayout title="Reports">
        <ReportsSkeleton />
      </AppLayout>
    )
  }

  const displayMetrics = [
    { title: "Total Revenue", value: formatCurrency(metrics.totalRevenue), change: metrics.revenueChange, trend: (metrics.revenueChange > 0 ? "up" : metrics.revenueChange < 0 ? "down" : "neutral") as "up" | "down" | "neutral", icon: DollarSign, iconClassName: "bg-emerald-500/10 text-emerald-600" },
    { title: "Total Orders", value: metrics.totalOrders.toString(), change: metrics.ordersChange, trend: (metrics.ordersChange > 0 ? "up" : metrics.ordersChange < 0 ? "down" : "neutral") as "up" | "down" | "neutral", icon: ShoppingCart, iconClassName: "bg-primary-subtle text-primary" },
    { title: "Avg Order Value", value: formatCurrency(metrics.avgOrderValue), change: 0, trend: "neutral" as const, icon: BarChart3, iconClassName: "bg-violet-500/10 text-violet-600" },
    { title: "Customers", value: metrics.totalCustomers.toString(), change: 0, trend: "neutral" as const, icon: Users, iconClassName: "bg-cyan-500/10 text-cyan-600" },
  ]

  return (
    <AppLayout title="Reports">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Select value={period} onValueChange={(v: PeriodType) => setPeriod(v)}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportPDF}>
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {displayMetrics.map((metric, i) => (
            <StatCard key={i} {...metric} />
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-4 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Revenue Trend
                      </CardTitle>
                      <CardDescription className="text-xs">{formatPeriodLabel(period)} performance</CardDescription>
                    </div>
                    <Badge variant="info">
                      {chartData.data.length} {period === "today" ? "hours" : period === "week" ? "days" : period === "month" ? "days" : "months"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData.data}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/50" />
                        <XAxis dataKey={chartData.xKey} axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} tickFormatter={(v) => `GHS ${v >= 1000 ? `${v/1000}k` : v}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey={chartData.revenueKey} stroke="#059669" strokeWidth={2} fill="url(#colorRevenue)" name="Revenue" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4 border-b border-border/50">
                  <div className="space-y-1">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <PieChartIcon className="h-4 w-4 text-violet-600" />
                      Payment Methods
                    </CardTitle>
                    <CardDescription className="text-xs">Distribution by volume</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentMethodData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                          labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                        >
                          {paymentMethodData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    {paymentMethodData.map((method) => (
                      <div key={method.name} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: method.color }} />
                        <span className="text-xs text-muted-foreground">{method.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader className="pb-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      Sales by {period === "today" ? "Hour" : period === "week" ? "Day" : period === "month" ? "Day" : "Month"}
                    </CardTitle>
                    <CardDescription className="text-xs">{formatPeriodLabel(period)} performance</CardDescription>
                  </div>
                  <Badge variant="success">
                    <TrendIcon className="h-3 w-3 mr-1" />
                    {filteredSales.length} Sales
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.data}>
                      <defs>
                        <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#059669" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#059669" stopOpacity={0.6}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/50" />
                      <XAxis dataKey={chartData.xKey} axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} tickFormatter={(v) => `GHS ${v >= 1000 ? `${v/1000}k` : v}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey={chartData.revenueKey} fill="url(#colorBar)" radius={[6, 6, 0, 0]} name="Sales" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader className="pb-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Package className="h-4 w-4 text-violet-600" />
                      Top Selling Products
                    </CardTitle>
                    <CardDescription className="text-xs">By revenue in {formatPeriodLabel(period).toLowerCase()}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportCSV}>
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {topProductsData.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No product data"
                    description="No product sales data for this period"
                  />
                ) : (
                  <div className="divide-y divide-border/50">
                    {topProductsData.map((product, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            i === 0 ? "bg-amber-500/10 text-amber-600" :
                            i === 1 ? "bg-muted text-muted-foreground" :
                            i === 2 ? "bg-orange-500/10 text-orange-600" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-[13px] font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.units} units sold</p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold">{formatCurrency(product.revenue)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader className="pb-4 border-b border-border/50">
                <div className="space-y-1">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    Payment Analysis
                  </CardTitle>
                  <CardDescription className="text-xs">Breakdown by payment method</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-4 md:grid-cols-3">
                  {paymentMethodData.map((method) => (
                    <div
                      key={method.name}
                      className="rounded-xl border border-border/50 bg-muted/30 p-4"
                    >
                      <div className="h-10 w-10 rounded-lg mb-3 flex items-center justify-center" style={{ backgroundColor: `${method.color}20` }}>
                        <div className="h-5 w-5 rounded-full" style={{ backgroundColor: method.color }} />
                      </div>
                      <p className="text-[13px] font-medium">{method.name}</p>
                      <p className="text-xl font-bold mt-1">{formatCurrency(method.amount)}</p>
                      <p className="text-xs text-muted-foreground mt-1">{method.value}% of total</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
