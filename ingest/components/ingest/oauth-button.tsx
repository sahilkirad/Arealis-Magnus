"use client"

import { Link2, Lock } from "lucide-react"

interface OAuthButtonProps {
  disabled?: boolean
}

export default function OAuthButton({ disabled }: OAuthButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
        disabled
          ? "border-white/10 bg-white/5 text-muted-foreground cursor-not-allowed"
          : "border-[#33a5ff]/40 bg-[#33a5ff]/10 text-[#33a5ff] hover:border-[#33a5ff]/60 hover:bg-[#33a5ff]/20"
      }`}
    >
      <Link2 className="h-4 w-4" />
      Connect via OAuth (Coming Soon)
      <Lock className="h-3.5 w-3.5 opacity-60" />
    </button>
  )
}

