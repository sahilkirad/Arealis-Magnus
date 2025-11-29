const statusColors = {
  approved: { bg: "rgba(16, 185, 129, 0.15)", text: "#10b981", border: "rgba(16, 185, 129, 0.3)" },
  blocked: { bg: "rgba(255, 85, 85, 0.15)", text: "#ff5555", border: "rgba(255, 85, 85, 0.3)" },
  pending: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b", border: "rgba(245, 158, 11, 0.3)" },
  failed: { bg: "rgba(255, 85, 85, 0.15)", text: "#ff5555", border: "rgba(255, 85, 85, 0.3)" },
  success: { bg: "rgba(16, 185, 129, 0.15)", text: "#10b981", border: "rgba(16, 185, 129, 0.3)" },
  warning: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b", border: "rgba(245, 158, 11, 0.3)" },
  high: { bg: "rgba(255, 85, 85, 0.15)", text: "#ff5555", border: "rgba(255, 85, 85, 0.3)" },
  medium: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b", border: "rgba(245, 158, 11, 0.3)" },
  low: { bg: "rgba(51, 165, 255, 0.15)", text: "#33a5ff", border: "rgba(51, 165, 255, 0.3)" },
  flagged: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b", border: "rgba(245, 158, 11, 0.3)" },
} as const

type StatusKey = keyof typeof statusColors

interface StatusBadgeProps {
  status: StatusKey | string
  label: string
}

const fallbackColors = { bg: "rgba(51, 165, 255, 0.15)", text: "#33a5ff", border: "rgba(51, 165, 255, 0.3)" }

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const colors = statusColors[status as StatusKey] ?? fallbackColors
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-semibold border"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
    >
      {label}
    </span>
  )
}
