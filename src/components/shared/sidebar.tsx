"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/lib/stores/ui-store"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Receipt,
  Wallet,
  Settings,
  ShoppingBag,
  BarChart3,
  Boxes,
  Store,
  ChevronLeft,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  Tag
} from "lucide-react"

const mainNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "POS", href: "/pos", icon: ShoppingCart },
]

const inventoryNav = [
  { name: "Products", href: "/products", icon: Package },
  { name: "Categories", href: "/categories", icon: Tag },
  { name: "Inventory", href: "/inventory", icon: Boxes },
  { name: "Sales", href: "/sales", icon: Receipt },
]

const crmNav = [
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Suppliers", href: "/suppliers", icon: ShoppingBag },
]

const financeNav = [
  { name: "Expenses", href: "/expenses", icon: Wallet },
  { name: "Reports", href: "/reports", icon: BarChart3 },
]

const bottomNav = [
  { name: "Settings", href: "/settings", icon: Settings },
]

interface NavItemProps {
  item: { name: string; href: string; icon: any }
  isActive: boolean
  collapsed: boolean
  onClick?: () => void
}

function NavItem({ item, isActive, collapsed, onClick }: NavItemProps) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive 
          ? "bg-gradient-to-r from-primary/90 to-primary text-white shadow-lg shadow-primary/25" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        collapsed ? "justify-center px-2" : ""
      )}
      title={collapsed ? item.name : undefined}
    >
      <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-white")} />
      {!collapsed && <span>{item.name}</span>}
    </Link>
  )
}

interface NavGroupProps {
  title: string
  items: { name: string; href: string; icon: any }[]
  pathname: string
  collapsed: boolean
  onClick?: () => void
}

function NavGroup({ title, items, pathname, collapsed, onClick }: NavGroupProps) {
  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1 py-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClick}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-gradient-to-r from-primary/90 to-primary text-white shadow-lg shadow-primary/25" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={item.name}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
          {title}
        </span>
      </div>
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return <NavItem key={item.name} item={item} isActive={isActive} collapsed={collapsed} onClick={onClick} />
      })}
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, setSidebarCollapsed, sidebarOpen, setSidebarOpen } = useUIStore()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleLinkClick = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const sidebarClasses = cn(
    "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out",
    isMobile ? "w-72" : sidebarCollapsed ? "w-20" : "w-72",
    isMobile && !sidebarOpen && "-translate-x-full"
  )

  return (
    <aside className={sidebarClasses}>
      <div className="flex h-full flex-col bg-gradient-to-b from-background to-background/80 backdrop-blur-xl border-r border-border/50">
        {/* Header */}
        <div className={cn(
          "flex h-16 items-center border-b border-border/50 px-4",
          sidebarCollapsed && !isMobile ? "justify-center" : "px-6"
        )}>
          {(!sidebarCollapsed || isMobile) && (
            <Link href="/dashboard" className="flex items-center gap-3 group" onClick={handleLinkClick}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg">
                <Store className="h-5 w-5" />
              </div>
              {!isMobile && (
                <div>
                  <span className="text-base font-bold">Stock Manage</span>
                  <p className="text-xs text-muted-foreground">Inventory System</p>
                </div>
              )}
            </Link>
          )}
          {sidebarCollapsed && !isMobile && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg">
              <Store className="h-5 w-5" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-4 p-4 overflow-y-auto">
          <NavGroup title="Main" items={mainNav} pathname={pathname} collapsed={sidebarCollapsed && !isMobile} onClick={handleLinkClick} />
          <NavGroup title="Inventory" items={inventoryNav} pathname={pathname} collapsed={sidebarCollapsed && !isMobile} onClick={handleLinkClick} />
          <NavGroup title="CRM" items={crmNav} pathname={pathname} collapsed={sidebarCollapsed && !isMobile} onClick={handleLinkClick} />
          <NavGroup title="Finance" items={financeNav} pathname={pathname} collapsed={sidebarCollapsed && !isMobile} onClick={handleLinkClick} />
        </nav>

        {/* Footer */}
        <div className="border-t border-border/50 p-4 space-y-2">
          {(!sidebarCollapsed || isMobile) && (
            <NavGroup title="System" items={bottomNav} pathname={pathname} collapsed={false} onClick={handleLinkClick} />
          )}
          {sidebarCollapsed && !isMobile && (
            <div className="flex flex-col items-center gap-1 py-2">
              {bottomNav.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
                      isActive 
                        ? "bg-gradient-to-r from-primary/90 to-primary text-white shadow-lg shadow-primary/25" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    title={item.name}
                  >
                    <item.icon className="h-5 w-5" />
                  </Link>
                )
              })}
            </div>
          )}
          
          {isMobile ? (
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
              <span>Close</span>
            </button>
          ) : (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 w-full",
                "hover:bg-muted hover:text-foreground",
                sidebarCollapsed && "justify-center px-2"
              )}
            >
              {sidebarCollapsed ? (
                <PanelLeft className="h-5 w-5" />
              ) : (
                <>
                  <PanelLeftClose className="h-5 w-5" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}

// Add mobile toggle button to header
export function MobileSidebarToggle() {
  const { setSidebarOpen } = useUIStore()
  
  return (
    <button
      onClick={() => setSidebarOpen(true)}
      className="lg:hidden p-2 hover:bg-muted rounded-lg"
    >
      <Menu className="h-6 w-6" />
    </button>
  )
}