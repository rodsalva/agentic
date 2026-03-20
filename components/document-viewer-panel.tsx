"use client"

import { ExternalLink } from "lucide-react"
import type { LegalDocument } from "@/lib/document-data"

interface DocumentViewerPanelProps {
  document: LegalDocument
  onClose: () => void
}

export function DocumentViewerPanel({ document, onClose }: DocumentViewerPanelProps) {
  return (
    <div className="flex h-full flex-shrink-0 bg-white" style={{ width: 520, borderLeft: "1px solid #e5e7eb" }}>

      {/* ── Drag handle ─────────────────────────────────────────── */}
      <div className="w-3 flex-shrink-0 flex items-center justify-center cursor-col-resize select-none">
        <div className="flex flex-col gap-[5px]">
          <span className="block w-[3px] h-[3px] rounded-full bg-gray-300" />
          <span className="block w-[3px] h-[3px] rounded-full bg-gray-300" />
          <span className="block w-[3px] h-[3px] rounded-full bg-gray-300" />
        </div>
      </div>

      {/* ── Main panel ──────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 h-full">

        {/* Header */}
        <div className="pt-7 pb-5 pr-6 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2
                className="text-[15px] font-bold leading-snug"
                style={{ color: "#111827", letterSpacing: "-0.01em" }}
              >
                {document.label}
              </h2>
              {document.originalUrl && (
                <a
                  href={document.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-[3px] mt-[7px] text-[12px] hover:underline"
                  style={{ color: "#2563eb" }}
                >
                  Ver documento original
                  <ExternalLink className="w-[10px] h-[10px] flex-shrink-0" />
                </a>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 transition-colors cursor-pointer leading-none"
              style={{ color: "#6b7280", fontSize: 20, fontWeight: 300, marginTop: 1 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#111827")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
              aria-label="Fechar"
            >
              ×
            </button>
          </div>
        </div>

        {/* Separator */}
        <div className="flex-shrink-0" style={{ height: 1, background: "#e5e7eb" }} />

        {/* Content */}
        <div
          className="flex-1 min-h-0 overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#d1d5db transparent",
          }}
        >
          <div className="pt-6 pb-8 pr-6">
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.65,
                color: "#1f2937",
                textAlign: "justify",
                whiteSpace: "pre-wrap",
              }}
            >
              {document.content}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
