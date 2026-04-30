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
  Sparkles
} from "lucide-react"
import { useCartStore } from "@/lib/stores/cart-store"
import { useToast } from "@/lib/hooks/use-toast"
import { cn, formatCurrency } from "@/lib/utils"
import { AppLayout } from "@/components/shared/app-layout"
import { motion, AnimatePresence } from "framer-motion"

const categories = ["All", "Spirits", "Beverages", "Groceries", "Household", "Snacks", "Personal Care"]

const categoryColors: Record<string, string> = {
  Spirits: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  Beverages: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Groceries: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Household: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Snacks: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  "Personal Care": "bg-pink-500/10 text-pink-600 border-pink-500/20",
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
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
        {/* Products Section */}
        <div className={cn("flex-1 flex flex-col min-h-0", showCart && "hidden lg:flex")}>
          <Card className="flex-1 flex flex-col shadow-md border-0 overflow-hidden">
            <CardHeader className="pb-3 space-y-4 bg-gradient-to-r from-primary/5 to-transparent shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search products by name or SKU..."
                  className="pl-12 h-12 bg-muted/50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Mobile Cart Toggle - only visible on mobile */}
              <div className="lg:hidden flex items-center justify-between">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setShowCart(true)}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Cart
                  {items.length > 0 && (
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary">
                      {items.length}
                    </Badge>
                  )}
                </Button>
                {items.length > 0 && (
                  <Button
                    className="gap-2 bg-gradient-to-r from-primary to-primary/80"
                    onClick={() => setShowCheckout(true)}
                  >
                    <Receipt className="h-4 w-4" />
                    {formatCurrency(getTotal())}
                  </Button>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                <Button
                  variant={selectedCategory === "All" ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "whitespace-nowrap text-xs px-3 py-1.5 rounded-lg",
                    selectedCategory === "All" && "bg-primary shadow-md shadow-primary/25"
                  )}
                  onClick={() => setSelectedCategory("All")}
                >
                  All Items
                </Button>
                {categories.slice(1).map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "whitespace-nowrap text-xs px-3 py-1.5 rounded-lg transition-all",
                      selectedCategory === cat && "bg-primary shadow-md shadow-primary/25"
                    )}
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
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  </div>
                  <p className="text-lg font-medium mb-1">Loading products...</p>
                  <p className="text-sm text-muted-foreground">Please wait</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Package className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <p className="text-lg font-medium mb-1">No products found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search or filter</p>
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: { staggerChildren: 0.03 }
                    }
                  }}
                >
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        show: { opacity: 1, y: 0 }
                      }}
                    >
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full p-3 sm:p-4 rounded-xl border bg-card hover:bg-muted/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 text-left group"
                      >
                        <div className="h-16 sm:h-20 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-3 group-hover:from-primary/10 group-hover:to-primary/5 transition-colors relative overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover rounded-xl"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          ) : (
                            <Package className="h-8 sm:h-10 w-8 sm:w-10 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
                          )}
                          <div className="absolute top-2 right-2">
                            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0.5", categoryColors[product.category] || "bg-muted text-muted-foreground")}>
                              {product.category}
                            </Badge>
                          </div>
                        </div>
                        <p className="font-semibold text-xs sm:text-sm truncate mb-1 group-hover:text-primary transition-colors">{product.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block mb-2">{product.sku}</p>
                        <p className="font-bold text-base sm:text-lg text-primary">{formatCurrency(product.price)}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{product.stock} in stock</p>
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Desktop Cart Sidebar */}
        <div className="hidden lg:flex w-full xl:w-[380px] flex-col gap-4 shrink-0">
          <Card className="flex-1 flex flex-col min-h-0 shadow-md border-0 overflow-hidden">
            <CardHeader className="pb-3 shrink-0 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                  </div>
                  Cart
                  {items.length > 0 && (
                    <Badge className="ml-1 bg-primary">{items.length}</Badge>
                  )}
                </CardTitle>
                {items.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-muted-foreground hover:text-destructive h-8 px-2"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto space-y-2 pt-0 scrollbar-thin">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="font-medium">Cart is empty</p>
                  <p className="text-sm text-muted-foreground mt-1">Click products to add them</p>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-2 p-2.5 rounded-xl bg-muted/50 border border-transparent hover:border-primary/10 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} each</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right min-w-[60px] shrink-0">
                        <p className="font-semibold text-sm">{formatCurrency(item.price * item.quantity)}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md border-0 overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(getSubtotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (15%)</span>
                  <span className="font-medium">{formatCurrency(getTotal() - getSubtotal())}</span>
                </div>
                <div className="h-px bg-border/50" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(getTotal())}</span>
                </div>
              </div>
              <Button
                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
                onClick={() => setShowCheckout(true)}
                disabled={items.length === 0}
              >
                <Receipt className="mr-2 h-5 w-5" />
                Checkout ({cartItemCount} items)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Cart Drawer */}
        {showCart && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCart(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-background flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Cart ({items.length})</h3>
                    <p className="text-xs text-muted-foreground">{cartItemCount} items</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowCart(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                      <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <p className="font-medium">Cart is empty</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right min-w-[60px]">
                        <p className="font-medium text-sm">{formatCurrency(item.price * item.quantity)}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="p-4 border-t space-y-4 bg-muted/30">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(getTotal())}</span>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={clearCart}>
                      Clear
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                      onClick={() => { setShowCart(false); setShowCheckout(true); }}
                    >
                      Checkout
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCheckout(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Checkout</h3>
                      <p className="text-xs text-muted-foreground">{cartItemCount} items</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowCheckout(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <div className="text-center py-5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl">
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-4xl font-bold text-primary">{formatCurrency(getTotal())}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "cash", icon: Banknote, label: "Cash", color: "emerald" },
                      { id: "momo", icon: Smartphone, label: "MoMo", color: "yellow" },
                      { id: "card", icon: CreditCard, label: "Card", color: "blue" },
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={cn(
                          "p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                          selectedPayment === method.id
                            ? method.color === "emerald" ? "border-primary bg-primary/10 text-primary" :
                              method.color === "yellow" ? "border-yellow-500 bg-yellow-500/10 text-yellow-600" :
                              "border-blue-500 bg-blue-500/10 text-blue-600"
                            : "border-border hover:bg-muted hover:border-muted-foreground/20"
                        )}
                      >
                        <method.icon className="h-5 w-5" />
                        <span className="text-xs font-medium">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-10"
                    onClick={() => setShowCheckout(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 h-10 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    onClick={handleCheckout}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Complete Sale
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-card rounded-3xl p-8 flex flex-col items-center text-center space-y-4 shadow-2xl max-w-sm w-full"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 15 }}
                className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30"
              >
                <CheckCircle2 className="h-12 w-12 text-white" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold">Sale Complete!</h3>
                <p className="text-muted-foreground mt-1">Transaction processed successfully</p>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold text-primary"
              >
                {formatCurrency(getTotal())}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Sparkles className="h-4 w-4" />
                <span>Receipt has been generated</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}