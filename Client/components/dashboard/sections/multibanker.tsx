"use client"
import { useState, useEffect } from "react"
import { KPICard } from "@/components/dashboard/components/kpi-cards-row"
import StatusBadge from "@/components/dashboard/components/status-badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { 
  Building2, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw,
  Plus,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  AlertTriangle,
  Clock,
  CreditCard
} from "lucide-react"

const cashFlowData = [
  { time: "00:00", inflow: 450, outflow: 280 },
  { time: "04:00", inflow: 320, outflow: 450 },
  { time: "08:00", inflow: 1250, outflow: 980 },
  { time: "12:00", inflow: 2100, outflow: 1850 },
  { time: "16:00", inflow: 1650, outflow: 1420 },
  { time: "20:00", inflow: 850, outflow: 680 },
]

interface BankAccount {
  id: string
  name: string
  shortName: string
  logo: string
  color: string
  balance: string
  balanceNum: number
  accountNumber: string
  status: "connected" | "degraded" | "disconnected"
  uptime: number
  transactionsToday: number
  inflows: { count: number; amount: string }
  outflows: { count: number; amount: string }
  lastSync: string
}

const bankAccounts: BankAccount[] = [
  {
    id: "hdfc",
    name: "HDFC Bank",
    shortName: "HDFC",
    logo: "H",
    color: "#004C8F",
    balance: "₹5,20,000",
    balanceNum: 520000,
    accountNumber: "****3210",
    status: "connected",
    uptime: 98,
    transactionsToday: 45,
    inflows: { count: 3, amount: "₹2,50,000" },
    outflows: { count: 12, amount: "₹1,80,000" },
    lastSync: "2 min ago"
  },
  {
    id: "icici",
    name: "ICICI Bank",
    shortName: "ICICI",
    logo: "I",
    color: "#F58220",
    balance: "₹7,80,000",
    balanceNum: 780000,
    accountNumber: "****5678",
    status: "connected",
    uptime: 97,
    transactionsToday: 38,
    inflows: { count: 2, amount: "₹1,50,000" },
    outflows: { count: 18, amount: "₹2,20,000" },
    lastSync: "5 min ago"
  },
  {
    id: "axis",
    name: "Axis Bank",
    shortName: "Axis",
    logo: "A",
    color: "#97144D",
    balance: "₹12,50,000",
    balanceNum: 1250000,
    accountNumber: "****9012",
    status: "degraded",
    uptime: 88,
    transactionsToday: 52,
    inflows: { count: 5, amount: "₹4,00,000" },
    outflows: { count: 25, amount: "₹2,50,000" },
    lastSync: "8 min ago"
  },
  {
    id: "kotak",
    name: "Kotak Mahindra",
    shortName: "Kotak",
    logo: "K",
    color: "#ED1C24",
    balance: "₹25,00,000",
    balanceNum: 2500000,
    accountNumber: "****3456",
    status: "connected",
    uptime: 99.5,
    transactionsToday: 65,
    inflows: { count: 8, amount: "₹3,00,000" },
    outflows: { count: 20, amount: "₹1,50,000" },
    lastSync: "1 min ago"
  },
]

const balanceDistribution = bankAccounts.map(bank => ({
  name: bank.shortName,
  value: bank.balanceNum,
  color: bank.color,
  percentage: ((bank.balanceNum / 5050000) * 100).toFixed(1)
}))

const transactionStream = [
  { time: "10:45 AM", bank: "HDFC", type: "Debit", amount: "₹50,000", vendor: "Vendor ABC", status: "settled" },
  { time: "10:40 AM", bank: "ICICI", type: "Credit", amount: "₹1,00,000", vendor: "Customer X", status: "settled" },
  { time: "10:35 AM", bank: "Axis", type: "Debit", amount: "₹30,000", vendor: "Vendor XYZ", status: "settled" },
  { time: "10:30 AM", bank: "Kotak", type: "Debit", amount: "₹75,000", vendor: "Supplier L", status: "settled" },
  { time: "10:25 AM", bank: "HDFC", type: "Credit", amount: "₹2,00,000", vendor: "Customer Y", status: "settled" },
  { time: "10:20 AM", bank: "ICICI", type: "Debit", amount: "₹45,000", vendor: "Vendor PQR", status: "in_transit" },
  { time: "10:15 AM", bank: "Kotak", type: "Credit", amount: "₹80,000", vendor: "Customer Z", status: "settled" },
  { time: "10:10 AM", bank: "Axis", type: "Debit", amount: "₹25,000", vendor: "Vendor DEF", status: "settled" },
]

const bankEvents = [
  { time: "2 min ago", bank: "HDFC", event: "API response time spike", severity: "medium", resolution: "Auto-mitigated" },
  { time: "15 min ago", bank: "Axis", event: "Connection timeout (1 min)", severity: "high", resolution: "Failover triggered" },
  { time: "1h 20 min ago", bank: "ICICI", event: "Certificate renewal", severity: "info", resolution: "Completed successfully" },
  { time: "3h 45 min ago", bank: "Kotak", event: "Scheduled maintenance", severity: "info", resolution: "Completed" },
]

export default function MultibankerSection() {
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }, 1500)
  }

  const totalBalance = "₹50,50,000"
  const totalInflows = "₹11,00,000"
  const totalOutflows = "₹8,00,000"
  const netMovement = "+₹3,00,000"

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "connected":
        return <Wifi className="w-4 h-4 text-[#00ffc8]" />
      case "degraded":
        return <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
      case "disconnected":
        return <WifiOff className="w-4 h-4 text-red-400" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Unified Multi-Bank Dashboard</h1>
          <p className="text-muted-foreground mt-1">Consolidated view across all connected banks</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
            <Plus className="w-4 h-4" />
            Add Bank
          </button>
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#33a5ff] text-white hover:bg-[#33a5ff]/80 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Sync Now
          </button>
        </div>
      </div>

      {/* Total Cash Position */}
      <div
        className="rounded-xl border border-[#00ffc8]/30 p-6"
        style={{
          background: "linear-gradient(135deg, rgba(0,255,200,0.1) 0%, rgba(51,165,255,0.05) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 0 60px rgba(0, 255, 200, 0.1)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">TOTAL CASH POSITION (All Banks Combined)</p>
            <p className="text-4xl font-bold text-foreground">{totalBalance}</p>
            <p className="text-sm text-muted-foreground mt-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Last Updated: {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} (5 mins ago)
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Today's Inflows</p>
                <p className="text-lg font-semibold text-[#00ffc8] flex items-center gap-1">
                  <ArrowDownRight className="w-4 h-4" />
                  {totalInflows}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Today's Outflows</p>
                <p className="text-lg font-semibold text-red-400 flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" />
                  {totalOutflows}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Net Movement</p>
                <p className="text-lg font-semibold text-[#00ffc8] flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {netMovement}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Connected Banks" value="4" trend="All active" trendPositive color="blue" />
        <KPICard title="API Status" value="100%" trend="No issues" trendPositive color="green" />
        <KPICard title="Total Balance" value="₹50.5L" trend="+5.2%" trendPositive color="green" />
        <KPICard title="Avg Latency" value="296ms" trend="-8% improvement" trendPositive color="green" />
      </div>

      {/* Individual Bank Cards */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Individual Bank Accounts (Real-time)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {bankAccounts.map((bank) => (
            <div
              key={bank.id}
              className={`rounded-xl border p-5 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                selectedBank?.id === bank.id 
                  ? "border-[#33a5ff]/50 shadow-lg shadow-[#33a5ff]/10" 
                  : "border-white/10 hover:border-white/30"
              }`}
              style={{
                background: "linear-gradient(135deg, rgba(20,30,60,0.6) 0%, rgba(20,20,40,0.4) 100%)",
                backdropFilter: "blur(20px)",
              }}
              onClick={() => setSelectedBank(selectedBank?.id === bank.id ? null : bank)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: bank.color }}
                  >
                    {bank.logo}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{bank.shortName}</p>
                    <p className="text-xs text-muted-foreground">{bank.accountNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <StatusIcon status={bank.status} />
                  <span className={`text-xs font-medium ${
                    bank.status === "connected" ? "text-[#00ffc8]" :
                    bank.status === "degraded" ? "text-[#f59e0b]" : "text-red-400"
                  }`}>
                    {bank.status === "connected" ? "Healthy" : bank.status === "degraded" ? "Slow" : "Offline"}
                  </span>
                </div>
              </div>

              {/* Balance */}
              <p className="text-2xl font-bold text-foreground mb-4">{bank.balance}</p>

              {/* Stats */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transactions Today</span>
                  <span className="text-foreground font-medium">{bank.transactionsToday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3 text-[#00ffc8]" /> Inflows
                  </span>
                  <span className="text-[#00ffc8]">{bank.inflows.amount} ({bank.inflows.count})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-red-400" /> Outflows
                  </span>
                  <span className="text-red-400">{bank.outflows.amount} ({bank.outflows.count})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank Health</span>
                  <span className={`font-medium ${bank.uptime >= 95 ? "text-[#00ffc8]" : "text-[#f59e0b]"}`}>
                    {bank.uptime}% uptime
                  </span>
                </div>
              </div>

              {/* Uptime Bar */}
              <div className="mt-3">
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${bank.uptime >= 95 ? "bg-[#00ffc8]" : "bg-[#f59e0b]"}`}
                    style={{ width: `${bank.uptime}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Last sync: {bank.lastSync}</span>
                <div className="flex gap-1">
                  <button className="text-xs text-[#33a5ff] hover:underline">Details</button>
                  <span className="text-muted-foreground">|</span>
                  <button className="text-xs text-[#33a5ff] hover:underline">Transactions</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cash Flow Chart & Balance Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Chart */}
        <div
          className="rounded-lg border border-white/10 p-6"
          style={{
            background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 30px rgba(51, 165, 255, 0.1)",
          }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Cash Flow (24h)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="time" stroke="rgba(255, 255, 255, 0.5)" />
              <YAxis stroke="rgba(255, 255, 255, 0.5)" />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(20, 30, 60, 0.9)", border: "1px solid rgba(51, 165, 255, 0.3)" }}
              />
              <Line type="monotone" dataKey="inflow" stroke="#00ffc8" strokeWidth={2} name="Inflow" dot={false} />
              <Line type="monotone" dataKey="outflow" stroke="#ff5555" strokeWidth={2} name="Outflow" dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00ffc8]" />
              <span className="text-sm text-muted-foreground">Inflows</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-sm text-muted-foreground">Outflows</span>
            </div>
          </div>
        </div>

        {/* Balance Distribution */}
        <div
          className="rounded-lg border border-white/10 p-6"
          style={{
            background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 30px rgba(51, 165, 255, 0.1)",
          }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Balance Distribution</h3>
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={balanceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                >
                  {balanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(20, 30, 60, 0.9)", border: "1px solid rgba(51, 165, 255, 0.3)" }}
                  formatter={(value: number) => `₹${(value/100000).toFixed(1)}L`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {balanceDistribution.map((bank) => (
                <div key={bank.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: bank.color }} />
                    <span className="text-sm text-foreground">{bank.name}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{bank.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bank Health Status */}
      <div
        className="rounded-lg border border-white/10 p-6"
        style={{
          background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Bank Health Status (24-hour uptime)</h3>
        <div className="space-y-3">
          {bankAccounts.map((bank) => (
            <div key={bank.id} className="flex items-center gap-4">
              <div className="w-16 text-sm font-medium text-foreground">{bank.shortName}</div>
              <div className="flex-1">
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${bank.uptime >= 95 ? "bg-[#00ffc8]" : "bg-[#f59e0b]"}`}
                    style={{ width: `${bank.uptime}%` }}
                  />
                </div>
              </div>
              <div className={`w-16 text-right text-sm font-semibold ${
                bank.uptime >= 95 ? "text-[#00ffc8]" : "text-[#f59e0b]"
              }`}>
                {bank.uptime}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Stream */}
      <div
        className="rounded-lg border border-white/10 p-6"
        style={{
          background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 0 30px rgba(51, 165, 255, 0.1)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#33a5ff]" />
            Transaction Stream (All Banks Combined)
          </h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-pulse" />
            <span className="text-xs text-muted-foreground">Live updates</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Time</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Bank</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Vendor/Customer</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactionStream.map((txn, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-sm text-muted-foreground">{txn.time}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-white/10 text-foreground">
                      {txn.bank}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center gap-1 text-sm font-medium ${
                      txn.type === "Credit" ? "text-[#00ffc8]" : "text-red-400"
                    }`}>
                      {txn.type === "Credit" ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                      {txn.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-foreground">{txn.amount}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{txn.vendor}</td>
                  <td className="py-3 px-4">
                    <StatusBadge 
                      status={txn.status === "settled" ? "success" : "warning"} 
                      label={txn.status === "settled" ? "Settled" : "In Transit"} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Bank Events */}
      <div
        className="rounded-lg border border-white/10 p-6"
        style={{
          background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
          Recent Bank Events
        </h3>
        <div className="space-y-3">
          {bankEvents.map((event, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between p-3 hover:bg-white/5 rounded-lg transition-colors border border-white/5"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {event.bank} – {event.event}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{event.resolution}</p>
              </div>
              <div className="text-right">
                <StatusBadge
                  status={event.severity === "high" ? "failed" : event.severity === "medium" ? "warning" : "success"}
                  label={event.severity.charAt(0).toUpperCase() + event.severity.slice(1)}
                />
                <p className="text-xs text-muted-foreground mt-1">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
