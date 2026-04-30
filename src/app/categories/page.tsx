"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { 
  Search, 
  Plus, 
  Tag,
  Loader2,
  Pencil,
  Trash2,
  Folder,
  Package
} from "lucide-react"
import { useToast } from "@/lib/hooks/use-toast"
import { AppLayout } from "@/components/shared/app-layout"

interface Category {
  _id: string
  name: string
  productCount?: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [products, setProducts] = useState<any[]>([])

  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/products")
      ])
      const categoriesData = await categoriesRes.json()
      const productsData = await productsRes.json()
      
      const categoriesWithCount = (categoriesData.categories || []).map((cat: Category) => ({
        ...cat,
        productCount: (productsData.products || []).filter((p: any) => p.category?._id === cat._id).length
      }))
      
      setCategories(categoriesWithCount)
      setProducts(productsData.products || [])
    } catch (error) {
      console.error("Failed to fetch:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddCategory = async () => {
    if (!categoryName.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName })
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        setShowAddModal(false)
        setCategoryName("")
        fetchData()
      }
    } catch (error) {
      console.error("Failed:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleEditCategory = async () => {
    if (!editingCategory || !categoryName.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/categories?id=${editingCategory._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName })
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        setEditingCategory(null)
        setCategoryName("")
        fetchData()
      }
    } catch (error) {
      console.error("Failed:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = async (catId: string) => {
    const cat = categories.find(c => c._id === catId)
    const productCount = products.filter((p: any) => p.category?._id === catId).length

    if (productCount > 0) {
      toast.warning(`Cannot delete this category. It has ${productCount} product(s) assigned to it.`)
      return
    }

    if (!confirm("Are you sure you want to delete this category?")) return
    
    try {
      await fetch(`/api/categories?id=${catId}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      console.error("Failed:", error)
    }
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    setCategoryName(category.name)
  }

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AppLayout title="Categories">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Categories</h2>
            <p className="text-muted-foreground">Organize your products into categories</p>
          </div>
          <Button className="gap-2" onClick={() => { setCategoryName(""); setShowAddModal(true) }}>
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Categories</p>
                  <p className="text-xl font-bold">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Folder className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">With Products</p>
                  <p className="text-xl font-bold">{categories.filter(c => c.productCount && c.productCount > 0).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-xl font-bold">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
              <p className="text-muted-foreground mb-4">Create your first category to organize products</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredCategories.map((category) => (
                  <div 
                    key={category._id} 
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Tag className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {category.productCount || 0} product{(category.productCount || 0) !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditModal(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteCategory(category._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Category Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Category Name</Label>
                <Input 
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Beverages, Snacks, Electronics"
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={handleAddCategory} disabled={saving || !categoryName.trim()}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Category Modal */}
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Category Name</Label>
                <Input 
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Category name"
                  onKeyDown={(e) => e.key === "Enter" && handleEditCategory()}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCategory(null)}>Cancel</Button>
              <Button onClick={handleEditCategory} disabled={saving || !categoryName.trim()}>
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