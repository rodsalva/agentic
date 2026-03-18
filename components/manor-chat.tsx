"use client"

import { useState, useCallback } from "react"
import { Sidebar } from "./sidebar"
import { ChatArea } from "./chat-area-v2"
import { MonitoringDetailView } from "./monitoring-detail-view"
import { ConversationDetailView } from "./conversation-detail-view"
import { MOCK_MONITORINGS, type MonitoringSubscription } from "@/lib/monitoring-data"
import { MOCK_CONVERSATIONS } from "@/lib/conversation-data"

export type InputMode = "default" | "pesquisar" | "monitorar"

export function ManorChat() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [monitorings, setMonitorings] = useState<MonitoringSubscription[]>(MOCK_MONITORINGS)
  const [selectedMonitoringId, setSelectedMonitoringId] = useState<string | null>(null)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [inputMode, setInputMode] = useState<InputMode>("default")
  const [chatMonitoringCount, setChatMonitoringCount] = useState(0)
  const [hasChatMessages, setHasChatMessages] = useState(false)

  // Collect all monitorings from conversations so detail view works
  const allConversationMonitorings = MOCK_CONVERSATIONS.flatMap((c) => c.monitoramentos)

  const handleSelectMonitoring = useCallback((id: string) => {
    // Find in global list first, then conversation monitorings
    setSelectedMonitoringId(id)
    setMonitorings((prev) =>
      prev.map((m) => m.id === id ? { ...m, hasNew: false, newCount: 0 } : m)
    )
  }, [])

  const handleSelectConversation = useCallback((id: string) => {
    setSelectedConversationId(id)
    setSelectedMonitoringId(null)
  }, [])

  const handleBackToChat = useCallback(() => {
    setSelectedMonitoringId(null)
    setSelectedConversationId(null)
  }, [])

  const handleBackFromMonitoringToConversation = useCallback(() => {
    setSelectedMonitoringId(null)
  }, [])

  const handleNewMonitoring = useCallback(() => {
    setSelectedMonitoringId(null)
    setSelectedConversationId(null)
    setInputMode("monitorar")
  }, [])

  const handleNewPesquisa = useCallback(() => {
    setSelectedMonitoringId(null)
    setSelectedConversationId(null)
    setInputMode("pesquisar")
  }, [])

  const handleAddMonitoring = useCallback((monitoring: MonitoringSubscription) => {
    setMonitorings((prev) => [monitoring, ...prev])
    setSelectedMonitoringId(monitoring.id)
    setSelectedConversationId(null)
    setInputMode("default")
  }, [])

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

  const handleFirstMessage = useCallback(() => {
    setHasChatMessages(true)
  }, [])

  // Resolve the selected monitoring — check both global and conversation monitorings
  const selectedMonitoring =
    monitorings.find((m) => m.id === selectedMonitoringId) ??
    allConversationMonitorings.find((m) => m.id === selectedMonitoringId) ??
    null

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        monitorings={monitorings}
        selectedMonitoringId={selectedMonitoringId}
        selectedConversationId={selectedConversationId}
        onSelectMonitoring={handleSelectMonitoring}
        onSelectConversation={handleSelectConversation}
        onNewMonitoring={handleNewMonitoring}
        onNewPesquisa={handleNewPesquisa}
        chatMonitoringCount={chatMonitoringCount}
        hasChatMessages={hasChatMessages}
      />

      {selectedMonitoring ? (
        <MonitoringDetailView
          monitoring={selectedMonitoring}
          onBack={selectedConversationId ? handleBackFromMonitoringToConversation : handleBackToChat}
          onTogglePause={handleTogglePause}
        />
      ) : selectedConversationId ? (
        <ConversationDetailView
          conversationId={selectedConversationId}
          onBack={handleBackToChat}
          onViewMonitoring={handleSelectMonitoring}
        />
      ) : (
        <ChatArea
          monitorings={monitorings}
          inputMode={inputMode}
          onSetInputMode={setInputMode}
          onViewMonitoring={handleSelectMonitoring}
          onAddMonitoring={handleAddMonitoring}
          onCreateMonitoringFromChat={handleAddMonitoringFromChat}
          onFirstMessage={handleFirstMessage}
        />
      )}
    </div>
  )
}
