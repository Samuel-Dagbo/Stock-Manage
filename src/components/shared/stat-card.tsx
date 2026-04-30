import { cn } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  change?: number
  trend?: "up" | "down" | "neutral"
  icon: any
  iconClassName?: string
  className?: string
}

export function StatCard({ title, value, change, trend = "neutral", icon: Icon, iconClassName, className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 shadow-xs", className)}>
      <div className="flex items-center justify-between">
        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", iconClassName || "bg-primary-subtle")}>
          <Icon className={cn("h-4 w-4", iconClassName ? "" : "text-primary")} />
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-0.5 text-[11px] font-semibold",
            trend === "up" && "text-success",
            trend === "down" && "text-destructive",
            trend === "neutral" && "text-muted-foreground"
          )}>
            {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> :
             trend === "down" ? <ArrowDownRight className="h-3 w-3" /> :
             <Minus className="h-3 w-3" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-0.5 tracking-tight">{value}</p>
      </div>
    </div>
  )
}
