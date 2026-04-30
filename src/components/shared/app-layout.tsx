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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="absolute inset-0 gradient-mesh opacity-30 pointer-events-none" />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar />

      {/* Main content wrapper with responsive margins - reacts to sidebar collapsed state */}
      <div
        className={cn(
          "min-h-screen transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"
        )}
      >
        <Header title={title} />

        <main className="p-4 lg:p-6 min-h-[calc(100vh-4rem)] overflow-x-hidden">
          <div className="w-full mx-auto">
            {children}
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  )
}