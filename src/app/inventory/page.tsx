"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency, formatRelativeTime } from "@/lib/utils"
import { AppLayout } from "@/components/shared/app-layout"
import { StatCard } from "@/components/shared/stat-card"
import { SearchInput } from "@/components/shared/search-input"
import { EmptyState } from "@/components/shared/empty-state"
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Loader2,
  Pencil,
  Upload,
  Image as ImageIcon,
  X,
  Plus,
  Tag,
  PlusIcon,
  Minus,
  BoxIcon,
} from "lucide-react"

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
    type: "stock_in" as const,
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

  const fetchData = async () => {
    setLoading(true)
    try {
      const [productsRes, movementsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/stock-movements"),
      ])
      const productsData = await productsRes.json()
      const movementsData = await movementsRes.json()
      setProducts(productsData.products || [])
      setMovements(movementsData.movements || [])
    } catch (error) {
      console.error("Failed to fetch:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleStockAdjustment = async () => {
    if (!selectedProduct || !formData.quantity) return
    setSaving(true)
    try {
      await fetch("/api/stock-adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct._id,
          type: formData.type,
          quantity: parseInt(formData.quantity),
          reason: formData.reason,
        }),
      })
      setShowAdjustmentModal(false)
      setSelectedProduct(null)
      setFormData({ type: "stock_in", quantity: "", reason: "" })
      fetchData()
    } catch (error) {
      console.error("Failed:", error)
    } finally {
      setSaving(false)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredMovements = movements.filter(m => {
    if (statusFilter !== "all" && m.type !== statusFilter) return false
    return true
  })

  const lowStockCount = products.filter(p => p.stockQuantity <= p.reorderLevel).length
  const outOfStockCount = products.filter(p => p.stockQuantity === 0).length
  const totalStockValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0)

  if (loading) {
    return (
      <AppLayout title="Inventory">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border/60">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
                    <div className="h-4 w-16 rounded-lg bg-muted animate-pulse" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-24 rounded-lg bg-muted animate-pulse" />
                    <div className="h-8 w-32 rounded-lg bg-muted animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-border/60">
            <CardContent className="p-6">
              <div className="h-96 bg-muted rounded-xl animate-pulse" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Inventory">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Stock Value"
            value={formatCurrency(totalStockValue)}
            icon={BoxIcon}
            iconClassName="bg-primary/10 text-primary"
          />
          <StatCard
            title="Low Stock Items"
            value={lowStockCount.toString()}
            icon={AlertTriangle}
            iconClassName="bg-warning/10 text-warning"
          />
          <StatCard
            title="Out of Stock"
            value={outOfStockCount.toString()}
            icon={X}
            iconClassName="bg-destructive/10 text-destructive"
          />
        </div>

        {/* Search */}
        <Card className="border-border/60">
          <CardContent className="p-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search products by name or SKU..."
            />
          </CardContent>
        </Card>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="p-0">
              <EmptyState
                icon={Package}
                title="No products found"
                description="Add products to manage your inventory"
                action={
                  <Button size="sm" className="gap-2 rounded-xl" onClick={() => openEditModal({ _id: "", name: "", sku: "", category: "", images: [], stockQuantity: 0, reorderLevel: 10, costPrice: 0, sellingPrice: 0 } as any)}>
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const isLowStock = product.stockQuantity <= product.reorderLevel
              const isOutOfStock = product.stockQuantity === 0
              return (
                <Card key={product._id} className="border-border/60 hover:shadow-card-hover transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center">
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover rounded-lg" />
                          ) : (
                            <Package className="h-6 w-6 text-muted-foreground/50" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{product.name}</h3>
                          <p className="text-xs text-muted-foreground">{product.sku}</p>
                        </div>
                      </div>
                      <Badge variant={isOutOfStock ? "destructive" : isLowStock ? "warning" : "secondary"} className="text-[10px]">
                        {isOutOfStock ? "Out" : isLowStock ? "Low" : "In Stock"}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Stock:</span>
                        <span className="font-semibold">{product.stockQuantity} units</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Reorder at:</span>
                        <span className="font-medium">{product.reorderLevel} units</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Value:</span>
                        <span className="font-medium">{formatCurrency(product.stockQuantity * product.costPrice)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1 text-sm"
                        onClick={() => {
                          setSelectedProduct(product)
                          setFormData({ type: "stock_in", quantity: "", reason: "" })
                        }}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                        Adjust
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm"
                        onClick={() => openEditModal(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Stock Movements */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ArrowUpDown className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Stock Movements</CardTitle>
                  <CardDescription className="text-xs">Recent inventory changes</CardDescription>
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] text-sm">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Movements</SelectItem>
                  <SelectItem value="stock_in">Stock In</SelectItem>
                  <SelectItem value="stock_out">Stock Out</SelectItem>
                  <SelectItem value="adjustment">Adjustments</SelectItem>
                  <SelectItem value="sale">Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredMovements.length === 0 ? (
              <div className="h-40 flex items-center justify-center">
                <EmptyState
                  icon={ArrowUpDown}
                  title="No movements yet"
                  description="Stock adjustments will appear here"
                />
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredMovements.map((movement) => (
                  <div key={movement._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-9 w-9 rounded-lg flex items-center justify-center",
                        movement.type === "stock_in" && "bg-success/10",
                        movement.type === "stock_out" && "bg-destructive/10",
                        movement.type === "adjustment" && "bg-warning/10",
                        movement.type === "sale" && "bg-info/10"
                      )}>
                        {movement.type === "stock_in" && <TrendingUp className="h-4 w-4 text-success" />}
                        {movement.type === "stock_out" && <TrendingDown className="h-4 w-4 text-destructive" />}
                        {movement.type === "adjustment" && <ArrowUpDown className="h-4 w-4 text-warning" />}
                        {movement.type === "sale" && <Package className="h-4 w-4 text-info" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{movement.productName}</p>
                        <p className="text-xs text-muted-foreground">{movement.reference}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-sm font-bold",
                        movement.type === "stock_in" && "text-success",
                        movement.type === "stock_out" && "text-destructive"
                      )}>
                        {movement.type === "stock_in" ? "+" : "-"}{movement.quantity}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(movement.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Adjustment Modal */}
        <Dialog open={showAdjustmentModal} onOpenChange={setShowAdjustmentModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Adjust Stock</DialogTitle>
              <DialogDescription>Update stock levels for {selectedProduct?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">Current Stock: <span className="text-lg font-bold">{selectedProduct?.stockQuantity}</span></p>
                <p className="text-xs text-muted-foreground">Reorder Level: {selectedProduct?.reorderLevel}</p>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Adjustment Type</Label>
                <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock_in">Stock In (Add)</SelectItem>
                    <SelectItem value="stock_out">Stock Out (Remove)</SelectItem>
                    <SelectItem value="adjustment">Manual Adjustment</SelectItem>
                    <SelectItem value="sale">Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Enter quantity"
                  className="text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Reason</Label>
                <Input
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Reason for adjustment"
                  className="text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" className="text-sm" onClick={() => setShowAdjustmentModal(false)}>Cancel</Button>
              <Button size="sm" className="text-sm" onClick={handleStockAdjustment} disabled={saving || !formData.quantity || !formData.reason}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Adjustment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Product Modal */}
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Edit Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Product Image</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={!editImage ? "default" : "outline"}
                      size="sm"
                      className="flex-1 gap-1 text-sm"
                      onClick={() => document.getElementById("edit-image-input")?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      Upload
                    </Button>
                    <Button
                      type="button"
                      variant={showUrlInput ? "default" : "outline"}
                      size="sm"
                      className="flex-1 gap-1 text-sm"
                      onClick={() => {
                        setUrlInput(editImage || "")
                        setShowUrlInput(true)
                      }}
                    >
                      <ImageIcon className="h-4 w-4" />
                      URL
                    </Button>
                  </div>
                  {showUrlInput && (
                    <div className="flex gap-2">
                      <Input
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Enter image URL..."
                        className="flex-1 text-sm"
                      />
                      <Button
                        size="sm"
                        className="text-sm"
                        onClick={() => {
                          setEditImage(urlInput)
                          setShowUrlInput(false)
                          setUrlInput("")
                        }}
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-sm"
                        onClick={() => { setShowUrlInput(false); setUrlInput("") }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  {!showUrlInput && editImage && (
                    <div className="relative inline-block w-full">
                      <img src={editImage} alt="Preview" className="h-32 w-full object-cover rounded-lg border" />
                      <button
                        type="button"
                        onClick={() => setEditImage("")}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                <input
                  id="edit-image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    // Simple mock upload - in real app, upload to server
                    const reader = new FileReader()
                    reader.onload = () => setEditImage(reader.result as string)
                    reader.readAsDataURL(file)
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Product Name</Label>
                <Input
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct!, name: e.target.value })}
                  placeholder="Product name"
                  className="text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Stock Quantity</Label>
                <Input
                  type="number"
                  value={editingProduct.stockQuantity}
                  onChange={(e) => setEditingProduct({ ...editingProduct!, stockQuantity: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" className="text-sm" onClick={() => setEditingProduct(null)}>Cancel</Button>
              <Button size="sm" className="text-sm" onClick={handleEditProduct} disabled={saving || !editingProduct?.name}>
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
        return <Badge variant="success">In Stock</Badge>
      case "low":
        return <Badge variant="warning">Low Stock</Badge>
      case "out":
        return <Badge variant="destructive">Out of Stock</Badge>
      default:
        return null
    }
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "stock_in":
        return <TrendingUp className="h-4 w-4 text-success" />
      case "stock_out":
        return <TrendingDown className="h-4 w-4 text-destructive" />
      case "adjustment":
        return <ArrowUpDown className="h-4 w-4 text-warning" />
      case "sale":
        return <TrendingDown className="h-4 w-4 text-destructive" />
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
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Products" value={String(products.length)} icon={Package} />
          <StatCard title="Inventory Value" value={formatCurrency(totalValue)} icon={Package} iconClassName="bg-info-subtle text-info" />
          <StatCard title="Low Stock" value={String(lowStockCount)} icon={AlertTriangle} iconClassName="bg-warning-subtle text-warning" />
          <StatCard title="Out of Stock" value={String(outOfStockCount)} icon={AlertTriangle} iconClassName="bg-destructive/10 text-destructive" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Stock Levels</CardTitle>
                  <div className="flex gap-2">
                    <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search products..." className="w-[180px]" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[120px] h-8 text-[13px]">
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
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <EmptyState icon={Package} title="No products found" description="No products match your current filters." />
                ) : (
                  <div className="divide-y divide-border/50">
                    {filteredProducts.map((product) => {
                      const status = getStockStatus(product.stockQuantity, product.reorderLevel)
                      return (
                        <div key={product._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-[13px] font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.sku}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-[13px] font-medium">{product.stockQuantity}</p>
                              <p className="text-[11px] text-muted-foreground">Reorder at {product.reorderLevel}</p>
                            </div>
                            {getStatusBadge(status)}
                            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openEditModal(product)}>
                              <Pencil className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openAdjustmentModal(product)}>
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
                <CardTitle className="text-sm">Recent Movements</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : movements.length === 0 ? (
                  <EmptyState icon={ArrowUpDown} title="No movements yet" description="Stock movements will appear here." />
                ) : (
                  <div className="divide-y divide-border/50">
                    {movements.slice(0, 10).map((movement) => (
                      <div key={movement._id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="mt-0.5">{getMovementIcon(movement.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium truncate">{movement.productName}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {movement.type === "stock_in" && "+"}
                            {movement.type === "stock_out" && "-"}
                            {movement.type === "adjustment" && (movement.quantity > 0 ? "+" : "-")}
                            {movement.type === "sale" && "-"}
                            {Math.abs(movement.quantity)} units · {movement.reference}
                          </p>
                        </div>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
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

        <Dialog open={showAdjustmentModal} onOpenChange={setShowAdjustmentModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Stock Adjustment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[13px] font-medium">{selectedProduct?.name}</p>
                <p className="text-xs text-muted-foreground">Current Stock: {selectedProduct?.stockQuantity}</p>
              </div>
              <div className="grid gap-2">
                <Label className="text-[13px]">Adjustment Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger className="h-9 text-[13px]">
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
                <Label className="text-[13px]">Quantity *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="h-9 text-[13px]"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-[13px]">Reason</Label>
                <Input
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="e.g. New shipment, damaged goods"
                  className="h-9 text-[13px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button size="sm" variant="outline" onClick={() => setShowAdjustmentModal(false)}>Cancel</Button>
              <Button size="sm" className="gap-1.5" onClick={handleAdjustment} disabled={saving || !formData.quantity}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Adjustment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="sm:max-w-md" description="Edit product details">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-[13px]">Product Image</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={!editImage ? "default" : "outline"}
                      size="sm"
                      className="flex-1 gap-1.5"
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
                      <Upload className="h-3.5 w-3.5" />
                      Upload
                    </Button>
                    <Button
                      type="button"
                      variant={showUrlInput ? "default" : "outline"}
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => {
                        setUrlInput(editImage || "")
                        setShowUrlInput(true)
                      }}
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      URL
                    </Button>
                  </div>
                  {showUrlInput && (
                    <div className="flex gap-2">
                      <Input
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Enter image URL..."
                        className="flex-1 h-9 text-[13px]"
                      />
                      <Button
                        size="sm"
                        className="gap-1.5"
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
                        className="h-32 w-full object-cover rounded-lg border border-border/50"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999'%3EInvalid Image%3C/text%3E%3C/svg%3E"
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setEditImage("")}
                        className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-[13px]">Product Name</Label>
                <Input
                  value={editingProduct?.name || ""}
                  onChange={(e) => updateEditingProduct("name", e.target.value)}
                  placeholder="Product name"
                  className="h-9 text-[13px]"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-[13px]">Stock Quantity</Label>
                <Input
                  type="number"
                  value={editingProduct?.stockQuantity || 0}
                  onChange={(e) => updateEditingProduct("stockQuantity", parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="h-9 text-[13px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button size="sm" variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
              <Button size="sm" className="gap-1.5" onClick={handleEditProduct} disabled={saving || !editingProduct?.name}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
