"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"

import Sidebar from "@/components/dashboard/sidebar"
import Header from "@/components/dashboard/header"
import OverviewSection from "@/components/dashboard/sections/overview"
import ComplianceSection from "@/components/dashboard/sections/compliance"
import FraudSection from "@/components/dashboard/sections/fraud"
import RoutingSection from "@/components/dashboard/sections/routing"
import SettlementSection from "@/components/dashboard/sections/settlement"
import ReconciliationSection from "@/components/dashboard/sections/reconciliation"
import MultibankerSection from "@/components/dashboard/sections/multibanker"
import AuditLedgerSection from "@/components/dashboard/sections/audit-ledger"
import ExplainabilitySection from "@/components/dashboard/sections/explainability"
import SettingsSection from "@/components/dashboard/sections/settings"
import IntegrationsSection from "@/components/dashboard/sections/integrations"
import {
  DashboardDataProvider,
  useDashboardDataContext,
} from "@/components/dashboard/providers/dashboard-data-context"

const sectionComponents: Record<string, () => JSX.Element> = {
  overview: OverviewSection,
  compliance: ComplianceSection,
  fraud: FraudSection,
  routing: RoutingSection,
  settlement: SettlementSection,
  reconciliation: ReconciliationSection,
  multibanker: MultibankerSection,
  "audit-ledger": AuditLedgerSection,
  explainability: ExplainabilitySection,
  settings: SettingsSection,
  integrations: IntegrationsSection,
}

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const searchParams = useSearchParams()

  const sessionId = searchParams.get("session")

  return (
    <DashboardDataProvider sessionId={sessionId}>
      <DashboardContent
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />
    </DashboardDataProvider>
  )
}

interface DashboardContentProps {
  activeSection: string
  setActiveSection: (value: string) => void
  sidebarOpen: boolean
  toggleSidebar: () => void
}

function DashboardContent({
  activeSection,
  setActiveSection,
  sidebarOpen,
  toggleSidebar,
}: DashboardContentProps) {
  const { data, loading, error } = useDashboardDataContext()
  const SectionComponent = sectionComponents[activeSection] ?? sectionComponents.overview

  const sessionType = (data?.session.source === "live" ? "live" : "csv") as "csv" | "live"
  const transactionCount = data?.session.records_ingested ?? 0

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuClick={toggleSidebar}
          sessionType={sessionType as "csv" | "live"}
          transactionCount={transactionCount}
          lastUpdated={data ? new Date(data.generatedAt) : new Date()}
        />

        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-6">
            {loading && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-muted-foreground">
                Loading dashboard data…
              </div>
            )}
            {error && !loading && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-6 text-red-200">
                Failed to load dashboard data: {error}
              </div>
            )}
            {!loading && !error && data && <SectionComponent />}
          </div>
        </main>
      </div>
    </div>
  )
}

