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
  ChevronLeft,
  ChevronRight,
  Truck,
  Calendar,
  FileText as FileTextIcon,
  AlertCircle,
  Percent,
  PackageOpen,
  Layers,
  History,
  CreditCard,
  TrendingUp,
  PieChart,
  Settings as SettingsIcon,
  UserCog,
  Shield,
  Bell,
  Search,
  Command,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const mainNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, description: "Overview of your business" },
  { name: "POS", href: "/pos", icon: ShoppingCart, description: "Point of sale system" },
  { name: "Tutorial", href: "/tutorial", icon: BookOpen, description: "Learn how to use Stock Manage" },
]

const inventoryNav = [
  { name: "Products", href: "/products", icon: Package, description: "Manage your products" },
  { name: "Categories", href: "/categories", icon: Tag, description: "Product categories" },
  { name: "Inventory", href: "/inventory", icon: Boxes, description: "Stock movements" },
  { name: "Sales", href: "/sales", icon: Receipt, description: "Transaction history" },
]

const crmNav = [
  { name: "Customers", href: "/customers", icon: Users, description: "Customer database" },
  { name: "Suppliers", href: "/suppliers", icon: ShoppingBag, description: "Supplier management" },
]

const financeNav = [
  { name: "Expenses", href: "/expenses", icon: Wallet, description: "Track expenses" },
  { name: "Reports", href: "/reports", icon: BarChart3, description: "Analytics & reports" },
  { name: "Audits", href: "/audits", icon: FileText, description: "Audit logs" },
]

const bottomNav = [
  { name: "Settings", href: "/settings", icon: Settings, description: "System settings" },
]

interface NavItemProps {
  item: { name: string; href: string; icon: any; description?: string }
  isActive: boolean
  collapsed: boolean
  onClick?: () => void
}

function NavItem({ item, isActive, collapsed, onClick }: NavItemProps) {
  const content = (
    <div
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          : "text-muted-foreground hover:bg-accent/80 hover:text-foreground",
        collapsed ? "justify-center px-0" : ""
      )}
      title={collapsed ? item.name : undefined}
    >
      <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
      {!collapsed && <span className="truncate">{item.name}</span>}
      {isActive && !collapsed && (
        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground shadow-sm" />
      )}
    </div>
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={item.href} onClick={onClick} className="block">
            {content}
          </Link>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="right" className="bg-slate-800 border-slate-700">
            <p>{item.name}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}

interface NavGroupProps {
  title: string
  items: { name: string; href: string; icon: any; description?: string }[]
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
          return <NavItem key={item.href} item={item} isActive={isActive} collapsed={collapsed} onClick={onClick} />
        })}
      </div>
    )
  }

  return (
    <div className="space-y-1 py-2">
      {!collapsed && (
        <div className="px-3 py-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">{title}</h2>
        </div>
      )}
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return <NavItem key={item.href} item={item} isActive={isActive} collapsed={collapsed} onClick={onClick} />
      })}
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, sidebarOpen, setSidebarOpen, setSidebarCollapsed } = useUIStore()

  if (!sidebarOpen) {
    return (
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-110"
      >
        <Menu className="h-5 w-5" />
      </button>
    )
  }

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        style={{ opacity: sidebarOpen ? 1 : 0 }}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border/60 bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/60 px-4">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Stock Manage</h1>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Premium Edition</p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <Store className="h-5 w-5 text-white" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-accent/80 hover:text-foreground"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <ScrollArea className="flex-1 py-4">
          <div className="px-3">
            <NavGroup
              title="Main"
              items={mainNav}
              pathname={pathname}
              collapsed={sidebarCollapsed}
              onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
            />
            <NavGroup
              title="Inventory"
              items={inventoryNav}
              pathname={pathname}
              collapsed={sidebarCollapsed}
              onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
            />
            <NavGroup
              title="CRM"
              items={crmNav}
              pathname={pathname}
              collapsed={sidebarCollapsed}
              onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
            />
            <NavGroup
              title="Finance"
              items={financeNav}
              pathname={pathname}
              collapsed={sidebarCollapsed}
              onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
            />
          </div>
        </ScrollArea>

        <div className="border-t border-border/60 p-3">
          <NavGroup
            title=""
            items={bottomNav}
            pathname={pathname}
            collapsed={sidebarCollapsed}
            onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
          />
        </div>
      </aside>
    </>
  )
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