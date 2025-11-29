"use client"

import { useMemo } from "react"
import { TrendingUp, CreditCard, Building2, Globe2 } from "lucide-react"

import MetricCard from "@/components/dashboard/components/metric-card"
import { useDashboardDataContext } from "@/components/dashboard/providers/dashboard-data-context"

function formatCurrency(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value)
}

export default function OverviewSection() {
  const { data, loading } = useDashboardDataContext()

  const metrics = data?.overview.metrics
  const paymentMethods = data?.overview.payment_methods ?? []
  const recentTransactions = data?.overview.recent_transactions ?? []

  const topCurrency = useMemo(() => {
    if (!metrics) return null
    const entries = Object.entries(metrics.currency_breakdown)
    if (!entries.length) return null
    const [currency, count] = entries.sort((a, b) => b[1] - a[1])[0]
    return { currency, count }
  }, [metrics])

  if (loading || !data || !metrics) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-muted-foreground">
          Loading overview metrics…
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Overview</h1>
        <div className="text-muted-foreground mt-1 space-y-0.5 text-sm">
          <p>
            Session ID: <span className="font-mono text-[#33a5ff]">{data.session.id}</span>
          </p>
          <p>
            Source: <span className="uppercase text-foreground">{data.session.source}</span>{" "}
            · Records ingested:{" "}
            <span className="text-foreground font-medium">{formatNumber(data.session.records_ingested)}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Volume"
          value={formatCurrency(metrics.total_volume)}
          subtitle={`${formatNumber(metrics.total_transactions)} transactions`}
          icon={<TrendingUp className="w-5 h-5" />}
          series={paymentMethods.map((m) => m.amount)}
          color="var(--neon-blue)"
        />
        <MetricCard
          title="Unique Vendors"
          value={formatNumber(metrics.unique_vendors)}
          subtitle="Distinct vendor IDs"
          icon={<Building2 className="w-5 h-5" />}
        />
        <MetricCard
          title="Payment Methods"
          value={paymentMethods.length}
          subtitle="Active rails in this session"
          icon={<CreditCard className="w-5 h-5" />}
          series={paymentMethods.map((m) => m.count)}
          color="var(--neon-green)"
        />
        <MetricCard
          title="Top Currency"
          value={topCurrency ? `${topCurrency.currency} · ${formatNumber(topCurrency.count)} txns` : "N/A"}
          subtitle="Currency breakdown"
          icon={<Globe2 className="w-5 h-5" />}
          series={Object.values(metrics.currency_breakdown)}
          color="var(--neon-purple)"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div
          className="rounded-lg border border-white/10 p-6"
          style={{
            background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
            backdropFilter: "blur(10px)",
          }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Payment Method Distribution</h2>
          {paymentMethods.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payment methods detected for this session.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase">Method</th>
                    <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase">Transactions</th>
                    <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentMethods.map((method) => (
                    <tr key={method.method} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-2 text-sm text-foreground font-medium">{method.method}</td>
                      <td className="py-2 text-sm text-foreground">
                        {formatNumber(method.count)} ({((method.count / metrics.total_transactions) * 100).toFixed(1)}%)
                      </td>
                      <td className="py-2 text-sm text-foreground">{formatCurrency(method.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div
          className="rounded-lg border border-white/10 p-6"
          style={{
            background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
            backdropFilter: "blur(10px)",
          }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h2>
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions ingested yet.</p>
          ) : (
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
              {recentTransactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{txn.vendor}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(txn.date).toLocaleString("en-IN", { hour12: true })} • {txn.bank}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#33a5ff]">{formatCurrency(txn.amount)}</p>
                    <p className="text-xs text-muted-foreground">{txn.payment_method}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
