"use client"

import { useState } from "react"
import { BookOpen, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { MOCK_CONVERSATIONS, type PesquisaData } from "@/lib/conversation-data"

type SortOrder = "recencia" | "alfabetica"

type DocumentEntry = PesquisaData & { conversationTitle: string }

function DocumentCard({
  doc,
  onClick,
}: {
  doc: DocumentEntry
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer group flex flex-col gap-4"
    >
      {/* ── Top row: icon + title + badge ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-[18px] h-[18px] text-gray-500" />
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{doc.title}</p>
          </div>
        </div>
      </div>

      {/* ── Conversation tag ── */}
      <div>
        <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-500 text-[11px] font-medium rounded-md">
          {doc.conversationTitle}
        </span>
      </div>

      {/* ── Query preview ── */}
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
        {doc.expandedQuery}
      </p>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <p className="text-[11px] text-gray-400">{doc.timestamp}</p>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
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
    if (a.isNew !== b.isNew) return a.isNew ? -1 : 1
    return 0
  })

  return (
    <div className="flex-1 flex flex-col h-full bg-white min-w-0">

      {/* ── Header ── */}
      <div className="px-8 pt-6 pb-5 border-b border-gray-100 flex-shrink-0">
        <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">Documentos</h1>
            <p className="text-xs text-gray-400 mt-0.5">{allDocs.length} documentos</p>
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

      {/* ── Grid ── */}
      <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-gray-100">
        <div className="max-w-3xl mx-auto w-full px-8 py-6">
          {sorted.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-20">Nenhuma pesquisa ainda.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {sorted.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} onClick={() => onViewPesquisa(doc)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
