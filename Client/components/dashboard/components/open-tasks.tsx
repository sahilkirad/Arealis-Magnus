"use client"
import { Clock } from "lucide-react"

const tasks = [
  {
    id: 1,
    severity: "high",
    title: "Approve high-value batch",
    context: "45 txns, ₹12.5 Cr",
    dueTime: "Due in 2h",
  },
  {
    id: 2,
    severity: "critical",
    title: "Resolve recon exception",
    context: "127 mismatched records",
    dueTime: "Overdue 1d",
  },
  {
    id: 3,
    severity: "high",
    title: "Review investigation case",
    context: "Fraud alert - 3 cases",
    dueTime: "Due in 4h",
  },
  {
    id: 4,
    severity: "medium",
    title: "Vendor payouts pending",
    context: "23 vendors, ₹5.2 Cr",
    dueTime: "Due in 1d",
  },
  {
    id: 5,
    severity: "critical",
    title: "Loan disbursements stuck",
    context: "12 accounts, ₹2.8 Cr",
    dueTime: "Overdue 2d",
  },
]

const getSeverityStyle = (severity: string) => {
  switch (severity) {
    case "critical":
      return { borderColor: "#ff5555", color: "#ff5555", bgColor: "rgba(255, 85, 85, 0.1)" }
    case "high":
      return { borderColor: "#ffa500", color: "#ffa500", bgColor: "rgba(255, 165, 0, 0.1)" }
    case "medium":
      return { borderColor: "var(--neon-blue)", color: "var(--neon-blue)", bgColor: "rgba(51, 165, 255, 0.1)" }
    default:
      return { borderColor: "var(--neon-green)", color: "var(--neon-green)", bgColor: "rgba(0, 255, 136, 0.1)" }
  }
}

export default function OpenTasks() {
  return (
    <div
      className="rounded-lg border border-white/10 p-6 space-y-4"
      style={{
        background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div>
        <h2 className="text-lg font-semibold text-foreground">Open Tasks</h2>
        <p className="text-sm text-muted-foreground mt-1">Operational alerts</p>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {tasks.map((task) => {
          const severity = getSeverityStyle(task.severity)
          return (
            <div
              key={task.id}
              className="border-l-4 p-3 rounded-lg cursor-pointer hover:bg-white/5 transition-all group"
              style={{
                borderColor: severity.borderColor,
                backgroundColor: severity.bgColor,
                color: severity.color,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="text-xs opacity-75 mt-1">{task.context}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs opacity-75">{task.dueTime}</span>
                <Clock className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
