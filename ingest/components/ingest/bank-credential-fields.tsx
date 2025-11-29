"use client"

import { Eye, EyeOff, KeyRound } from "lucide-react"
import { useState } from "react"

interface BankCredentialFieldsProps {
  selectedBanks: string[]
  credentials: Record<string, string>
  errors: Record<string, string | null>
  onChange: (bankId: string, value: string) => void
}

const bankLabels: Record<string, string> = {
  hdfc: "HDFC API Key",
  icici: "ICICI API Key",
  axis: "Axis API Key",
  kotak: "Kotak API Key",
  yes: "Yes Bank API Key",
}

export default function BankCredentialFields({ selectedBanks, credentials, errors, onChange }: BankCredentialFieldsProps) {
  const [visibleField, setVisibleField] = useState<string | null>(null)

  if (selectedBanks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-xs text-muted-foreground">
        Select a bank above to enter API credentials or launch OAuth.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {selectedBanks.map((bankId) => {
        const value = credentials[bankId] ?? ""
        const error = errors[bankId]
        const isVisible = visibleField === bankId
        return (
          <div key={bankId} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <label htmlFor={`${bankId}-api-key`} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <KeyRound className="h-3.5 w-3.5 text-[#33a5ff]" />
              {bankLabels[bankId] ?? "API Key"}
            </label>
            <div className="mt-2 flex items-center gap-2">
              <input
                id={`${bankId}-api-key`}
                type={isVisible ? "text" : "password"}
                value={value}
                onChange={(event) => onChange(bankId, event.target.value)}
                placeholder="Enter secure API key"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#33a5ff] focus:outline-none"
              />
              <button
                type="button"
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors"
                onClick={() => setVisibleField(isVisible ? null : bankId)}
              >
                {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Paste the key provided by your bank. Keep it confidential—only encrypted during submission.
            </p>
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          </div>
        )
      })}
    </div>
  )
}

