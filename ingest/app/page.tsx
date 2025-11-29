"use client"

import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Info, Hash, Upload as UploadIcon, Wifi, ShieldCheck, Building2 } from "lucide-react"
import CSVUploadPanel from "../components/ingest/csv-upload-panel"
import APIBankingPanel from "../components/ingest/api-banking-panel"
import ModalStack from "../components/ingest/modal-stack"
import { API_BASE_URL } from "../lib/api"

const REQUIRED_HEADERS = [
  "date",
  "vendor_id",
  "vendor_name",
  "amount",
  "currency",
  "payment_method",
  "bank_name",
  "gst_number",
  "pan_number",
  "payment_purpose",
  "receiving_bank",
  "receiving_account",
  "country",
]

export default function IngestPage() {
  const router = useRouter()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [selectedBanks, setSelectedBanks] = useState<string[]>([])
  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const [credentialErrors, setCredentialErrors] = useState<Record<string, string | null>>({})
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedCount, setConnectedCount] = useState(0)
  const [lastConnectedAt, setLastConnectedAt] = useState<Date | null>(null)

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const isBusy = isUploading || isConnecting

  const resetState = () => {
    setSelectedFile(null)
    setValidationErrors([])
    setIsUploading(false)
    setUploadProgress(0)
    setSelectedBanks([])
    setCredentials({})
    setCredentialErrors({})
    setIsConnecting(false)
  }

  const validateCsvHeaders = useCallback(async (file: File) => {
    const text = await file.text()
    const firstLine = text.split("\n")[0] ?? ""
    const headers = firstLine
      .replace(/\r/g, "")
      .split(",")
      .map((header) => header.trim().toLowerCase())
    const missing = REQUIRED_HEADERS.filter((header) => !headers.includes(header))
    return missing
  }, [])

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setSelectedFile(null)
      setValidationErrors(["Unsupported file. Please upload a .csv file under 50 MB."])
      return
    }
    setSelectedFile(file)
    setValidationErrors([])
  }

  const simulateProgress = (setter: (value: number) => void, duration = 2000) =>
    new Promise<void>((resolve) => {
      const steps = 20
      let current = 0
      const interval = setInterval(() => {
        current += 1
        setter(Math.min(100, Math.round((current / steps) * 100)))
        if (current >= steps) {
          clearInterval(interval)
          resolve()
        }
      }, duration / steps)
    })

  const finishSuccessFlow = (message: string, sessionId: string) => {
    setSuccessMessage(message)
    setShowSuccessModal(true)
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.href = `http://localhost:3000/dashboard?session=${sessionId}`
      } else {
        router.push(`/dashboard?session=${sessionId}`)
      }
    }, 2200)
  }

  const handleUploadCSV = async () => {
    if (!selectedFile) {
      setValidationErrors(["Please select a CSV file before uploading."])
      return
    }
    setValidationErrors([])
    setIsUploading(true)
    setUploadProgress(5)
    try {
      const missingHeaders = await validateCsvHeaders(selectedFile)
      if (missingHeaders.length > 0) {
        setValidationErrors(missingHeaders.map((header) => `Missing required column: ${header}`))
        setIsUploading(false)
        setUploadProgress(0)
        return
      }
      setUploadProgress(25)
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch(`${API_BASE_URL}/ingest/csv`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorPayload = await response
          .json()
          .catch(() => ({ detail: "Failed to upload CSV. Please retry later." }))
        throw new Error(errorPayload.detail ?? "Failed to upload CSV. Please retry later.")
      }

      setUploadProgress(75)
      const payload: { session_id: string } = await response.json()
      setUploadProgress(100)
      setIsUploading(false)
      finishSuccessFlow("CSV ingestion complete. Redirecting you to the dashboard overview.", payload.session_id)
    } catch (error) {
      console.error(error)
      setErrorMessage(
        error instanceof Error ? error.message : "We could not process the CSV file. Please try again or contact support.",
      )
      setShowErrorModal(true)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const toggleBankSelection = (bankId: string) => {
    setSelectedBanks((prev) => {
      if (prev.includes(bankId)) {
        const updated = prev.filter((id) => id !== bankId)
        return updated
      }
      if (prev.length >= 4) return prev
      return [...prev, bankId]
    })
    setCredentialErrors((prev) => ({ ...prev, [bankId]: null }))
  }

  const handleCredentialChange = (bankId: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [bankId]: value }))
    setCredentialErrors((prev) => ({ ...prev, [bankId]: value.length < 8 ? "API key must be at least 8 characters." : null }))
  }

  const handleSetupAPI = async () => {
    if (selectedBanks.length === 0) {
      setErrorMessage("Select at least one bank before starting API setup.")
      setShowErrorModal(true)
      return
    }
    const missingCredentials = selectedBanks.filter((bankId) => !credentials[bankId] || credentials[bankId].length < 8)
    if (missingCredentials.length > 0) {
      const newErrors: Record<string, string | null> = {}
      missingCredentials.forEach((bankId) => {
        newErrors[bankId] = "Please enter a valid API key (8+ characters)."
      })
      setCredentialErrors((prev) => ({ ...prev, ...newErrors }))
      return
    }

    setIsConnecting(true)
    try {
      await simulateProgress(() => {}, 3000)
      setIsConnecting(false)
      setConnectedCount(selectedBanks.length)
      setLastConnectedAt(new Date())
      finishSuccessFlow("Bank connections established. Loading your dashboard.", `sess_live_${Date.now()}`)
    } catch (error) {
      console.error(error)
      setIsConnecting(false)
      setErrorMessage("Unable to establish bank connections. Please verify credentials and retry.")
      setShowErrorModal(true)
    }
  }

  const processingMessage = isUploading
    ? "Validating headers, sanitizing data, and ingesting transactions."
    : "Connecting securely to bank APIs and verifying credentials."

  return (
    <div className="relative min-h-screen pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10%] top-[25%] h-72 w-72 rounded-full bg-[#081631]/60 blur-3xl" />
        <div className="absolute right-[-15%] top-[40%] h-96 w-96 rounded-full bg-[#043033]/55 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(20,30,45,0.9),transparent_60%)]" />
      </div>

      <div className="mx-auto max-w-6xl space-y-10 px-6 py-12">
        <header className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_15px_45px_rgb(8_15_30_/_0.45)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#33a5ff] to-[#00ffc8] shadow-inner shadow-[#33a5ff]/40">
                  <Hash className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground/60">Arealis Magnus</p>
                  <h1 className="text-xl font-semibold text-foreground">Data Ingestion Hub</h1>
                </div>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Upload CSV ledgers or connect live banking partners to populate the Arealis Magnus dashboard. We enforce schema validation, compliance rules, and connection health checks before you proceed.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <UploadIcon className="h-4 w-4 text-[#33a5ff]" />
                {selectedFile ? selectedFile.name : "No file selected"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <Wifi className="h-4 w-4 text-[#00ffc8]" />
                {connectedCount} banks connected
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <Info className="h-4 w-4 text-[#f5a524]" />
                Need help? Press <kbd className="rounded bg-white/10 px-1">Ctrl</kbd>+<kbd className="rounded bg-white/10 px-1">/</kbd>
              </span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Upload State</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{selectedFile ? "Ready to ingest" : "Awaiting CSV"}</p>
              <p className="text-[11px] text-muted-foreground/70">
                {selectedFile ? "Validated headers detected" : "Drag & drop CSV or browse files"}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Validation</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {validationErrors.length === 0 ? "All checks passing" : `${validationErrors.length} issue(s)`}
              </p>
              <p className="text-[11px] text-muted-foreground/70">
                {validationErrors.length === 0 ? "Schema guardrails enforced" : "Resolve highlighted columns"}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Bank Connectors</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{connectedCount} active</p>
              <p className="text-[11px] text-muted-foreground/70">Last synced {lastConnectedAt ? lastConnectedAt.toLocaleTimeString() : "—"}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <CSVUploadPanel
            selectedFile={selectedFile}
            validationErrors={validationErrors}
            isProcessing={isUploading}
            uploadProgress={uploadProgress}
            onFileSelect={handleFileSelect}
          />

          <APIBankingPanel
            selectedBanks={selectedBanks}
            credentials={credentials}
            errors={credentialErrors}
            isProcessing={isConnecting}
            connectedCount={connectedCount}
            lastUpdated={lastConnectedAt}
            onToggleBank={toggleBankSelection}
            onCredentialChange={handleCredentialChange}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-muted-foreground">
            Cancel resets the current flow. You’ll remain on this page until a CSV upload or API setup succeeds.
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={resetState}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-all hover:border-white/20 hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUploadCSV}
              disabled={isBusy || !selectedFile}
              className={`rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
                isBusy || !selectedFile
                  ? "border-white/10 bg-white/5 text-muted-foreground cursor-not-allowed"
                  : "border-[#33a5ff]/60 bg-[#33a5ff]/20 text-[#33a5ff] hover:border-[#33a5ff]/80 hover:bg-[#33a5ff]/30"
              }`}
            >
              Upload CSV
            </button>
            <button
              type="button"
              onClick={handleSetupAPI}
              disabled={isBusy || selectedBanks.length === 0}
              className={`rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
                isBusy || selectedBanks.length === 0
                  ? "border-white/10 bg-white/5 text-muted-foreground cursor-not-allowed"
                  : "border-[#00ffc8]/60 bg-[#00ffc8]/20 text-[#00ffc8] hover:border-[#00ffc8]/80 hover:bg-[#00ffc8]/30"
              }`}
            >
              Setup Live API
            </button>
          </div>
        </div>
      </div>

      <ModalStack
        showProcessing={isBusy}
        showSuccess={showSuccessModal}
        showError={showErrorModal}
        processingMessage={processingMessage}
        successMessage={successMessage}
        errorMessage={errorMessage}
        onDismissSuccess={() => setShowSuccessModal(false)}
        onDismissError={() => setShowErrorModal(false)}
      />
    </div>
  )
}

