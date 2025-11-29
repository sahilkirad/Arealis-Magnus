"use client"
import { useState } from "react"
import { KPICard } from "@/components/dashboard/components/kpi-cards-row"
import StatusBadge from "@/components/dashboard/components/status-badge"
import { 
  BookOpen, 
  Search, 
  Download, 
  Share2, 
  CheckCircle2, 
  Lock, 
  Shield,
  FileText,
  Clock,
  User,
  Hash,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink
} from "lucide-react"

interface AuditEntry {
  id: number
  timestamp: string
  action: string
  actor: string
  actorType: "user" | "system" | "automated"
  details: string
  status: string
  hash: string
}

interface TransactionAudit {
  transactionId: string
  vendor: string
  amount: string
  entries: AuditEntry[]
}

const sampleTransactionAudits: TransactionAudit[] = [
  {
    transactionId: "TRF_001",
    vendor: "Vendor ABC Ltd",
    amount: "₹50,000",
    entries: [
      { id: 1, timestamp: "2025-03-15 10:30:00", action: "Payment Initiated", actor: "Finance Manager (Priya)", actorType: "user", details: "Amount: ₹50,000 | Status: INITIATED", status: "success", hash: "abc123def456ghi" },
      { id: 2, timestamp: "2025-03-15 10:30:02", action: "Compliance Checked", actor: "Compliance Agent", actorType: "automated", details: "GST: VALID ✓ | TDS: APPLICABLE ✓ | FEMA: N/A | Status: APPROVED", status: "success", hash: "jkl789mno012pqr" },
      { id: 3, timestamp: "2025-03-15 10:30:03", action: "Fraud Checked", actor: "Fraud Detection Agent", actorType: "automated", details: "Risk Score: 0.15 | Anomalies: NONE | Status: CLEAN", status: "success", hash: "stu345vwx678yz" },
      { id: 4, timestamp: "2025-03-15 10:30:05", action: "Route Selected", actor: "Route Optimizer Agent", actorType: "automated", details: "Selected: IMPS | Fee: ₹50 | Success Probability: 92%", status: "success", hash: "abc901def234ghi" },
      { id: 5, timestamp: "2025-03-15 10:30:06", action: "Payment Executed", actor: "Bank Interface", actorType: "system", details: "UTR: 123456789012 | Status: SENT TO BANK", status: "success", hash: "jkl567mno890pqr" },
      { id: 6, timestamp: "2025-03-15 10:45:15", action: "Settlement Confirmed", actor: "Bank API", actorType: "system", details: "Credit Status: RECEIVED BY VENDOR | Settlement Time: 15 mins 15 secs", status: "success", hash: "stu789vwx012yz" },
    ]
  },
  {
    transactionId: "TRF_045",
    vendor: "Vendor XYZ",
    amount: "₹75,000",
    entries: [
      { id: 1, timestamp: "2025-03-15 10:35:00", action: "Payment Initiated", actor: "Finance Team", actorType: "user", details: "Amount: ₹75,000 | Status: INITIATED", status: "success", hash: "def456ghi789jkl" },
      { id: 2, timestamp: "2025-03-15 10:35:02", action: "Compliance Checked", actor: "Compliance Agent", actorType: "automated", details: "GST: EXPIRED | Status: BLOCKED", status: "failed", hash: "mno012pqr345stu" },
    ]
  },
]

const auditTrailList = [
  { timestamp: "2024-01-15 14:23:45", user: "admin@arealis.com", action: "Transaction processed", entity: "TRF_001", details: "Amount: ₹5,00,000 | Status: Settled", status: "success" },
  { timestamp: "2024-01-15 14:22:18", user: "system", action: "Fraud check completed", entity: "TRF_002", details: "Risk Score: 0.12 | Result: Low Risk", status: "success" },
  { timestamp: "2024-01-15 14:21:03", user: "compliance_officer", action: "Manual override", entity: "TRF_003", details: "Reason: Vendor relationship | Approved", status: "success" },
  { timestamp: "2024-01-15 14:19:52", user: "system", action: "Settlement failed", entity: "TRF_004", details: "Error: Bank API timeout | Retry queued", status: "failed" },
  { timestamp: "2024-01-15 14:18:34", user: "finance_team", action: "Report exported", entity: "Report-Daily-Recon", details: "Format: PDF | Recipient: CFO", status: "success" },
]

const hashVerification = [
  { block: "Block #12847", hash: "0x7f8a9b3c2d1e4f5g...", status: "valid", verified: "1 min ago" },
  { block: "Block #12846", hash: "0x3e4a5b6c7d8f9g0h...", status: "valid", verified: "5 min ago" },
  { block: "Block #12845", hash: "0x9c2e1a8b3f4d7e5c...", status: "valid", verified: "12 min ago" },
]

const eventFilters = [
  "Transaction Processed",
  "Settlement Event",
  "Fraud Detection",
  "Manual Override",
  "System Error",
  "User Login",
  "Configuration Change",
  "Report Generated",
]

export default function AuditLedgerSection() {
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionAudit>(sampleTransactionAudits[0])
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const ActorIcon = ({ type }: { type: string }) => {
    switch (type) {
      case "user":
        return <User className="w-4 h-4 text-[#33a5ff]" />
      case "system":
        return <Shield className="w-4 h-4 text-[#f59e0b]" />
      case "automated":
        return <Clock className="w-4 h-4 text-[#00ffc8]" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Immutable Audit Ledger</h1>
          <p className="text-muted-foreground mt-1">Complete transaction audit trail & compliance logs</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
            <Download className="w-4 h-4" />
            Download Audit Report (PDF)
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
            <Share2 className="w-4 h-4" />
            Share with Auditors
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#00ffc8] text-black hover:bg-[#00ffc8]/80 transition-colors">
            <CheckCircle2 className="w-4 h-4" />
            Verify Integrity
          </button>
        </div>
      </div>

      {/* Audit Summary */}
      <div
        className="rounded-lg border border-white/10 p-4"
        style={{
          background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total Logged:</span>
            <span className="ml-2 font-semibold text-foreground">951 transactions</span>
          </div>
          <div>
            <span className="text-muted-foreground">Audit Entries:</span>
            <span className="ml-2 font-semibold text-[#33a5ff]">5,706</span>
            <span className="text-xs text-muted-foreground ml-1">(6 per txn)</span>
          </div>
          <div>
            <span className="text-muted-foreground">Data Integrity:</span>
            <span className="ml-2 font-semibold text-[#00ffc8]">100%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Coverage:</span>
            <span className="ml-2 font-semibold text-[#00ffc8]">100%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Compliant:</span>
            <span className="ml-2 font-semibold text-[#00ffc8]">✓ YES</span>
            <span className="text-xs text-muted-foreground ml-1">(Audit Ready)</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Audit Entries" value="5,706" trend="+156 today" trendPositive color="blue" />
        <KPICard title="Integrity Score" value="100%" trend="All valid" trendPositive color="green" />
        <KPICard title="Last Sync" value="2 min" trend="Up to date" trendPositive color="green" />
        <KPICard title="Hash Validity" value="100%" trend="All verified" trendPositive color="green" />
      </div>

      {/* Immutability Guarantee */}
      <div
        className="rounded-xl border border-[#00ffc8]/30 p-6"
        style={{
          background: "linear-gradient(135deg, rgba(0,255,200,0.1) 0%, rgba(51,165,255,0.05) 100%)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-6 h-6 text-[#00ffc8]" />
          <h3 className="text-lg font-semibold text-foreground">Immutability Guarantee</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-muted-foreground mb-1">Database Type</p>
            <p className="font-medium text-foreground">PostgreSQL Append-Only Ledger</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-muted-foreground mb-1">Delete Policy</p>
            <p className="font-medium text-red-400">BLOCKED</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-muted-foreground mb-1">Modify Policy</p>
            <p className="font-medium text-red-400">BLOCKED</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-muted-foreground mb-1">Result</p>
            <p className="font-medium text-[#00ffc8]">Tamper-proof ✓</p>
          </div>
        </div>
      </div>

      {/* Transaction Audit Trail Viewer */}
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
            {sampleTransactionAudits.map((audit) => (
              <button
                key={audit.transactionId}
                onClick={() => setSelectedTransaction(audit)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  selectedTransaction.transactionId === audit.transactionId
                    ? "bg-[#33a5ff]/20 border border-[#33a5ff]/50"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-sm text-[#33a5ff]">{audit.transactionId}</span>
                  <span className="text-xs text-muted-foreground">{audit.entries.length} entries</span>
                </div>
                <p className="text-sm font-medium text-foreground">{audit.amount}</p>
                <p className="text-xs text-muted-foreground">{audit.vendor}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Complete Audit History */}
        <div
          className="lg:col-span-2 rounded-lg border border-white/10 p-6"
          style={{
            background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 30px rgba(51, 165, 255, 0.1)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#33a5ff]" />
                Complete Audit History
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedTransaction.transactionId} | {selectedTransaction.vendor} | {selectedTransaction.amount}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <Copy className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="p-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {selectedTransaction.entries.map((entry, idx) => (
              <div key={entry.id} className="relative">
                {/* Timeline connector */}
                {idx < selectedTransaction.entries.length - 1 && (
                  <div className="absolute left-[19px] top-10 w-0.5 h-full bg-white/20" />
                )}
                
                <div 
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    entry.status === "success" 
                      ? "bg-[#00ffc8]/5 border-[#00ffc8]/20 hover:border-[#00ffc8]/40" 
                      : "bg-red-500/5 border-red-500/20 hover:border-red-500/40"
                  }`}
                  onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      entry.status === "success" ? "bg-[#00ffc8]/20" : "bg-red-500/20"
                    }`}>
                      {entry.status === "success" ? (
                        <CheckCircle2 className="w-5 h-5 text-[#00ffc8]" />
                      ) : (
                        <Shield className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-foreground">Entry {entry.id}: {entry.action}</p>
                        <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <ActorIcon type={entry.actorType} />
                        <span className="text-sm text-muted-foreground">{entry.actor} ({entry.actorType})</span>
                      </div>
                      <p className="text-sm text-foreground">{entry.details}</p>
                      
                      {expandedEntry === entry.id && (
                        <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2 text-xs">
                            <Hash className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Hash:</span>
                            <code className="text-[#00ffc8] font-mono">{entry.hash}</code>
                          </div>
                        </div>
                      )}
                    </div>
                    {expandedEntry === entry.id ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Searchable Audit Trail */}
      <div
        className="rounded-lg border border-white/10 p-6"
        style={{
          background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Searchable Audit Trail</h3>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by ID, user, action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#33a5ff] w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Timestamp</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">User</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Action</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Entity</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Details</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {auditTrailList.map((entry, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-sm text-muted-foreground">{entry.timestamp}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{entry.user}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{entry.action}</td>
                  <td className="py-3 px-4 font-mono text-sm text-[#33a5ff]">{entry.entity}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground max-w-[200px] truncate">{entry.details}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={entry.status} label={entry.status.charAt(0).toUpperCase() + entry.status.slice(1)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hash Verification & Event Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hash Verification Block */}
        <div
          className="rounded-lg border border-white/10 p-6"
          style={{
            background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
            backdropFilter: "blur(10px)",
          }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Hash className="w-5 h-5 text-[#00ffc8]" />
            Hash Verification Block
          </h3>
          <div className="space-y-3">
            {hashVerification.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between p-3 hover:bg-white/5 rounded-lg transition-colors border border-white/5"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.block}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{item.hash}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status="success" label="Valid" />
                  <p className="text-xs text-muted-foreground mt-1">{item.verified}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Type Filters */}
        <div
          className="rounded-lg border border-white/10 p-6"
          style={{
            background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
            backdropFilter: "blur(10px)",
          }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Event Type Filters</h3>
          <div className="flex flex-wrap gap-2">
            {eventFilters.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveFilter(activeFilter === tag ? null : tag)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  activeFilter === tag
                    ? "bg-[#33a5ff]/20 border-[#33a5ff]/50 text-[#33a5ff]"
                    : "bg-white/5 border-white/20 hover:border-white/40 text-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          
          {/* Export Options */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-sm font-medium text-foreground mb-3">Export Options</p>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <FileText className="w-4 h-4" />
                Export as PDF
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <Download className="w-4 h-4" />
                Export as CSV
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <Share2 className="w-4 h-4" />
                Share (Encrypted)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
