"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
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
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  ShoppingCart,
  Package,
  TrendingUp,
  Plus,
  Menu,
  Calendar,
  DollarSign,
  Clock,
  PanelLeft
} from "lucide-react"

interface HeaderProps {
  title?: string
}

interface Notification {
  id: string
  title: string
  message: string
  time: string
  icon: any
  color: string
}

const mockNotifications: Notification[] = [
  { id: "1", title: "Low Stock Alert", message: "Royal Crown Gin 750ml is running low", time: "5 min ago", icon: Package, color: "text-amber-500 bg-amber-500/10" },
  { id: "2", title: "New Sale", message: "New sale of GHS 450.00 completed", time: "15 min ago", icon: TrendingUp, color: "text-green-500 bg-green-500/10" },
  { id: "3", title: "New Order", message: "Customer Kwame placed a new order", time: "1 hour ago", icon: ShoppingCart, color: "text-blue-500 bg-blue-500/10" },
]

export function Header({ title }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme, setSidebarOpen } = useUIStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const pageTitle = title || pathname.split("/").pop()?.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "Dashboard"

  const quickActions = [
    { name: "New Sale", icon: ShoppingCart, action: () => router.push("/pos"), color: "bg-primary" },
    { name: "Add Product", icon: Plus, action: () => router.push("/products"), color: "bg-emerald-500" },
  ]

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 lg:px-6">
      {/* Left Side */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div>
          <h1 className="text-lg lg:text-xl font-bold tracking-tight">{pageTitle}</h1>
          <p className="text-xs lg:text-sm text-muted-foreground hidden sm:flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Center - Search (hidden on mobile) */}
      <div className="hidden md:flex flex-1 items-center justify-center max-w-xl mx-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products, customers, sales..."
            className="w-full h-10 pl-11 pr-20 bg-muted/50 border-none rounded-xl focus:ring-2 focus:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Quick Actions - Desktop only */}
        <div className="hidden lg:flex items-center gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.name}
              variant="outline"
              size="sm"
              className="gap-2 h-9"
              onClick={action.action}
            >
              <action.icon className="h-4 w-4" />
              <span className="hidden xl:inline">{action.name}</span>
            </Button>
          ))}
        </div>

        {/* Mobile Quick Sale */}
        <Button
          variant="default"
          size="icon"
          className="lg:hidden h-9 w-9"
          onClick={() => router.push("/pos")}
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-destructive">
                {mockNotifications.length}
              </Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Notifications</h3>
              <Badge variant="secondary" className="text-xs">{mockNotifications.length} new</Badge>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-4 hover:bg-muted/50 cursor-pointer border-b last:border-0"
                >
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", notification.color)}>
                    <notification.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {notification.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t">
              <Button variant="ghost" className="w-full text-sm">
                View all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 px-2 rounded-lg hover:bg-muted/50">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white text-sm font-medium">
                  SM
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-2 p-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white">
                      SM
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Store Manager</p>
                    <p className="text-xs text-muted-foreground">manager@store.com</p>
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}