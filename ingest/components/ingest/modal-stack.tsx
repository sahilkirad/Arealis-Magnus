"use client"

interface ModalStackProps {
  showProcessing: boolean
  showSuccess: boolean
  showError: boolean
  processingMessage: string
  successMessage: string
  errorMessage: string
  onDismissSuccess: () => void
  onDismissError: () => void
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-background/95 p-6 shadow-xl">{children}</div>
    </div>
  )
}

export default function ModalStack({
  showProcessing,
  showSuccess,
  showError,
  processingMessage,
  successMessage,
  errorMessage,
  onDismissSuccess,
  onDismissError,
}: ModalStackProps) {
  return (
    <>
      {showProcessing && (
        <Overlay>
          <div className="space-y-3 text-sm text-muted-foreground">
            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-[#33a5ff]/40 border-t-[#33a5ff]" />
              Processing your request
            </h3>
            <p>{processingMessage}</p>
          </div>
        </Overlay>
      )}

      {showSuccess && (
        <Overlay>
          <div className="space-y-4 text-sm text-muted-foreground">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[#00ffc8]">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#00ffc8] text-[#00ffc8]">
                ✓
              </span>
              Success
            </h3>
            <p>{successMessage}</p>
            <button
              type="button"
              onClick={onDismissSuccess}
              className="w-full rounded-lg border border-[#00ffc8]/40 bg-[#00ffc8]/10 px-3 py-2 text-sm font-semibold text-[#00ffc8] hover:bg-[#00ffc8]/20 transition-colors"
            >
              Continue
            </button>
          </div>
        </Overlay>
      )}

      {showError && (
        <Overlay>
          <div className="space-y-4 text-sm text-muted-foreground">
            <h3 className="flex items-center gap-2 text-base font-semibold text-red-400">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-red-400 text-red-400">
                !
              </span>
              Something went wrong
            </h3>
            <p>{errorMessage}</p>
            <button
              type="button"
              onClick={onDismissError}
              className="w-full rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </Overlay>
      )}
    </>
  )
}

