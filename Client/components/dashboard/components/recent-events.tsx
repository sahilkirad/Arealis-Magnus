"use client"
import { CheckCircle, AlertCircle, XCircle, Clock, ArrowRight } from "lucide-react"

const events = [
  {
    id: 1,
    type: "settled",
    title: "Payment settled (IMPS)",
    transactionId: "TXN-2024-001847",
    amount: "₹45,000",
    rail: "IMPS",
    time: "2 min ago",
  },
  {
    id: 2,
    type: "approval",
    title: "Approval required",
    transactionId: "Batch-1024",
    amount: "₹2.3 Cr",
    rail: "NEFT",
    time: "5 min ago",
  },
  {
    id: 3,
    type: "error",
    title: "Recon exception detected",
    transactionId: "RECON-2024-5432",
    amount: "₹12,500",
    rail: "RTGS",
    time: "8 min ago",
  },
  {
    id: 4,
    type: "warning",
    title: "Rail failure detected",
    transactionId: "RAIL-2024-0921",
    amount: "₹5,000",
    rail: "UPI",
    time: "12 min ago",
  },
  {
    id: 5,
    type: "settled",
    title: "Batch approved",
    transactionId: "BATCH-2024-445",
    amount: "₹8.7 Cr",
    rail: "NEFT",
    time: "15 min ago",
  },
]

const getIcon = (type: string) => {
  switch (type) {
    case "settled":
      return <CheckCircle className="w-4 h-4" style={{ color: "var(--neon-green)" }} />
    case "approval":
      return <Clock className="w-4 h-4 text-yellow-500" />
    case "error":
      return <XCircle className="w-4 h-4 text-destructive" />
    case "warning":
      return <AlertCircle className="w-4 h-4 text-orange-500" />
    default:
      return <CheckCircle className="w-4 h-4" style={{ color: "var(--neon-cyan)" }} />
  }
}

export default function RecentEvents() {
  return (
    <div
      className="rounded-lg border border-white/10 p-6 space-y-4"
      style={{
        background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Recent Events</h2>
          <p className="text-sm text-muted-foreground mt-1">Latest transaction activity</p>
        </div>
        <button className="text-sm transition-colors hover:underline" style={{ color: "var(--neon-cyan)" }}>
          View All
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
          >
            <div className="mt-1 flex-shrink-0">{getIcon(event.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{event.title}</p>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-muted-foreground">{event.transactionId}</span>
                  <span className="text-foreground font-semibold">{event.amount}</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground">{event.rail}</span>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">{event.time}</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  )
}
