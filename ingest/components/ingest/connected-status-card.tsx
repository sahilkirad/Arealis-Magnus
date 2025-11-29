"use client"

import { CheckCircle2, XCircle, Clock } from "lucide-react"

interface ConnectedStatusCardProps {
  connectedCount: number
  isProcessing: boolean
  lastUpdated: Date | null
}

export default function ConnectedStatusCard({ connectedCount, isProcessing, lastUpdated }: ConnectedStatusCardProps) {
  const status =
    connectedCount === 0
      ? { icon: <XCircle className="h-4 w-4 text-red-400" />, text: "Not configured" }
      : { icon: <CheckCircle2 className="h-4 w-4 text-[#00ffc8]" />, text: `Connected: ${connectedCount}` }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Status</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {lastUpdated ? lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "Not synced"}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm text-foreground">
        {status.icon}
        <span>{status.text}</span>
      </div>
      {isProcessing && (
        <p className="mt-2 text-xs text-muted-foreground">Establishing secure bank connections… please do not close this tab.</p>
      )}
      {!isProcessing && connectedCount === 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Setup at least one bank to enable live routing, reconciliation, and multi-bank analytics.
        </p>
      )}
    </div>
  )
}

