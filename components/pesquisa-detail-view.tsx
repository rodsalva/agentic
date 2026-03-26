"use client"

import React, { useState } from "react"
import { ArrowLeft, ChevronDown, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PesquisaData } from "@/lib/conversation-data"
import { AgenticScopedChat } from "./agentic-scoped-chat"

// ── Inline content renderer ───────────────────────────────────────

function renderInline(text: string, onOpenDocument?: (id: string) => void): React.ReactNode {
  // Split on bold (**...**) and doc links ([text](doc:id))
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(doc:[^)]+\))/)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(doc:([^)]+)\)$/)
    if (linkMatch && onOpenDocument) {
      return (
        <button
          key={i}
          onClick={() => onOpenDocument(linkMatch[2])}
          className="text-[#2563eb] hover:underline cursor-pointer"
        >
          {linkMatch[1]}
        </button>
      )
    }
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}

function RenderContent({ content, onOpenDocument }: { content: string; onOpenDocument?: (id: string) => void }) {
  const lines = content.split("\n")
  return (
    <div className="text-sm text-gray-700 leading-relaxed space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1.5" />
        if (line.startsWith("## ")) return <p key={i} className="font-semibold text-gray-900 text-sm mt-4 mb-1 first:mt-0">{renderInline(line.slice(3), onOpenDocument)}</p>
        if (line.startsWith("### ")) return <p key={i} className="font-medium text-gray-800 text-sm mt-2">{renderInline(line.slice(4), onOpenDocument)}</p>
        if (line.startsWith("- ")) return (
          <div key={i} className="flex gap-2 ml-1">
            <span className="text-gray-400 flex-shrink-0 mt-0.5">•</span>
            <span>{renderInline(line.slice(2), onOpenDocument)}</span>
          </div>
        )
        if (line.startsWith("| ")) return (
          <p key={i} className="text-sm text-gray-600 font-mono text-xs">{line}</p>
        )
        return <p key={i}>{renderInline(line, onOpenDocument)}</p>
      })}
    </div>
  )
}

const PESQUISA_REPLIES = [
  "Os critérios principais são o efetivo desembolso econômico e a existência de negócio jurídico real com terceiros — é o que os tribunais têm exigido consistentemente.",
  "Posso detalhar os requisitos específicos desta pesquisa ou buscar precedentes adicionais sobre o tema. O que prefere?",
  "Existem nuances importantes dependendo do período de apuração. Quer que eu detalhe algum ponto específico?",
]

// ── Main component ────────────────────────────────────────────────

export function PesquisaDetailView({
  pesquisa,
  onBack,
  onOpenDocument,
}: {
  pesquisa: PesquisaData
  onBack: () => void
  onOpenDocument?: (id: string) => void
}) {
  const [pesquisaOpen, setPesquisaOpen] = useState(true)
  const [respostaOpen, setRespostaOpen] = useState(true)

  return (
    <div className="flex-1 flex flex-col h-full bg-white min-w-0">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
        <div className="max-w-xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-medium text-gray-900">{pesquisa.title}</h1>
              <p className="text-xs text-gray-400 mt-0.5">{pesquisa.timestamp}</p>
            </div>
          </div>
          <button
            onClick={() => navigator.clipboard?.writeText(pesquisa.content)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            Copiar tudo
          </button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-gray-100">
        <div className="max-w-xl mx-auto w-full px-6 py-6">

          {/* Pesquisa section */}
          <div className="mb-6 pb-6 border-b border-gray-100">
            <div
              className="flex items-center justify-between mb-2 cursor-pointer"
              onClick={() => setPesquisaOpen((v) => !v)}
            >
              <div className="flex items-center gap-1 text-xs text-gray-400 uppercase tracking-wide select-none">
                <ChevronDown className={cn("w-3 h-3 transition-transform", !pesquisaOpen && "-rotate-90")} />
                Pesquisa
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(pesquisa.expandedQuery) }}
                className="text-gray-300 hover:text-gray-500 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            {pesquisaOpen && (
              <p className="text-sm text-gray-600 leading-relaxed">{pesquisa.expandedQuery}</p>
            )}
          </div>

          {/* Resposta section */}
          <div>
            <div
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={() => setRespostaOpen((v) => !v)}
            >
              <div className="flex items-center gap-1 text-xs text-gray-400 uppercase tracking-wide select-none">
                <ChevronDown className={cn("w-3 h-3 transition-transform", !respostaOpen && "-rotate-90")} />
                Resposta
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(pesquisa.content) }}
                className="text-gray-300 hover:text-gray-500 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            {respostaOpen && <RenderContent content={pesquisa.content} onOpenDocument={onOpenDocument} />}
          </div>

        </div>
      </div>

      {/* ── Chat ───────────────────────────────────────────────── */}
      <div className="flex-shrink-0 max-w-xl mx-auto w-full">
        <AgenticScopedChat
          placeholder={`Pergunte sobre esta pesquisa...`}
          replies={PESQUISA_REPLIES}
        />
      </div>
    </div>
  )
}
