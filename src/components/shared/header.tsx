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
  Clock
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

export function Header({ title }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { setSidebarOpen } = useUIStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur-xl px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-8 w-8"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <div className="min-w-0">
          <h1 className="text-sm font-semibold tracking-tight truncate">{pageTitle}</h1>
          <p className="text-[11px] text-muted-foreground hidden sm:flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="hidden md:flex flex-1 items-center justify-center max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-full h-8 pl-9 pr-14 bg-muted/50 border-0 rounded-lg text-[13px] focus-visible:ring-1 focus-visible:ring-ring"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="hidden lg:flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 h-8 text-[13px]"
            onClick={() => router.push("/pos")}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">New Sale</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 h-8 text-[13px]"
            onClick={() => router.push("/products")}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Add Product</span>
          </Button>
        </div>

        <Button
          variant="default"
          size="icon"
          className="lg:hidden h-8 w-8"
          onClick={() => router.push("/pos")}
        >
          <ShoppingCart className="h-3.5 w-3.5" />
        </Button>

        <ThemeSwitcher />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="h-3.5 w-3.5" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                {mockNotifications.length}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 rounded-xl shadow-lg" align="end" sideOffset={8}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-sm font-semibold">Notifications</h3>
              <Badge variant="secondary" className="text-[10px]">{mockNotifications.length} new</Badge>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-3.5 hover:bg-muted/50 cursor-pointer border-b last:border-0 transition-colors"
                >
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", variantStyles[notification.variant])}>
                    <notification.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[13px]">{notification.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {notification.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2.5 border-t">
              <Button variant="ghost" className="w-full text-[13px] h-8">
                View all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 px-1.5 rounded-lg">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="gradient-primary text-white text-[11px] font-semibold">
                  SM
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52 rounded-xl shadow-lg" align="end" sideOffset={8}>
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-2.5 p-1.5">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="gradient-primary text-white text-xs font-semibold">
                    SM
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">Store Manager</p>
                  <p className="text-[11px] text-muted-foreground truncate">manager@store.com</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")} className="text-[13px]">
              <User className="mr-2 h-3.5 w-3.5" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")} className="text-[13px]">
              <Settings className="mr-2 h-3.5 w-3.5" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive text-[13px]" onClick={handleLogout}>
              <LogOut className="mr-2 h-3.5 w-3.5" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
