"use client"
import { useState } from "react"
import { KPICard } from "@/components/dashboard/components/kpi-cards-row"
import StatusBadge from "@/components/dashboard/components/status-badge"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Mail, 
  MessageSquare,
  Smartphone,
  ArrowRight,
  RefreshCw,
  Eye,
  XCircle
} from "lucide-react"

const settlementTimeline = [
  { time: "00:00", settled: 0, inTransit: 500, pending: 2847, failed: 0 },
  { time: "04:00", settled: 450, inTransit: 350, pending: 1900, failed: 12 },
  { time: "08:00", settled: 1250, inTransit: 200, pending: 1100, failed: 18 },
  { time: "12:00", settled: 2100, inTransit: 450, pending: 210, failed: 25 },
  { time: "16:00", settled: 2650, inTransit: 140, pending: 45, failed: 28 },
  { time: "20:00", settled: 2810, inTransit: 0, pending: 0, failed: 37 },
]

interface TransactionTimeline {
  id: string
  amount: string
  vendor: string
  vendorId: string
  route: string
  status: "settled" | "in_transit" | "pending" | "failed"
  totalTime?: string
  steps: {
    status: "completed" | "active" | "pending" | "failed"
    title: string
    description: string
    timestamp?: string
    detail?: string
  }[]
  notifications: {
    type: "sms" | "email"
    recipient: string
    message: string
    sentAt: string
  }[]
}

const sampleTransactions: TransactionTimeline[] = [
  {
    id: "TRF_001",
    amount: "₹50,000",
    vendor: "Vendor ABC Ltd",
    vendorId: "V-1847",
    route: "IMPS",
    status: "settled",
    totalTime: "15 min 15 sec",
    steps: [
      { status: "completed", title: "Initiated", description: "Payment initiated by Finance Manager", timestamp: "10:30:00 AM", detail: "Route: IMPS | Expected: 15 mins" },
      { status: "completed", title: "Bank Processing", description: "HDFC processing debit", timestamp: "10:30:45 AM", detail: "Processing time: 45 secs" },
      { status: "completed", title: "In Transit", description: "Clearing network: NPCI", timestamp: "10:40:30 AM", detail: "UTR: 123456789012" },
      { status: "completed", title: "Settled", description: "Credit received at ICICI", timestamp: "10:45:15 AM", detail: "Vendor account: ****3210" },
    ],
    notifications: [
      { type: "sms", recipient: "Finance Manager", message: "Payment of ₹50,000 settled to Vendor ABC", sentAt: "10:45:16 AM" },
      { type: "email", recipient: "finance@company.com", message: "Transaction details attached", sentAt: "10:45:17 AM" },
      { type: "sms", recipient: "Vendor ABC", message: "Payment received: ₹50,000 | Ref: TRF_001", sentAt: "10:45:18 AM" },
      { type: "email", recipient: "vendor@abc.com", message: "Transaction reference shared", sentAt: "10:45:19 AM" },
    ]
  },
  {
    id: "TRF_003",
    amount: "₹30,000",
    vendor: "Vendor XYZ",
    vendorId: "V-2156",
    route: "IMPS",
    status: "in_transit",
    steps: [
      { status: "completed", title: "Initiated", description: "Payment initiated", timestamp: "10:50:00 AM", detail: "Route: IMPS" },
      { status: "completed", title: "Bank Processing", description: "HDFC processing", timestamp: "10:50:30 AM", detail: "Processing completed" },
      { status: "active", title: "In Transit", description: "Clearing via NPCI", timestamp: "10:51:00 AM", detail: "Estimated: 5 mins remaining" },
      { status: "pending", title: "Settlement", description: "Awaiting credit confirmation", detail: "Target: ICICI Bank" },
    ],
    notifications: []
  },
  {
    id: "TRF_005",
    amount: "₹75,000",
    vendor: "Supplier DEF",
    vendorId: "V-3421",
    route: "RTGS",
    status: "pending",
    steps: [
      { status: "completed", title: "Initiated", description: "Payment initiated", timestamp: "10:55:00 AM", detail: "Route: RTGS" },
      { status: "active", title: "Bank Processing", description: "SBI processing debit", timestamp: "10:55:15 AM", detail: "Waiting for debit confirmation" },
      { status: "pending", title: "In Transit", description: "Pending bank clearance" },
      { status: "pending", title: "Settlement", description: "Awaiting settlement" },
    ],
    notifications: []
  },
]

const allSettlements = [
  { id: "TRF_001", amount: "₹50,000", vendor: "Vendor ABC", status: "settled", time: "15 min 15 sec" },
  { id: "TRF_002", amount: "₹75,000", vendor: "Vendor DEF", status: "settled", time: "10 min 5 sec" },
  { id: "TRF_003", amount: "₹30,000", vendor: "Vendor XYZ", status: "in_transit", time: "(Live)" },
  { id: "TRF_004", amount: "₹1,50,000", vendor: "Supplier GHI", status: "settled", time: "9 min 30 sec" },
  { id: "TRF_005", amount: "₹75,000", vendor: "Supplier DEF", status: "pending", time: "(Processing)" },
]

const exceptionAlerts = [
  { time: "2 min ago", settlement: "STL-2024-2841", exception: "Bank API timeout", severity: "high", action: "Retry initiated" },
  { time: "8 min ago", settlement: "STL-2024-2840", exception: "Insufficient liquidity", severity: "high", action: "Manual review" },
  { time: "15 min ago", settlement: "STL-2024-2839", exception: "Account blocked", severity: "medium", action: "Investigation" },
]

export default function SettlementSection() {
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionTimeline>(sampleTransactions[0])

  const settledCount = 951
  const inTransitCount = 12
  const pendingCount = 9
  const failedCount = 0
  const avgSettlementTime = "2.4 min"

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-[#00ffc8]" />
      case "active":
        return <Clock className="w-5 h-5 text-[#33a5ff] animate-pulse" />
      case "pending":
        return <div className="w-5 h-5 rounded-full border-2 border-white/30" />
      case "failed":
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
      <div>
          <h1 className="text-3xl font-bold text-foreground">Real-Time Settlement Tracking</h1>
          <p className="text-muted-foreground mt-1">Live payment status & settlement monitoring</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
            <Eye className="w-4 h-4" />
            Investigate Pending
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#33a5ff] text-white hover:bg-[#33a5ff]/80 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Retry Failed
          </button>
        </div>
      </div>

      {/* Transaction Status Overview */}
      <div
        className="rounded-lg border border-white/10 p-4"
        style={{
          background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 rounded-lg bg-[#00ffc8]/10 border border-[#00ffc8]/30">
            <p className="text-2xl font-bold text-[#00ffc8]">{settledCount}</p>
            <p className="text-xs text-muted-foreground">Successfully Settled (97.8%)</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-[#33a5ff]/10 border border-[#33a5ff]/30">
            <p className="text-2xl font-bold text-[#33a5ff]">{inTransitCount}</p>
            <p className="text-xs text-muted-foreground">In Transit (1.2%)</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30">
            <p className="text-2xl font-bold text-[#f59e0b]">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending (0.9%)</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-2xl font-bold text-red-400">{failedCount}</p>
            <p className="text-xs text-muted-foreground">Failed (0%)</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-2xl font-bold text-foreground">{avgSettlementTime}</p>
            <p className="text-xs text-muted-foreground">Avg Settlement Time</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Settled" value="₹84.2 Cr" trend="+12.4%" trendPositive color="green" />
        <KPICard title="In Transit" value="₹8.5 Cr" trend="-2.1%" trendPositive color="blue" />
        <KPICard title="Pending" value="₹2.1 Cr" trend="+0.8%" trendPositive={false} color="amber" />
        <KPICard title="Failed" value="₹0" trend="No failures" trendPositive color="green" />
      </div>

      {/* Interactive Transaction Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction List */}
        <div
          className="rounded-lg border border-white/10 p-6 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 30px rgba(51, 165, 255, 0.1)",
          }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Select Transaction</h3>
          <div className="space-y-2">
            {sampleTransactions.map((txn) => (
              <button
                key={txn.id}
                onClick={() => setSelectedTransaction(txn)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  selectedTransaction.id === txn.id 
                    ? "bg-[#33a5ff]/20 border border-[#33a5ff]/50" 
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-sm text-[#33a5ff]">{txn.id}</span>
                  <StatusBadge 
                    status={txn.status === "in_transit" ? "warning" : txn.status === "pending" ? "pending" : txn.status} 
                    label={txn.status.replace("_", " ").toUpperCase()} 
                  />
                </div>
                <p className="text-sm font-medium text-foreground">{txn.amount}</p>
                <p className="text-xs text-muted-foreground">{txn.vendor}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline View */}
        <div
          className="lg:col-span-2 rounded-lg border border-white/10 p-6 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 30px rgba(51, 165, 255, 0.1)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Live Transaction Timeline</h3>
              <p className="text-sm text-muted-foreground">
                {selectedTransaction.id} | {selectedTransaction.amount} → {selectedTransaction.vendor}
              </p>
            </div>
            {selectedTransaction.totalTime && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total Time</p>
                <p className="text-lg font-bold text-[#00ffc8]">{selectedTransaction.totalTime}</p>
              </div>
            )}
          </div>

          {/* Timeline Steps */}
          <div className="space-y-4">
            {selectedTransaction.steps.map((step, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <StatusIcon status={step.status} />
                  {idx < selectedTransaction.steps.length - 1 && (
                    <div className={`w-0.5 flex-1 mt-2 ${
                      step.status === "completed" ? "bg-[#00ffc8]" : "bg-white/20"
                    }`} />
                  )}
                </div>
                <div className={`flex-1 pb-4 ${step.status === "active" ? "animate-pulse" : ""}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className={`font-semibold ${
                      step.status === "completed" ? "text-foreground" :
                      step.status === "active" ? "text-[#33a5ff]" : "text-muted-foreground"
                    }`}>
                      {step.title}
                    </p>
                    {step.timestamp && (
                      <span className="text-xs text-muted-foreground">{step.timestamp}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  {step.detail && (
                    <p className="text-xs text-[#00ffc8] mt-1">{step.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Notifications Sent */}
          {selectedTransaction.notifications.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Send className="w-4 h-4 text-[#00ffc8]" />
                Notifications Sent
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedTransaction.notifications.map((notif, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
                    {notif.type === "sms" ? (
                      <Smartphone className="w-4 h-4 text-[#33a5ff] mt-0.5" />
                    ) : (
                      <Mail className="w-4 h-4 text-[#f59e0b] mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{notif.recipient}</p>
                      <p className="text-xs text-muted-foreground">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.sentAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settlement Timeline Chart */}
      <div
        className="rounded-lg border border-white/10 p-6 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 0 30px rgba(51, 165, 255, 0.1)",
        }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Settlement Timeline (24h)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={settlementTimeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="time" stroke="rgba(255, 255, 255, 0.5)" />
            <YAxis stroke="rgba(255, 255, 255, 0.5)" />
            <Tooltip
              contentStyle={{ backgroundColor: "rgba(20, 30, 60, 0.9)", border: "1px solid rgba(51, 165, 255, 0.3)" }}
            />
            <Area type="monotone" dataKey="settled" stackId="1" stroke="#00ffc8" fill="#00ffc866" name="Settled" />
            <Area type="monotone" dataKey="inTransit" stackId="1" stroke="#33a5ff" fill="#33a5ff66" name="In Transit" />
            <Area type="monotone" dataKey="pending" stackId="1" stroke="#f59e0b" fill="#f59e0b66" name="Pending" />
            <Area type="monotone" dataKey="failed" stackId="1" stroke="#ff5555" fill="#ff555566" name="Failed" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Settlement Tracker Table */}
      <div
        className="rounded-lg border border-white/10 p-6 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 0 30px rgba(51, 165, 255, 0.1)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Settlement Tracker</h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-pulse" />
            <span className="text-xs text-muted-foreground">Auto-refresh: Every 30 seconds</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Trans ID</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Vendor</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Time to Settle</th>
              </tr>
            </thead>
            <tbody>
              {allSettlements.map((settlement) => (
                <tr key={settlement.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm text-[#33a5ff]">{settlement.id}</span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-foreground">{settlement.amount}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{settlement.vendor}</td>
                  <td className="py-3 px-4">
                    <StatusBadge 
                      status={settlement.status === "in_transit" ? "warning" : settlement.status === "pending" ? "pending" : settlement.status} 
                      label={settlement.status.replace("_", " ").charAt(0).toUpperCase() + settlement.status.replace("_", " ").slice(1)} 
                    />
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">{settlement.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exception Alerts */}
      <div
        className="rounded-lg border border-white/10 p-6 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 0 30px rgba(51, 165, 255, 0.1)",
        }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-[#f59e0b]" />
          Exception Alerts Panel
        </h3>
        <div className="space-y-3">
          {exceptionAlerts.map((alert, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between p-3 hover:bg-white/5 rounded-lg transition-colors border border-white/5"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{alert.exception}</p>
                  <StatusBadge
                    status={alert.severity}
                    label={alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Settlement: {alert.settlement}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-foreground">{alert.action}</p>
                <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
