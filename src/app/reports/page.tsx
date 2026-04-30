"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AppLayout } from "@/components/shared/app-layout"
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
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  PieChart as PieChartIcon,
  TrendingUp as TrendIcon,
  Activity,
  Calendar,
  Loader2
} from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"
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
  Legend,
  LineChart,
  Line
} from "recharts"
import { motion } from "framer-motion"
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
  format,
  isWithinInterval
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

const colorMap: Record<string, string> = {
  emerald: "text-emerald-600 bg-emerald-500/10",
  primary: "text-primary bg-primary/10",
  violet: "text-violet-600 bg-violet-500/10",
  cyan: "text-cyan-600 bg-cyan-500/10",
}

const gradientMap: Record<string, string> = {
  emerald: "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5",
  primary: "bg-gradient-to-br from-primary/20 to-primary/5",
  violet: "bg-gradient-to-br from-violet-500/20 to-violet-500/5",
  cyan: "bg-gradient-to-br from-cyan-500/20 to-cyan-500/5",
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

function MetricCard({ title, value, change, icon: Icon, color, delay }: {
  title: string, value: string, change: number, icon: any, color: string, delay: number
}) {
  const isPositive = change >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="border-0 shadow-md card-hover overflow-hidden relative">
        <div className={`absolute top-0 right-0 w-32 h-32 ${gradientMap[color]} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div className={`h-14 w-14 rounded-2xl ${gradientMap[color]} flex items-center justify-center shadow-lg`}>
              <Icon className={`h-7 w-7 ${colorMap[color].split(' ')[0]}`} />
            </div>
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              isPositive ? "text-emerald-600" : "text-rose-600"
            )}>
              {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {Math.abs(change).toFixed(1)}%
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-lg p-3">
        <p className="font-medium text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-md">
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
    doc.setTextColor(59, 130, 246)
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
      headStyles: { fillColor: [59, 130, 246] }
    })

    const finalY = (doc as any).lastAutoTable?.finalY || 140

    doc.setFontSize(14)
    doc.text("Payment Methods", 14, finalY + 15)

    autoTable(doc, {
      startY: finalY + 20,
      head: [["Method", "Percentage", "Amount"]],
      body: paymentMethodData.map(p => [p.name, `${p.value}%`, formatCurrency(p.amount)]),
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] }
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
    { title: "Total Revenue", value: formatCurrency(metrics.totalRevenue), change: metrics.revenueChange, icon: DollarSign, color: "emerald" },
    { title: "Total Orders", value: metrics.totalOrders.toString(), change: metrics.ordersChange, icon: ShoppingCart, color: "primary" },
    { title: "Avg Order Value", value: formatCurrency(metrics.avgOrderValue), change: 0, icon: BarChart3, color: "violet" },
    { title: "Customers", value: metrics.totalCustomers.toString(), change: 0, icon: Users, color: "cyan" },
  ]

  return (
    <AppLayout title="Reports">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Reports & Analytics</h2>
            <p className="text-muted-foreground">Business insights and performance metrics</p>
          </div>
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
            <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {displayMetrics.map((metric, i) => (
            <MetricCard key={i} {...metric} delay={i * 0.1} />
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
            <TabsTrigger value="sales" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Sales</TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Products</TabsTrigger>
            <TabsTrigger value="payments" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-0 shadow-md overflow-hidden">
                <CardHeader className="pb-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        Revenue Trend
                      </CardTitle>
                      <CardDescription>{formatPeriodLabel(period)} performance</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
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
                        <XAxis dataKey={chartData.xKey} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-muted-foreground" />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `GHS ${v >= 1000 ? `${v/1000}k` : v}`} className="text-muted-foreground" />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey={chartData.revenueKey} stroke="#059669" strokeWidth={2} fill="url(#colorRevenue)" name="Revenue" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md overflow-hidden">
                <CardHeader className="pb-4 border-b bg-gradient-to-r from-violet-500/5 to-transparent">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <PieChartIcon className="h-4 w-4 text-violet-600" />
                      </div>
                      Payment Methods
                    </CardTitle>
                    <CardDescription>Distribution by volume</CardDescription>
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
                        <span className="text-sm text-muted-foreground">{method.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <Card className="border-0 shadow-md overflow-hidden">
              <CardHeader className="pb-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      Sales by {period === "today" ? "Hour" : period === "week" ? "Day" : period === "month" ? "Day" : "Month"}
                    </CardTitle>
                    <CardDescription>{formatPeriodLabel(period)} performance</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
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
                      <XAxis dataKey={chartData.xKey} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-muted-foreground" />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `GHS ${v >= 1000 ? `${v/1000}k` : v}`} className="text-muted-foreground" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey={chartData.revenueKey} fill="url(#colorBar)" radius={[6, 6, 0, 0]} name="Sales" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card className="border-0 shadow-md overflow-hidden">
              <CardHeader className="pb-4 border-b bg-gradient-to-r from-violet-500/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Package className="h-4 w-4 text-violet-600" />
                      </div>
                      Top Selling Products
                    </CardTitle>
                    <CardDescription>By revenue in {formatPeriodLabel(period).toLowerCase()}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {topProductsData.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No product sales data for this period</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topProductsData.map((product, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                            i === 0 ? "bg-amber-500/10 text-amber-500" :
                            i === 1 ? "bg-slate-400/10 text-slate-400" :
                            i === 2 ? "bg-orange-400/10 text-orange-400" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {i + 1}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.units} units sold</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(product.revenue)}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card className="border-0 shadow-md overflow-hidden">
              <CardHeader className="pb-4 border-b bg-gradient-to-r from-emerald-500/5 to-transparent">
                <div className="space-y-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                    </div>
                    Payment Analysis
                  </CardTitle>
                  <CardDescription>Breakdown by payment method</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-4 md:grid-cols-3">
                  {paymentMethodData.map((method) => (
                    <motion.div
                      key={method.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border"
                    >
                      <div className="h-12 w-12 rounded-xl mb-4 flex items-center justify-center" style={{ backgroundColor: `${method.color}20` }}>
                        <div className="h-6 w-6 rounded-full" style={{ backgroundColor: method.color }} />
                      </div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-2xl font-bold mt-2">{formatCurrency(method.amount)}</p>
                      <p className="text-sm text-muted-foreground mt-1">{method.value}% of total</p>
                    </motion.div>
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