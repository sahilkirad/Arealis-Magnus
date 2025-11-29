"use client"

const stages = [
  { name: "Created", count: 2847, percentage: 100, deltaYesterday: "+5.2%" },
  { name: "Approved", count: 2843, percentage: 99.9, deltaYesterday: "+5.1%" },
  { name: "ACC", count: 2841, percentage: 99.8, deltaYesterday: "+5.0%" },
  { name: "Routed", count: 2820, percentage: 99.1, deltaYesterday: "+4.8%" },
  { name: "Settled", count: 2810, percentage: 98.7, deltaYesterday: "+4.6%" },
]

export default function LiveFunnel() {
  return (
    <div
      className="rounded-lg border border-white/10 p-6 space-y-6"
      style={{
        background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div>
        <h2 className="text-lg font-semibold text-foreground">Live Funnel</h2>
        <p className="text-sm text-muted-foreground mt-1">Transaction flow stages</p>
      </div>

      <div className="space-y-4">
        {stages.map((stage) => (
          <div key={stage.name}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{stage.name}</span>
                <span className="text-xs text-muted-foreground">
                  {stage.count.toLocaleString()} ({stage.percentage}%)
                </span>
              </div>
              <span className="text-xs font-semibold" style={{ color: "var(--neon-green)" }}>
                {stage.deltaYesterday}
              </span>
            </div>

            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${stage.percentage}%`,
                  background: "linear-gradient(90deg, var(--neon-cyan), var(--neon-blue))",
                  boxShadow: "0 0 20px rgba(0, 255, 200, 0.2)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
