"use client"

export const dynamic = "force-dynamic"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
  MoreHorizontal, 
  Trash2, 
  Package,
  Loader2,
  ArrowUpDown,
  Minus,
  Plus as PlusIcon,
  Tag,
  Upload,
  Image as ImageIcon,
  X,
  Camera,
  Pencil
} from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/lib/hooks/use-toast"
import { AppLayout } from "@/components/shared/app-layout"

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
    if (product.stockQuantity === 0) return { label: "Out", color: "bg-red-500" }
    if (product.stockQuantity <= product.reorderLevel) return { label: "Low", color: "bg-amber-500" }
    return { label: "OK", color: "bg-green-500" }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AppLayout title="Products">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Products</h2>
            <p className="text-muted-foreground">{products.length} items • Click stock to adjust</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setShowCategories(true)}>
              <Tag className="h-4 w-4" />
              Categories
            </Button>
            <Button className="gap-2" onClick={handleQuickAdd}>
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">In Stock</p>
              <p className="text-2xl font-bold text-green-600">{products.filter(p => p.stockQuantity > 0).length}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold text-amber-600">{products.filter(p => p.stockQuantity <= p.reorderLevel && p.stockQuantity > 0).length}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{products.filter(p => p.stockQuantity === 0).length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products by name or SKU..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-4">Add your first product to get started</p>
              <Button onClick={handleQuickAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const status = getStockStatus(product)
              return (
                <Card key={product._id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Product Image */}
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
                    <Badge className={`${status.color} text-white text-xs absolute top-2 right-2`}>
                      {status.label}
                    </Badge>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="absolute top-2 left-2 h-7 text-xs shadow-md"
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
                    <h3 className="font-semibold mb-1 truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{product.sku}</p>
                    
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-muted-foreground">{product.category?.name || "Uncategorized"}</span>
                      <span className="font-bold text-lg">{formatCurrency(product.sellingPrice)}</span>
                    </div>
                    
                    {/* Stock - Click to adjust */}
                    <div className="flex items-center justify-between bg-muted rounded-lg p-2">
                      <span className="text-sm text-muted-foreground">Stock:</span>
                      <button 
                        onClick={() => setSelectedProduct(product)}
                        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-background transition-colors font-medium"
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
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Product Image</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant={!formData.image ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </Button>
                    <Button 
                      type="button"
                      variant={showUrlInputAdd ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => { 
                        setUrlInput(formData.image || "")
                        setShowUrlInputAdd(true) 
                      }}
                    >
                      <ImageIcon className="h-4 w-4 mr-1" />
                      URL
                    </Button>
                  </div>
                  
                  {showUrlInputAdd && (
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
                        className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80"
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
                <Label>Product Name *</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Royal Crown Gin 750ml"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Selling Price *</Label>
                  <Input 
                    type="number"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Cost Price</Label>
                  <Input 
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Initial Stock</Label>
                  <Input 
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddProduct(false)}>Cancel</Button>
              <Button onClick={handleSaveProduct} disabled={saving || !formData.name || !formData.sellingPrice}>
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
              <DialogTitle className="flex items-center gap-2">
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
                />
                <Button onClick={handleAddCategory} disabled={saving || !newCategoryName.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {categories.map((cat) => (
                  <div key={cat._id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{cat.name}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteCategory(cat._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No categories yet</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowCategories(false)}>Done</Button>
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
                      variant={!formData.image ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </Button>
                    <Button 
                      type="button"
                      variant={showUrlInputEdit ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => { 
                        setUrlInput(formData.image || "")
                        setShowUrlInputEdit(true) 
                      }}
                    >
                      <ImageIcon className="h-4 w-4 mr-1" />
                      URL
                    </Button>
                  </div>
                  {showUrlInputEdit && (
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
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Product name"
                />
              </div>
              <div className="grid gap-2">
                <Label>Stock Quantity</Label>
                <Input 
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
              <Button onClick={handleEditProduct} disabled={saving || !formData.name}>
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
              <DialogTitle className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5" />
                Adjust Stock
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-muted rounded-xl mb-4">
                <p className="font-semibold text-lg">{selectedProduct?.name}</p>
                <p className="text-muted-foreground">Current stock: <span className="font-bold text-foreground">{selectedProduct?.stockQuantity}</span></p>
              </div>
              
              <div className="flex gap-2 mb-4">
                <Button 
                  className="flex-1"
                  onClick={() => handleStockAdjust("add")}
                  disabled={saving || !adjustQty}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Stock
                </Button>
                <Button 
                  className="flex-1"
                  variant="destructive"
                  onClick={() => handleStockAdjust("remove")}
                  disabled={saving || !adjustQty}
                >
                  <Minus className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
              
              <div className="grid gap-2">
                <Label>How many?</Label>
                <Input 
                  type="number"
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="Enter quantity"
                  className="text-center text-xl font-bold"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setSelectedProduct(null); setAdjustQty("") }}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}