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
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150",
        isActive 
          ? "bg-primary-subtle text-primary" 
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        collapsed ? "justify-center px-0" : ""
      )}
      title={collapsed ? item.name : undefined}
    >
      <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
      {!collapsed && <span>{item.name}</span>}
      {isActive && !collapsed && (
        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
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
      <div className="flex flex-col items-center gap-0.5 py-1">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClick}
              className={cn(
                "group flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150",
                isActive 
                  ? "bg-primary-subtle text-primary" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title={item.name}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      <div className="px-3 pt-3 pb-1">
        <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
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
    "fixed left-0 top-0 z-40 h-screen transition-all duration-200 ease-in-out",
    isMobile ? "w-64" : sidebarCollapsed ? "w-[68px]" : "w-64",
    isMobile && !sidebarOpen && "-translate-x-full"
  )

  return (
    <aside className={sidebarClasses}>
      <div className="flex h-full flex-col bg-sidebar-bg border-r border-sidebar-border">
        <div className={cn(
          "flex h-14 items-center border-b border-sidebar-border px-4",
          sidebarCollapsed && !isMobile ? "justify-center" : "px-5"
        )}>
          {(!sidebarCollapsed || isMobile) && (
            <Link href="/dashboard" className="flex items-center gap-2.5 group" onClick={handleLinkClick}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary text-white">
                <Store className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-sm font-bold tracking-tight">Stock Manage</span>
              </div>
            </Link>
          )}
          {sidebarCollapsed && !isMobile && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary text-white">
              <Store className="h-4 w-4" />
            </div>
          )}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-1 p-3 overflow-y-auto scrollbar-thin">
          <NavGroup title="Main" items={mainNav} pathname={pathname} collapsed={sidebarCollapsed && !isMobile} onClick={handleLinkClick} />
          <NavGroup title="Inventory" items={inventoryNav} pathname={pathname} collapsed={sidebarCollapsed && !isMobile} onClick={handleLinkClick} />
          <NavGroup title="CRM" items={crmNav} pathname={pathname} collapsed={sidebarCollapsed && !isMobile} onClick={handleLinkClick} />
          <NavGroup title="Finance" items={financeNav} pathname={pathname} collapsed={sidebarCollapsed && !isMobile} onClick={handleLinkClick} />
        </nav>

        <div className="border-t border-sidebar-border p-3 space-y-1">
          {(!sidebarCollapsed || isMobile) ? (
            <NavGroup title="System" items={bottomNav} pathname={pathname} collapsed={false} onClick={handleLinkClick} />
          ) : (
            <div className="flex flex-col items-center gap-0.5 py-1">
              {bottomNav.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150",
                      isActive 
                        ? "bg-primary-subtle text-primary" 
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                    title={item.name}
                  >
                    <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  </Link>
                )
              })}
            </div>
          )}
          
          {!isMobile && (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground transition-all duration-150 w-full",
                "hover:bg-accent hover:text-foreground",
                sidebarCollapsed && "justify-center px-0"
              )}
            >
              {sidebarCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4" />
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
