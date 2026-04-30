"use client"

import { useEffect } from "react"
import { useUIStore } from "@/lib/stores/ui-store"

export function ThemeProvider() {
  const { theme } = useUIStore()

  useEffect(() => {
    const root = document.documentElement
    
    // Handle system preference
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      root.classList.remove("light", "dark")
      root.classList.add(systemTheme)
    } else {
      root.classList.remove("light", "dark")
      root.classList.add(theme)
    }
  }, [theme])

  return null
}