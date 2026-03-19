"use client"

import { useState } from "react"
import { Bell, Pause, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MonitoringSubscription } from "@/lib/monitoring-data"

type SortOrder = "recencia" | "alfabetica"

function MonitoringRow({
  monitoring,
  onClick,
}: {
  monitoring: MonitoringSubscription
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors cursor-pointer group"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Icon */}
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
            monitoring.hasNew ? "bg-amber-100" : "bg-gray-100"
          )}>
            <Bell className={cn("w-3.5 h-3.5", monitoring.hasNew ? "text-amber-500" : "text-gray-400")} />
          </div>

          {/* Name + meta */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className={cn(
                "text-sm font-medium truncate",
                monitoring.hasNew ? "text-gray-900" : "text-gray-700"
              )}>
                {monitoring.name}
              </p>
              {monitoring.status === "paused" && (
                <Pause className="w-3 h-3 text-gray-300 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-gray-400">
              {monitoring.status === "paused"
                ? "Pausado"
                : monitoring.hasNew
                  ? `${monitoring.newCount} ${monitoring.newCount === 1 ? "novidade" : "novidades"} · verificado ${monitoring.lastChecked}`
                  : `Verificado ${monitoring.lastChecked}`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {monitoring.hasNew && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-amber-400 text-white text-[10px] font-bold leading-none">
              {monitoring.newCount}
            </span>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-gray-400 transition-colors" />
        </div>
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
    if (sort === "alfabetica") {
      return a.name.localeCompare(b.name, "pt-BR")
    }
    // recencia: with updates first (by newCount desc), then paused/empty last
    if (a.hasNew !== b.hasNew) return a.hasNew ? -1 : 1
    if (a.newCount !== b.newCount) return b.newCount - a.newCount
    if (a.status !== b.status) return a.status === "active" ? -1 : 1
    return 0
  })

  const totalUpdates = monitorings.reduce((acc, m) => acc + (m.newCount ?? 0), 0)

  return (
    <div className="flex-1 flex flex-col h-full bg-white min-w-0">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
        <div className="max-w-xl mx-auto w-full flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">Monitoramentos</h1>
            {totalUpdates > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">
                {totalUpdates} {totalUpdates === 1 ? "atualização ainda não vista" : "atualizações ainda não vistas"}
              </p>
            )}
          </div>

          {/* Sort toggle */}
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
            <p className="text-sm text-gray-400 text-center py-16">Nenhum monitoramento ainda.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {sorted.map((m) => (
                <MonitoringRow key={m.id} monitoring={m} onClick={() => onSelectMonitoring(m.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
