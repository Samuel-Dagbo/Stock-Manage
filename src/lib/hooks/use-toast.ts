import { useUIStore } from "@/lib/stores/ui-store"

export function useToast() {
  const { addToast, removeToast } = useUIStore()

  return {
    toast: {
      success: (title: string, description?: string) => {
        addToast({ title, description, variant: "success" })
      },
      error: (title: string, description?: string) => {
        addToast({ title, description, variant: "error" })
      },
      warning: (title: string, description?: string) => {
        addToast({ title, description, variant: "warning" })
      },
      info: (title: string, description?: string) => {
        addToast({ title, description, variant: "default" })
      },
    },
    dismiss: removeToast,
  }
}