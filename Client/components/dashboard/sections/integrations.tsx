"use client"
import { Zap, Database, Shield, Cloud, Slack, BarChart3 } from "lucide-react"

export default function IntegrationsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Integrations</h1>
        <p className="text-muted-foreground mt-1">Connect external services and platforms</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "Banks & Payment Rails", icon: <Zap className="w-5 h-5" />, status: "connected", count: "12" },
          { title: "Data Warehouses", icon: <Database className="w-5 h-5" />, status: "connected", count: "3" },
          { title: "Compliance Tools", icon: <Shield className="w-5 h-5" />, status: "connected", count: "2" },
          { title: "Cloud Providers", icon: <Cloud className="w-5 h-5" />, status: "connected", count: "1" },
          { title: "Communication", icon: <Slack className="w-5 h-5" />, status: "ready", count: "0" },
          { title: "Analytics", icon: <BarChart3 className="w-5 h-5" />, status: "ready", count: "0" },
        ].map((integration, i) => (
          <div key={i} className="glass-card p-6 hover:border-neon-blue/50 transition-all cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="text-neon-cyan mt-1">{integration.icon}</div>
                <div>
                  <h3 className="font-semibold text-foreground">{integration.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${integration.status === "connected" ? "bg-neon-green/20 text-neon-green" : "bg-accent/20 text-muted-foreground"}`}
                    >
                      {integration.status === "connected" ? "✓ Connected" : "Available"}
                    </span>
                    {integration.count && (
                      <span className="text-xs text-muted-foreground">{integration.count} services</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
