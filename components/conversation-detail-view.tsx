"use client"

import React, { useState, useRef, useEffect } from "react"
import { BookOpen, Bell, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { MOCK_CONVERSATIONS, type PesquisaData, type ConvMessage } from "@/lib/conversation-data"
import type { MonitoringSubscription } from "@/lib/monitoring-data"
import { ManorAvatar } from "./manor-avatar"
import { AgenticScopedChat } from "./agentic-scoped-chat"

// ── Inline content renderer ────────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
      : <React.Fragment key={i}>{part}</React.Fragment>
  )
}

function RenderContent({ content }: { content: string }) {
  const lines = content.split("\n")
  return (
    <div className="text-sm text-gray-700 leading-relaxed space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1.5" />
        if (line.startsWith("## ")) return <p key={i} className="font-semibold text-gray-900 text-sm mt-4 mb-1 first:mt-0">{line.slice(3)}</p>
        if (line.startsWith("### ")) return <p key={i} className="font-medium text-gray-800 text-sm mt-2">{line.slice(4)}</p>
        if (line.startsWith("- ")) return (
          <div key={i} className="flex gap-2 ml-1">
            <span className="text-gray-400 flex-shrink-0 mt-0.5">•</span>
            <span>{renderInline(line.slice(2))}</span>
          </div>
        )
        if (line.startsWith("| ")) return (
          <p key={i} className="text-sm text-gray-600 font-mono text-xs">{line}</p>
        )
        return <p key={i}>{renderInline(line)}</p>
      })}
    </div>
  )
}

const CONV_REPLIES = [
  "Com base na jurisprudência recente, vale revisar as posições fiscais antes do encerramento do exercício, especialmente nos pontos identificados aqui.",
  "A documentação da racionalidade econômica é o elemento central. Posso detalhar os requisitos específicos se quiser.",
  "Existem precedentes favoráveis dependendo das características do caso. Quer que eu os liste?",
]

// ── Pesquisa proposal display ──────────────────────────────────────

function PesquisaProposalDisplay({ pesquisa }: { pesquisa: PesquisaData }) {
  return (
    <div className="space-y-3 flex-1 min-w-0">
      <div className="bg-gray-50 rounded-2xl px-5 py-4 max-w-lg">
        <p className="text-sm text-gray-700 leading-relaxed">{pesquisa.expandedQuery}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-gray-100 text-gray-400 text-sm px-4 py-2 rounded-full select-none cursor-default">
          <Check className="w-3.5 h-3.5" />
          <span>Prosseguir com esta pesquisa</span>
        </div>
      </div>
    </div>
  )
}

// ── Pesquisa result display ────────────────────────────────────────

function PesquisaResultDisplay({ pesquisa, onViewPesquisa }: { pesquisa: PesquisaData; onViewPesquisa: (p: PesquisaData) => void }) {
  return (
    <div className="flex-1 min-w-0">
      <button
        onClick={() => onViewPesquisa(pesquisa)}
        className="border border-gray-100 rounded-xl px-4 py-3.5 max-w-md bg-white text-left hover:bg-gray-50 transition-colors cursor-pointer w-full"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-[18px] h-[18px] text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Documento <span className="normal-case font-normal opacity-70">· Pesquisa</span></p>
            <p className="text-sm font-medium text-gray-900 truncate">{pesquisa.title}</p>
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mt-1">{pesquisa.expandedQuery}</p>
          </div>
        </div>
      </button>
    </div>
  )
}

// ── Monitoramento row ──────────────────────────────────────────────

function MonitoramentoRow({
  mon,
  onClick,
}: {
  mon: MonitoringSubscription
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-100 transition-all text-left cursor-pointer hover:shadow-sm hover:bg-gray-50"
    >
      {/* Icon */}
      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Bell className="w-[18px] h-[18px] text-gray-500" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Monitoramento</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 truncate">{mon.name}</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-[11px] text-gray-400">
            {mon.hasNew
              ? `Verificado ${mon.lastChecked}`
              : `Verificado ${mon.lastChecked} · sem atualizações`
            }
          </p>
          {mon.hasNew && (
            <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-medium leading-none">
              {mon.newCount} {mon.newCount === 1 ? "atualização" : "atualizações"}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <ChevronDown className="-rotate-90 w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
    </button>
  )
}

// ── Chat history components ────────────────────────────────────────

function MIcon() {
  return <ManorAvatar state="idle" size="xs" className="flex-shrink-0 mt-0.5" />
}

function RSAvatar() {
  return (
    <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 text-white text-[9px] font-bold">
      RS
    </div>
  )
}

function MonitoringProposalCard({ monitoring, onClick }: { monitoring: MonitoringSubscription; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="border border-gray-100 rounded-xl px-4 py-3.5 max-w-md bg-white text-left hover:bg-gray-50 transition-colors cursor-pointer w-full"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Bell className="w-[18px] h-[18px] text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Monitoramento</p>
          <p className="text-sm font-medium text-gray-900 truncate">{monitoring.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-gray-400 leading-relaxed truncate">
              {monitoring.scope.sources.map((s) => s.toUpperCase()).join(", ")} · {monitoring.scope.tributos.join(", ")} · {monitoring.scope.assuntos.join(", ")}
            </p>
            {monitoring.hasNew && (
              <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-medium leading-none">
                {monitoring.newCount} {monitoring.newCount === 1 ? "atualização" : "atualizações"}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

function ChatHistory({
  messages,
  pesquisas,
  monitoramentos,
  onViewMonitoring,
  onViewPesquisa,
}: {
  messages: ConvMessage[]
  pesquisas: PesquisaData[]
  monitoramentos: MonitoringSubscription[]
  onViewMonitoring: (id: string) => void
  onViewPesquisa: (p: PesquisaData) => void
}) {
  return (
    <div className="space-y-5 px-6 py-6">
      {messages.map((msg, i) => {
        if (msg.role === "user") {
          return (
            <div key={i} className="flex justify-end items-end gap-2">
              <div className="max-w-[75%] border border-gray-200 rounded-2xl rounded-br-sm px-4 py-2.5">
                <p className="text-sm text-gray-800">{msg.content}</p>
              </div>
              <RSAvatar />
            </div>
          )
        }

        if (msg.type === "pesquisa-proposal" && msg.pesquisaId) {
          const pesquisa = pesquisas.find((p) => p.id === msg.pesquisaId)
          if (!pesquisa) return null
          return (
            <div key={i} className="flex items-start gap-3">
              <MIcon />
              <PesquisaProposalDisplay pesquisa={pesquisa} />
            </div>
          )
        }

        if (msg.type === "pesquisa-result" && msg.pesquisaId) {
          const pesquisa = pesquisas.find((p) => p.id === msg.pesquisaId)
          if (!pesquisa) return null
          return (
            <div key={i} data-pesquisa-id={pesquisa.id} className="flex items-start gap-3">
              <MIcon />
              <PesquisaResultDisplay pesquisa={pesquisa} onViewPesquisa={onViewPesquisa} />
            </div>
          )
        }

        if (msg.type === "monitoring-proposal" && msg.monitoringId) {
          const mon = monitoramentos.find((m) => m.id === msg.monitoringId)
          if (!mon) return null
          return (
            <div key={i} className="flex items-start gap-2">
              <MIcon />
              <p className="text-sm text-gray-700 leading-relaxed flex-1">
                Vou criar um monitoramento com o seguinte escopo: {mon.scope.sources.map((s) => s.toUpperCase()).join(", ")} · {mon.scope.tributos.join(", ")} · {mon.scope.assuntos.join(", ")}
              </p>
            </div>
          )
        }

        if (msg.type === "monitoring-created" && msg.monitoringId) {
          const mon = monitoramentos.find((m) => m.id === msg.monitoringId)
          return (
            <div key={i} data-monitoring-id={msg.monitoringId} className="flex items-start gap-2">
              <MIcon />
              <div className="space-y-3 flex-1 min-w-0">
                {mon && <MonitoringProposalCard monitoring={mon} onClick={() => onViewMonitoring(mon.id)} />}
                <p className="text-sm text-gray-700 leading-relaxed">Feito. Estarei de olho nesse tema e te aviso quando algo aparecer.</p>
              </div>
            </div>
          )
        }

        // Default: assistant text
        return (
          <div key={i} className="flex items-start gap-2">
            <MIcon />
            <p className="text-sm text-gray-700 leading-relaxed flex-1">{msg.content}</p>
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────

interface ConversationDetailViewProps {
  conversationId: string
  onBack: () => void
  onViewMonitoring: (id: string) => void
  onViewPesquisa: (p: PesquisaData) => void
}

export function ConversationDetailView({ conversationId, onBack, onViewMonitoring, onViewPesquisa }: ConversationDetailViewProps) {
  const conversation = MOCK_CONVERSATIONS.find((c) => c.id === conversationId)
  if (!conversation) return null

  const totalNewMonitoramentoItems = conversation.monitoramentos.reduce((acc, m) => acc + (m.hasNew ? m.newCount : 0), 0)

  const scrollRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [activeDropdown, setActiveDropdown] = useState<"pesquisas" | "monitoramentos" | null>(null)

  useEffect(() => {
    if (!activeDropdown) return
    function handleClick(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [activeDropdown])

  function handleScrollToPesquisa(id: string) {
    setActiveDropdown(null)
    setTimeout(() => {
      const el = scrollRef.current?.querySelector(`[data-pesquisa-id="${id}"]`)
      el?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 50)
  }

  function handleScrollToMonitoring(id: string) {
    setActiveDropdown(null)
    setTimeout(() => {
      const el = scrollRef.current?.querySelector(`[data-monitoring-id="${id}"]`)
      el?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 50)
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white min-w-0">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div ref={headerRef} className="px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
        <div className="max-w-2xl mx-auto w-full">
          <h1 className="text-base font-semibold text-gray-900 mb-3">{conversation.title}</h1>

          {/* Stats row */}
          <div className="flex items-center gap-4">

            {/* Pesquisas dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === "pesquisas" ? null : "pesquisas")}
                className="flex items-center gap-1.5 hover:opacity-60 transition-opacity cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-600">
                  {conversation.pesquisas.length} {conversation.pesquisas.length === 1 ? "documento" : "documentos"}
                </span>
              </button>
              {activeDropdown === "pesquisas" && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-50 w-80 max-h-72 overflow-y-auto">
                  {conversation.pesquisas.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => handleScrollToPesquisa(p.id)}
                      className={cn(
                        "w-full flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 text-left cursor-pointer transition-colors",
                        idx < conversation.pesquisas.length - 1 && "border-b border-gray-50"
                      )}
                    >
                      <BookOpen className={cn("w-3.5 h-3.5 flex-shrink-0 mt-0.5", "text-gray-300")} />
                      <span className="text-sm text-gray-700 leading-snug">{p.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Monitoramentos dropdown */}
            {conversation.monitoramentos.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "monitoramentos" ? null : "monitoramentos")}
                  className="flex items-center gap-1.5 hover:opacity-60 transition-opacity cursor-pointer"
                >
                  <Bell className={cn("w-3.5 h-3.5", totalNewMonitoramentoItems > 0 ? "text-amber-500" : "text-gray-400")} />
                  <span className="text-xs text-gray-600">
                    {conversation.monitoramentos.length} {conversation.monitoramentos.length === 1 ? "monitoramento" : "monitoramentos"}
                  </span>
                  {totalNewMonitoramentoItems > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-amber-100 text-amber-600 text-[9px] font-bold">
                      {totalNewMonitoramentoItems} {totalNewMonitoramentoItems === 1 ? "atualização" : "atualizações"}
                    </span>
                  )}
                </button>
                {activeDropdown === "monitoramentos" && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-50 w-80 max-h-72 overflow-y-auto">
                    {conversation.monitoramentos.map((m, idx) => (
                      <button
                        key={m.id}
                        onClick={() => handleScrollToMonitoring(m.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 text-left cursor-pointer transition-colors",
                          idx < conversation.monitoramentos.length - 1 && "border-b border-gray-50"
                        )}
                      >
                        <Bell className={cn("w-3.5 h-3.5 flex-shrink-0", m.hasNew ? "text-amber-400" : "text-gray-300")} />
                        <span className="text-sm text-gray-700 flex-1 min-w-0 leading-snug">{m.name}</span>
                        {m.hasNew && (
                          <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-white text-[9px] font-bold">
                            {m.newCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Chat history ────────────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-gray-100">
        <div className="max-w-2xl mx-auto w-full">
          <ChatHistory
            messages={conversation.chatMessages}
            pesquisas={conversation.pesquisas}
            monitoramentos={conversation.monitoramentos}
            onViewMonitoring={onViewMonitoring}
            onViewPesquisa={onViewPesquisa}
          />
        </div>
      </div>

      {/* ── Chat input ──────────────────────────────────────────── */}
      <AgenticScopedChat
        placeholder={`Pergunte sobre ${conversation.title}...`}
        replies={CONV_REPLIES}
      />
    </div>
  )
}
