"use client"

import { cn } from "@/lib/utils"
import { ManorAvatar } from "./manor-avatar"
import type { MonitoringSubscription, SourceType } from "@/lib/monitoring-data"

// ── Manor-voiced summaries ─────────────────────────────────────────

const MANOR_VOICE: Record<string, string> = {
  "mon-1": "Novo precedente do CARF reforça vedação ao ágio interno. Quem tem estruturas ativas precisa ver isso antes do encerramento do exercício.",
  "mon-2": "STJ ampliou o conceito de insumos para serviços. Pode abrir créditos retroativos de PIS/COFINS que você ainda não aproveitou.",
  "mon-3": "Reforma tributária segue o cronograma publicado. Sem urgências por agora, mas o prazo de transição se aproxima.",
}

const SOURCE_LABELS: Record<SourceType, string> = {
  stf: "STF", stj: "STJ", trf: "TRF",
  receita: "RFB", dou: "DOU", carf: "CARF",
}

// ── Feed Card ──────────────────────────────────────────────────────

function FeedCard({
  monitoring,
  onOpenChat,
  onSelectMonitoring,
}: {
  monitoring: MonitoringSubscription
  onOpenChat: (m: MonitoringSubscription) => void
  onSelectMonitoring: (id: string) => void
}) {
  const isPaused = monitoring.status === "paused"
  const hasNew = monitoring.hasNew
  const summary = MANOR_VOICE[monitoring.id] ?? monitoring.impactSummary

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-5 flex flex-col gap-3.5 transition-all duration-300",
        hasNew
          ? "border-2 border-amber-200 animate-manor-card"
          : "border border-gray-100 hover:border-gray-200 hover:shadow-sm"
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {hasNew && (
            <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 animate-manor-dot" />
          )}
          {isPaused && (
            <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
          )}
          <p className="text-sm font-semibold text-gray-900 truncate">{monitoring.name}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {hasNew && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              {monitoring.newCount} {monitoring.newCount === 1 ? "nova" : "novas"}
            </span>
          )}
          {isPaused && (
            <span className="text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
              pausado
            </span>
          )}
        </div>
      </div>

      {/* Manor voice summary */}
      {!isPaused && (
        <div className="flex items-start gap-2">
          <ManorAvatar
            state={hasNew ? "active" : "idle"}
            size="xs"
            className="mt-0.5 flex-shrink-0"
          />
          <p className="text-xs text-gray-600 leading-relaxed">
            "{summary}"
          </p>
        </div>
      )}

      {isPaused && (
        <p className="text-xs text-gray-400 leading-relaxed pl-4">
          Monitoramento pausado. Clique em "Perguntar" para retomar ou ajustar.
        </p>
      )}

      {/* Scope chips */}
      <div className="flex flex-wrap gap-1">
        {monitoring.scope.sources.slice(0, 3).map((s) => (
          <span
            key={s}
            className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-md font-medium"
          >
            {SOURCE_LABELS[s]}
          </span>
        ))}
        {monitoring.scope.tributos.slice(0, 2).map((t) => (
          <span
            key={t}
            className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-md"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Action chips */}
      <div className="flex items-center gap-2 pt-0.5 border-t border-gray-50">
        <button
          onClick={() => onOpenChat(monitoring)}
          className={cn(
            "flex-1 py-2 text-xs font-medium rounded-xl transition-all duration-150",
            hasNew
              ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-500 hover:text-white hover:border-amber-500"
              : "bg-gray-50 text-gray-700 border border-gray-100 hover:bg-gray-900 hover:text-white hover:border-gray-900"
          )}
        >
          {hasNew ? "Entender" : "Perguntar"}
        </button>
        <button
          onClick={() => onSelectMonitoring(monitoring.id)}
          className="flex-1 py-2 text-xs font-medium rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
        >
          Ver tudo
        </button>
      </div>
    </div>
  )
}

// ── ManorFeed ──────────────────────────────────────────────────────

interface ManorFeedProps {
  monitorings: MonitoringSubscription[]
  onOpenChat: (monitoring: MonitoringSubscription) => void
  onSelectMonitoring: (id: string) => void
  onNewMonitoring?: () => void
}

export function ManorFeed({
  monitorings,
  onOpenChat,
  onSelectMonitoring,
  onNewMonitoring,
}: ManorFeedProps) {
  const totalNew = monitorings.reduce((acc, m) => acc + (m.newCount ?? 0), 0)
  const hasNews = totalNew > 0

  const sorted = [...monitorings].sort((a, b) => {
    if (a.hasNew !== b.hasNew) return a.hasNew ? -1 : 1
    if (a.newCount !== b.newCount) return b.newCount - a.newCount
    if (a.status !== b.status) return a.status === "active" ? -1 : 1
    return 0
  })

  return (
    <div className="flex-1 flex flex-col h-full bg-white min-w-0">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 flex-shrink-0 border-b border-gray-50">
        <div className="max-w-xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <ManorAvatar
              state={hasNews ? "active" : "idle"}
              size="md"
              hasNews={hasNews}
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-semibold text-gray-900">
                {hasNews
                  ? `Tenho ${totalNew} ${totalNew === 1 ? "novidade" : "novidades"} para você`
                  : "Tudo em dia"}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {monitorings.length === 0
                  ? "Nenhum monitoramento ativo"
                  : `${monitorings.length} ${monitorings.length === 1 ? "monitoramento ativo" : "monitoramentos ativos"}`}
              </p>
            </div>
            {onNewMonitoring && (
              <button
                onClick={onNewMonitoring}
                className="text-xs text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                + Novo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feed list */}
      <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-gray-100">
        <div className="max-w-xl mx-auto w-full px-6 py-5 space-y-3">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <ManorAvatar state="waiting" size="xl" />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Nenhum monitoramento ainda</p>
                <p className="text-xs text-gray-400 leading-relaxed max-w-[200px] mx-auto">
                  Me conta um tema e eu fico de olho por você.
                </p>
              </div>
              {onNewMonitoring && (
                <button
                  onClick={onNewMonitoring}
                  className="px-4 py-2 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Criar monitoramento
                </button>
              )}
            </div>
          ) : (
            sorted.map((m) => (
              <FeedCard
                key={m.id}
                monitoring={m}
                onOpenChat={onOpenChat}
                onSelectMonitoring={onSelectMonitoring}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
