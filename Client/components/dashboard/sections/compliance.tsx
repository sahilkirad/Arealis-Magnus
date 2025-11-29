"use client"

import { useMemo, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import {
  CheckCircle2,
  XCircle,
  FileSearch,
  Upload,
  UserCheck,
  Download,
  RefreshCw,
  Filter,
  Shield,
  FileText,
  AlertTriangle,
} from "lucide-react"

import { KPICard } from "@/components/dashboard/components/kpi-cards-row"
import StatusBadge from "@/components/dashboard/components/status-badge"
import { useDashboardDataContext } from "@/components/dashboard/providers/dashboard-data-context"

function formatINRCurrency(value: number) {
  if (!Number.isFinite(value)) return "₹0"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds)) return "—"
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remaining = Math.round(seconds % 60)
  return `${minutes}m ${remaining}s`
}

const ACTION_PRESETS: Record<string, { icon: JSX.Element; label: string; color: string }> = {
  GST: {
    icon: <Upload className="w-3 h-3" />,
    label: "Upload Doc",
    color: "text-[#f59e0b] border-[#f59e0b]/30 hover:bg-[#f59e0b]/10",
  },
  PAN: {
    icon: <UserCheck className="w-3 h-3" />,
    label: "Verify",
    color: "text-[#00ffc8] border-[#00ffc8]/30 hover:bg-[#00ffc8]/10",
  },
  FEMA: {
    icon: <FileSearch className="w-3 h-3" />,
    label: "Review",
    color: "text-[#33a5ff] border-[#33a5ff]/30 hover:bg-[#33a5ff]/10",
  },
  KYC: {
    icon: <UserCheck className="w-3 h-3" />,
    label: "Verify",
    color: "text-[#00ffc8] border-[#00ffc8]/30 hover:bg-[#00ffc8]/10",
  },
}

function resolveAction(rule: string) {
  return ACTION_PRESETS[rule] ?? ACTION_PRESETS.FEMA
}

export default function ComplianceSection() {
  const { data, loading } = useDashboardDataContext()

  const compliance = data?.compliance

  const [filterStatus, setFilterStatus] = useState<"all" | "blocked" | "pending">("all")
  const [filterRule, setFilterRule] = useState<string>("all")

  const trend = compliance?.trend ?? []
  const blockedTransactions = compliance?.blocked_transactions ?? []

  const filteredTransactions = useMemo(() => {
    return blockedTransactions.filter((transaction) => {
      if (filterStatus !== "all" && transaction.status !== filterStatus) return false
      if (filterRule !== "all" && transaction.ruleViolated !== filterRule) return false
      return true
    })
  }, [blockedTransactions, filterRule, filterStatus])

  if (loading || !data || !compliance) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-muted-foreground">
          Loading compliance insights…
        </div>
      </div>
    )
  }

  const metrics = compliance.metrics
  const approvalRate = metrics.approval_rate
  const declineRate = 100 - approvalRate

  const uniqueRules = useMemo(() => {
    const set = new Set<string>()
    compliance.rules.forEach((rule) => set.add(rule.rule))
    return Array.from(set)
  }, [compliance.rules])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compliance Clearance</h1>
          <p className="text-muted-foreground mt-1">Regulatory requirements & policy adherence</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
            <Download className="w-4 h-4" />
            Download Blocked List
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#33a5ff] text-white hover:bg-[#33a5ff]/80 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Re-check All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Checked" value={metrics.total_checked.toLocaleString()} trend="24h feed" trendPositive color="blue" />
        <KPICard
          title="Approved"
          value={`${metrics.approved.toLocaleString()} (${approvalRate.toFixed(1)}%)`}
          trend="Stable"
          trendPositive
          color="green"
        />
        <KPICard
          title="Blocked"
          value={`${metrics.blocked.toLocaleString()} (${declineRate.toFixed(1)}%)`}
          trend="Investigate"
          trendPositive={false}
          color="red"
        />
        <KPICard
          title="Avg Processing Time"
          value={formatDuration(metrics.processing_time_seconds)}
          trend="Target &lt; 3s"
          trendPositive
          color="green"
        />
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
            <Shield className="w-5 h-5 text-[#33a5ff]" />
            Compliance Rules Applied
          </h3>
          <span className="text-xs text-muted-foreground">{compliance.rules.length} rules active</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {compliance.rules.map((rule) => {
            const successRatio = rule.checked ? (rule.checked - rule.failed) / rule.checked : 0
            return (
              <div
                key={rule.rule}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-[#00ffc8]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">{rule.rule}</span>
                  {rule.failed === 0 ? (
                    <CheckCircle2 className="w-5 h-5 text-[#00ffc8]" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Checked</span>
                    <span className="text-foreground">{rule.checked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Passed</span>
                    <span className="text-[#00ffc8]">{rule.checked - rule.failed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Failed</span>
                    <span className={rule.failed > 0 ? "text-red-400" : "text-foreground"}>{rule.failed}</span>
                  </div>
                </div>
                <div className="mt-3 w-full bg-white/10 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#33a5ff]"
                    style={{ width: `${successRatio * 100}%` }}
                  />
                </div>
              </div>
            )
          })}
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
        <h3 className="text-lg font-semibold text-foreground mb-4">Rule Failures Trend (7 Days)</h3>
        {trend.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-6 text-sm text-muted-foreground">
            No rule breaches detected for this session yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" />
              <YAxis stroke="rgba(255, 255, 255, 0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20, 30, 60, 0.9)",
                  border: "1px solid rgba(51, 165, 255, 0.3)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="gst" fill="#33a5ff" name="GST" />
              <Bar dataKey="tds" fill="#10b981" name="TDS" />
              <Bar dataKey="fema" fill="#f59e0b" name="FEMA" />
              <Bar dataKey="kyc" fill="#ff5555" name="KYC" />
            </BarChart>
          </ResponsiveContainer>
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
            Blocked Transactions
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value as typeof filterStatus)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-[#33a5ff]"
              >
                <option value="all">All Status</option>
                <option value="blocked">Blocked</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={filterRule}
                onChange={(event) => setFilterRule(event.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-[#33a5ff]"
              >
                <option value="all">All Rules</option>
                {uniqueRules.map((rule) => (
                  <option key={rule} value={rule}>
                    {rule}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Trans ID</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Vendor</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Reason</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Rule</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => {
                const actionPreset = resolveAction(transaction.ruleViolated)
                return (
                  <tr key={transaction.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-sm font-mono text-[#33a5ff]">{transaction.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{transaction.vendorName}</p>
                        <p className="text-xs text-muted-foreground">{transaction.vendorId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-foreground">{formatINRCurrency(transaction.amount)}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground max-w-[220px] truncate">{transaction.reason}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-white/10 text-foreground">
                        {transaction.ruleViolated}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge
                        status={transaction.status}
                        label={transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <button
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${actionPreset.color}`}
                      >
                        {actionPreset.icon}
                        {actionPreset.label}
                      </button>
                    </td>
                  </tr>
                )
              })}
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
          <FileText className="w-5 h-5 text-[#00ffc8]" />
          Recent Actions
        </h3>
        <div className="space-y-3">
          {compliance.recent_actions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
              No reviewer actions recorded for this session.
            </div>
          ) : (
            compliance.recent_actions.map((action, index) => (
              <div
                key={`${action.vendor}-${index}`}
                className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{action.action}</p>
                  <p className="text-xs text-muted-foreground mt-1">{action.vendor}</p>
                </div>
                <div className="text-right">
                  <StatusBadge
                    status={action.status}
                    label={action.status.charAt(0).toUpperCase() + action.status.slice(1)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(action.timestamp).toLocaleString("en-IN", { hour12: true })}
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
