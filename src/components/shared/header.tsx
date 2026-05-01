"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/lib/stores/ui-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  Search,  
  Bell,  
  Command,  
  LogOut,  
  User,  
  Settings,  
  ShoppingCart,  
  Package,  
  TrendingUp,  
  Plus,  
  Menu,  
  Calendar, 
  Clock,
  Hexagon,
  Flame
} from "lucide-react"
import { ThemeSwitcher } from "./theme-switcher"

interface HeaderProps {
  title?: string
}

interface Notification {
  id: string
  title: string
  message: string
  time: string
  icon: any
  variant: "warning" | "success" | "info"
}

const mockNotifications: Notification[] = [
  { id: "1", title: "Low Stock Alert", message: "Royal Crown Gin 750ml is running low", time: "5 min ago", icon: Package, variant: "warning" },
  { id: "2", title: "New Sale", message: "New sale of GHS 450.00 completed", time: "15 min ago", icon: TrendingUp, variant: "success" },
  { id: "3", title: "New Order", message: "Customer Kwame placed a new order", time: "1 hour ago", icon: ShoppingCart, variant: "info" },
]

const variantStyles = {
  warning: "bg-warning-subtle text-warning",
  success: "bg-success-subtle text-success",
  info: "bg-info-subtle text-info",
}

function SearchBar({ className }: { className?: string }) {
  const [searchQuery, setSearchQuery] = useState("")
  
  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search products, customers, sales..."
        className="w-full h-10 pl-10 pr-20 bg-secondary/50 border-0 rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-ring shadow-sm"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md border border-border/50">
        <Command className="h-2.5 w-2.5" />
        <span>K</span>
      </div>
    </div>
  )
}

function NotificationPanel() {
  return (
    <div className="w-80 rounded-2xl overflow-hidden shadow-2xl border border-border/50">
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-secondary/30">
        <h3 className="font-semibold">Notifications</h3>
        <Badge variant="secondary" className="text-[10px]">{mockNotifications.length} new</Badge>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {mockNotifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-start gap-3 p-4 hover:bg-secondary/50 cursor-pointer border-b border-border/30 last:border-0 transition-colors"
          >
            <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", variantStyles[notification.variant])}>
              <notification.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{notification.title}</p>
              <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {notification.time}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-border/50 bg-secondary/30">
        <Button variant="ghost" className="w-full text-sm h-9">
          View all notifications
        </Button>
      </div>
    </div>
  )
}

function UserMenu({ onLogout }: { onLogout: () => void }) {
  const router = useRouter()
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 px-2 rounded-xl hover:bg-secondary/50 transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="gradient-primary text-white text-xs font-semibold">
              SM
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 rounded-xl shadow-xl border border-border/50" align="end" sideOffset={8}>
        <DropdownMenuLabel className="font-normal p-2">
          <div className="flex items-center gap-3 p-1.5">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="gradient-primary text-white text-xs font-semibold">
                SM
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">Store Manager</p>
              <p className="text-xs text-muted-foreground truncate">manager@store.com</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings")} className="text-sm rounded-lg">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")} className="text-sm rounded-lg">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive text-sm rounded-lg" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Header({ title }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { setSidebarOpen } = useUIStore()
  const [isMobile, setIsMobile] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    
    return () => {
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const pageTitle = title || pathname.split("/").pop()?.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "Dashboard"

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/" })
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <header className={cn(
      "sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/30 bg-background/60 backdrop-blur-xl px-4 lg:px-6 transition-all duration-200",
      scrolled && "bg-background/90 shadow-sm"
    )}>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9 rounded-lg"
          onClick={() => {
            useUIStore.getState().setSidebarOpen(true)
          }}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="min-w-0">
          <h1 className="text-base font-semibold tracking-tight">{pageTitle}</h1>
          <p className="text-xs text-muted-foreground hidden sm:flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4">
        <SearchBar />
      </div>

      <div className="flex items-center gap-2">
        {!isMobile && (
          <div className="hidden lg:flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-9 rounded-xl"
              onClick={() => router.push("/products")}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden xl:inline">Add Product</span>
            </Button>
            <Button
              size="sm"
              className="gap-2 h-9 rounded-xl shadow-sm"
              onClick={() => router.push("/pos")}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden xl:inline">New Sale</span>
            </Button>
          </div>
        )}

        {isMobile && (
          <Button
            variant="default"
            size="icon"
            className="h-9 w-9 rounded-xl"
            onClick={() => router.push("/pos")}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        )}

        <ThemeSwitcher />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-secondary/50">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                {mockNotifications.length}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 rounded-2xl shadow-2xl border border-border/50" align="end" sideOffset={8}>
            <NotificationPanel />
          </PopoverContent>
        </Popover>

        <UserMenu onLogout={handleLogout} />
      </div>
    </header>
  )
}