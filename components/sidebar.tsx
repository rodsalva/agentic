"use client"

import { useState } from "react"
import { ChevronLeft, ChevronDown, LogOut, Bell, Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MonitoringSubscription } from "@/lib/monitoring-data"

// ── Conversations (unchanged) ─────────────────────────────────────

export type MonitoringType = "pesquisa" | "monitoramento"

export interface Conversation {
  id: string
  title: string
}

const conversations: Conversation[] = [
  { id: "1", title: "Nova Conversa" },
  { id: "2", title: "Questão Tributária Gen..." },
  { id: "5", title: "Legislação IRPF Pensã..." },
  { id: "6", title: "Transfer Pricing 2024" },
  { id: "7", title: "Tributação de Pensão ..." },
  { id: "8", title: "Tratamento Tributário ..." },
  { id: "9", title: "como a manor foi feita" },
  { id: "10", title: "o flamengo joga quand..." },
]

// ── Props ─────────────────────────────────────────────────────────

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  monitorings: MonitoringSubscription[]
  selectedMonitoringId: string | null
  onSelectMonitoring: (id: string) => void
  onNewMonitoring: () => void
  onNewPesquisa: () => void
}

// ── Collapsed sidebar ─────────────────────────────────────────────

function CollapsedSidebar({
  onToggle,
  monitorings,
}: {
  onToggle: () => void
  monitorings: MonitoringSubscription[]
}) {
  const totalNew = monitorings.filter((m) => m.hasNew).length

  return (
    <div className="w-12 border-r border-gray-200 flex flex-col items-center py-4 gap-4">
      <button onClick={onToggle} className="text-gray-400 hover:text-gray-600">
        <ChevronLeft className="w-4 h-4 rotate-180" />
      </button>
      {totalNew > 0 && (
        <div className="relative">
          <Bell className="w-4 h-4 text-gray-400" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
        </div>
      )}
    </div>
  )
}

// ── Main sidebar ──────────────────────────────────────────────────

export function Sidebar({
  isOpen,
  onToggle,
  monitorings,
  selectedMonitoringId,
  onSelectMonitoring,
  onNewMonitoring,
  onNewPesquisa,
}: SidebarProps) {

  if (!isOpen) {
    return <CollapsedSidebar onToggle={onToggle} monitorings={monitorings} />
  }

  const totalNew = monitorings.reduce((acc, m) => acc + (m.hasNew ? m.newCount : 0), 0)

  return (
    <div className="w-72 border-r border-gray-200 flex flex-col h-full bg-white">

      {/* Collapse button — top */}
      <div className="px-4 pt-4 pb-0">
        <button onClick={onToggle} className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Nova Conversa + search */}
      <div className="px-4 pt-8 pb-3 flex items-center justify-between gap-2">
        <button
          onClick={onNewPesquisa}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer flex-1"
        >
          <Plus className="w-3.5 h-3.5 text-gray-400" />
          Nova Conversa
        </button>
        <button className="text-gray-400 hover:text-gray-600 flex-shrink-0 cursor-pointer">
          <Search className="w-4 h-4" />
        </button>
      </div>


      {/* ── MONITORAMENTOS section ───────────────────────────────── */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Monitoramentos
          </span>
          {totalNew > 0 && (
            <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-amber-100 text-amber-600 text-[9px] font-bold">
              {totalNew}
            </span>
          )}
        </div>

        {/* Monitoring items */}
        <div className="space-y-0.5">
          {monitorings.length === 0 ? (
            <button
              onClick={onNewMonitoring}
              className="w-full text-left px-2 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              + Criar primeiro monitoramento
            </button>
          ) : (
            monitorings.map((mon) => (
              <button
                key={mon.id}
                onClick={() => onSelectMonitoring(mon.id)}
                className={cn(
                  "w-full text-left px-2 py-2 rounded-lg flex items-center justify-between gap-2 transition-colors cursor-pointer group",
                  selectedMonitoringId === mon.id
                    ? "bg-amber-50"
                    : "hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      "text-sm truncate",
                      selectedMonitoringId === mon.id
                        ? "text-gray-900 font-medium"
                        : "text-gray-600 font-normal",
                      mon.hasNew && "text-gray-900 font-medium"
                    )}
                  >
                    {mon.name}
                  </span>
                </div>
                <span className={cn(
                  "flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md",
                  mon.hasNew
                    ? "text-amber-600 bg-amber-100"
                    : "text-gray-400 bg-gray-100"
                )}>
                  {mon.newCount}
                </span>
              </button>
            ))
          )}
        </div>
      </div>


      {/* ── PESQUISAS section ────────────────────────────────────── */}
      <div className="px-4 pb-1 mt-4">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Pesquisas
        </span>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className="px-2 mx-2 py-2 rounded-lg flex items-center hover:bg-gray-50 cursor-pointer"
          >
            <span className="text-sm text-gray-600 truncate">
              {conv.title}
            </span>
          </div>
        ))}
      </div>

      {/* Ver mais */}
      <div className="px-4 py-3 border-t border-gray-100">
        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ChevronDown className="w-4 h-4" />
          <span>Ver mais</span>
        </button>
      </div>

      {/* User profile */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            <img
              src="/male-user-avatar.png"
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">Rodrigo Salvador</span>
            <span className="text-xs text-gray-500">rodsalva@gmail.com</span>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
