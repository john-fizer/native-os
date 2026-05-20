"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  delta?: number
  color?: string
  icon?: React.ReactNode
  className?: string
}

export default function MetricCard({ label, value, sub, delta, color, icon, className }: MetricCardProps) {
  const trend = delta == null ? null : delta > 0 ? "up" : delta < 0 ? "down" : "flat"

  return (
    <div
      className={cn("rounded-xl p-4 flex flex-col gap-3", className)}
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>
          {label}
        </p>
        {icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + "22" }}>
            <span style={{ color }}>{icon}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{value}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{sub}</p>}
      </div>
      {trend && (
        <div className="flex items-center gap-1">
          {trend === "up" && <TrendingUp size={12} style={{ color: "var(--accent-green)" }} />}
          {trend === "down" && <TrendingDown size={12} style={{ color: "var(--accent-red)" }} />}
          {trend === "flat" && <Minus size={12} style={{ color: "var(--muted)" }} />}
          <span
            className="text-xs font-medium"
            style={{
              color: trend === "up" ? "var(--accent-green)" : trend === "down" ? "var(--accent-red)" : "var(--muted)",
            }}
          >
            {delta != null && delta > 0 ? "+" : ""}{delta}% this week
          </span>
        </div>
      )}
    </div>
  )
}
