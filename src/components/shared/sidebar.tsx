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
  BookOpen,
  ChevronDown,
  Sparkles
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
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive 
          ? "bg-primary/10 text-primary dark:bg-primary/15" 
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
        collapsed ? "justify-center px-0 w-10" : ""
      )}
      title={collapsed ? item.name : undefined}
    >
      <div className={cn(
        "relative flex items-center justify-center",
        collapsed ? "h-10 w-10" : ""
      )}>
        {isActive && (
          <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl -z-10 animate-pulse-soft" />
        )}
        <item.icon className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )} />
      </div>
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
      <div className="flex flex-col items-center gap-1 py-3">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClick}
              className={cn(
                "group flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
              title={item.name}
            >
              <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="px-3 pt-6 pb-2">
        <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider flex items-center gap-2">
          {title === "Main" && <Sparkles className="h-3 w-3" />}
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

function SidebarContent({ collapsed, isMobile, onLinkClick }: { collapsed: boolean; isMobile: boolean; onLinkClick?: () => void }) {
  const pathname = usePathname()
  
  return (
    <>
      <div className="flex-1 overflow-y-auto scrollbar-thin py-4">
        <NavGroup title="Main" items={mainNav} pathname={pathname} collapsed={collapsed} onClick={onLinkClick} />
        <NavGroup title="Inventory" items={inventoryNav} pathname={pathname} collapsed={collapsed} onClick={onLinkClick} />
        <NavGroup title="CRM" items={crmNav} pathname={pathname} collapsed={collapsed} onClick={onLinkClick} />
        <NavGroup title="Finance" items={financeNav} pathname={pathname} collapsed={collapsed} onClick={onLinkClick} />
      </div>

      <div className="border-t border-border/50 p-3 space-y-1">
        {collapsed ? (
          <div className="flex flex-col items-center gap-1 py-2">
            {bottomNav.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                  title={item.name}
                >
                  <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                </Link>
              )
            })}
          </div>
        ) : (
          <NavGroup title="System" items={bottomNav} pathname={pathname} collapsed={false} onClick={onLinkClick} />
        )}
        
        {!isMobile && (
          <button
            onClick={() => useUIStore.getState().setSidebarCollapsed(!collapsed)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 w-full",
              "hover:bg-secondary/50 hover:text-foreground",
              collapsed && "justify-center px-0 w-10"
            )}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
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
    </>
  )
}

export function Sidebar() {
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

  useEffect(() => {
    if (sidebarOpen && isMobile) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [sidebarOpen, isMobile])

  const handleLinkClick = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const sidebarWidth = isMobile ? "w-[280px]" : sidebarCollapsed ? "w-[72px]" : "w-[260px]"

  return (
    <>
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen flex flex-col",
        "bg-card/95 dark:bg-card/80 backdrop-blur-xl border-r border-border/30",
        "transition-all duration-300 ease-out",
        isMobile ? "translate-x-0" : "",
        sidebarWidth,
        !isMobile && sidebarCollapsed && "lg:w-[72px]",
        isMobile && !sidebarOpen && "-translate-x-full"
      )}>
        <div className={cn(
          "flex h-16 items-center border-b border-border/30 px-4 bg-card/50",
          isMobile || sidebarCollapsed ? "justify-center px-2" : "justify-between px-4"
        )}>
          {(!sidebarCollapsed || isMobile) && (
            <Link href="/dashboard" className="flex items-center gap-3 group" onClick={handleLinkClick}>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
                <Store className="h-4 w-4" />
              </div>
              {!isMobile && !sidebarCollapsed && (
                <div className="min-w-0">
                  <span className="text-sm font-bold tracking-tight">Stock Manage</span>
                </div>
              )}
            </Link>
          )}
          {(sidebarCollapsed && !isMobile) && (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white shadow-lg shadow-primary/25">
              <Store className="h-4 w-4" />
            </div>
          )}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          {!isMobile && sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title="Expand sidebar"
            >
              <PanelLeft className="h-[18px] w-[18px]" />
            </button>
          )}
          {!isMobile && !sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>

        <SidebarContent 
          collapsed={sidebarCollapsed && !isMobile} 
          isMobile={isMobile} 
          onLinkClick={handleLinkClick} 
        />
      </aside>
    </>
  )
}

export function MobileSidebarToggle() {
  const { setSidebarOpen } = useUIStore()
  
  return (
    <button
      onClick={() => setSidebarOpen(true)}
      className="lg:hidden p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-colors"
    >
      <Menu className="h-5 w-5" />
    </button>
  )
}