"use client"
import { useState } from "react"
import { KPICard } from "@/components/dashboard/components/kpi-cards-row"
import StatusBadge from "@/components/dashboard/components/status-badge"
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText,
  Building2,
  Users,
  ArrowRight,
  Search,
  Download,
  RefreshCw,
  Gauge
} from "lucide-react"

interface ThreeWayMatch {
  transactionId: string
  amount: string
  date: string
  internal: {
    amount: string
    date: string
    reference: string
    status: "matched" | "mismatched" | "missing"
  }
  bank: {
    amount: string
    date: string
    utr: string
    status: "matched" | "mismatched" | "missing"
  }
  vendor: {
    amount: string
    date: string
    reference: string
    status: "matched" | "mismatched" | "missing"
  }
  overallStatus: "full" | "partial" | "unreconciled"
  confidenceScore: number
  reconTime: string
}

const sampleMatches: ThreeWayMatch[] = [
  {
    transactionId: "TRF_001",
    amount: "₹50,000",
    date: "2025-03-15",
    internal: { amount: "₹50,000", date: "2025-03-15", reference: "INV_001", status: "matched" },
    bank: { amount: "₹50,000", date: "2025-03-15", utr: "123456789012", status: "matched" },
    vendor: { amount: "₹50,000", date: "2025-03-15", reference: "VEN_REF_123", status: "matched" },
    overallStatus: "full",
    confidenceScore: 100,
    reconTime: "17 min"
  },
  {
    transactionId: "TRF_045",
    amount: "₹75,000",
    date: "2025-03-15",
    internal: { amount: "₹75,000", date: "2025-03-15", reference: "INV_045", status: "matched" },
    bank: { amount: "₹75,500", date: "2025-03-15", utr: "234567890123", status: "mismatched" },
    vendor: { amount: "₹75,000", date: "2025-03-15", reference: "VEN_REF_456", status: "matched" },
    overallStatus: "partial",
    confidenceScore: 67,
    reconTime: "Pending"
  },
  {
    transactionId: "TRF_089",
    amount: "₹30,000",
    date: "2025-03-14",
    internal: { amount: "₹30,000", date: "2025-03-15", reference: "INV_089", status: "mismatched" },
    bank: { amount: "₹30,000", date: "2025-03-14", utr: "345678901234", status: "matched" },
    vendor: { amount: "₹30,000", date: "2025-03-14", reference: "VEN_REF_789", status: "matched" },
    overallStatus: "partial",
    confidenceScore: 85,
    reconTime: "Pending"
  },
]

const matchVisualization = [
  { category: "Full Match", value: 938, percentage: 98.6, color: "#00ffc8" },
  { category: "Partial Match", value: 11, percentage: 1.2, color: "#f59e0b" },
  { category: "Unreconciled", value: 2, percentage: 0.2, color: "#ff5555" },
]

const mismatchReasons = [
  { reason: "Timing difference", count: 156, percentage: 54.4, icon: "⏰" },
  { reason: "Amount variance", count: 68, percentage: 23.7, icon: "💰" },
  { reason: "Reference mismatch", count: 42, percentage: 14.6, icon: "🔗" },
  { reason: "Duplicate detection", count: 20, percentage: 7.0, icon: "📋" },
  { reason: "Metadata error", count: 14, percentage: 4.9, icon: "⚠️" },
]

const unreconciledTransactions = [
  { id: "UNREC-001", internalRef: "INT-8741", externalRef: "EXT-5621", amount: "₹45,250", discrepancy: "Amount mismatch by ₹1,000", daysOld: 3 },
  { id: "UNREC-002", internalRef: "INT-8740", externalRef: "EXT-5620", amount: "₹1,20,000", discrepancy: "Date variance (1 day)", daysOld: 2 },
]

const reconActivity = [
  { time: "2 min ago", activity: "Auto-reconciliation completed", count: "1,250 items", status: "success" },
  { time: "15 min ago", activity: "Rule-based matching executed", count: "856 items", status: "success" },
  { time: "32 min ago", activity: "Exception flagged", count: "23 items", status: "warning" },
  { time: "1h 15 min ago", activity: "Manual recon session started", count: "142 items", status: "success" },
]

export default function ReconciliationSection() {
  const [selectedMatch, setSelectedMatch] = useState<ThreeWayMatch>(sampleMatches[0])

  const MatchStatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "matched":
        return <CheckCircle2 className="w-5 h-5 text-[#00ffc8]" />
      case "mismatched":
        return <AlertCircle className="w-5 h-5 text-[#f59e0b]" />
      case "missing":
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reconciliation Engine</h1>
          <p className="text-muted-foreground mt-1">Three-way matching & discrepancy resolution</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
            <Search className="w-4 h-4" />
            Investigate
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#00ffc8] text-black hover:bg-[#00ffc8]/80 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Run Reconciliation
          </button>
        </div>
      </div>

      {/* Reconciliation Summary */}
      <div
        className="rounded-lg border border-white/10 p-4"
        style={{
          background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total Settled:</span>
            <span className="ml-2 font-semibold text-foreground">951</span>
          </div>
          <div>
            <span className="text-muted-foreground">Fully Reconciled:</span>
            <span className="ml-2 font-semibold text-[#00ffc8]">938 (98.6%)</span>
          </div>
          <div>
            <span className="text-muted-foreground">Partial:</span>
            <span className="ml-2 font-semibold text-[#f59e0b]">11 (1.2%)</span>
          </div>
          <div>
            <span className="text-muted-foreground">Unreconciled:</span>
            <span className="ml-2 font-semibold text-red-400">2 (0.2%)</span>
          </div>
          <div>
            <span className="text-muted-foreground">Avg Match Time:</span>
            <span className="ml-2 font-semibold text-foreground">4.2 min</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Full Match" value="938" trend="+4.2%" trendPositive color="green" />
        <KPICard title="Partial Match" value="11" trend="+1.5%" trendPositive={false} color="amber" />
        <KPICard title="Unreconciled" value="2" trend="-3.8%" trendPositive color="green" />
        <KPICard title="Confidence Score" value="98.5%" trend="+0.5%" trendPositive color="green" />
      </div>

      {/* Three-Way Match Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Selector */}
        <div
          className="rounded-lg border border-white/10 p-6"
          style={{
            background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
            backdropFilter: "blur(10px)",
          }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Select Transaction</h3>
          <div className="space-y-2">
            {sampleMatches.map((match) => (
              <button
                key={match.transactionId}
                onClick={() => setSelectedMatch(match)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  selectedMatch.transactionId === match.transactionId
                    ? "bg-[#33a5ff]/20 border border-[#33a5ff]/50"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-sm text-[#33a5ff]">{match.transactionId}</span>
                  <StatusBadge
                    status={match.overallStatus === "full" ? "success" : match.overallStatus === "partial" ? "warning" : "failed"}
                    label={match.overallStatus.toUpperCase()}
                  />
                </div>
                <p className="text-sm font-medium text-foreground">{match.amount}</p>
                <p className="text-xs text-muted-foreground">Confidence: {match.confidenceScore}%</p>
              </button>
            ))}
          </div>
        </div>

        {/* Three-Way Match Visualization */}
        <div
          className="lg:col-span-2 rounded-lg border border-white/10 p-6"
          style={{
            background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 30px rgba(51, 165, 255, 0.1)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Three-Way Match Visualization</h3>
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-[#00ffc8]" />
              <span className="text-sm font-semibold text-[#00ffc8]">{selectedMatch.confidenceScore}% Confidence</span>
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">Transaction: <span className="text-[#33a5ff] font-mono">{selectedMatch.transactionId}</span></p>
            <p className="text-lg font-bold text-foreground">{selectedMatch.amount}</p>
          </div>

          {/* Three Sources */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Internal Ledger */}
            <div className={`p-4 rounded-lg border ${
              selectedMatch.internal.status === "matched" 
                ? "bg-[#00ffc8]/10 border-[#00ffc8]/30" 
                : "bg-[#f59e0b]/10 border-[#f59e0b]/30"
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-[#33a5ff]" />
                <span className="text-sm font-semibold text-foreground">1️⃣ Internal Ledger</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="text-foreground">{selectedMatch.internal.amount} <MatchStatusIcon status={selectedMatch.internal.status} /></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="text-foreground">{selectedMatch.internal.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference:</span>
                  <span className="text-foreground">{selectedMatch.internal.reference}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <span className={`text-xs font-semibold ${
                  selectedMatch.internal.status === "matched" ? "text-[#00ffc8]" : "text-[#f59e0b]"
                }`}>
                  Status: {selectedMatch.internal.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Bank Statement */}
            <div className={`p-4 rounded-lg border ${
              selectedMatch.bank.status === "matched" 
                ? "bg-[#00ffc8]/10 border-[#00ffc8]/30" 
                : "bg-[#f59e0b]/10 border-[#f59e0b]/30"
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-[#00ffc8]" />
                <span className="text-sm font-semibold text-foreground">2️⃣ Bank Statement</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Debit Amount:</span>
                  <span className="text-foreground">{selectedMatch.bank.amount} <MatchStatusIcon status={selectedMatch.bank.status} /></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="text-foreground">{selectedMatch.bank.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UTR:</span>
                  <span className="text-foreground font-mono text-xs">{selectedMatch.bank.utr}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <span className={`text-xs font-semibold ${
                  selectedMatch.bank.status === "matched" ? "text-[#00ffc8]" : "text-[#f59e0b]"
                }`}>
                  Status: {selectedMatch.bank.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Vendor Confirmation */}
            <div className={`p-4 rounded-lg border ${
              selectedMatch.vendor.status === "matched" 
                ? "bg-[#00ffc8]/10 border-[#00ffc8]/30" 
                : "bg-[#f59e0b]/10 border-[#f59e0b]/30"
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-[#f59e0b]" />
                <span className="text-sm font-semibold text-foreground">3️⃣ Vendor Portal</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credit Amount:</span>
                  <span className="text-foreground">{selectedMatch.vendor.amount} <MatchStatusIcon status={selectedMatch.vendor.status} /></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="text-foreground">{selectedMatch.vendor.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendor Ref:</span>
                  <span className="text-foreground">{selectedMatch.vendor.reference}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <span className={`text-xs font-semibold ${
                  selectedMatch.vendor.status === "matched" ? "text-[#00ffc8]" : "text-[#f59e0b]"
                }`}>
                  Status: {selectedMatch.vendor.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Match Flow Diagram */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-muted-foreground mb-3">Reconciliation Process Flow:</p>
            <div className="flex items-center justify-center gap-2 text-sm flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#33a5ff]/20 text-[#33a5ff]">Internal Ledger</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className={`px-3 py-1 rounded-full ${
                selectedMatch.internal.status === "matched" ? "bg-[#00ffc8]/20 text-[#00ffc8]" : "bg-[#f59e0b]/20 text-[#f59e0b]"
              }`}>Amount Match {selectedMatch.internal.status === "matched" ? "✓" : "!"}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className={`px-3 py-1 rounded-full ${
                selectedMatch.bank.status === "matched" ? "bg-[#00ffc8]/20 text-[#00ffc8]" : "bg-[#f59e0b]/20 text-[#f59e0b]"
              }`}>Date Match {selectedMatch.bank.status === "matched" ? "✓" : "!"}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className={`px-3 py-1 rounded-full ${
                selectedMatch.overallStatus === "full" ? "bg-[#00ffc8]/20 text-[#00ffc8]" : "bg-[#f59e0b]/20 text-[#f59e0b]"
              }`}>Overall: {selectedMatch.overallStatus.toUpperCase()}</span>
            </div>
          </div>

          {/* Recon Time */}
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Reconciliation Time: <span className="text-foreground font-semibold">{selectedMatch.reconTime}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Match Status & Mismatch Reasons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3-Way Match Status */}
        <div
          className="rounded-lg border border-white/10 p-6"
          style={{
            background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
            backdropFilter: "blur(10px)",
          }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">3-Way Match Status</h3>
          <div className="space-y-4">
            {matchVisualization.map((item) => (
              <div key={item.category}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">{item.category}</span>
                  <span className="text-sm font-semibold" style={{ color: item.color }}>
                    {item.value} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mismatch Reasons */}
        <div
          className="rounded-lg border border-white/10 p-6"
          style={{
            background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
            backdropFilter: "blur(10px)",
          }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Mismatch Reasons</h3>
          <div className="space-y-3">
            {mismatchReasons.map((item) => (
              <div key={item.reason} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="text-sm text-muted-foreground">{item.reason}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">{item.count}</span>
                  <div className="w-20 bg-white/10 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-[#33a5ff]" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Unreconciled Transactions */}
      <div
        className="rounded-lg border border-white/10 p-6"
        style={{
          background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          Unreconciled Transactions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Reference</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Internal Ref</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">External Ref</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Discrepancy</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Days Old</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {unreconciledTransactions.map((txn) => (
                <tr key={txn.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 font-mono text-sm text-[#33a5ff]">{txn.id}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{txn.internalRef}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{txn.externalRef}</td>
                  <td className="py-3 px-4 text-sm font-medium text-foreground">{txn.amount}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{txn.discrepancy}</td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-semibold ${txn.daysOld > 3 ? "text-red-400" : "text-[#f59e0b]"}`}>
                      {txn.daysOld}d
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="px-3 py-1 text-xs font-medium rounded-md bg-[#33a5ff]/10 text-[#33a5ff] border border-[#33a5ff]/30 hover:bg-[#33a5ff]/20">
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div
        className="rounded-lg border border-white/10 p-6"
        style={{
          background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Reconciliation Activity</h3>
        <div className="space-y-3">
          {reconActivity.map((activity, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors border border-white/5"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{activity.activity}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.count}</p>
              </div>
              <div className="text-right">
                <StatusBadge
                  status={activity.status}
                  label={activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                />
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
