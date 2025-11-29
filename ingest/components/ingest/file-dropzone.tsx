"use client"

import { useCallback, useState } from "react"
import { Upload, FileText, XCircle, CheckCircle2 } from "lucide-react"

interface FileDropzoneProps {
  selectedFile: File | null
  validationErrors: string[]
  isProcessing: boolean
  onFileSelect: (file: File | null) => void
}

const MAX_FILE_SIZE_MB = 50

export default function FileDropzone({ selectedFile, validationErrors, isProcessing, onFileSelect }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()
      setIsDragging(false)
      if (isProcessing) return
      const file = event.dataTransfer.files?.[0]
      if (!file) return
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        onFileSelect(null)
        return
      }
      const sizeInMb = file.size / (1024 * 1024)
      if (sizeInMb > MAX_FILE_SIZE_MB) {
        onFileSelect(null)
        return
      }
      onFileSelect(file)
    },
    [isProcessing, onFileSelect]
  )

  const handleBrowse = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      onFileSelect(null)
      return
    }
    const sizeInMb = file.size / (1024 * 1024)
    if (sizeInMb > MAX_FILE_SIZE_MB) {
      onFileSelect(null)
      return
    }
    onFileSelect(file)
  }

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault()
        if (!isProcessing) setIsDragging(true)
      }}
      onDragLeave={(event) => {
        event.preventDefault()
        setIsDragging(false)
      }}
      onDragOver={(event) => {
        event.preventDefault()
        if (!isProcessing) setIsDragging(true)
      }}
      onDrop={handleDrop}
      className="relative rounded-2xl border-2 border-dashed border-white/15 bg-white/5 backdrop-blur-lg transition-all duration-300"
      style={{
        boxShadow: isDragging ? "0 0 40px rgba(51,165,255,0.25)" : "0 0 20px rgba(51,165,255,0.1)",
      }}
    >
      <input
        accept=".csv,text/csv"
        type="file"
        onChange={handleBrowse}
        className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
        disabled={isProcessing}
      />
      <div className="relative z-10 flex flex-col items-center justify-center gap-3 p-10 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/10 transition-colors"
          style={{ backgroundColor: isDragging ? "rgba(51,165,255,0.2)" : "rgba(255,255,255,0.08)" }}
        >
          <Upload className="h-6 w-6 text-[#33a5ff]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Drag & drop CSV here</p>
          <p className="text-xs text-muted-foreground mt-1">or click to browse from your computer</p>
        </div>
        <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
          <span>Maximum size 50 MB · UTF-8 encoded CSV only</span>
          <span>Ensure headers match template exactly</span>
        </div>

        {selectedFile && (
          <div className="mt-4 flex w-full max-w-sm items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left">
            <FileText className="h-5 w-5 text-[#33a5ff]" />
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-[10px] text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-[#00ffc8]" />
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="mt-4 w-full max-w-sm rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-left text-xs text-red-300">
            <div className="flex items-center gap-2 font-semibold">
              <XCircle className="h-4 w-4" />
              Validation errors detected:
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {validationErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

