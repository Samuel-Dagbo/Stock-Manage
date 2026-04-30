"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
  Receipt,
  Eye,
  RotateCcw,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  CircleDot,
  FileText,
  Printer,
  X,
  Loader2
} from "lucide-react"
import { formatCurrency, formatDateTime, formatRelativeTime, cn } from "@/lib/utils"
import { AppLayout } from "@/components/shared/app-layout"
import { motion, AnimatePresence } from "framer-motion"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"

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

function SalesSkeleton() {
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
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value, change, icon: Icon, color, gradient, delay }: {
  title: string, value: string, change: number, icon: any, color: string, gradient: string, delay: number
}) {
  const isPositive = change > 0
  const isNeutral = change === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="border-0 shadow-md card-hover overflow-hidden relative">
        <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div className={`h-14 w-14 rounded-2xl ${gradient} flex items-center justify-center shadow-lg`}>
              <Icon className={`h-7 w-7 ${color}`} />
            </div>
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              isPositive ? "text-emerald-600 dark:text-emerald-400" :
              isNeutral ? "text-muted-foreground" : "text-rose-600 dark:text-rose-400"
            )}>
              {isPositive ? <ArrowUpRight className="h-4 w-4" /> :
               isNeutral ? <CircleDot className="h-3 w-3" /> : <ArrowDownRight className="h-4 w-4" />}
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

function ReceiptModal({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printContent = receiptRef.current
    if (!printContent) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt ${sale.receiptNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { font-size: 18px; margin-bottom: 5px; }
            .header p { font-size: 10px; color: #666; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin: 5px 0; }
            .row.item { margin-left: 10px; }
            .row.item .name { flex: 1; }
            .row.item .qty { width: 40px; text-align: center; }
            .row.item .amount { width: 80px; text-align: right; }
            .total { font-weight: bold; font-size: 14px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #666; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
    printWindow.close()
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.setTextColor(59, 130, 246)
    doc.text("SALES RECEIPT", 105, 20, { align: "center" })

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text("Stock Manage", 105, 30, { align: "center" })
    doc.text(`${sale.receiptNumber}`, 105, 36, { align: "center" })
    doc.text(`${format(new Date(sale.createdAt), "yyyy-MM-dd HH:mm")}`, 105, 42, { align: "center" })

    let y = 55

    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.text("Items:", 20, y)
    y += 10

    doc.setFontSize(10)
    sale.items.forEach(item => {
      doc.text(`${item.quantity}x ${item.productName}`, 25, y)
      doc.text(formatCurrency(item.total), 180, y, { align: "right" })
      y += 7
    })

    y += 5
    doc.setDrawColor(200)
    doc.line(20, y, 190, y)
    y += 10

    doc.text("Subtotal:", 20, y)
    doc.text(formatCurrency(sale.subtotal), 180, y, { align: "right" })
    y += 7

    if (sale.tax > 0) {
      doc.text("Tax:", 20, y)
      doc.text(formatCurrency(sale.tax), 180, y, { align: "right" })
      y += 7
    }

    if (sale.discount > 0) {
      doc.text("Discount:", 20, y)
      doc.text(`-${formatCurrency(sale.discount)}`, 180, y, { align: "right" })
      y += 7
    }

    y += 3
    doc.setFontSize(14)
    doc.setTextColor(59, 130, 246)
    doc.text("TOTAL:", 20, y)
    doc.text(formatCurrency(sale.total), 180, y, { align: "right" })

    y += 15
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Payment: ${sale.paymentMethod.toUpperCase()}`, 20, y)
    y += 7
    doc.text(`Status: ${sale.status.toUpperCase()}`, 20, y)
    y += 7
    doc.text(`Customer: ${sale.customer?.name || "Walk-in Customer"}`, 20, y)

    y += 20
    doc.setFontSize(8)
    doc.text("Thank you for your business!", 105, y, { align: "center" })

    doc.save(`receipt-${sale.receiptNumber}.pdf`)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Receipt</h3>
              <p className="text-xs text-muted-foreground font-mono">{sale.receiptNumber}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div ref={receiptRef} className="bg-white dark:bg-black text-black dark:text-white p-4 rounded-lg font-mono text-sm">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold">Stock Manage</h2>
              <p className="text-xs text-gray-500">Sales Receipt</p>
            </div>

            <div className="text-xs text-gray-500 mb-4">
              <p>{format(new Date(sale.createdAt), "yyyy-MM-dd HH:mm")}</p>
              <p>{sale.receiptNumber}</p>
            </div>

            <div className="border-t border-b border-dashed border-gray-300 py-2 mb-3">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Item</span>
                <span>Amount</span>
              </div>
              {sale.items.map((item, i) => (
                <div key={i} className="flex justify-between text-xs mb-1">
                  <span>{item.quantity}x {item.productName}</span>
                  <span>{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>

            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              {sale.tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(sale.tax)}</span>
                </div>
              )}
              {sale.discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>-{formatCurrency(sale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-dashed border-gray-300">
                <span>TOTAL</span>
                <span>{formatCurrency(sale.total)}</span>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-dashed border-gray-300 text-xs text-gray-500">
              <p>Payment: {sale.paymentMethod.toUpperCase()}</p>
              <p>Customer: {sale.customer?.name || "Walk-in"}</p>
              <p>Status: {sale.status.toUpperCase()}</p>
            </div>

            <div className="mt-4 text-center text-xs text-gray-400">
              <p>Thank you for your business!</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex gap-3">
          <Button variant="outline" className="flex-1 gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button className="flex-1 gap-2 bg-gradient-to-r from-primary to-primary/80" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  const fetchSales = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (dateFilter !== "all") params.set("date", dateFilter)
      const res = await fetch(`/api/sales?${params}`)
      const data = await res.json()
      setSales(data.sales || [])
    } catch (error) {
      console.error("Failed to fetch sales:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSales()
  }, [statusFilter, dateFilter])

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (sale.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    return matchesSearch
  })

  const totalRevenue = filteredSales
    .filter(s => s.status !== "refunded")
    .reduce((sum, s) => sum + s.total, 0)
  const totalSalesCount = filteredSales.filter(s => s.status === "completed").length
  const refundCount = filteredSales.filter(s => s.status === "refunded").length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10 shadow-sm">Completed</Badge>
      case "refunded":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/10 shadow-sm">Refunded</Badge>
      case "partial":
        return <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20 hover:bg-slate-500/10 shadow-sm">Partial</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentBadge = (method: string) => {
    const colors: Record<string, { bg: string, text: string }> = {
      cash: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
      momo: { bg: "bg-violet-500/10", text: "text-violet-600" },
      card: { bg: "bg-blue-500/10", text: "text-blue-600" },
    }
    const style = colors[method] || { bg: "bg-muted", text: "text-muted-foreground" }
    return <Badge className={`${style.bg} ${style.text} border-0 shadow-sm capitalize font-medium`}>{method}</Badge>
  }

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
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `sales-${format(new Date(), "yyyy-MM-dd")}.csv`
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
    doc.text(`Generated: ${format(new Date(), "yyyy-MM-dd HH:mm")}`, 14, 30)

    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.text(`Total Sales: ${totalSalesCount}`, 14, 42)
    doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 14, 50)
    doc.text(`Refunds: ${refundCount}`, 14, 58)

    doc.setFontSize(12)
    doc.text("Recent Transactions", 14, 74)

    autoTable(doc, {
      startY: 80,
      head: [["Date", "Receipt #", "Customer", "Total", "Payment", "Status"]],
      body: filteredSales.slice(0, 50).map(sale => [
        format(new Date(sale.createdAt), "yyyy-MM-dd"),
        sale.receiptNumber,
        sale.customer?.name || "Walk-in",
        formatCurrency(sale.total),
        sale.paymentMethod,
        sale.status
      ]),
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] }
    })

    doc.save(`sales-report-${format(new Date(), "yyyy-MM-dd")}.pdf`)
  }

  return (
    <AppLayout title="Sales">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Sales</h2>
            <p className="text-muted-foreground">View and manage all transactions</p>
          </div>
          <div className="flex gap-2">
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

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            change={12.5}
            icon={formatCurrency}
            color="text-emerald-600"
            gradient="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5"
            delay={0.1}
          />
          <StatCard
            title="Total Transactions"
            value={filteredSales.length.toString()}
            change={8.2}
            icon={Receipt}
            color="text-primary"
            gradient="bg-gradient-to-br from-primary/20 to-primary/5"
            delay={0.15}
          />
          <StatCard
            title="Refunds"
            value={refundCount.toString()}
            change={refundCount > 0 ? -5 : 0}
            icon={RotateCcw}
            color="text-amber-600"
            gradient="bg-gradient-to-br from-amber-500/20 to-amber-500/5"
            delay={0.2}
          />
        </div>

        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="pb-4 border-b bg-gradient-to-r from-muted/50 to-transparent">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by receipt number or customer..."
                  className="pl-11 h-11 bg-muted/50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] h-11">
                    <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[150px] h-11">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <SalesSkeleton />
            ) : filteredSales.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Receipt className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <p className="text-lg font-medium mb-1">No sales found</p>
                <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or search</p>
                <Button variant="outline" className="gap-2" onClick={() => window.location.href = "/pos"}>
                  <FileText className="h-4 w-4" />
                  Go to POS
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {filteredSales.map((sale, i) => (
                  <motion.div
                    key={sale._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-mono text-sm font-medium">{sale.receiptNumber}</p>
                        <p className="text-sm text-muted-foreground">{sale.customer?.name || "Walk-in Customer"}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(sale.createdAt)}</p>
                      </div>
                    </div>
                    <div className="hidden lg:flex items-center gap-6">
                      <div className="text-center">
                        <Badge variant="outline" className="font-normal">{sale.items.length} items</Badge>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <p className="font-semibold">{formatCurrency(sale.total)}</p>
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(sale.createdAt)}</p>
                      </div>
                      <div className="min-w-[80px]">
                        {getPaymentBadge(sale.paymentMethod)}
                      </div>
                      <div className="min-w-[100px]">
                        {getStatusBadge(sale.status)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 lg:hidden">
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(sale.total)}</p>
                        {getStatusBadge(sale.status)}
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10"
                        onClick={() => setSelectedSale(sale)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10"
                        onClick={() => {
                          const doc = new jsPDF()
                          doc.setFontSize(20)
                          doc.setTextColor(59, 130, 246)
                          doc.text("SALES RECEIPT", 105, 20, { align: "center" })
                          let y = 40
                          doc.setFontSize(12)
                          doc.setTextColor(0)
                          sale.items.forEach(item => {
                            doc.text(`${item.quantity}x ${item.productName}`, 20, y)
                            doc.text(formatCurrency(item.total), 180, y, { align: "right" })
                            y += 8
                          })
                          y += 10
                          doc.setFontSize(14)
                          doc.setTextColor(59, 130, 246)
                          doc.text("TOTAL:", 20, y)
                          doc.text(formatCurrency(sale.total), 180, y, { align: "right" })
                          doc.save(`receipt-${sale.receiptNumber}.pdf`)
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {selectedSale && (
          <ReceiptModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
        )}
      </AnimatePresence>
    </AppLayout>
  )
}