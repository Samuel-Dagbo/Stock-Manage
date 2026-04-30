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
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  Tag,
  FileText,
  BookOpen
} from "lucide-react"

const mainNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "POS", href: "/pos", icon: ShoppingCart },
  { name: "Tutorial", href: "/tutorial", icon: BookOpen },
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
  { name: "Audits", href: "/audits", icon: FileText },
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
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive 
          ? "bg-primary text-primary-foreground shadow-sm" 
          : "text-muted-foreground hover:bg-accent/80 hover:text-foreground",
        collapsed ? "justify-center px-0" : ""
      )}
      title={collapsed ? item.name : undefined}
    >
      <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
      {!collapsed && <span>{item.name}</span>}
      {isActive && !collapsed && (
        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground" />
      )}
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
                "group flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-accent/80 hover:text-foreground"
              )}
              title={item.name}
            >
              <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="px-3 pt-4 pb-2">
        <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
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
    "fixed left-0 top-0 z-50 h-screen transition-all duration-300 ease-out",
    isMobile ? "w-72" : sidebarCollapsed ? "w-[72px]" : "w-72",
    isMobile && !sidebarOpen && "-translate-x-full"
  )

  return (
    <aside className={sidebarClasses}>
      <div className={cn(
        "flex h-16 items-center border-b border-sidebar-border px-4 bg-sidebar-bg",
        sidebarCollapsed && !isMobile ? "justify-center" : "px-5"
      )}>
        {(!sidebarCollapsed || isMobile) && (
          <Link href="/dashboard" className="flex items-center gap-3 group" onClick={handleLinkClick}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Store className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-bold tracking-tight">Stock Manage</span>
            </div>
          </Link>
        )}
        {sidebarCollapsed && !isMobile && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white shadow-lg shadow-primary/20">
            <Store className="h-4 w-4" />
          </div>
        )}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto scrollbar-thin bg-sidebar-bg">
        <NavGroup title="Main" items={mainNav} pathname={pathname} collapsed={sidebarCollapsed && !isMobile} onClick={handleLinkClick} />
        <NavGroup title="Inventory" items={inventoryNav} pathname={pathname} collapsed={sidebarCollapsed && !isMobile} onClick={handleLinkClick} />
        <NavGroup title="CRM" items={crmNav} pathname={pathname} collapsed={sidebarCollapsed && !isMobile} onClick={handleLinkClick} />
        <NavGroup title="Finance" items={financeNav} pathname={pathname} collapsed={sidebarCollapsed && !isMobile} onClick={handleLinkClick} />
      </nav>

      <div className="border-t border-sidebar-border p-3 space-y-1 bg-sidebar-bg">
        {(!sidebarCollapsed || isMobile) ? (
          <NavGroup title="System" items={bottomNav} pathname={pathname} collapsed={false} onClick={handleLinkClick} />
        ) : (
          <div className="flex flex-col items-center gap-1 py-2">
            {bottomNav.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-accent/80 hover:text-foreground"
                  )}
                  title={item.name}
                >
                  <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                </Link>
              )
            })}
          </div>
        )}
        
        {!isMobile && (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 w-full",
              "hover:bg-accent/80 hover:text-foreground",
              sidebarCollapsed && "justify-center px-0"
            )}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="h-[18px] w-[18px]" />
            ) : (
              <>
                <PanelLeftClose className="h-[18px] w-[18px]" />
                <span>Collapse</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  )
}

export function MobileSidebarToggle() {
  const { setSidebarOpen } = useUIStore()
  
  return (
    <button
      onClick={() => setSidebarOpen(true)}
      className="lg:hidden p-2 hover:bg-accent rounded-lg text-muted-foreground transition-colors"
    >
      <Menu className="h-5 w-5" />
    </button>
  )
}