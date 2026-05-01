"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Receipt,
  CreditCard,
  Smartphone,
  Banknote,
  Package,
  CheckCircle2,
  Loader2,
  X,
  ShoppingBag,
} from "lucide-react"
import { useCartStore } from "@/lib/stores/cart-store"
import { useToast } from "@/lib/hooks/use-toast"
import { cn, formatCurrency } from "@/lib/utils"
import { AppLayout } from "@/components/shared/app-layout"

const categories = ["All", "Spirits", "Beverages", "Groceries", "Household", "Snacks", "Personal Care"]

const categoryBadgeVariants: Record<string, "success" | "warning" | "destructive" | "info"> = {
  Spirits: "info",
  Beverages: "info",
  Groceries: "success",
  Household: "warning",
  Snacks: "warning",
  "Personal Care": "destructive",
}

interface POSProduct {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  category: string
  image: string | null
}

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showCheckout, setShowCheckout] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState("cash")
  const [showSuccess, setShowSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [posProducts, setPosProducts] = useState<POSProduct[]>([])
  const [loading, setLoading] = useState(true)

  const {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getTotal
  } = useCartStore()

  const { toast } = useToast()

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products")
        const data = await res.json()
        const products = data.products || []
        setPosProducts(products.map((p: any) => ({
          id: p._id,
          name: p.name,
          sku: p.sku,
          price: p.sellingPrice,
          stock: p.stockQuantity,
          category: p.category?.name || "Uncategorized",
          image: p.images?.[0] || null,
        })))
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = posProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    return matchesSearch && matchesCategory && product.stock > 0
  })

  const handleAddToCart = (product: POSProduct) => {
    addItem({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: 1,
      stock: product.stock,
    })
  }

  const handleCheckout = async () => {
    setSaving(true)
    try {
      const payload = {
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          sku: item.sku,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
        })),
        subtotal: getSubtotal(),
        discountAmount: 0,
        taxAmount: getTotal() - getSubtotal(),
        total: getTotal(),
        paymentMethod: selectedPayment,
        customerName: "Walk-in Customer",
      }

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setShowSuccess(true)
        setTimeout(() => {
          clearCart()
          setShowSuccess(false)
          setShowCheckout(false)
        }, 2000)
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to save sale")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast.error("Failed to save sale")
    } finally {
      setSaving(false)
    }
  }

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <AppLayout title="POS">
      <div className="flex flex-col lg:flex-row gap-4 min-h-[calc(100vh-8rem)]">
        <div className={cn("flex-1 flex flex-col min-h-0", showCart && "hidden lg:flex")}>
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-3 space-y-4 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name or SKU..."
                  className="pl-10 bg-muted/50 border-border/50 focus:ring-2 focus:ring-primary/20 text-[13px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="lg:hidden flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setShowCart(true)}
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Cart
                  {items.length > 0 && (
                    <Badge variant="default" className="ml-1 h-4 min-w-4 rounded-full px-1 text-[10px]">
                      {items.length}
                    </Badge>
                  )}
                </Button>
                {items.length > 0 && (
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setShowCheckout(true)}
                  >
                    <Receipt className="h-3.5 w-3.5" />
                    {formatCurrency(getTotal())}
                  </Button>
                )}
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1">
                <Button
                  variant={selectedCategory === "All" ? "default" : "outline"}
                  size="sm"
                  className="whitespace-nowrap text-xs px-3 rounded-md"
                  onClick={() => setSelectedCategory("All")}
                >
                  All Items
                </Button>
                {categories.slice(1).map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    className="whitespace-nowrap text-xs px-3 rounded-md"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto pt-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                  <p className="text-sm font-medium">Loading products...</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Please wait</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Package className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium">No products found</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Try adjusting your search or filter</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleAddToCart(product)}
                      className="w-full p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/50 hover:border-primary/30 transition-all duration-150 text-left group"
                    >
                      <div className="h-16 sm:h-20 rounded-lg bg-muted/50 flex items-center justify-center mb-2.5 group-hover:bg-primary/5 transition-colors relative overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <Package className="h-7 w-7 text-muted-foreground/40 group-hover:text-primary/40 transition-colors" />
                        )}
                        <div className="absolute top-1.5 right-1.5">
                          <Badge variant={categoryBadgeVariants[product.category] || "secondary"} className="text-[10px] px-1.5 py-0">
                            {product.category}
                          </Badge>
                        </div>
                      </div>
                      <p className="font-medium text-[13px] truncate group-hover:text-primary transition-colors">{product.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate hidden sm:block">{product.sku}</p>
                      <div className="flex items-baseline justify-between mt-1.5">
                        <p className="font-semibold text-sm text-primary">{formatCurrency(product.price)}</p>
                        <p className="text-[11px] text-muted-foreground">{product.stock} in stock</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="hidden lg:flex w-full xl:max-w-[380px] flex-col gap-4">
          <Card className="flex flex-col min-h-0">
            <CardHeader className="pb-3 shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-3.5 w-3.5 text-primary" />
                  Cart
                  {items.length > 0 && (
                    <Badge variant="default" className="ml-0.5">{items.length}</Badge>
                  )}
                </CardTitle>
                {items.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-muted-foreground hover:text-destructive h-7 px-2 text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto space-y-2 pt-0">
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <div className="h-14 w-14 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                    <ShoppingBag className="h-7 w-7 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium">Cart is empty</p>
                  <p className="text-xs text-muted-foreground mt-1">Click products to add them</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[13px] truncate">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">{formatCurrency(item.price)} each</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-2.5 w-2.5" />
                      </Button>
                      <span className="w-5 text-center text-[13px] font-semibold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                    <div className="text-right min-w-[56px] shrink-0">
                      <p className="font-semibold text-[13px]">{formatCurrency(item.price * item.quantity)}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="shrink-0">
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(getSubtotal())}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground">Tax (15%)</span>
                  <span className="font-medium">{formatCurrency(getTotal() - getSubtotal())}</span>
                </div>
                <div className="h-px bg-border/50" />
                <div className="flex justify-between font-semibold text-sm">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(getTotal())}</span>
                </div>
              </div>
              <Button
                className="w-full gap-1.5"
                size="lg"
                onClick={() => setShowCheckout(true)}
                disabled={items.length === 0}
              >
                <Receipt className="h-4 w-4" />
                Checkout ({cartItemCount} items)
              </Button>
            </CardContent>
          </Card>
        </div>

        {showCart && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCart(false)}
            />
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  <div>
                    <h3 className="text-sm font-semibold">Cart ({items.length})</h3>
                    <p className="text-[11px] text-muted-foreground">{cartItemCount} items</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowCart(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                      <ShoppingBag className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-medium">Cart is empty</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[13px] truncate">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-2.5 w-2.5" />
                        </Button>
                        <span className="w-6 text-center text-[13px] font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                      <div className="text-right min-w-[56px]">
                        <p className="font-medium text-[13px]">{formatCurrency(item.price * item.quantity)}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="p-4 border-t border-border/50 space-y-3">
                  <div className="flex justify-between font-semibold text-sm">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(getTotal())}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={clearCart}>
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => { setShowCart(false); setShowCheckout(true); }}
                    >
                      Checkout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showCheckout && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCheckout(false)}
        >
          <div
            className="bg-card rounded-xl border border-border shadow-xs w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Receipt className="h-4 w-4 text-primary" />
                  <div>
                    <h3 className="text-sm font-semibold">Checkout</h3>
                    <p className="text-[11px] text-muted-foreground">{cartItemCount} items</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowCheckout(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="text-center py-4 bg-muted/40 rounded-lg">
                <p className="text-[11px] text-muted-foreground mb-0.5">Total Amount</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(getTotal())}</p>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-medium text-muted-foreground">Payment Method</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "cash", icon: Banknote, label: "Cash" },
                    { id: "momo", icon: Smartphone, label: "MoMo" },
                    { id: "card", icon: CreditCard, label: "Card" },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={cn(
                        "p-2.5 rounded-lg border flex flex-col items-center gap-1.5 transition-all",
                        selectedPayment === method.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 hover:bg-muted hover:border-border"
                      )}
                    >
                      <method.icon className="h-4 w-4" />
                      <span className="text-[11px] font-medium">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowCheckout(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={handleCheckout}
                  disabled={saving}
                  loading={saving}
                >
                  {saving ? "Processing..." : "Complete Sale"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="p-6 flex flex-col items-center text-center space-y-3 max-w-sm w-full">
            <div className="h-16 w-16 rounded-full bg-success-subtle flex items-center justify-center">
              <CheckCircle2 className="h-9 w-9 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Sale Complete!</h3>
              <p className="text-[13px] text-muted-foreground mt-0.5">Transaction processed successfully</p>
            </div>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(getTotal())}
            </p>
            <p className="text-xs text-muted-foreground">
              Receipt has been generated
            </p>
          </Card>
        </div>
      )}
    </AppLayout>
  )
}
