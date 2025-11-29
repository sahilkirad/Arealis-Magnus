"use client"

import { useMemo } from "react"
import { Building2 } from "lucide-react"

interface BankOption {
  id: string
  label: string
  description: string
}

const bankOptions: BankOption[] = [
  { id: "hdfc", label: "HDFC Bank", description: "Enterprise API · OAuth or API Key" },
  { id: "icici", label: "ICICI Bank", description: "API Key integration" },
  { id: "axis", label: "Axis Bank", description: "OAuth sandbox available" },
  { id: "kotak", label: "Kotak Mahindra", description: "API Key integration" },
  { id: "yes", label: "Yes Bank", description: "Coming soon" },
]

interface BankCheckboxGroupProps {
  selectedBanks: string[]
  onToggle: (bankId: string) => void
  isDisabled?: boolean
}

export default function BankCheckboxGroup({ selectedBanks, onToggle, isDisabled }: BankCheckboxGroupProps) {
  const connectedCount = selectedBanks.length
  const reachedLimit = connectedCount >= 4

  const summary = useMemo(() => {
    if (connectedCount === 0) return "Select up to 4 banks to connect"
    return `Selected ${connectedCount}/4 banks`
  }, [connectedCount])

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#33a5ff]/40 bg-[#33a5ff]/15">
            <Building2 className="h-5 w-5 text-[#33a5ff]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Connected Banks</p>
            <p className="text-xs text-muted-foreground">{summary}</p>
          </div>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-muted-foreground">
          Connected: {connectedCount}/4
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {bankOptions.map((bank) => {
          const checked = selectedBanks.includes(bank.id)
          const disabled = isDisabled || (!checked && reachedLimit)
          return (
            <button
              key={bank.id}
              type="button"
              onClick={() => onToggle(bank.id)}
              disabled={disabled}
              className={`w-full rounded-lg border px-3 py-3 text-left transition-all ${
                checked ? "border-[#00ffc8]/50 bg-[#00ffc8]/10" : "border-white/10 bg-white/5 hover:bg-white/10"
              } ${disabled && !checked ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{bank.label}</p>
                  <p className="text-xs text-muted-foreground">{bank.description}</p>
                </div>
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    checked
                      ? "border-[#00ffc8] bg-[#00ffc8]/20 text-[#00ffc8]"
                      : "border-white/10 bg-white/5 text-muted-foreground"
                  }`}
                >
                  {checked ? "✓" : ""}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

