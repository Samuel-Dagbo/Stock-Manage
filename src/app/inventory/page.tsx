"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search, 
  Plus, 
  Package, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Loader2,
  Pencil,
  Upload,
  Image as ImageIcon,
  X
} from "lucide-react"
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils"
import { AppLayout } from "@/components/shared/app-layout"

interface Product {
  _id: string
  name: string
  sku: string
  category: string
  images?: string[]
  stockQuantity: number
  reorderLevel: number
  costPrice: number
  sellingPrice: number
}

interface StockMovement {
  _id: string
  productId: string
  productName: string
  type: "stock_in" | "stock_out" | "adjustment" | "sale"
  quantity: number
  reference: string
  date: string
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editImage, setEditImage] = useState("")
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState("")

  const [formData, setFormData] = useState({
    type: "stock_in",
    quantity: "",
    reason: "",
  })

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setEditImage(product.images?.[0] || "")
  }

  const handleEditProduct = async () => {
    if (!editingProduct) return
    setSaving(true)
    try {
      await fetch(`/api/products/${editingProduct._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingProduct.name,
          image: editImage ? [editImage] : [],
          stockQuantity: editingProduct.stockQuantity,
        }),
      })
      setEditingProduct(null)
      fetchData()
    } catch (error) {
      console.error("Failed:", error)
    } finally {
      setSaving(false)
    }
  }

  const updateEditingProduct = (field: string, value: any) => {
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, [field]: value })
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [productsRes, movementsRes] = await Promise.all([
        fetch("/api/products?includeLowStock=true"),
        fetch("/api/stock-movements"),
      ])
      const productsData = await productsRes.json()
      const movementsData = await movementsRes.json()
      setProducts(productsData.products || [])
      setMovements(movementsData.movements || [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getStockStatus = (quantity: number, reorderLevel: number) => {
    if (quantity === 0) return "out"
    if (quantity <= reorderLevel) return "low"
    return "ok"
  }

  const filteredProducts = products.filter(product => {
    const status = getStockStatus(product.stockQuantity, product.reorderLevel)
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0)
  const lowStockCount = products.filter(p => getStockStatus(p.stockQuantity, p.reorderLevel) === "low").length
  const outOfStockCount = products.filter(p => getStockStatus(p.stockQuantity, p.reorderLevel) === "out").length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ok":
        return <Badge className="bg-green-500 text-white">In Stock</Badge>
      case "low":
        return <Badge className="bg-amber-500 text-white">Low Stock</Badge>
      case "out":
        return <Badge className="bg-red-500 text-white">Out of Stock</Badge>
      default:
        return null
    }
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "stock_in":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "stock_out":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case "adjustment":
        return <ArrowUpDown className="h-4 w-4 text-amber-500" />
      case "sale":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const handleAdjustment = async () => {
    if (!selectedProduct || !formData.quantity) return
    setSaving(true)
    try {
      const res = await fetch("/api/stock-adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct._id,
          type: formData.type,
          quantity: parseInt(formData.quantity),
          reason: formData.reason,
        }),
      })
      if (res.ok) {
        setShowAdjustmentModal(false)
        setFormData({ type: "stock_in", quantity: "", reason: "" })
        setSelectedProduct(null)
        fetchData()
      }
    } catch (error) {
      console.error("Failed to adjust stock:", error)
    } finally {
      setSaving(false)
    }
  }

  const openAdjustmentModal = (product: Product) => {
    setSelectedProduct(product)
    setShowAdjustmentModal(true)
  }

  return (
    <AppLayout title="Inventory">
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Inventory</h2>
          <p className="text-muted-foreground">Track stock levels and movements</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={lowStockCount > 0 ? "border-amber-500/50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={outOfStockCount > 0 ? "border-red-500/50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold">{outOfStockCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Stock Levels</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      className="pl-10 w-[200px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="ok">In Stock</SelectItem>
                      <SelectItem value="low">Low Stock</SelectItem>
                      <SelectItem value="out">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No products found</p>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.map((product) => {
const status = getStockStatus(product.stockQuantity, product.reorderLevel)
                    return (
                      <div key={product._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.sku}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">{product.stockQuantity}</p>
                            <p className="text-xs text-muted-foreground">Reorder at {product.reorderLevel}</p>
                          </div>
                          {getStatusBadge(status)}
                          <Button size="sm" variant="outline" onClick={() => openEditModal(product)}>
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openAdjustmentModal(product)}>
                            Adjust
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Movements</CardTitle>
              <CardDescription>Stock activity log</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </div>
              ) : movements.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground text-sm">No movements yet</p>
              ) : (
                <div className="space-y-4">
                  {movements.slice(0, 10).map((movement) => (
                    <div key={movement._id} className="flex items-start gap-3">
                      <div className="mt-0.5">{getMovementIcon(movement.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{movement.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {movement.type === "stock_in" && "+"}
                          {movement.type === "stock_out" && "-"}
                          {movement.type === "adjustment" && (movement.quantity > 0 ? "+" : "-")}
                          {movement.type === "sale" && "-"}
                          {Math.abs(movement.quantity)} units · {movement.reference}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(movement.date)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      <Dialog open={showAdjustmentModal} onOpenChange={setShowAdjustmentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stock Adjustment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">{selectedProduct?.name}</p>
              <p className="text-sm text-muted-foreground">Current Stock: {selectedProduct?.stockQuantity}</p>
            </div>
            <div className="grid gap-2">
              <Label>Adjustment Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock_in">Stock In (Add)</SelectItem>
                  <SelectItem value="stock_out">Stock Out (Remove)</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Quantity *</Label>
              <Input 
                type="number" 
                min="1" 
                value={formData.quantity} 
                onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <Label>Reason</Label>
              <Input 
                value={formData.reason} 
                onChange={(e) => setFormData({...formData, reason: e.target.value})} 
                placeholder="e.g. New shipment, damaged goods"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustmentModal(false)}>Cancel</Button>
            <Button onClick={handleAdjustment} disabled={saving || !formData.quantity}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="sm:max-w-md" description="Edit product details">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Product Image</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant={!editImage ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const input = document.createElement("input")
                      input.type = "file"
                      input.accept = "image/*"
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (!file) return
                        const formData = new FormData()
                        formData.append("file", file)
                        try {
                          const res = await fetch("/api/upload", { method: "POST", body: formData })
                          const data = await res.json()
                          if (data.success) setEditImage(data.url)
                        } catch (err) { console.error(err) }
                      }
                      input.click()
                    }}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </Button>
                  <Button 
                    type="button"
                    variant={showUrlInput ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => { 
                      setUrlInput(editImage || "")
                      setShowUrlInput(true) 
                    }}
                  >
                    <ImageIcon className="h-4 w-4 mr-1" />
                    URL
                  </Button>
                </div>
                {showUrlInput && (
                  <div className="flex gap-2">
                    <Input 
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="Enter image URL..."
                      className="flex-1"
                    />
                    <Button 
                      size="sm"
                      onClick={() => {
                        if (urlInput) setEditImage(urlInput)
                        setShowUrlInput(false)
                        setUrlInput("")
                      }}
                    >
                      Add
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => { setShowUrlInput(false); setUrlInput("") }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                {!showUrlInput && editImage && (
                  <div className="relative inline-block w-full">
                    <img 
                      src={editImage} 
                      alt="Preview" 
                      className="h-32 w-full object-cover rounded-lg border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999'%3EInvalid Image%3C/text%3E%3C/svg%3E"
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => setEditImage("")}
                      className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Product Name</Label>
              <Input 
                value={editingProduct?.name || ""}
                onChange={(e) => updateEditingProduct("name", e.target.value)}
                placeholder="Product name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Stock Quantity</Label>
              <Input
                type="number"
                value={editingProduct?.stockQuantity || 0}
                onChange={(e) => updateEditingProduct("stockQuantity", parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
            <Button onClick={handleEditProduct} disabled={saving || !editingProduct?.name}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </AppLayout>
  )
}