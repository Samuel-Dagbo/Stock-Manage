"use client"

import { useEffect, useState } from "react"
import { useUIStore } from "@/lib/stores/ui-store"

export function ThemeProvider() {
  const { theme } = useUIStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const root = document.documentElement
    
    root.classList.add("theme-transition")
    
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
    
    setTimeout(() => {
      root.classList.remove("theme-transition")
    }, 300)
  }, [theme, mounted])

  return null
}