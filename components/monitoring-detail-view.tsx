"use client"

import { useState, useRef } from "react"
import { ArrowLeft, Send, Loader2, Pause, Play, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MonitoringSubscription, MonitoringItem } from "@/lib/monitoring-data"

// ── Scoped chat ───────────────────────────────────────────────────

const MOCK_REPLIES = [
  "Com base nas atualizações recentes, o CARF e o STJ convergem para vedação à amortização de ágio interno. Recomendo revisar operações com estrutura societária semelhante.",
  "A comprovação de propósito negocial genuíno é o elemento central. Documente a racionalidade econômica de cada etapa da operação.",
  "Não há precedentes favoráveis recentes neste monitoramento. O entendimento restritivo parece consolidado nas duas instâncias.",
]

function ScopedChat({ name }: { name: string }) {
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

// ── Item detail ───────────────────────────────────────────────────

function ItemDetail({ item, onBack }: { item: MonitoringItem; onBack: () => void }) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 max-w-xl mx-auto w-full">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-8 cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Voltar
      </button>

      {/* O que mudou */}
      <div className="mb-6">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">O que mudou</p>
        <h2 className="text-base font-medium text-gray-900 mb-2 leading-snug">{item.title}</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{item.ementa}</p>
      </div>

      {/* Onde */}
      <div className="mb-6 border-t border-gray-100 pt-5">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Onde</p>
        <div className="space-y-2 text-sm">
          <div className="flex gap-6">
            <span className="text-gray-400 w-16 flex-shrink-0">Órgão</span>
            <span className="text-gray-700">{item.orgao}</span>
          </div>
          {item.turma && (
            <div className="flex gap-6">
              <span className="text-gray-400 w-16 flex-shrink-0">Turma</span>
              <span className="text-gray-700">{item.turma}</span>
            </div>
          )}
          {item.relator && (
            <div className="flex gap-6">
              <span className="text-gray-400 w-16 flex-shrink-0">Relator</span>
              <span className="text-gray-700">{item.relator}</span>
            </div>
          )}
          <div className="flex gap-6">
            <span className="text-gray-400 w-16 flex-shrink-0">Data</span>
            <span className="text-gray-700">{item.date}</span>
          </div>
        </div>
      </div>

      {/* Implicações */}
      {item.implications && (
        <div className="mb-6 border-t border-gray-100 pt-5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Implicações</p>
          <p className="text-sm text-gray-600 leading-relaxed">{item.implications}</p>
        </div>
      )}
    </div>
  )
}

// ── Item row ──────────────────────────────────────────────────────

function ItemRow({ item, onClick }: { item: MonitoringItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] text-gray-400 uppercase tracking-wide">
              {item.source.toUpperCase()} · {item.date}
            </span>
            {item.isNew && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm font-medium text-gray-900 leading-snug mb-1.5">{item.title}</p>
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{item.ementa}</p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-gray-400 flex-shrink-0 mt-1 transition-colors" />
      </div>
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────

interface MonitoringDetailViewProps {
  monitoring: MonitoringSubscription
  onBack: () => void
  onTogglePause: (id: string) => void
}

export function MonitoringDetailView({ monitoring, onBack, onTogglePause }: MonitoringDetailViewProps) {
  const [selectedItem, setSelectedItem] = useState<MonitoringItem | null>(null)
  const newItems = monitoring.items.filter((i) => i.isNew)
  const oldItems = monitoring.items.filter((i) => !i.isNew)

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
              <h1 className="text-sm font-medium text-gray-900">{monitoring.name}</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {monitoring.status === "paused"
                  ? "Pausado"
                  : `Verificado ${monitoring.lastChecked}${monitoring.newCount > 0 ? ` · ${monitoring.newCount} ${monitoring.newCount === 1 ? "novidade" : "atualizações"}` : ""}`
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => onTogglePause(monitoring.id)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            {monitoring.status === "paused"
              ? <><Play className="w-3.5 h-3.5" /> Retomar</>
              : <><Pause className="w-3.5 h-3.5" /> Pausar</>
            }
          </button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-gray-100">

        {selectedItem ? (
          <ItemDetail item={selectedItem} onBack={() => setSelectedItem(null)} />
        ) : (
          <div className="max-w-xl mx-auto w-full px-6 py-6">

            {/* Empty state */}
            {monitoring.items.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-12">
                Nenhuma atualização ainda.
              </p>
            )}

            {/* New items */}
            {newItems.length > 0 && (
              <div className="mb-6">
                <div className="divide-y divide-gray-50">
                  {newItems.map((item) => (
                    <ItemRow key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                  ))}
                </div>
              </div>
            )}

            {/* Impact summary */}
            {monitoring.impactSummary && (
              <div className="mb-6 pb-6 border-b border-gray-100">
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Análise de impacto</p>
                <p className="text-sm text-gray-600 leading-relaxed">{monitoring.impactSummary}</p>
              </div>
            )}

            {/* Suggestions */}
            {monitoring.suggestions.length > 0 && (
              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex flex-col gap-1">
                  {monitoring.suggestions.map((s, i) => (
                    <button
                      key={i}
                      className="text-left text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer py-0.5"
                    >
                      {s} →
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Older items */}
            {oldItems.length > 0 && (
              <div>
                {newItems.length > 0 && (
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Anteriores</p>
                )}
                <div className="divide-y divide-gray-50">
                  {oldItems.map((item) => (
                    <ItemRow key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Chat ───────────────────────────────────────────────── */}
      {!selectedItem && (
        <div className="flex-shrink-0 max-w-xl mx-auto w-full">
          <ScopedChat name={monitoring.name} />
        </div>
      )}
    </div>
  )
}
