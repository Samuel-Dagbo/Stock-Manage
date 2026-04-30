"use client"

import { useEffect } from "react"
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/lib/stores/ui-store"

const icons = {
  default: Info,
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
}

const styles = {
  default: "bg-background border-border",
  success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  error: "bg-destructive/10 border-destructive/20 text-destructive dark:text-red-400",
  warning: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
}

export function Toaster() {
  const { toasts, removeToast } = useUIStore()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon = icons[toast.variant]

        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right-full fade-in duration-300",
              styles[toast.variant]
            )}
          >
            <Icon className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{toast.title}</p>
              {toast.description && (
                <p className="text-sm opacity-80 mt-0.5">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded-md p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function useToast() {
  const { addToast, removeToast } = useUIStore()

  const toast = {
    success: (title: string, description?: string) => {
      addToast({ title, description, variant: "success" })
    },
    error: (title: string, description?: string) => {
      addToast({ title, description, variant: "error" })
    },
    warning: (title: string, description?: string) => {
      addToast({ title, description, variant: "warning" })
    },
    default: (title: string, description?: string) => {
      addToast({ title, description, variant: "default" })
    },
  }

  return { toast, dismiss: removeToast }
}