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
  Sparkles,
} from "lucide-react"

export function ThemeSwitcher() {
  const { theme, setTheme } = useUIStore()
  const [open, setOpen] = useState(false)

  const themes = [
    { 
      value: "light" as const, 
      label: "Light",
      icon: Sun,
      description: "Bright & Clear",
    },
    { 
      value: "dark" as const, 
      label: "Dark", 
      icon: Moon,
      description: "Easy on Eyes",
    },
    { 
      value: "system" as const, 
      label: "System",
      icon: Monitor,
      description: "Auto Theme",
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
            "relative h-9 w-9 rounded-xl p-0 group",
            "hover:bg-accent/80 hover:text-foreground",
            "transition-all duration-200 ease-out",
            "hover:scale-110 active:scale-95"
          )}
        >
          <div className={cn(
            "absolute inset-0 rounded-xl opacity-0",
            "bg-gradient-to-br from-primary/20 via-transparent to-transparent",
            "group-hover:opacity-100 transition-opacity duration-300"
          )} />
          <div className="relative">
            <CurrentIcon className={cn(
              "h-[18px] w-[18px] transition-all duration-300",
              theme === "light" && "text-amber-500 group-hover:text-amber-600 rotate-0",
              theme === "dark" && "text-indigo-400 group-hover:text-indigo-300",
              theme === "system" && "text-emerald-500 group-hover:text-emerald-400"
            )} />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border-border/60 bg-card p-2">
        <div className="flex items-center gap-2 mb-2 px-2 py-1.5">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Theme</span>
        </div>
        {themes.map((t) => {
          const Icon = t.icon
          const isSelected = theme === t.value
          return (
            <DropdownMenuItem
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                "flex items-center gap-3 rounded-lg p-2 mb-1 last:mb-0 cursor-pointer",
                "hover:bg-accent/80 hover:text-foreground transition-colors",
                isSelected && "bg-primary/10"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                "bg-gradient-to-br",
                t.value === "light" && "from-amber-400 via-orange-400 to-yellow-400",
                t.value === "dark" && "from-indigo-600 via-purple-600 to-violet-600",
                t.value === "system" && "from-emerald-500 via-teal-500 to-cyan-500"
              )}>
                <Icon className={cn(
                  "h-4 w-4",
                  isSelected ? "text-white" : "text-white/80"
                )} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{t.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                </div>
                <span className="text-[10px] text-muted-foreground">{t.description}</span>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
