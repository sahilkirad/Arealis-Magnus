"use client"

import { useMemo, useState } from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  AlertTriangle,
  ShieldAlert,
  Eye,
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Activity,
  MapPin,
  CreditCard,
  TrendingUp,
  Clock,
  Smartphone,
} from "lucide-react"

import { KPICard } from "@/components/dashboard/components/kpi-cards-row"
import StatusBadge from "@/components/dashboard/components/status-badge"
import { useDashboardDataContext } from "@/components/dashboard/providers/dashboard-data-context"

const ANOMALY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "High Amount": TrendingUp,
  "Pattern Deviation": Clock,
  "Route Priority": CreditCard,
  "Cross Border": MapPin,
  Baseline: Activity,
}

function resolveAnomalyColor(severity: string) {
  if (severity === "high") return { bg: "bg-red-500/20", fg: "text-red-400" }
  if (severity === "medium") return { bg: "bg-[#f59e0b]/20", fg: "text-[#f59e0b]" }
  return { bg: "bg-[#00ffc8]/20", fg: "text-[#00ffc8]" }
}

function formatINRCurrency(value: number) {
  if (!Number.isFinite(value)) return "₹0"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

export default function FraudSection() {
  const { data, loading } = useDashboardDataContext()
  const fraud = data?.fraud

  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null)
  const [showMediumRisk, setShowMediumRisk] = useState(false)

  const toggleExpand = (id: string) => {
    setExpandedTransaction((prev) => (prev === id ? null : id))
  }

  const pieData = useMemo(() => fraud?.risk_distribution ?? [], [fraud?.risk_distribution])

  if (loading || !data || !fraud) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-muted-foreground">
          Loading fraud intelligence…
        </div>
      </div>
    )
  }

  const metrics = fraud.metrics
  const totalAnalyzed = metrics.transactions_analyzed
  const cleanCount = metrics.clean_transactions
  const flaggedCount = metrics.flagged_medium_risk
  const blockedCount = metrics.blocked_high_risk

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fraud Detection</h1>
          <p className="text-muted-foreground mt-1">Anomaly detection & risk assessment</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
            <Eye className="w-4 h-4" />
            Review Flagged
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
            <Ban className="w-4 h-4" />
            Block High Risk
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#00ffc8] text-black hover:bg-[#00ffc8]/80 transition-colors">
            <CheckCircle2 className="w-4 h-4" />
            Approve All Clean
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
          <ShieldAlert className="w-5 h-5 text-[#33a5ff]" />
          <span className="text-sm font-semibold text-foreground">Risk Analysis Summary</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Analyzed:</span>
            <span className="ml-2 font-semibold text-foreground">{totalAnalyzed}</span>
            <span className="text-xs text-muted-foreground ml-1">(post-compliance)</span>
          </div>
          <div>
            <span className="text-muted-foreground">Clean:</span>
            <span className="ml-2 font-semibold text-[#00ffc8]">
              {cleanCount} ({((cleanCount / totalAnalyzed) * 100 || 0).toFixed(1)}%)
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Flagged:</span>
            <span className="ml-2 font-semibold text-[#f59e0b]">
              {flaggedCount} ({((flaggedCount / totalAnalyzed) * 100 || 0).toFixed(1)}%)
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Blocked:</span>
            <span className="ml-2 font-semibold text-red-400">
              {blockedCount} ({((blockedCount / totalAnalyzed) * 100 || 0).toFixed(1)}%)
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Avg Risk:</span>
            <span className="ml-2 font-semibold text-foreground">{metrics.avg_risk_score.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="High Risk" value={blockedCount} trend="Escalate immediately" trendPositive={false} color="red" />
        <KPICard title="Medium Risk" value={flaggedCount} trend="Manual review" trendPositive={false} color="amber" />
        <KPICard title="Low Risk" value={cleanCount} trend="Auto-approved" trendPositive color="green" />
        <KPICard
          title="Avg Risk Score"
          value={metrics.avg_risk_score.toFixed(2)}
          trend="Weighted rolling avg"
          trendPositive={false}
          color="blue"
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
          <h3 className="text-lg font-semibold text-foreground mb-4">Risk Score Distribution</h3>
          <div className="flex items-center">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="count">
                  {pieData.map((slice, index) => (
                    <Cell key={slice.bucket} fill={slice.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(20, 30, 60, 0.9)",
                    border: "1px solid rgba(51, 165, 255, 0.3)",
                  }}
                  formatter={(value: number, name: string, payload) => [
                    `${value} txns • ${payload?.payload?.percentage.toFixed(1)}%`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {pieData.map((slice) => (
                <div key={slice.bucket} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }} />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{slice.bucket}</p>
                    <p className="text-sm font-semibold text-foreground">
                      {slice.count} txns ({slice.percentage.toFixed(1)}%)
                    </p>
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
          <h3 className="text-lg font-semibold text-foreground mb-4">Anomalies Detected</h3>
          <div className="space-y-3">
            {fraud.anomalies.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
                No anomalies detected for this session.
              </div>
            ) : (
              fraud.anomalies.map((anomaly) => {
                const colors = resolveAnomalyColor(anomaly.severity)
                const Icon = ANOMALY_ICONS[anomaly.type] ?? Activity
                return (
                  <div
                    key={anomaly.type}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.bg}`}>
                      <Icon className={`w-4 h-4 ${colors.fg}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{anomaly.type}</p>
                        <span className={`text-sm font-semibold ${colors.fg}`}>{anomaly.count}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{anomaly.description}</p>
                    </div>
                  </div>
                )
              })
            )}
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
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          High Risk Transactions
        </h3>
        <div className="space-y-3">
          {fraud.high_risk.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
              No high risk transactions detected.
            </div>
          ) : (
            fraud.high_risk.map((transaction) => (
              <div key={transaction.id} className="border border-white/10 rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => toggleExpand(transaction.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-[#33a5ff]">{transaction.id}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{transaction.vendor}</p>
                      <p className="text-xs text-muted-foreground">{transaction.vendorId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-foreground">{formatINRCurrency(transaction.amount)}</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-white/10">{transaction.anomalyType}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-red-400">{(transaction.riskScore * 100).toFixed(0)}%</span>
                      <StatusBadge
                        status={transaction.status}
                        label={transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      />
                    </div>
                    {expandedTransaction === transaction.id ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {expandedTransaction === transaction.id && (
                  <div className="p-4 bg-white/5 border-top border-white/10 space-y-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Reason: </span>
                      <span className="text-foreground">{transaction.reason}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {transaction.details?.deviation && (
                        <div className="p-3 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20">
                          <p className="text-xs text-muted-foreground mb-1">Deviation</p>
                          <p className="text-foreground">{transaction.details.deviation}</p>
                        </div>
                      )}
                      {transaction.details?.pattern && (
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-xs text-muted-foreground mb-1">Pattern</p>
                          <p className="text-foreground">{transaction.details.pattern}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-[#00ffc8]/10 text-[#00ffc8] border border-[#00ffc8]/30 hover:bg-[#00ffc8]/20 transition-colors">
                        Approve
                      </button>
                      <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors">
                        Block
                      </button>
                      <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-white/5 text-foreground border border-white/10 hover:bg-white/10 transition-colors">
                        Investigate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
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
        <button className="w-full flex items-center justify-between" onClick={() => setShowMediumRisk((prev) => !prev)}>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
            Medium Risk Details
            <span className="text-sm font-normal text-muted-foreground">({fraud.medium_risk.length} transactions)</span>
          </h3>
          {showMediumRisk ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </button>

        {showMediumRisk && (
          <div className="mt-4 space-y-2">
            {fraud.medium_risk.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-[#33a5ff]">{transaction.id}</span>
                  <span className="text-sm text-foreground">{transaction.vendor}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-[#f59e0b]/10 text-[#f59e0b]">{transaction.anomalyType}</span>
                  <span className="text-sm font-semibold text-[#f59e0b]">{(transaction.riskScore * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
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
          <Activity className="w-5 h-5 text-[#33a5ff]" />
          Live Anomaly Events Feed
        </h3>
        <div className="space-y-3">
          {fraud.events.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
              No anomaly events logged during this period.
            </div>
          ) : (
            fraud.events.map((event, idx) => (
              <div
                key={`${event.vendor}-${idx}`}
                className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors border border-white/5"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{event.event}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {event.vendor} ({event.vendorId})
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={event.severity} label={event.severity.charAt(0).toUpperCase() + event.severity.slice(1)} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(event.timestamp).toLocaleString("en-IN", { hour12: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
