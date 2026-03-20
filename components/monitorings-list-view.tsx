"use client"

import { useState } from "react"
import { Bell, Pause, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MonitoringSubscription, SourceType } from "@/lib/monitoring-data"

type SortOrder = "recencia" | "alfabetica"

const SOURCE_LABELS: Record<SourceType, string> = {
  stf: "STF",
  stj: "STJ",
  trf: "TRF",
  receita: "Receita Federal",
  dou: "DOU",
  carf: "CARF",
}

function MonitoringCard({
  monitoring,
  onClick,
}: {
  monitoring: MonitoringSubscription
  onClick: () => void
}) {
  const isPaused = monitoring.status === "paused"

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer group flex flex-col gap-4"
    >
      {/* ── Top row: icon + name + badge ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            {isPaused
              ? <Pause className="w-[18px] h-[18px] text-gray-400" />
              : <Bell className="w-[18px] h-[18px] text-gray-500" />
            }
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="text-sm font-semibold text-gray-900 leading-snug">{monitoring.name}</p>
            <p className="text-[11px] text-gray-400 mt-1">
              {isPaused ? "Pausado" : `Verificado ${monitoring.lastChecked}`}
            </p>
          </div>
        </div>
        {monitoring.hasNew && (
          <span className="flex-shrink-0 px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded-lg leading-none">
            {monitoring.newCount} {monitoring.newCount === 1 ? "atualização" : "atualizações"}
          </span>
        )}
      </div>

      {/* ── Scope tags ── */}
      <div className="flex flex-wrap gap-1.5">
        {monitoring.scope.sources.map((s) => (
          <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-medium rounded-md">
            {SOURCE_LABELS[s]}
          </span>
        ))}
        {monitoring.scope.tributos.map((t) => (
          <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[11px] rounded-md">
            {t}
          </span>
        ))}
        {monitoring.scope.assuntos.map((a) => (
          <span key={a} className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[11px] rounded-md border border-gray-100">
            {a}
          </span>
        ))}
      </div>

      {/* ── Impact summary ── */}
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
        {monitoring.impactSummary}
      </p>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <p className="text-[11px] text-gray-400">
          {monitoring.items.length} {monitoring.items.length === 1 ? "item" : "itens"} monitorados
        </p>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
      </div>
    </button>
  )
}

export function MonitoringsListView({
  monitorings,
  onSelectMonitoring,
}: {
  monitorings: MonitoringSubscription[]
  onSelectMonitoring: (id: string) => void
}) {
  const [sort, setSort] = useState<SortOrder>("recencia")

  const sorted = [...monitorings].sort((a, b) => {
    if (sort === "alfabetica") return a.name.localeCompare(b.name, "pt-BR")
    if (a.hasNew !== b.hasNew) return a.hasNew ? -1 : 1
    if (a.newCount !== b.newCount) return b.newCount - a.newCount
    if (a.status !== b.status) return a.status === "active" ? -1 : 1
    return 0
  })

  const totalUpdates = monitorings.reduce((acc, m) => acc + (m.newCount ?? 0), 0)

  return (
    <div className="flex-1 flex flex-col h-full bg-white min-w-0">

      {/* ── Header ── */}
      <div className="px-8 pt-6 pb-5 border-b border-gray-100 flex-shrink-0">
        <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">Monitoramentos</h1>
            {totalUpdates > 0 ? (
              <p className="text-xs text-gray-400 mt-0.5">
                {totalUpdates} {totalUpdates === 1 ? "atualização ainda não vista" : "atualizações ainda não vistas"}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-0.5">{monitorings.length} ativos</p>
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

      {/* ── Grid ── */}
      <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-gray-100">
        <div className="max-w-3xl mx-auto w-full px-8 py-6">
          {sorted.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-20">Nenhum monitoramento ainda.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {sorted.map((m) => (
                <MonitoringCard key={m.id} monitoring={m} onClick={() => onSelectMonitoring(m.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
