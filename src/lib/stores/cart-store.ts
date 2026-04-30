import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  id: string
  productId: string
  name: string
  sku: string
  price: number
  quantity: number
  stock: number
  image?: string
  variantName?: string
}

interface CartState {
  items: CartItem[]
  customer: { id: string; name: string } | null
  discountType: "percentage" | "fixed"
  discountValue: number
  discountAmount: number
  taxRate: number
  taxAmount: number
  notes: string

  addItem: (item: Omit<CartItem, "id">) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
  setCustomer: (customer: { id: string; name: string } | null) => void
  setDiscount: (type: "percentage" | "fixed", value: number) => void
  setDiscountAmount: (amount: number) => void
  setTaxRate: (rate: number) => void
  setNotes: (notes: string) => void
  getSubtotal: () => number
  getTotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      customer: null,
      discountType: "percentage",
      discountValue: 0,
      discountAmount: 0,
      taxRate: 0,
      taxAmount: 0,
      notes: "",

      addItem: (item) => {
        const items = get().items
        const existingItem = items.find((i) => i.productId === item.productId && i.variantName === item.variantName)

        if (existingItem) {
          const newQuantity = existingItem.quantity + item.quantity
          set({
            items: items.map((i) =>
              i.id === existingItem.id
                ? { ...i, quantity: Math.min(newQuantity, item.stock) }
                : i
            ),
          })
        } else {
          const newItem = {
            ...item,
            id: Math.random().toString(36).slice(2) + Date.now().toString(36),
          }
          set({
            items: [...items, newItem],
          })
        }
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) })
        } else {
          set({
            items: get().items.map((i) =>
              i.id === id
                ? { ...i, quantity: Math.min(quantity, i.stock) }
                : i
            ),
          })
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },

      clearCart: () => {
        set({
          items: [],
          customer: null,
          discountValue: 0,
          discountAmount: 0,
          taxRate: 0,
          taxAmount: 0,
          notes: "",
        })
      },

      setCustomer: (customer) => set({ customer }),

      setDiscount: (type, value) => {
        const subtotal = get().getSubtotal()
        let amount = 0

        if (type === "percentage") {
          amount = subtotal * (value / 100)
        } else {
          amount = value
        }

        set({
          discountType: type,
          discountValue: value,
          discountAmount: amount,
        })
      },

      setDiscountAmount: (amount) => set({ discountAmount: amount }),

      setTaxRate: (rate) => {
        const subtotal = get().getSubtotal()
        const afterDiscount = subtotal - get().discountAmount
        set({
          taxRate: rate,
          taxAmount: afterDiscount * (rate / 100),
        })
      },

      setNotes: (notes) => set({ notes }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      getTotal: () => {
        const subtotal = get().getSubtotal()
        const discount = get().discountAmount
        const tax = get().taxAmount
        return Math.max(0, subtotal - discount + tax)
      },
    }),
    {
      name: "stock-manage-cart",
      partialize: (state) => ({
        items: state.items,
        customer: state.customer,
        discountType: state.discountType,
        discountValue: state.discountValue,
        discountAmount: state.discountAmount,
        taxRate: state.taxRate,
        taxAmount: state.taxAmount,
        notes: state.notes,
      }),
    }
  )
)