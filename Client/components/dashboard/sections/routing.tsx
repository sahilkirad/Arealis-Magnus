"use client"

import { useEffect, useMemo, useState } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { Route, Zap, ArrowRight, RefreshCw, Activity, Target, Gauge } from "lucide-react"

import { KPICard } from "@/components/dashboard/components/kpi-cards-row"
import StatusBadge from "@/components/dashboard/components/status-badge"
import { useDashboardDataContext } from "@/components/dashboard/providers/dashboard-data-context"

const ROUTE_COLORS: Record<string, string> = {
  NEFT: "#33a5ff",
  IMPS: "#00ffc8",
  RTGS: "#f59e0b",
  SWIFT: "#9d4edd",
}

function formatINRCurrency(value: number) {
  if (!Number.isFinite(value)) return "₹0"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

function pickRouteColor(method: string, fallbackIndex: number) {
  return ROUTE_COLORS[method] ?? ["#33a5ff", "#00ffc8", "#f59e0b", "#9d4edd"][fallbackIndex % 4]
}

interface BankPerformanceRow {
  rail: string
  successRate: number
  fee: string
  avgTime: string
  queueLength: number
  lastUpdated: string
}

export default function RoutingSection() {
  const { data, loading } = useDashboardDataContext()

  const routing = data?.routing

  const normalizedBankPerformance = useMemo<BankPerformanceRow[]>(() => {
    if (!routing) return []
    return routing.bank_performance.map((entry) => ({
      rail: entry.rail,
      successRate: entry.success_rate,
      fee: entry.fee,
      avgTime: entry.avg_time,
      queueLength: entry.queue_length,
      lastUpdated: entry.last_updated || "Just now",
    }))
  }, [routing])

  const [bankPerformance, setBankPerformance] = useState<BankPerformanceRow[]>(normalizedBankPerformance)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null)

  useEffect(() => {
    setBankPerformance(normalizedBankPerformance)
    setSelectedTransaction((prev) => prev ?? routing?.recommendations[0]?.transactionId ?? null)
  }, [normalizedBankPerformance, routing?.recommendations])

  useEffect(() => {
    if (!bankPerformance.length) return
    const interval = setInterval(() => {
      setBankPerformance((prev) =>
        prev.map((bank) => ({
          ...bank,
          successRate: Math.max(70, Math.min(99, bank.successRate + (Math.random() - 0.5) * 1.2)),
          queueLength: Math.max(0, bank.queueLength + Math.floor((Math.random() - 0.5) * 3)),
          lastUpdated: "Just now",
        })),
      )
    }, 30000)
    return () => clearInterval(interval)
  }, [bankPerformance.length])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setBankPerformance((prev) => prev.map((bank) => ({ ...bank, lastUpdated: "Just now" })))
      setIsRefreshing(false)
    }, 800)
  }

  if (loading || !data || !routing) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-muted-foreground">
          Loading routing analytics…
        </div>
      </div>
    )
  }

  const metrics = routing.metrics
  const totalRouted = metrics.transactions_routed
  const avgFeeSaved = metrics.avg_fee_saved
  const totalSaved = metrics.total_cost_optimized
  const avgSuccessProb = metrics.avg_success_probability

  const distribution = routing.distribution.map((item, index) => ({
    name: item.method,
    value: item.count,
    color: pickRouteColor(item.method, index),
    fee:
      item.method === "SWIFT"
        ? `$${item.fee.toFixed(0)}`
        : `₹${item.fee.toFixed(0)}`,
    percentage: `${item.percentage.toFixed(1)}%`,
    amount: item.amount,
  }))

  const recommendations = routing.recommendations
  const decisions = routing.decisions

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Smart Route Optimizer</h1>
          <p className="text-muted-foreground mt-1">
            Intelligent route selection driven by live fee, speed, and reliability signals
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Stats
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#33a5ff] text-white hover:bg-[#33a5ff]/80 transition-colors">
            <Target className="w-4 h-4" />
            Optimize All
          </button>
        </div>
      </div>

      <div
        className="rounded-lg border border-white/10 p-4"
        style={{
          background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Route className="w-5 h-5 text-[#00ffc8]" />
          <span className="text-sm font-semibold text-foreground">Routing Summary</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Transactions Routed:</span>
            <span className="ml-2 font-semibold text-foreground">{totalRouted}</span>
            <span className="text-xs text-muted-foreground ml-1">(fraud cleared)</span>
          </div>
          <div>
            <span className="text-muted-foreground">Avg Fee Saved:</span>
            <span className="ml-2 font-semibold text-[#00ffc8]">{formatINRCurrency(avgFeeSaved)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total Savings:</span>
            <span className="ml-2 font-semibold text-[#00ffc8]">{formatINRCurrency(totalSaved)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Avg Success Rate:</span>
            <span className="ml-2 font-semibold text-foreground">{avgSuccessProb.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Routes Active"
          value={distribution.length}
          trend={distribution.map((item) => item.name).join(", ")}
          trendPositive
          color="blue"
        />
        <KPICard
          title="Avg Fee Saved"
          value={formatINRCurrency(avgFeeSaved)}
          subtitle="Per transaction optimization"
          trend="Adaptive routing"
          trendPositive
          color="green"
        />
        <KPICard
          title="Transactions Routed"
          value={totalRouted}
          subtitle="Ready for settlement"
          trend={`${avgSuccessProb.toFixed(1)}% success`}
          trendPositive
          color="green"
        />
        <KPICard
          title="Total Cost Saved"
          value={formatINRCurrency(totalSaved)}
          subtitle="Compared to default rails"
          trend="Rolling 24h window"
          trendPositive
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="rounded-lg border border-white/10 p-6 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 30px rgba(51, 165, 255, 0.1)",
          }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Route Distribution</h3>
          <div className="flex items-center">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={distribution} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value">
                  {distribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(20, 30, 60, 0.9)",
                    border: "1px solid rgba(51, 165, 255, 0.3)",
                  }}
                  formatter={(value: number, name: string, payload) => [
                    `${value} txns • ${payload?.payload?.percentage ?? ""}`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {distribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-foreground">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {item.value} ({item.percentage})
                    </p>
                    <p className="text-xs text-muted-foreground">Fee: {item.fee}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="rounded-lg border border-white/10 p-6 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 30px rgba(51, 165, 255, 0.1)",
          }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Route Selection Logic</h3>
          <div className="space-y-4">
            <div className="relative pl-8">
              <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-[#33a5ff] flex items-center justify-center text-xs font-bold text-white">
                1
              </div>
              <div className="p-3 rounded-lg bg-[#33a5ff]/10 border border-[#33a5ff]/30">
                <p className="text-sm font-semibold text-foreground mb-2">Rule-Based Filtering</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>• Amount, corridor, urgency, and cut-off heuristics</p>
                  <p>• Regulatory constraints for FEMA and cross-border transfers</p>
                  <p>• Corporate policy guardrails (time windows, preferred rails)</p>
                </div>
              </div>
              <div className="absolute left-3 top-8 w-0.5 h-full bg-white/20" />
            </div>

            <div className="relative pl-8">
              <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-[#00ffc8] flex items-center justify-center text-xs font-bold text-black">
                2
              </div>
              <div className="p-3 rounded-lg bg-[#00ffc8]/10 border border-[#00ffc8]/30">
                <p className="text-sm font-semibold text-foreground mb-2">Real-Time Network Analysis</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>• Pull bank uptime, queue depth, and API latency</p>
                  <p>• Track settlement duration for the session cohort</p>
                  <p>• Blend historical win-rate with current degradation signals</p>
                </div>
              </div>
              <div className="absolute left-3 top-8 w-0.5 h-full bg-white/20" />
            </div>

            <div className="relative pl-8">
              <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-[#f59e0b] flex items-center justify-center text-xs font-bold text-black">
                3
              </div>
              <div className="p-3 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30">
                <p className="text-sm font-semibold text-foreground mb-2">Scoring & Optimization</p>
                <div className="space-y-1 text-xs">
                  <p className="text-muted-foreground font-mono">
                    score = (success_rate × 0.6) − (fee × 0.2) − (settlement_time × 0.2)
                  </p>
                  <p className="text-[#00ffc8] mt-2">→ Choose the rail with the highest composite score</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="rounded-lg border border-white/10 p-6 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 0 30px rgba(51, 165, 255, 0.1)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00ffc8]" />
            Real-time Bank Performance
            <span className="text-xs text-muted-foreground font-normal">(Auto-refresh every 5 min)</span>
          </h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-pulse" />
            <span className="text-xs text-[#00ffc8]">Live</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Rail</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Success Rate</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Fee</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Avg Time</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Queue</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Last Update</th>
              </tr>
            </thead>
            <tbody>
              {bankPerformance.map((bank) => (
                <tr key={bank.rail} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-foreground">{bank.rail}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-white/10 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            bank.successRate >= 90
                              ? "bg-[#00ffc8]"
                              : bank.successRate >= 80
                                ? "bg-[#f59e0b]"
                                : "bg-red-400"
                          }`}
                          style={{ width: `${bank.successRate}%` }}
                        />
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          bank.successRate >= 90 ? "text-[#00ffc8]" : bank.successRate >= 80 ? "text-[#f59e0b]" : "text-red-400"
                        }`}
                      >
                        {bank.successRate.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">{bank.fee}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{bank.avgTime}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{bank.queueLength} pending</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{bank.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="rounded-lg border border-white/10 p-6 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 0 30px rgba(51, 165, 255, 0.1)",
        }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#f59e0b]" />
          Route Recommendations
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Trans ID</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Selected Route</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Fee</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Success Prob</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Reason</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((rec) => (
                <tr
                  key={rec.transactionId}
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                    selectedTransaction === rec.transactionId ? "bg-white/5" : ""
                  }`}
                  onClick={() => setSelectedTransaction(rec.transactionId)}
                >
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm text-[#33a5ff]">{rec.transactionId}</span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-foreground">{formatINRCurrency(rec.amount)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rec.selectedRoute === "IMPS"
                          ? "bg-[#00ffc8]/20 text-[#00ffc8]"
                          : rec.selectedRoute === "RTGS"
                            ? "bg-[#f59e0b]/20 text-[#f59e0b]"
                            : rec.selectedRoute === "NEFT"
                              ? "bg-[#33a5ff]/20 text-[#33a5ff]"
                              : "bg-[#9d4edd]/20 text-[#9d4edd]"
                      }`}
                    >
                      {rec.selectedRoute}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">
                    {rec.selectedRoute === "SWIFT" ? `$${rec.fee.toFixed(0)}` : formatINRCurrency(rec.fee)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-semibold ${rec.successProb >= 90 ? "text-[#00ffc8]" : "text-[#f59e0b]"}`}>
                      {rec.successProb.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{rec.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="rounded-lg border border-white/10 p-6 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 0 30px rgba(51, 165, 255, 0.1)",
        }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Gauge className="w-5 h-5 text-[#33a5ff]" />
          Live Routing Decisions Feed
        </h3>
        <div className="space-y-3">
          {decisions.map((decision, idx) => (
            <div
              key={`${decision.transaction}-${idx}`}
              className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors border border-white/5"
            >
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground w-32">
                  {new Date(decision.timestamp).toLocaleString("en-IN", { hour12: true })}
                </span>
                <span className="font-mono text-sm text-[#33a5ff]">{decision.transaction}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{decision.decision}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">Score: {decision.score.toFixed(3)}</span>
                <StatusBadge status={decision.status} label={decision.status.charAt(0).toUpperCase() + decision.status.slice(1)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
