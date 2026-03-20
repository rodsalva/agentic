"use client"

import React, { useState, useRef } from "react"
import { ArrowLeft, ChevronDown, Copy, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PesquisaData } from "@/lib/conversation-data"

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

// ── Scoped chat ───────────────────────────────────────────────────

const MOCK_REPLIES = [
  "Com base na pesquisa realizada, os critérios principais são o efetivo desembolso econômico e a existência de negócio jurídico real com terceiros.",
  "Posso detalhar os requisitos específicos mencionados na resposta ou buscar precedentes adicionais sobre o tema.",
  "Existem nuances importantes dependendo do período de apuração. Deseja que eu detalhe algum ponto específico?",
]

function ScopedChat() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const replyIdx = useRef(0)

  function send() {
    const text = input.trim()
    if (!text || loading) return
    setMessages((p) => [...p, { role: "user", text }])
    setInput("")
    setLoading(true)
    const idx = replyIdx.current % MOCK_REPLIES.length
    replyIdx.current++
    setTimeout(() => {
      setMessages((p) => [...p, { role: "assistant", text: MOCK_REPLIES[idx] }])
      setLoading(false)
    }, 1200)
  }

  return (
    <div className="border-t border-gray-100 px-6 py-3">
      {messages.length > 0 && (
        <div className="max-w-sm mx-auto mb-2 space-y-1.5 max-h-32 overflow-y-auto [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-gray-200">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <p className={cn(
                "max-w-[80%] text-xs leading-relaxed px-3 py-1.5 rounded-2xl",
                m.role === "user" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
              )}>
                {m.text}
              </p>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <p className="text-xs text-gray-400 px-3 py-1.5 bg-gray-100 rounded-2xl">...</p>
            </div>
          )}
        </div>
      )}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 w-full max-w-sm border border-gray-200 rounded-2xl px-3.5 py-2 bg-white">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Digitar mensagem..."
            className="flex-1 text-xs text-gray-700 placeholder:text-gray-400 bg-transparent outline-none"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className={cn(
              "flex-shrink-0 transition-colors",
              input.trim() && !loading ? "text-gray-500 hover:text-gray-900 cursor-pointer" : "text-gray-300 cursor-not-allowed"
            )}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  )
}

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
        <ScopedChat />
      </div>
    </div>
  )
}
