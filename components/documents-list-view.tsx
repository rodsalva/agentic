"use client"

import { useState } from "react"
import { BookOpen, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { MOCK_CONVERSATIONS, type PesquisaData } from "@/lib/conversation-data"

type SortOrder = "recencia" | "alfabetica"

type DocumentEntry = PesquisaData & { conversationTitle: string }

function DocumentRow({
  doc,
  onClick,
}: {
  doc: DocumentEntry
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors cursor-pointer group"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
            doc.isNew ? "bg-blue-50" : "bg-gray-100"
          )}>
            <BookOpen className={cn("w-3.5 h-3.5", doc.isNew ? "text-blue-400" : "text-gray-400")} />
          </div>

          <div className="min-w-0">
            <p className={cn(
              "text-sm font-medium truncate mb-0.5",
              doc.isNew ? "text-gray-900" : "text-gray-700"
            )}>
              {doc.title}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {doc.conversationTitle} · {doc.timestamp}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {doc.isNew && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          )}
          <ChevronRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-gray-400 transition-colors" />
        </div>
      </div>
    </button>
  )
}

export function DocumentsListView({
  onViewPesquisa,
}: {
  onViewPesquisa: (p: PesquisaData) => void
}) {
  const [sort, setSort] = useState<SortOrder>("recencia")

  const allDocs: DocumentEntry[] = MOCK_CONVERSATIONS.flatMap((conv) =>
    conv.pesquisas.map((p) => ({ ...p, conversationTitle: conv.title }))
  )

  const sorted = [...allDocs].sort((a, b) => {
    if (sort === "alfabetica") return a.title.localeCompare(b.title, "pt-BR")
    // recencia: new first
    if (a.isNew !== b.isNew) return a.isNew ? -1 : 1
    return 0
  })

  const newCount = allDocs.filter((d) => d.isNew).length

  return (
    <div className="flex-1 flex flex-col h-full bg-white min-w-0">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
        <div className="max-w-xl mx-auto w-full flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">Documentos</h1>
            {newCount > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">
                {newCount} {newCount === 1 ? "documento novo" : "documentos novos"}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setSort("recencia")}
              className={cn(
                "text-xs px-2.5 py-1.5 rounded-md transition-colors cursor-pointer",
                sort === "recencia" ? "bg-white text-gray-800 shadow-sm font-medium" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Recentes
            </button>
            <button
              onClick={() => setSort("alfabetica")}
              className={cn(
                "text-xs px-2.5 py-1.5 rounded-md transition-colors cursor-pointer",
                sort === "alfabetica" ? "bg-white text-gray-800 shadow-sm font-medium" : "text-gray-500 hover:text-gray-700"
              )}
            >
              A–Z
            </button>
          </div>
        </div>
      </div>

      {/* ── List ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-gray-100">
        <div className="max-w-xl mx-auto w-full px-6 py-2">
          {sorted.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-16">Nenhum documento ainda.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {sorted.map((doc) => (
                <DocumentRow key={doc.id} doc={doc} onClick={() => onViewPesquisa(doc)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
