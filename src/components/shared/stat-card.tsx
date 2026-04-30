"use client"

import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  change?: number
  trend?: "up" | "down" | "neutral"
  icon: LucideIcon
  iconClassName?: string
  className?: string
}

export function StatCard({ title, value, change, trend = "neutral", icon: Icon, iconClassName, className }: StatCardProps) {
  const getTrendIcon = () => {
    if (trend === "up") return TrendingUp
    if (trend === "down") return TrendingDown
    return Minus
  }

  const getTrendColor = () => {
    if (trend === "up") return "text-success"
    if (trend === "down") return "text-destructive"
    return "text-muted-foreground"
  }

  const TrendIcon = getTrendIcon()

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 hover:shadow-card-hover transition-all duration-300 group",
      className
    )}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className={cn(
          "flex h-11 w-11 rounded-xl items-center justify-center transition-transform group-hover:scale-110",
          iconClassName || "bg-primary/10 text-primary"
        )}>
          <Icon className="h-5 w-5" />
        </div>
        
        {change !== undefined && change !== 0 && (
          <div className={cn("flex items-center gap-1 text-xs font-medium", getTrendColor())}>
            <TrendIcon className="h-4 w-4" />
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  )
}
