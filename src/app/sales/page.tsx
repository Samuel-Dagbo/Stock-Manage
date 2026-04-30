"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency, formatDateTime, formatRelativeTime } from "@/lib/utils"
import { AppLayout } from "@/components/shared/app-layout"
import { StatCard } from "@/components/shared/stat-card"
import { SearchInput } from "@/components/shared/search-input"
import { EmptyState } from "@/components/shared/empty-state"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"
import {
  Download,
  Receipt,
  Eye,
  RotateCcw,
  Filter,
  FileText,
  Printer,
  X,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Calendar,
  Clock,
  Plus,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
} from "lucide-react"

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
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-32" />
                </div>
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
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
          <title>Receipt - ${sale.receiptNumber}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            .receipt { max-width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .items { margin: 20px 0; }
            .item { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .total { font-weight: bold; border-top: 1px solid #000; padding-top: 10px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>Stock Manage</h2>
              <p>Receipt #${sale.receiptNumber}</p>
            </div>
            <div class="items">
              ${sale.items.map(item => `
                <div class="item">
                  <span>${item.productName} x${item.quantity}</span>
                  <span>${formatCurrency(item.total)}</span>
                </div>
              `).join('')}
            </div>
            <div class="total">
              <div class="item">
                <span>Total</span>
                <span>${formatCurrency(sale.total)}</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text("Stock Manage", 105, 20, { align: "center" })
    doc.setFontSize(12)
    doc.text(`Receipt #${sale.receiptNumber}`, 105, 35, { align: "center" })
    doc.text(formatDateTime(sale.createdAt), 105, 45, { align: "center" })

    const tableData = sale.items.map(item => [
      item.productName,
      item.quantity,
      formatCurrency(item.price),
      formatCurrency(item.total)
    ])

    autoTable(doc, {
      startY: 55,
      head: [["Item", "Qty", "Price", "Total"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [99, 102, 241] },
    })

    const finalY = (doc as any).lastAutoTable.finalY || 55
    doc.text(`Subtotal: ${formatCurrency(sale.subtotal)}`, 140, finalY + 10)
    doc.text(`Tax: ${formatCurrency(sale.tax)}`, 140, finalY + 20)
    doc.text(`Discount: ${formatCurrency(sale.discount)}`, 140, finalY + 30)
    doc.setFontSize(14)
    doc.text(`Total: ${formatCurrency(sale.total)}`, 140, finalY + 45)

    doc.save(`receipt-${sale.receiptNumber}.pdf`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div ref={receiptRef} className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <Receipt className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Receipt</h2>
            <p className="text-sm text-muted-foreground">#{sale.receiptNumber}</p>
            <p className="text-xs text-muted-foreground">{formatDateTime(sale.createdAt)}</p>
          </div>

          <div className="space-y-3 mb-6">
            {sale.items.map((item, i) => (
              <div key={i} className="flex justify-between items-start py-2 border-b border-border/60">
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold">{formatCurrency(item.total)}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(sale.tax)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-destructive">-{formatCurrency(sale.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border/60">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(sale.total)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {sale.customer?.name || "Walk-in Customer"}
            </span>
            <Badge variant={sale.paymentMethod === "cash" ? "success" : sale.paymentMethod === "momo" ? "warning" : "info"}>
              {sale.paymentMethod}
            </Badge>
          </div>
        </div>

        <div className="p-4 border-t border-border/60 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Button variant="ghost" size="sm" className="flex-1" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)

  const fetchSales = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (statusFilter !== "all") params.set("status", statusFilter)
      
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
  }, [search, statusFilter])

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
  const totalTax = sales.reduce((sum, sale) => sum + sale.tax, 0)
  const avgOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text("Sales Report", 105, 20, { align: "center" })
    doc.setFontSize(12)
    doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy")}`, 105, 30, { align: "center" })

    const tableData = sales.map(sale => [
      sale.receiptNumber,
      sale.customer?.name || "Walk-in",
      formatDateTime(sale.createdAt),
      formatCurrency(sale.total),
      sale.paymentMethod,
      sale.status
    ])

    autoTable(doc, {
      startY: 40,
      head: [["Receipt", "Customer", "Date", "Total", "Payment", "Status"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [99, 102, 241] },
    })

    const finalY = (doc as any).lastAutoTable.finalY || 40
    doc.setFontSize(12)
    doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 140, finalY + 20)
    doc.text(`Total Tax: ${formatCurrency(totalTax)}`, 140, finalY + 30)
    doc.text(`Avg Order Value: ${formatCurrency(avgOrderValue)}`, 140, finalY + 40)

    doc.save(`sales-report-${format(new Date(), "yyyy-MM-dd")}.pdf`)
  }

  if (loading) {
    return (
      <AppLayout title="Sales">
        <SalesSkeleton />
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Sales">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={DollarSign}
            iconClassName="bg-primary/10 text-primary"
          />
          <StatCard
            title="Total Orders"
            value={sales.length.toString()}
            icon={ShoppingCart}
            iconClassName="bg-info/10 text-info"
          />
          <StatCard
            title="Avg Order Value"
            value={formatCurrency(avgOrderValue)}
            icon={Package}
            iconClassName="bg-warning/10 text-warning"
          />
        </div>

        {/* Filters */}
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search by receipt or customer..."
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] text-sm">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="gap-2 text-sm" onClick={handleExportPDF}>
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Link href="/pos">
                  <Button size="sm" className="gap-2 text-sm">
                    <Plus className="h-4 w-4" />
                    New Sale
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales List */}
        {sales.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="p-0">
              <EmptyState
                icon={Receipt}
                title="No sales yet"
                description="Start making sales to see your transactions"
                action={
                  <Link href="/pos">
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Make First Sale
                    </Button>
                  </Link>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/60">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="border-b border-border/60">
                      <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Receipt</th>
                      <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer</th>
                      <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                      <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Items</th>
                      <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Total</th>
                      <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale._id} className="border-b border-border/60 hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <span className="font-mono text-sm font-semibold">{sale.receiptNumber}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm">{sale.customer?.name || "Walk-in"}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{formatDateTime(sale.createdAt)}</div>
                          <div className="text-xs text-muted-foreground">{formatRelativeTime(sale.createdAt)}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary" className="text-[10px]">
                            {sale.items.length} items
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-sm font-bold">{formatCurrency(sale.total)}</span>
                        </td>
                        <td className="p-4 text-right">
                          <Badge
                            variant={
                              sale.status === "completed"
                                ? "success"
                                : sale.status === "pending"
                                ? "warning"
                                : "destructive"
                            }
                            className="text-[10px]"
                          >
                            {sale.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setSelectedSale(sale)
                                setShowReceipt(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {showReceipt && selectedSale && (
          <ReceiptModal sale={selectedSale} onClose={() => {
            setShowReceipt(false)
            setSelectedSale(null)
          }} />
        )}
      </div>
    </AppLayout>
  )
}


function SalesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-32" />
                </div>
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
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
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-lg shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Receipt className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Receipt</h3>
              <p className="text-[11px] text-muted-foreground font-mono">{sale.receiptNumber}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div ref={receiptRef} className="bg-white dark:bg-black text-black dark:text-white p-4 rounded-lg font-mono text-[13px]">
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
          <Button className="flex-1 gap-2" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
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
        return <Badge variant="success">Completed</Badge>
      case "refunded":
        return <Badge variant="destructive">Refunded</Badge>
      case "partial":
        return <Badge variant="warning">Partial</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentBadge = (method: string) => {
    switch (method) {
      case "cash":
        return <Badge variant="success" className="capitalize">{method}</Badge>
      case "momo":
      case "card":
        return <Badge variant="info" className="capitalize">{method}</Badge>
      default:
        return <Badge variant="outline" className="capitalize">{method}</Badge>
    }
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

  if (loading) {
    return (
      <AppLayout title="Sales">
        <SalesSkeleton />
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Sales">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            change={12.5}
            trend="up"
            icon={DollarSign}
            iconClassName="bg-success-subtle text-success"
          />
          <StatCard
            title="Total Transactions"
            value={filteredSales.length.toString()}
            change={8.2}
            trend="up"
            icon={Receipt}
            iconClassName="bg-info-subtle text-info"
          />
          <StatCard
            title="Refunds"
            value={refundCount.toString()}
            change={refundCount > 0 ? 5 : 0}
            trend={refundCount > 0 ? "down" : "neutral"}
            icon={RotateCcw}
            iconClassName="bg-warning-subtle text-warning"
          />
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by receipt number or customer..."
                className="flex-1"
              />
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] h-8 text-[13px]">
                    <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
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
                  <SelectTrigger className="w-[130px] h-8 text-[13px]">
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-[13px]" onClick={handleExportCSV}>
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-[13px]" onClick={handleExportPDF}>
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredSales.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No sales found"
                description="Try adjusting your filters or search"
                action={
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => window.location.href = "/pos"}>
                    <FileText className="h-3.5 w-3.5" />
                    Go to POS
                  </Button>
                }
              />
            ) : (
              <div className="divide-y divide-border/50">
                {filteredSales.map((sale) => (
                  <div
                    key={sale._id}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Receipt className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-mono text-[13px] font-medium">{sale.receiptNumber}</p>
                        <p className="text-[13px] text-muted-foreground">{sale.customer?.name || "Walk-in Customer"}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(sale.createdAt)}</p>
                      </div>
                    </div>
                    <div className="hidden lg:flex items-center gap-4">
                      <Badge variant="outline" className="font-normal text-[11px]">{sale.items.length} items</Badge>
                      <div className="text-right min-w-[90px]">
                        <p className="text-sm font-semibold">{formatCurrency(sale.total)}</p>
                        <p className="text-[11px] text-muted-foreground">{formatRelativeTime(sale.createdAt)}</p>
                      </div>
                      <div className="min-w-[70px]">
                        {getPaymentBadge(sale.paymentMethod)}
                      </div>
                      <div className="min-w-[90px]">
                        {getStatusBadge(sale.status)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 lg:hidden">
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(sale.total)}</p>
                        {getStatusBadge(sale.status)}
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setSelectedSale(sale)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
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
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedSale && (
        <ReceiptModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
      )}
    </AppLayout>
  )
}
