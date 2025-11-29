"use client"

import type React from "react"
import { MoreVertical, TrendingUp, TrendingDown } from "lucide-react"
import { LineChart, Line, ResponsiveContainer } from "recharts"

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: string
  trendPositive?: boolean
  icon?: React.ReactNode
  chart?: string
  series?: number[]
  color?: string
}

const chartData = {
  volume: [
    { value: 2400 },
    { value: 3200 },
    { value: 2800 },
    { value: 3800 },
    { value: 3500 },
    { value: 4200 },
    { value: 4800 },
  ],
  rate: [
    { value: 98.2 },
    { value: 98.5 },
    { value: 98.4 },
    { value: 98.6 },
    { value: 98.7 },
    { value: 98.8 },
    { value: 98.7 },
  ],
  time: [
    { value: 2.8 },
    { value: 2.6 },
    { value: 2.5 },
    { value: 2.4 },
    { value: 2.3 },
    { value: 2.4 },
    { value: 2.4 },
  ],
  pending: [{ value: 32 }, { value: 28 }, { value: 26 }, { value: 25 }, { value: 24 }, { value: 24 }, { value: 24 }],
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendPositive = true,
  icon,
  chart,
  series,
  color = "var(--neon-cyan)",
}: MetricCardProps) {
  const resolvedSeries =
    series?.map((point) => ({ value: point })) ?? (chart ? chartData[chart as keyof typeof chartData] : null)

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
          {icon ? (
            <div className="p-2 rounded-lg bg-white/10 text-muted-foreground">{icon}</div>
          ) : (
            <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground opacity-0 group-hover:opacity-100">
              <MoreVertical className="w-4 h-4" />
            </button>
          )}
        </div>

        {subtitle && (
          <div className="mb-2">
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        )}

        {trend && (
          <div className="flex items-center gap-1 mb-2">
            {trendPositive ? (
              <TrendingUp className="w-3.5 h-3.5" style={{ color: "var(--neon-green)" }} />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-destructive" />
            )}
            <span className="text-xs font-semibold" style={{ color: trendPositive ? "var(--neon-green)" : "#ff5555" }}>
              {trend}
            </span>
          </div>
        )}

        {resolvedSeries && (
          <div className="h-12 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resolvedSeries}>
                <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
