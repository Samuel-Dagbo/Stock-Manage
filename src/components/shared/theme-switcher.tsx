"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/lib/stores/ui-store"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sun,
  Moon,
  Monitor,
  Check,
  Sparkles
} from "lucide-react"

export function ThemeSwitcher() {
  const { theme, setTheme } = useUIStore()
  const [open, setOpen] = useState(false)

  const themes = [
    { 
      value: "light" as const, 
      label: "Light Mode",
      icon: Sun,
      description: "Bright & Clear",
      gradient: "from-amber-400 via-orange-400 to-yellow-400"
    },
    { 
      value: "dark" as const, 
      label: "Dark Mode", 
      icon: Moon,
      description: "Easy on Eyes",
      gradient: "from-indigo-600 via-purple-600 to-violet-600"
    },
    { 
      value: "system" as const, 
      label: "System",
      icon: Monitor,
      description: "Auto Theme",
      gradient: "from-emerald-500 via-teal-500 to-cyan-500"
    },
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[2]
  const CurrentIcon = currentTheme.icon

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "relative h-10 w-10 rounded-xl p-0 group",
            "hover:bg-foreground/5 dark:hover:bg-foreground/10",
            "transition-all duration-300 ease-out",
            "hover:scale-105 active:scale-95"
          )}
        >
          <div className={cn(
            "absolute inset-0 rounded-xl opacity-0",
            "bg-gradient-to-br from-primary/20 via-transparent to-transparent",
            "group-hover:opacity-100 transition-opacity duration-300"
          )} />
          <div className="relative">
            {theme === "light" && (
              <div className="relative animate-spin-slow">
                <Sun className={cn(
                  "h-[18px] w-[18px] transition-all duration-300",
                  "text-amber-500 group-hover:text-amber-600",
                  "group-hover:scale-110"
                )} />
              </div>
            )}
            {theme === "dark" && (
              <div className="relative">
                <Moon className={cn(
                  "h-[18px] w-[18px] transition-all duration-300",
                  "text-indigo-400 group-hover:text-indigo-300",
                  "group-hover:rotate-[-15deg] group-hover:scale-110"
                )} />
              </div>
            )}
            {theme === "system" && (
              <div className="relative animate-pulse-slow">
                <Monitor className={cn(
                  "h-[18px] w-[18px] transition-all duration-300",
                  "text-emerald-500 group-hover:text-emerald-400",
                  "group-hover:scale-110"
                )} />
              </div>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        sideOffset={12}
        className={cn(
          "w-72 p-2",
          "bg-background/95 dark:bg-background/95",
          "backdrop-blur-xl",
          "border border-border/50 dark:border-border/50",
          "shadow-xl shadow-black/10 dark:shadow-black/30",
          "rounded-2xl"
        )}
      >
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Choose Theme</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Customize your look</p>
        </div>

        <div className="space-y-1.5 mt-2">
          {themes.map((item) => {
            const Icon = item.icon
            const isActive = theme === item.value
            
            return (
              <DropdownMenuItem
                key={item.value}
                onClick={() => {
                  setTheme(item.value)
                  setOpen(false)
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer",
                  "transition-all duration-200 ease-out",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/20",
                  isActive 
                    ? "bg-primary/10 dark:bg-primary/15" 
                    : "hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "relative h-10 w-10 rounded-xl flex items-center justify-center",
                  "bg-gradient-to-br shadow-sm",
                  item.gradient,
                  isActive && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                )}>
                  <Icon className="h-[18px] w-[18px] text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-medium",
                      isActive && "text-primary"
                    )}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>

                {isActive && (
                  <div className={cn(
                    "h-6 w-6 rounded-full bg-primary flex items-center justify-center",
                    "animate-scale-in"
                  )}>
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                )}
              </DropdownMenuItem>
            )
          })}
        </div>

        <div className={cn(
          "mt-3 pt-3 border-t border-border/50",
          "text-xs text-center text-muted-foreground"
        )}>
          Theme will be saved automatically
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}