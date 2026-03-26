"use client"

import { useState, useCallback, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { ChatArea } from "./chat-area-v2"
import { MonitoringDetailView } from "./monitoring-detail-view"
import { ConversationDetailView } from "./conversation-detail-view"
import { PesquisaDetailView } from "./pesquisa-detail-view"
import { DigestView } from "./digest-view"
import { ManorFeed } from "./manor-feed"
import { DocumentsListView } from "./documents-list-view"
import { InlineChat, GENERAL_MONITORING_ID } from "./inline-chat"
import { ManorDialog, type DialogData } from "./manor-dialog"
import { MOCK_MONITORINGS, type MonitoringSubscription, type MonitoringItem } from "@/lib/monitoring-data"
import { MOCK_CONVERSATIONS, type PesquisaData } from "@/lib/conversation-data"
import { DocumentViewerPanel } from "./document-viewer-panel"
import dynamic from "next/dynamic"
const ManorSpace = dynamic(() => import("./manor-space").then(m => m.ManorSpace), { ssr: false })
import { type ActiveChatContext } from "./sidebar"
import { findDocument } from "@/lib/document-data"
import { LitigationMapView } from "./litigation-map-view"

export type InputMode = "default" | "pesquisar" | "monitorar"

export function ManorChat() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [monitorings, setMonitorings] = useState<MonitoringSubscription[]>(MOCK_MONITORINGS)
  const [selectedMonitoringId, setSelectedMonitoringId] = useState<string | null>(null)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [selectedPesquisa, setSelectedPesquisa] = useState<PesquisaData | null>(null)
  const [showDigest, setShowDigest] = useState(false)
  const [showMonitoringsList, setShowMonitoringsList] = useState(false)
  const [showDocumentsList, setShowDocumentsList] = useState(false)
  const [showLitigationMap, setShowLitigationMap] = useState(false)
  const [inputMode, setInputMode] = useState<InputMode>("default")
  const [chatMonitoringCount, setChatMonitoringCount] = useState(0)
  const [hasChatMessages, setHasChatMessages] = useState(false)
  const [pendingDigestMessage, setPendingDigestMessage] = useState<string | null>(null)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [inlineChatMonitoring, setInlineChatMonitoring] = useState<MonitoringSubscription | null>(null)
  const [itemChat, setItemChat] = useState<{ item: MonitoringItem; monitoring: MonitoringSubscription } | null>(null)
  const [generalChat, setGeneralChat] = useState(false)

  const GENERAL_MONITORING: MonitoringSubscription = {
    id: GENERAL_MONITORING_ID,
    name: "",
    scope: { sources: [], tributos: [], assuntos: [] },
    status: "active",
    lastChecked: "",
    newCount: 0,
    hasNew: false,
    items: [],
    impactSummary: "",
    suggestions: [],
  }
  const [activeDialog, setActiveDialog] = useState<DialogData | null>(null)
  // Collect all monitorings from conversations so detail view works
  const allConversationMonitorings = MOCK_CONVERSATIONS.flatMap((c) => c.monitoramentos)

  const handleSelectMonitoring = useCallback((id: string) => {
    // Find in global list first, then conversation monitorings
    setSelectedMonitoringId(id)
    setMonitorings((prev) =>
      prev.map((m) => m.id === id ? { ...m, hasNew: false, newCount: 0 } : m)
    )
  }, [])

  const handleSelectPesquisa = useCallback((pesquisa: PesquisaData) => {
    setSelectedPesquisa(pesquisa)
  }, [])

  const handleBackFromPesquisa = useCallback(() => {
    setSelectedPesquisa(null)
    // if we came from documents list, stay there (showDocumentsList remains true)
  }, [])

  const handleSelectConversation = useCallback((id: string) => {
    setSelectedConversationId(id)
    setSelectedMonitoringId(null)
    setSelectedPesquisa(null)
  }, [])

  const handleShowDigest = useCallback(() => {
    setShowDigest(true)
    setSelectedMonitoringId(null)
    setSelectedConversationId(null)
    setSelectedPesquisa(null)
  }, [])

  const handleBackToChat = useCallback(() => {
    setSelectedMonitoringId(null)
    setSelectedConversationId(null)
    setSelectedPesquisa(null)
    setShowDigest(false)
    setShowMonitoringsList(false)
    setShowDocumentsList(false)
  }, [])

  const handleShowMonitoringsList = useCallback(() => {
    setShowMonitoringsList(true)
    setShowDocumentsList(false)
    setShowLitigationMap(false)
    setSelectedMonitoringId(null)
    setSelectedConversationId(null)
    setSelectedPesquisa(null)
    setShowDigest(false)
  }, [])

  const handleShowDocumentsList = useCallback(() => {
    setShowDocumentsList(true)
    setShowMonitoringsList(false)
    setShowLitigationMap(false)
    setSelectedMonitoringId(null)
    setSelectedConversationId(null)
    setSelectedPesquisa(null)
    setShowDigest(false)
  }, [])

  const handleShowLitigationMap = useCallback(() => {
    setShowLitigationMap(true)
    setShowDocumentsList(false)
    setShowMonitoringsList(false)
    setSelectedMonitoringId(null)
    setSelectedConversationId(null)
    setSelectedPesquisa(null)
    setShowDigest(false)
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

  const handleOpenDocument = useCallback((id: string) => {
    setSelectedDocumentId(id)
    setSidebarOpen(false)
  }, [])

  const handleCloseDocument = useCallback(() => {
    setSelectedDocumentId(null)
  }, [])

  const handleStartConversationFromDigest = useCallback((msg: string) => {
    setPendingDigestMessage(msg)
    setShowDigest(false)
    setHasChatMessages(true)
  }, [])

  // Resolve the selected monitoring — check both global and conversation monitorings
  const selectedMonitoring =
    monitorings.find((m) => m.id === selectedMonitoringId) ??
    allConversationMonitorings.find((m) => m.id === selectedMonitoringId) ??
    null

  const selectedDocument = selectedDocumentId ? findDocument(selectedDocumentId) ?? null : null

  const activeChatContext: ActiveChatContext = generalChat
    ? { type: "general" }
    : itemChat
    ? { type: "monitoring", name: itemChat.monitoring.name }
    : inlineChatMonitoring
    ? { type: "monitoring", name: inlineChatMonitoring.name }
    : null

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        monitorings={monitorings}
        selectedMonitoringId={selectedMonitoringId}
        selectedConversationId={selectedConversationId}
        showDigest={showDigest}
        showMonitoringsList={showMonitoringsList}
        showDocumentsList={showDocumentsList}
        onSelectMonitoring={handleSelectMonitoring}
        onSelectConversation={handleSelectConversation}
        onShowDigest={handleShowDigest}
        onShowMonitoringsList={handleShowMonitoringsList}
        onShowDocumentsList={handleShowDocumentsList}
        showLitigationMap={showLitigationMap}
        onShowLitigationMap={handleShowLitigationMap}
        onNewMonitoring={handleNewMonitoring}
        onNewPesquisa={handleNewPesquisa}
        onOpenInlineChat={(m) => setInlineChatMonitoring(m)}
        onOpenGeneralChat={() => setGeneralChat(true)}
        chatMonitoringCount={chatMonitoringCount}
        hasChatMessages={hasChatMessages}
        activeChatContext={activeChatContext}
      />

      <div className="relative flex flex-1 min-w-0 h-full">
        {showLitigationMap ? (
          <LitigationMapView />
        ) : showDocumentsList && !selectedPesquisa ? (
          <DocumentsListView onViewPesquisa={handleSelectPesquisa} />
        ) : showMonitoringsList && !selectedMonitoringId ? (
          <ManorFeed
            monitorings={monitorings}
            onOpenChat={(m) => setInlineChatMonitoring(m)}
            onSelectMonitoring={handleSelectMonitoring}
            onNewMonitoring={handleNewMonitoring}
          />
        ) : showDigest ? (
          <DigestView onBack={handleBackToChat} onStartConversation={handleStartConversationFromDigest} />
        ) : selectedPesquisa ? (
          <PesquisaDetailView
            pesquisa={selectedPesquisa}
            onBack={handleBackFromPesquisa}
            onOpenDocument={handleOpenDocument}
          />
        ) : selectedMonitoring ? (
          <MonitoringDetailView
            monitoring={selectedMonitoring}
            onBack={selectedConversationId ? handleBackFromMonitoringToConversation : showMonitoringsList ? () => setSelectedMonitoringId(null) : handleBackToChat}
            onTogglePause={handleTogglePause}
            onOpenItemChat={(item) => setItemChat({ item, monitoring: selectedMonitoring })}
          />
        ) : selectedConversationId ? (
          <ConversationDetailView
            conversationId={selectedConversationId}
            onBack={handleBackToChat}
            onViewMonitoring={handleSelectMonitoring}
            onViewPesquisa={handleSelectPesquisa}
          />
        ) : (
          <ManorSpace
            monitorings={monitorings}
            onOpenChat={() => setGeneralChat(true)}
          />
        )}

        {selectedDocument && (
          <DocumentViewerPanel
            document={selectedDocument}
            onClose={handleCloseDocument}
          />
        )}
      </div>

      {/* Inline Chat overlay — general or specific */}
      {(generalChat || inlineChatMonitoring || itemChat) && (
        <InlineChat
          monitoring={generalChat ? GENERAL_MONITORING : (itemChat?.monitoring ?? inlineChatMonitoring!)}
          item={itemChat?.item}
          onClose={() => { setGeneralChat(false); setInlineChatMonitoring(null); setItemChat(null) }}
          onViewFull={(id) => {
            setGeneralChat(false)
            setInlineChatMonitoring(null)
            setItemChat(null)
            handleSelectMonitoring(id)
          }}
        />
      )}

      {/* Pokémon dialogue — critical event modal */}
      <ManorDialog
        dialog={activeDialog}
        onClose={() => setActiveDialog(null)}
      />

    </div>
  )
}
