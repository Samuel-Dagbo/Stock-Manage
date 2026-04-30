import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UIState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  theme: "light" | "dark" | "system"
  commandPaletteOpen: boolean
  toasts: Toast[]

  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setTheme: (theme: "light" | "dark" | "system") => void
  setCommandPaletteOpen: (open: boolean) => void
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

interface Toast {
  id: string
  title: string
  description?: string
  variant: "default" | "success" | "error" | "warning"
}

const isServer = typeof window === "undefined"

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      theme: "system",
      commandPaletteOpen: false,
      toasts: [],

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setTheme: (theme) => set({ theme }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      addToast: (toast) =>
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id: Math.random().toString(36).slice(2) }],
        })),
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
    }),
    {
      name: "stock-manage-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
      skipHydration: isServer,
    }
  )
)