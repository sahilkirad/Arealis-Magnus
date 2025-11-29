"use client"

import type React from "react"

interface Column {
  header: string
  accessor: string
  width?: string
  render?: (value: any) => React.ReactNode
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  title?: string
}

export default function DataTable({ columns, data, title }: DataTableProps) {
  return (
    <div
      className="rounded-lg border border-white/10 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 0 30px rgba(51, 165, 255, 0.1)",
      }}
    >
      {title && (
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                {columns.map((col) => (
                  <td key={`${idx}-${col.accessor}`} className="px-6 py-4 text-sm text-foreground">
                    {col.render ? col.render(row[col.accessor]) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
