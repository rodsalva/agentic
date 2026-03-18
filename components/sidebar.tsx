"use client"

import { useState } from "react"
import { ChevronLeft, LogOut, BookOpen, Bell, Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MonitoringSubscription } from "@/lib/monitoring-data"

export type MonitoringType = "pesquisa" | "monitoramento"

export interface Conversation {
  id: string
  title: string
  pesquisas: number
  monitoramentos: number
  monitoramentosNew: number
}

const conversations: Conversation[] = [
  { id: "1",  title: "Nova Conversa",             pesquisas: 0, monitoramentos: 0, monitoramentosNew: 0 },
  { id: "2",  title: "Questão Tributária Gen...",  pesquisas: 3, monitoramentos: 2, monitoramentosNew: 1 },
  { id: "5",  title: "Legislação IRPF Pensã...",  pesquisas: 1, monitoramentos: 0, monitoramentosNew: 0 },
  { id: "6",  title: "Transfer Pricing 2024",     pesquisas: 4, monitoramentos: 1, monitoramentosNew: 1 },
  { id: "7",  title: "Tributação de Pensão ...",  pesquisas: 2, monitoramentos: 3, monitoramentosNew: 2 },
  { id: "8",  title: "Tratamento Tributário ...", pesquisas: 0, monitoramentos: 1, monitoramentosNew: 0 },
  { id: "9",  title: "como a manor foi feita",    pesquisas: 1, monitoramentos: 0, monitoramentosNew: 0 },
  { id: "10", title: "o flamengo joga quand...",  pesquisas: 2, monitoramentos: 0, monitoramentosNew: 0 },
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
  chatMonitoringCount: number
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
  chatMonitoringCount,
}: SidebarProps) {

  if (!isOpen) {
    return <CollapsedSidebar onToggle={onToggle} monitorings={monitorings} />
  }

  return (
    <div className="w-64 border-r border-gray-200 flex flex-col h-full bg-white">

      {/* MANOR header */}
      <div className="px-4 pt-5 pb-4 flex items-center justify-between">
        <a href="/" className="cursor-pointer">
          <img src="/manor-01.svg" alt="Manor" className="h-5 w-auto" />
        </a>
        <button onClick={onToggle} className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>


      {/* ── CONVERSAS section ─────────────────────────────────────── */}
      <div className="px-4 pb-1 mt-6 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Conversas
        </span>
        <div className="flex items-center gap-2">
          <a href="/" className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
          </a>
          <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2">

        {/* Active conversation — current chat session */}
        <div className="px-2 py-3 rounded-lg bg-gray-50 cursor-pointer group mb-1">
          <span className="text-sm text-gray-700 truncate block mb-1.5">Conversa atual</span>
          {chatMonitoringCount > 0 && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-0.5 text-amber-500">
                <Bell className="w-3 h-3" />
                <span className="text-[10px] leading-none">{chatMonitoringCount}</span>
              </span>
            </div>
          )}
        </div>

        {conversations.map((conv) => (
          <div
            key={conv.id}
            className="px-2 py-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
          >
            {/* Title */}
            <span className="text-sm text-gray-700 truncate block mb-1.5">{conv.title}</span>

            {/* Icons row — only if there's something to show */}
            {(conv.pesquisas > 0 || conv.monitoramentos > 0) && (
              <div className="flex items-center gap-3">

                {/* Pesquisa */}
                {conv.pesquisas > 0 && (
                  <span className="flex items-center gap-0.5 text-gray-300 group-hover:text-gray-400">
                    <BookOpen className="w-3 h-3" />
                    <span className="text-[10px] leading-none">{conv.pesquisas}</span>
                  </span>
                )}

                {/* Monitoramento */}
                {conv.monitoramentos > 0 && (
                  <span className={cn(
                    "flex items-center gap-0.5 relative",
                    conv.monitoramentosNew > 0
                      ? "text-amber-500"
                      : "text-gray-300 group-hover:text-gray-400"
                  )}>
                    <Bell className="w-3 h-3" />
                    <span className="text-[10px] leading-none">{conv.monitoramentos}</span>
                    {conv.monitoramentosNew > 0 && (
                      <span className="ml-0.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-amber-400 text-white text-[8px] font-bold leading-none">
                        {conv.monitoramentosNew}
                      </span>
                    )}
                  </span>
                )}

              </div>
            )}
          </div>
        ))}
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
