"use client"

import type React from "react"
import { MoreVertical, TrendingUp, TrendingDown } from "lucide-react"

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: string
  trendPositive?: boolean
  icon?: React.ReactNode
  color?: "blue" | "green" | "amber" | "red"
}

const colorMap = {
  blue: "#33a5ff",
  green: "#10b981",
  amber: "#f59e0b",
  red: "#ff5555",
}

export function KPICard({ title, value, subtitle, trend, trendPositive = true, icon, color = "blue" }: KPICardProps) {
  return (
    <div
      className="group rounded-lg border border-white/10 p-6 overflow-hidden transition-all duration-300 hover:shadow-lg relative"
      style={{
        background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 0 30px rgba(51, 165, 255, 0.1)",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{value}</h3>
          </div>
          <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground opacity-0 group-hover:opacity-100">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {subtitle && <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>}

        {trend && (
          <div className="flex items-center gap-1">
            {trendPositive ? (
              <TrendingUp className="w-3.5 h-3.5" style={{ color: colorMap[color] }} />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" style={{ color: colorMap.red }} />
            )}
            <span className="text-xs font-semibold" style={{ color: trendPositive ? colorMap[color] : colorMap.red }}>
              {trend}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
