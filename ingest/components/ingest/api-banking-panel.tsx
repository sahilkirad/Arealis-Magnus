"use client"

import BankCheckboxGroup from "./bank-checkbox-group"
import BankCredentialFields from "./bank-credential-fields"
import ConnectedStatusCard from "./connected-status-card"
import OAuthButton from "./oauth-button"

interface APIBankingPanelProps {
  selectedBanks: string[]
  credentials: Record<string, string>
  errors: Record<string, string | null>
  isProcessing: boolean
  connectedCount: number
  lastUpdated: Date | null
  onToggleBank: (bankId: string) => void
  onCredentialChange: (bankId: string, value: string) => void
}

export default function APIBankingPanel({
  selectedBanks,
  credentials,
  errors,
  isProcessing,
  connectedCount,
  lastUpdated,
  onToggleBank,
  onCredentialChange,
}: APIBankingPanelProps) {
  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_8px_30px_rgb(8_15_30_/_0.35)] backdrop-blur-xl">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground tracking-wide">Live Bank API Setup</h2>
        <p className="text-sm text-muted-foreground/80 leading-relaxed">
          Connect your banking partners to stream real-time balances and settlements. You can connect up to four banks now and add more later.
        </p>
      </div>

      <BankCheckboxGroup selectedBanks={selectedBanks} onToggle={onToggleBank} isDisabled={isProcessing} />

      <BankCredentialFields
        selectedBanks={selectedBanks}
        credentials={credentials}
        errors={errors}
        onChange={onCredentialChange}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={selectedBanks.length === 0 || isProcessing}
          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
            selectedBanks.length === 0 || isProcessing
              ? "border-white/10 bg-white/5 text-muted-foreground cursor-not-allowed"
              : "border-[#33a5ff]/50 bg-[#33a5ff]/10 text-[#33a5ff] hover:border-[#33a5ff]/70 hover:bg-[#33a5ff]/20"
          }`}
        >
          Test Connection
        </button>
        <OAuthButton disabled />
        <span className="text-[11px] text-muted-foreground">
          We recommend enabling OAuth for the fastest onboarding. API keys are encrypted in transit and never stored unencrypted.
        </span>
      </div>

      <ConnectedStatusCard connectedCount={connectedCount} isProcessing={isProcessing} lastUpdated={lastUpdated} />
    </section>
  )
}

