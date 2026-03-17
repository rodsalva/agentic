"use client"

import { useState } from "react"
import { ChevronLeft, Search, ChevronDown, LogOut, Bell, FileSearch } from "lucide-react"
import { cn } from "@/lib/utils"

export type MonitoringType = "pesquisa" | "monitoramento"

export interface Conversation {
  id: string
  title: string
  unread: boolean
  hasMonitoramento?: boolean
  hasPesquisa?: boolean
  hasNewAlerts?: boolean
}

const conversations: Conversation[] = [
  { id: "1", title: "Nova Conversa", unread: true },
  { id: "2", title: "Questão Tributária Gen...", unread: true },
  { id: "3", title: "Ágio Interno · CARF", unread: true, hasMonitoramento: true, hasNewAlerts: true },
  { id: "4", title: "PIS/COFINS · STJ", unread: false, hasMonitoramento: true, hasPesquisa: true, hasNewAlerts: true },
  { id: "5", title: "Legislação IRPF Pensã...", unread: true },
  { id: "6", title: "Transfer Pricing 2024", unread: false, hasPesquisa: true },
  { id: "7", title: "Tributação de Pensão ...", unread: true },
  { id: "8", title: "Tratamento Tributário ...", unread: true },
  { id: "9", title: "como a manor foi feita", unread: true },
  { id: "10", title: "o flamengo joga quand...", unread: true },
]

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"todas" | "nao-lidas">("todas")

  if (!isOpen) {
    return (
      <div className="w-12 border-r border-gray-200 flex flex-col items-center py-4">
        <button onClick={onToggle} className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </button>
      </div>
    )
  }

  return (
    <div className="w-72 border-r border-gray-200 flex flex-col h-full">
      {/* Collapse button */}
      <div className="p-4 pb-2">
        <button onClick={onToggle} className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* New conversation */}
      <div className="px-4 py-3 flex items-center justify-between">
        <span className="text-base text-gray-700">+ Nova Conversa</span>
        <Search className="w-4 h-4 text-gray-400" />
      </div>

      {/* Tabs */}
      <div className="px-4 py-3 flex gap-4">
        <button
          onClick={() => setActiveTab("todas")}
          className={cn("text-base", activeTab === "todas" ? "text-blue-600 font-medium" : "text-gray-500")}
        >
          Todas
        </button>
        <button
          onClick={() => setActiveTab("nao-lidas")}
          className={cn("text-base", activeTab === "nao-lidas" ? "text-blue-600 font-medium" : "text-gray-500")}
        >
          Não lidas
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <div key={conv.id} className="px-4 py-2.5 flex items-start justify-between hover:bg-gray-50 cursor-pointer group">
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <span className="text-sm font-medium text-gray-700 truncate pr-2">{conv.title}</span>
              {(conv.hasMonitoramento || conv.hasPesquisa) && (
                <div className="flex items-center gap-1 mt-0.5">
                  {conv.hasNewAlerts && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  )}
                  {conv.hasMonitoramento && (
                    <Bell className="w-3 h-3 text-gray-400" />
                  )}
                  {conv.hasPesquisa && (
                    <FileSearch className="w-3 h-3 text-gray-400" />
                  )}
                </div>
              )}
            </div>
            {conv.unread && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></span>}
          </div>
        ))}
      </div>

      {/* Ver mais */}
      <div className="px-4 py-3 border-t border-gray-100">
        <button className="flex items-center gap-1 text-base text-gray-500 hover:text-gray-700">
          <ChevronDown className="w-4 h-4" />
          <span>Ver mais</span>
        </button>
      </div>

      {/* User profile */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            <img src="/male-user-avatar.png" alt="User avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-medium text-gray-900">Rodrigo Salvador</span>
            <span className="text-sm text-gray-500">rodsalva@gmail.com</span>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
