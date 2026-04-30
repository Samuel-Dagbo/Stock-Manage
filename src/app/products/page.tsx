"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/lib/hooks/use-toast"
import { AppLayout } from "@/components/shared/app-layout"
import { StatCard } from "@/components/shared/stat-card"
import { SearchInput } from "@/components/shared/search-input"
import { EmptyState } from "@/components/shared/empty-state"
import {
  Package,
  Plus,
  Tag,
  Image as ImageIcon,
  Upload,
  X,
  Pencil,
  ArrowUpDown,
  Plus as PlusIcon,
  Minus,
  BoxIcon,
  AlertTriangle,
  XCircle,
} from "lucide-react"

interface Product {
  _id: string
  name: string
  sku: string
  images?: string[]
  category?: { _id: string; name: string }
  costPrice: number
  sellingPrice: number
  stockQuantity: number
  reorderLevel: number
}

interface Category {
  _id: string
  name: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [adjustQty, setAdjustQty] = useState("")
  const [uploading, setUploading] = useState(false)
  const [showUrlInputAdd, setShowUrlInputAdd] = useState(false)
  const [showUrlInputEdit, setShowUrlInputEdit] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [newCategoryName, setNewCategoryName] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    costPrice: "",
    sellingPrice: "",
    stockQuantity: "0",
    image: "",
  })

  const { toast } = useToast()

  const openEditModal = (product: Product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category?._id || "",
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      stockQuantity: product.stockQuantity.toString(),
      image: product.images?.[0] || "",
    })
    setEditingProduct(product)
  }

  const handleEditProduct = async () => {
    if (!editingProduct || !formData.name) return
    setSaving(true)
    try {
      await fetch(`/api/products/${editingProduct._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          image: formData.image ? [formData.image] : [],
          stockQuantity: parseInt(formData.stockQuantity) || 0,
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
      const res = await fetch("/api/products")
      const data = await res.json()
      setProducts(data.products || [])
      setCategories(data.categories || [])
    } catch (error) {
      console.error("Failed to fetch:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleQuickAdd = () => {
    const sku = `SKU-${Date.now().toString(36).toUpperCase().slice(-6)}`
    setFormData({ name: "", sku, category: categories[0]?._id || "", costPrice: "", sellingPrice: "", stockQuantity: "0", image: "" })
    setShowAddProduct(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.url }))
      } else {
        toast.error("Upload failed. Make sure Cloudinary is configured.")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.sellingPrice) return
    setSaving(true)
    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          sku: formData.sku,
          category: formData.category || undefined,
          image: formData.image || undefined,
          costPrice: parseFloat(formData.costPrice) || 0,
          sellingPrice: parseFloat(formData.sellingPrice) || 0,
          stockQuantity: parseInt(formData.stockQuantity) || 0,
          reorderLevel: 10,
          unitType: "piece",
        }),
      })
      setShowAddProduct(false)
      fetchData()
    } catch (error) {
      console.error("Failed:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleStockAdjust = async (type: "add" | "remove") => {
    if (!selectedProduct || !adjustQty) return
    setSaving(true)
    try {
      await fetch("/api/stock-adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct._id,
          type: type === "add" ? "stock_in" : "stock_out",
          quantity: parseInt(adjustQty),
          reason: "Manual adjustment",
        }),
      })
      setAdjustQty("")
      setSelectedProduct(null)
      fetchData()
    } catch (error) {
      console.error("Failed:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    setSaving(true)
    try {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      })
      setNewCategoryName("")
      fetchData()
    } catch (error) {
      console.error("Failed:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = async (catId: string) => {
    try {
      await fetch(`/api/categories?id=${catId}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      console.error("Failed:", error)
    }
  }

  const getStockStatus = (product: Product) => {
    if (product.stockQuantity === 0) return { label: "Out", variant: "destructive" as const }
    if (product.stockQuantity <= product.reorderLevel) return { label: "Low", variant: "warning" as const }
    return { label: "In Stock", variant: "success" as const }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalProducts = products.length
  const inStock = products.filter(p => p.stockQuantity > 0).length
  const lowStock = products.filter(p => p.stockQuantity <= p.reorderLevel && p.stockQuantity > 0).length
  const outOfStock = products.filter(p => p.stockQuantity === 0).length

  return (
    <AppLayout title="Products">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-muted-foreground">{products.length} items · Click stock to adjust</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={() => setShowCategories(true)}>
              <Tag className="h-4 w-4" />
              Categories
            </Button>
            <Button size="sm" className="gap-2 rounded-xl" onClick={handleQuickAdd}>
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Products"
            value={totalProducts.toString()}
            icon={BoxIcon}
            iconClassName="bg-info/10 text-info"
          />
          <StatCard
            title="In Stock"
            value={inStock.toString()}
            icon={Package}
            iconClassName="bg-success/10 text-success"
          />
          <StatCard
            title="Low Stock"
            value={lowStock.toString()}
            icon={AlertTriangle}
            iconClassName="bg-warning/10 text-warning"
          />
          <StatCard
            title="Out of Stock"
            value={outOfStock.toString()}
            icon={XCircle}
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
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-40 bg-muted animate-pulse" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-muted rounded w-1/3 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="p-0">
              <EmptyState
                icon={Package}
                title="No products yet"
                description="Add your first product to get started"
                action={
                  <Button size="sm" className="gap-2 rounded-xl" onClick={handleQuickAdd}>
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const status = getStockStatus(product)
              return (
                <Card key={product._id} className="overflow-hidden group hover:shadow-card-hover transition-all duration-300">
                  <div className="h-40 bg-muted relative">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E"
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted/50">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <Badge variant={status.variant} className="text-[10px] font-bold px-2 py-0.5">
                        {status.label}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 text-[11px] rounded-lg bg-background/90 backdrop-blur-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditModal(product)
                        }}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold mb-1 truncate">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{product.sku}</p>

                    <div className="flex items-center justify-between text-xs mb-3">
                      <Badge variant="secondary" className="text-[9px] font-medium">
                        {product.category?.name || "Uncategorized"}
                      </Badge>
                      <span className="text-sm font-bold text-primary">{formatCurrency(product.sellingPrice)}</span>
                    </div>

                    <div className="flex items-center justify-between bg-muted/50 rounded-lg p-2">
                      <span className="text-[10px] text-muted-foreground">Stock:</span>
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold hover:bg-background transition-colors"
                      >
                        <span className={product.stockQuantity <= product.reorderLevel ? "text-warning" : "text-foreground"}>
                          {product.stockQuantity}
                        </span>
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Add Product Modal */}
        <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg">Add New Product</DialogTitle>
              <DialogDescription className="text-sm">Enter product details below</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Product Image</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={!formData.image ? "default" : "outline"}
                      size="sm"
                      className="flex-1 gap-1 text-sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      Upload
                    </Button>
                    <Button
                      type="button"
                      variant={showUrlInputAdd ? "default" : "outline"}
                      size="sm"
                      className="flex-1 gap-1 text-sm"
                      onClick={() => {
                        setUrlInput(formData.image || "")
                        setShowUrlInputAdd(true)
                      }}
                    >
                      <ImageIcon className="h-4 w-4" />
                      URL
                    </Button>
                  </div>

                  {showUrlInputAdd && (
                    <div className="flex gap-2">
                      <Input
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Enter image URL..."
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        className="text-sm"
                        onClick={() => {
                          if (urlInput) setFormData(prev => ({ ...prev, image: urlInput }))
                          setShowUrlInputAdd(false)
                          setUrlInput("")
                        }}
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-sm"
                        onClick={() => { setShowUrlInputAdd(false); setUrlInput("") }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {!showUrlInputAdd && formData.image && (
                    <div className="relative inline-block w-full">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="h-32 w-full object-cover rounded-lg border"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999'%3EInvalid Image%3C/text%3E%3C/svg%3E"
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-sm font-medium">Product Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Royal Crown Gin 750ml"
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Selling Price *</Label>
                  <Input
                    type="number"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                    placeholder="0.00"
                    className="text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Cost Price</Label>
                  <Input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                    placeholder="0.00"
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Initial Stock</Label>
                  <Input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                    placeholder="0"
                    className="text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                    <SelectTrigger className="text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" className="text-sm" onClick={() => setShowAddProduct(false)}>Cancel</Button>
              <Button size="sm" className="text-sm" onClick={handleSaveProduct} disabled={saving || !formData.name || !formData.sellingPrice}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Categories Modal */}
        <Dialog open={showCategories} onOpenChange={setShowCategories}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Manage Categories
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="flex gap-2 mb-4">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name"
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  className="text-sm"
                />
                <Button size="sm" className="text-sm gap-1" onClick={handleAddCategory} disabled={saving || !newCategoryName.trim()}>
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {categories.map((cat) => (
                  <div key={cat._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">{cat.name}</span>
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteCategory(cat._id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-4">No categories yet</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button size="sm" className="text-sm" onClick={() => setShowCategories(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Product Modal */}
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Edit Product</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Product Image</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={!formData.image ? "default" : "outline"}
                      size="sm"
                      className="flex-1 gap-1 text-sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      Upload
                    </Button>
                    <Button
                      type="button"
                      variant={showUrlInputEdit ? "default" : "outline"}
                      size="sm"
                      className="flex-1 gap-1 text-sm"
                      onClick={() => {
                        setUrlInput(formData.image || "")
                        setShowUrlInputEdit(true)
                      }}
                    >
                      <ImageIcon className="h-4 w-4" />
                      URL
                    </Button>
                  </div>
                  {showUrlInputEdit && (
                    <div className="flex gap-2">
                      <Input
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Enter image URL..."
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        className="text-sm"
                        onClick={() => {
                          if (urlInput) setFormData(prev => ({ ...prev, image: urlInput }))
                          setShowUrlInputEdit(false)
                          setUrlInput("")
                        }}
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-sm"
                        onClick={() => { setShowUrlInputEdit(false); setUrlInput("") }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  {formData.image && !showUrlInputEdit && (
                    <div className="relative inline-block w-full">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="h-32 w-full object-cover rounded-lg border"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999'%3EInvalid Image%3C/text%3E%3C/svg%3E"
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Product Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Product name"
                  className="text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Stock Quantity</Label>
                <Input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                  placeholder="0"
                  className="text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" className="text-sm" onClick={() => setEditingProduct(null)}>Cancel</Button>
              <Button size="sm" className="text-sm" onClick={handleEditProduct} disabled={saving || !formData.name}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stock Adjustment Modal */}
        <Dialog open={!!selectedProduct && !showAddProduct && !showCategories && !editingProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-lg flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5" />
                Adjust Stock
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-muted/50 rounded-xl mb-4">
                <p className="text-sm font-semibold">{selectedProduct?.name}</p>
                <p className="text-xs text-muted-foreground">Current stock: <span className="text-sm font-bold text-foreground">{selectedProduct?.stockQuantity}</span></p>
              </div>

              <div className="flex gap-2 mb-4">
                <Button
                  className="flex-1 gap-1 text-sm"
                  size="sm"
                  onClick={() => handleStockAdjust("add")}
                  disabled={saving || !adjustQty}
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Stock
                </Button>
                <Button
                  className="flex-1 gap-1 text-sm"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleStockAdjust("remove")}
                  disabled={saving || !adjustQty}
                >
                  <Minus className="h-4 w-4" />
                  Remove
                </Button>
              </div>

              <div className="grid gap-2">
                <Label className="text-sm font-medium">How many?</Label>
                <Input
                  type="number"
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="Enter quantity"
                  className="text-center text-lg font-bold"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" className="text-sm" onClick={() => { setSelectedProduct(null); setAdjustQty("") }}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}


interface Category {
  _id: string
  name: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [adjustQty, setAdjustQty] = useState("")
  const [uploading, setUploading] = useState(false)
  const [showUrlInputAdd, setShowUrlInputAdd] = useState(false)
  const [showUrlInputEdit, setShowUrlInputEdit] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [newCategoryName, setNewCategoryName] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    costPrice: "",
    sellingPrice: "",
    stockQuantity: "0",
    image: "",
  })

  const { toast } = useToast()

  const openEditModal = (product: Product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category?._id || "",
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      stockQuantity: product.stockQuantity.toString(),
      image: product.images?.[0] || "",
    })
    setEditingProduct(product)
  }

  const handleEditProduct = async () => {
    if (!editingProduct || !formData.name) return
    setSaving(true)
    try {
      await fetch(`/api/products/${editingProduct._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          image: formData.image ? [formData.image] : [],
          stockQuantity: parseInt(formData.stockQuantity) || 0,
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
      const res = await fetch("/api/products")
      const data = await res.json()
      setProducts(data.products || [])
      setCategories(data.categories || [])
    } catch (error) {
      console.error("Failed to fetch:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleQuickAdd = () => {
    const sku = `SKU-${Date.now().toString(36).toUpperCase().slice(-6)}`
    setFormData({ name: "", sku, category: categories[0]?._id || "", costPrice: "", sellingPrice: "", stockQuantity: "0", image: "" })
    setShowAddProduct(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.url }))
      } else {
        toast.error("Upload failed. Make sure Cloudinary is configured.")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.sellingPrice) return
    setSaving(true)
    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          sku: formData.sku,
          category: formData.category || undefined,
          image: formData.image || undefined,
          costPrice: parseFloat(formData.costPrice) || 0,
          sellingPrice: parseFloat(formData.sellingPrice) || 0,
          stockQuantity: parseInt(formData.stockQuantity) || 0,
          reorderLevel: 10,
          unitType: "piece",
        }),
      })
      setShowAddProduct(false)
      fetchData()
    } catch (error) {
      console.error("Failed:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleStockAdjust = async (type: "add" | "remove") => {
    if (!selectedProduct || !adjustQty) return
    setSaving(true)
    try {
      await fetch("/api/stock-adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct._id,
          type: type === "add" ? "stock_in" : "stock_out",
          quantity: parseInt(adjustQty),
          reason: "Manual adjustment",
        }),
      })
      setAdjustQty("")
      setSelectedProduct(null)
      fetchData()
    } catch (error) {
      console.error("Failed:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    setSaving(true)
    try {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      })
      setNewCategoryName("")
      fetchData()
    } catch (error) {
      console.error("Failed:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = async (catId: string) => {
    try {
      await fetch(`/api/categories?id=${catId}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      console.error("Failed:", error)
    }
  }

  const getStockStatus = (product: Product) => {
    if (product.stockQuantity === 0) return { label: "Out", variant: "destructive" as const }
    if (product.stockQuantity <= product.reorderLevel) return { label: "Low", variant: "warning" as const }
    return { label: "OK", variant: "success" as const }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalProducts = products.length
  const inStock = products.filter(p => p.stockQuantity > 0).length
  const lowStock = products.filter(p => p.stockQuantity <= p.reorderLevel && p.stockQuantity > 0).length
  const outOfStock = products.filter(p => p.stockQuantity === 0).length

  return (
    <AppLayout title="Products">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-[13px] text-muted-foreground">{products.length} items · Click stock to adjust</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-[13px]" onClick={() => setShowCategories(true)}>
              <Tag className="h-3.5 w-3.5" />
              Categories
            </Button>
            <Button size="sm" className="gap-1.5 text-[13px]" onClick={handleQuickAdd}>
              <Plus className="h-3.5 w-3.5" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Total Products"
            value={totalProducts.toString()}
            icon={BoxIcon}
            iconClassName="bg-info-subtle text-info"
          />
          <StatCard
            title="In Stock"
            value={inStock.toString()}
            icon={Package}
            iconClassName="bg-success-subtle text-success"
          />
          <StatCard
            title="Low Stock"
            value={lowStock.toString()}
            icon={AlertTriangle}
            iconClassName="bg-warning-subtle text-warning"
          />
          <StatCard
            title="Out of Stock"
            value={outOfStock.toString()}
            icon={XCircle}
            iconClassName="bg-destructive-subtle text-destructive"
          />
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search products by name or SKU..."
            />
          </CardContent>
        </Card>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EmptyState
                icon={Package}
                title="No products yet"
                description="Add your first product to get started"
                action={
                  <Button size="sm" className="text-[13px]" onClick={handleQuickAdd}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Product
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const status = getStockStatus(product)
              return (
                <Card key={product._id} className="overflow-hidden">
                  <div className="h-40 bg-muted relative group">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999'%3EImage%3C/text%3E%3C/svg%3E"
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}
                    <Badge variant={status.variant} className="text-[11px] absolute top-2 right-2">
                      {status.label}
                    </Badge>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 left-2 h-7 text-[13px] rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditModal(product)
                      }}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold mb-0.5 truncate">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{product.sku}</p>

                    <div className="flex items-center justify-between text-[13px] mb-3">
                      <Badge variant="info" className="text-[11px]">{product.category?.name || "Uncategorized"}</Badge>
                      <span className="text-sm font-bold">{formatCurrency(product.sellingPrice)}</span>
                    </div>

                    <div className="flex items-center justify-between bg-muted rounded-lg p-2">
                      <span className="text-xs text-muted-foreground">Stock:</span>
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-background transition-colors text-sm font-medium"
                      >
                        <span>{product.stockQuantity}</span>
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* ===== MODALS ===== */}

        {/* Add Product Modal with Image Upload */}
        <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-[13px]">Product Image</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={!formData.image ? "default" : "outline"}
                      size="sm"
                      className="flex-1 text-[13px]"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1" />
                      Upload
                    </Button>
                    <Button
                      type="button"
                      variant={showUrlInputAdd ? "default" : "outline"}
                      size="sm"
                      className="flex-1 text-[13px]"
                      onClick={() => {
                        setUrlInput(formData.image || "")
                        setShowUrlInputAdd(true)
                      }}
                    >
                      <ImageIcon className="h-3.5 w-3.5 mr-1" />
                      URL
                    </Button>
                  </div>

                  {showUrlInputAdd && (
                    <div className="flex gap-2">
                      <Input
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Enter image URL..."
                        className="flex-1 text-[13px]"
                      />
                      <Button
                        size="sm"
                        className="text-[13px]"
                        onClick={() => {
                          if (urlInput) setFormData(prev => ({ ...prev, image: urlInput }))
                          setShowUrlInputAdd(false)
                          setUrlInput("")
                        }}
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[13px]"
                        onClick={() => { setShowUrlInputAdd(false); setUrlInput("") }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {!showUrlInputAdd && formData.image && (
                    <div className="relative inline-block w-full">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="h-32 w-full object-cover rounded-lg border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999'%3EInvalid Image%3C/text%3E%3C/svg%3E"
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-[13px]">Product Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Royal Crown Gin 750ml"
                  className="text-[13px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-[13px]">Selling Price *</Label>
                  <Input
                    type="number"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                    placeholder="0.00"
                    className="text-[13px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[13px]">Cost Price</Label>
                  <Input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                    placeholder="0.00"
                    className="text-[13px]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-[13px]">Initial Stock</Label>
                  <Input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                    placeholder="0"
                    className="text-[13px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[13px]">Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                    <SelectTrigger className="text-[13px]"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" className="text-[13px]" onClick={() => setShowAddProduct(false)}>Cancel</Button>
              <Button size="sm" className="text-[13px]" onClick={handleSaveProduct} disabled={saving || !formData.name || !formData.sellingPrice}>
                {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Save Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Categories Modal */}
        <Dialog open={showCategories} onOpenChange={setShowCategories}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4" />
                Manage Categories
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="flex gap-2 mb-4">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name"
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  className="text-[13px]"
                />
                <Button size="sm" className="text-[13px]" onClick={handleAddCategory} disabled={saving || !newCategoryName.trim()}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {categories.map((cat) => (
                  <div key={cat._id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-[13px] font-medium">{cat.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleDeleteCategory(cat._id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-center text-muted-foreground text-xs py-4">No categories yet</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button size="sm" className="text-[13px]" onClick={() => setShowCategories(false)}>Done</Button>
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
                <Label className="text-[13px]">Product Image</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={!formData.image ? "default" : "outline"}
                      size="sm"
                      className="flex-1 text-[13px]"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1" />
                      Upload
                    </Button>
                    <Button
                      type="button"
                      variant={showUrlInputEdit ? "default" : "outline"}
                      size="sm"
                      className="flex-1 text-[13px]"
                      onClick={() => {
                        setUrlInput(formData.image || "")
                        setShowUrlInputEdit(true)
                      }}
                    >
                      <ImageIcon className="h-3.5 w-3.5 mr-1" />
                      URL
                    </Button>
                  </div>
                  {showUrlInputEdit && (
                    <div className="flex gap-2">
                      <Input
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Enter image URL..."
                        className="flex-1 text-[13px]"
                      />
                      <Button
                        size="sm"
                        className="text-[13px]"
                        onClick={() => {
                          if (urlInput) setFormData(prev => ({ ...prev, image: urlInput }))
                          setShowUrlInputEdit(false)
                          setUrlInput("")
                        }}
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[13px]"
                        onClick={() => { setShowUrlInputEdit(false); setUrlInput("") }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  {formData.image && !showUrlInputEdit && (
                    <div className="relative inline-block w-full">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="h-32 w-full object-cover rounded-lg border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999'%3EInvalid Image%3C/text%3E%3C/svg%3E"
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80"
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
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Product name"
                  className="text-[13px]"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-[13px]">Stock Quantity</Label>
                <Input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                  placeholder="0"
                  className="text-[13px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" className="text-[13px]" onClick={() => setEditingProduct(null)}>Cancel</Button>
              <Button size="sm" className="text-[13px]" onClick={handleEditProduct} disabled={saving || !formData.name}>
                {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stock Adjustment Modal */}
        <Dialog open={!!selectedProduct && !showAddProduct && !showCategories && !editingProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-sm">
                <ArrowUpDown className="h-4 w-4" />
                Adjust Stock
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-muted rounded-xl mb-4">
                <p className="text-sm font-semibold">{selectedProduct?.name}</p>
                <p className="text-xs text-muted-foreground">Current stock: <span className="text-sm font-bold text-foreground">{selectedProduct?.stockQuantity}</span></p>
              </div>

              <div className="flex gap-2 mb-4">
                <Button
                  className="flex-1 text-[13px]"
                  size="sm"
                  onClick={() => handleStockAdjust("add")}
                  disabled={saving || !adjustQty}
                >
                  <PlusIcon className="h-3.5 w-3.5 mr-1" />
                  Add Stock
                </Button>
                <Button
                  className="flex-1 text-[13px]"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleStockAdjust("remove")}
                  disabled={saving || !adjustQty}
                >
                  <Minus className="h-3.5 w-3.5 mr-1" />
                  Remove
                </Button>
              </div>

              <div className="grid gap-2">
                <Label className="text-[13px]">How many?</Label>
                <Input
                  type="number"
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="Enter quantity"
                  className="text-center text-lg font-bold"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" className="text-[13px]" onClick={() => { setSelectedProduct(null); setAdjustQty("") }}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
