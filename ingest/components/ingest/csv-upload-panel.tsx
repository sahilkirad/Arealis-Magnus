"use client"

import { useMemo } from "react"
import { ShieldCheck, Loader2 } from "lucide-react"
import FileDropzone from "./file-dropzone"
import CSVRequirementsList from "./csv-requirements-list"

interface CSVUploadPanelProps {
  selectedFile: File | null
  validationErrors: string[]
  isProcessing: boolean
  uploadProgress: number
  onFileSelect: (file: File | null) => void
}

export default function CSVUploadPanel({
  selectedFile,
  validationErrors,
  isProcessing,
  uploadProgress,
  onFileSelect,
}: CSVUploadPanelProps) {
  const statusLabel = useMemo(() => {
    if (isProcessing) {
      return `Uploading... ${uploadProgress}%`
    }
    if (selectedFile) {
      return "File ready for validation"
    }
    return "Awaiting CSV upload"
  }, [isProcessing, uploadProgress, selectedFile])

  return (
    <section
      className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_8px_30px_rgb(8_15_30_/_0.35)] backdrop-blur-xl"
    >
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground tracking-wide">CSV Upload</h2>
        <p className="text-sm text-muted-foreground/80 leading-relaxed">
          Upload your disbursement ledger in CSV format. We will validate headers and data before ingestion.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-muted-foreground shadow-inner">
          <ShieldCheck className="h-3.5 w-3.5 text-[#00ffc8]" />
          <span>{statusLabel}</span>
          {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#00ffc8]" />}
        </div>
      </div>

      <FileDropzone
        selectedFile={selectedFile}
        validationErrors={validationErrors}
        isProcessing={isProcessing}
        onFileSelect={onFileSelect}
      />

      <CSVRequirementsList />
    </section>
  )
}
