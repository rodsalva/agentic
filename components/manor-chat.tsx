"use client"

import { useState, useCallback } from "react"
import { Sidebar } from "./sidebar"
import { ChatArea } from "./chat-area-v2"
import { MonitoringDetailView } from "./monitoring-detail-view"
import { MOCK_MONITORINGS, type MonitoringSubscription } from "@/lib/monitoring-data"

export type InputMode = "default" | "pesquisar" | "monitorar"

export function ManorChat() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [monitorings, setMonitorings] = useState<MonitoringSubscription[]>(MOCK_MONITORINGS)
  const [selectedMonitoringId, setSelectedMonitoringId] = useState<string | null>(null)
  const [inputMode, setInputMode] = useState<InputMode>("default")
  const [chatMonitoringCount, setChatMonitoringCount] = useState(0)

  const handleSelectMonitoring = useCallback((id: string) => {
    setSelectedMonitoringId(id)
    setMonitorings((prev) =>
      prev.map((m) => m.id === id ? { ...m, hasNew: false, newCount: 0 } : m)
    )
  }, [])

  const handleBackToChat = useCallback(() => {
    setSelectedMonitoringId(null)
  }, [])

  const handleNewMonitoring = useCallback(() => {
    setSelectedMonitoringId(null)
    setInputMode("monitorar")
  }, [])

  const handleNewPesquisa = useCallback(() => {
    setSelectedMonitoringId(null)
    setInputMode("pesquisar")
  }, [])

  const handleAddMonitoring = useCallback((monitoring: MonitoringSubscription) => {
    setMonitorings((prev) => [monitoring, ...prev])
    setSelectedMonitoringId(monitoring.id)
    setInputMode("default")
  }, [])

  // Add monitoring from chat flow — does not navigate to detail view
  const handleAddMonitoringFromChat = useCallback((monitoring: MonitoringSubscription) => {
    setMonitorings((prev) => [monitoring, ...prev])
    setChatMonitoringCount((c) => c + 1)
    setInputMode("default")
  }, [])

  const handleTogglePause = useCallback((id: string) => {
    setMonitorings((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: m.status === "active" ? "paused" : "active" } : m
      )
    )
  }, [])

  const selectedMonitoring = monitorings.find((m) => m.id === selectedMonitoringId) ?? null

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        monitorings={monitorings}
        selectedMonitoringId={selectedMonitoringId}
        onSelectMonitoring={handleSelectMonitoring}
        onNewMonitoring={handleNewMonitoring}
        onNewPesquisa={handleNewPesquisa}
        chatMonitoringCount={chatMonitoringCount}
      />

      {selectedMonitoring ? (
        <MonitoringDetailView
          monitoring={selectedMonitoring}
          onBack={handleBackToChat}
          onTogglePause={handleTogglePause}
        />
      ) : (
        <ChatArea
          monitorings={monitorings}
          inputMode={inputMode}
          onSetInputMode={setInputMode}
          onViewMonitoring={handleSelectMonitoring}
          onAddMonitoring={handleAddMonitoring}
          onCreateMonitoringFromChat={handleAddMonitoringFromChat}
        />
      )}
    </div>
  )
}
