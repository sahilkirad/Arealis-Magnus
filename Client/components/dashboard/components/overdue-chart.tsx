"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { category: "Approvals", count: 12 },
  { category: "Recon", count: 8 },
  { category: "Fraud", count: 3 },
  { category: "Routing", count: 5 },
  { category: "Settlement", count: 6 },
]

export default function OverdueChart() {
  return (
    <div
      className="rounded-lg border border-white/10 p-6"
      style={{
        background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Overdue by Category</h2>
        <p className="text-sm text-muted-foreground mt-1">Tasks exceeding SLA by category</p>
      </div>

      <div className="h-64 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="category" tick={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: 12 }} />
            <YAxis tick={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(20, 30, 60, 0.95)",
                border: "1px solid rgba(0, 255, 200, 0.3)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "rgba(255, 255, 255, 0.8)" }}
            />
            <Bar dataKey="count" fill="var(--neon-cyan)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-5 gap-2 mt-6">
        {data.map((item) => (
          <div
            key={item.category}
            className="p-3 rounded-lg border border-white/10 text-center hover:border-white/20 transition-colors"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
          >
            <div className="text-xs text-muted-foreground">{item.category}</div>
            <div className="text-lg font-bold text-foreground mt-1">{item.count}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
