"use client"

import { ReactNode } from "react"
import { Sidebar } from "@/components/shared/sidebar"
import { Header } from "@/components/shared/header"
import { Toaster } from "@/components/ui/toaster"
import { useUIStore } from "@/lib/stores/ui-store"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: ReactNode
  title?: string
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const { sidebarCollapsed, sidebarOpen, setSidebarOpen } = useUIStore()

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar />

      <div
        className={cn(
          "min-h-screen transition-[margin] duration-300 ease-in-out",
          sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
        )}
      >
        <Header title={title} />

        <main className="p-4 lg:p-6 min-h-[calc(100vh-4rem)]">
          <div className="mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  )
}