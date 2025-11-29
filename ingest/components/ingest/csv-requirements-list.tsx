"use client"

import { CheckCircle2, FileSpreadsheet, Info } from "lucide-react"

const requiredColumns = [
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

export default function CSVRequirementsList() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#33a5ff]/10 border border-[#33a5ff]/30">
          <FileSpreadsheet className="h-5 w-5 text-[#33a5ff]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">CSV Requirements</p>
          <p className="text-xs text-muted-foreground">Make sure your CSV includes these headers.</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
        {requiredColumns.map((column) => (
          <div key={column} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#00ffc8]" />
            <span className="uppercase tracking-wide text-muted-foreground">{column}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 text-[#33a5ff]" />
        <p>
          Save the file as UTF-8 encoded CSV. Amount column should be numeric; date column format: YYYY-MM-DD. Download the{" "}
          <a href="#" className="text-[#33a5ff] underline decoration-dotted underline-offset-4">
            ingestion template
          </a>{" "}
          or review the{" "}
          <a href="#" className="text-[#33a5ff] underline decoration-dotted underline-offset-4">
            format guide
          </a>
          .
        </p>
      </div>
    </div>
  )
}

