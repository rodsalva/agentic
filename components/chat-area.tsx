"use client"

import React, { useState, useRef, useEffect } from "react"
import { Send, Zap, ChevronDown, MessageSquare, FileSearch, Check, Bell } from "lucide-react"
import { DailyUpdatesArtifact } from "./daily-updates-artifact"
import { MonitoringAlertStack, type MonitoringAlert } from "./monitoring-alert-card"
import { MonitoringArtifact } from "./monitoring-artifact"
import { cn } from "@/lib/utils"

type Message = {
  role: "user" | "assistant"
  content: string
  suggestions?: string[]
  contextType?: string
}

export type UpdateType = "legislation" | "reforma" | "carf" | "rfb"

const DIGEST_USER_MSG = "O que mudou no direito tributário federal nas últimas 24 horas?"

const DIGEST_RESPONSE: Message = {
  role: "assistant",
  content: "",
  contextType: "daily-updates",
}

const CATEGORY_COUNTS: Record<string, number> = {
  stf: 8, stj: 12, trf: 7, receita: 9, dou: 5,
}

const TOTAL_UPDATES = 103

// Mock monitoring alerts
const MOCK_ALERTS: MonitoringAlert[] = [
  { id: "ma1", name: "Ágio Interno · CARF", newCount: 2, lastUpdate: "há 12 min", isNew: true },
  { id: "ma2", name: "PIS/COFINS · STJ", newCount: 1, lastUpdate: "há 2 horas", isNew: true },
]


export function ChatArea() {
  // no props needed — artifact renders inline
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [mode, setMode] = useState<"chat" | "completo" | "monitoramento">("chat")
  const [showModeMenu, setShowModeMenu] = useState(false)
  const [alerts, setAlerts] = useState<MonitoringAlert[]>(MOCK_ALERTS)
  const inputRef = useRef<HTMLInputElement>(null)
  const modeMenuRef = useRef<HTMLDivElement>(null)

  const handleViewAlert = (id: string) => {
    // Navigate to monitoring chat - for demo, show monitoring artifact
    setMessages([
      { role: "user", content: "Ver monitoramento: " + alerts.find(a => a.id === id)?.name },
      { role: "assistant", content: "", contextType: "monitoring" },
    ])
  }

  const handleDismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [messages])

  // Close mode menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target as Node)) {
        setShowModeMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSendMessage = () => {
    if (!message.trim()) return
    setMessages([...messages, { role: "user", content: message }])
    setMessage("")
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Entendido. Estou processando sua solicitação..."
      }])
    }, 500)
  }

  const handleSuggestionClick = (text: string) => {
    setMessages(prev => [...prev, { role: "user", content: text }])
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Perfeito! Vou buscar essas informações para você..."
      }])
    }, 500)
  }

  const handleDigestClick = () => {
    setMessages([
      { role: "user", content: DIGEST_USER_MSG },
      DIGEST_RESPONSE,
    ])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // ── Welcome screen ──
  const renderWelcome = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
      <div className="max-w-lg w-full flex flex-col items-center">

        {/* Brand */}
        <img src="/manor-logo.svg" alt="Manor" className="h-10 mb-3" />
        <p className="text-sm text-gray-400 mb-8">Inteligência para o direito tributário federal</p>

        {/* Monitoring Alerts */}
        {alerts.length > 0 && (
          <div className="w-full mb-6">
            <MonitoringAlertStack
              alerts={alerts}
              onView={handleViewAlert}
              onDismiss={handleDismissAlert}
            />
          </div>
        )}

        {/* Input */}
        <div className="w-full relative mb-5">
          <div className="w-full border border-gray-200 rounded-2xl bg-white">
            <div className="px-5 pt-4 pb-8">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={mode === "monitoramento" ? "Monitorar..." : "Pesquisar..."}
                autoFocus
                className="w-full text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent"
              />
            </div>
            <div className="flex items-center justify-end gap-2 px-3 pb-3">
              <div className="relative" ref={modeMenuRef}>
                <button
                  onClick={() => setShowModeMenu(!showModeMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 rounded-full transition-colors cursor-pointer"
                >
                  <span className="font-medium">
                    {mode === "chat" ? "Pesquisa: Chat" : mode === "completo" ? "Pesquisa: Completa" : "Monitoramento"}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showModeMenu && (
                  <div className="absolute bottom-full right-0 mb-3 w-80 bg-white border border-gray-100 rounded-xl shadow-lg p-2 z-50" style={{ right: "-40px" }}>
                    <button
                      onClick={() => { setMode("chat"); setShowModeMenu(false) }}
                      className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-colors cursor-pointer ${mode === "chat" ? "bg-gray-50" : "hover:bg-gray-50"}`}
                    >
                      <MessageSquare className={`w-4 h-4 mt-0.5 ${mode === "chat" ? "text-gray-900" : "text-gray-400"}`} />
                      <div className="flex-1">
                        <span className={`text-sm ${mode === "chat" ? "text-gray-900 font-medium" : "text-gray-600"}`}>Pesquisa: Chat</span>
                        <p className="text-xs text-gray-400 mt-0.5">Conversa interativa, respostas rápidas.</p>
                      </div>
                      {mode === "chat" && <Check className="w-4 h-4 text-gray-900 mt-0.5" />}
                    </button>
                    <button
                      onClick={() => { setMode("completo"); setShowModeMenu(false) }}
                      className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-colors cursor-pointer ${mode === "completo" ? "bg-gray-50" : "hover:bg-gray-50"}`}
                    >
                      <FileSearch className={`w-4 h-4 mt-0.5 ${mode === "completo" ? "text-gray-900" : "text-gray-400"}`} />
                      <div className="flex-1">
                        <span className={`text-sm ${mode === "completo" ? "text-gray-900 font-medium" : "text-gray-600"}`}>Pesquisa: Completa</span>
                        <p className="text-xs text-gray-400 mt-0.5">Análise aprofundada, uma interação.</p>
                      </div>
                      {mode === "completo" && <Check className="w-4 h-4 text-gray-900 mt-0.5" />}
                    </button>
                    <button
                      onClick={() => { setMode("monitoramento"); setShowModeMenu(false) }}
                      className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-colors cursor-pointer ${mode === "monitoramento" ? "bg-gray-50" : "hover:bg-gray-50"}`}
                    >
                      <Bell className={`w-4 h-4 mt-0.5 ${mode === "monitoramento" ? "text-gray-900" : "text-gray-400"}`} />
                      <div className="flex-1">
                        <span className={`text-sm ${mode === "monitoramento" ? "text-gray-900 font-medium" : "text-gray-600"}`}>Monitoramento</span>
                        <p className="text-xs text-gray-400 mt-0.5">Acompanhe atualizações  sobre um tema.</p>
                      </div>
                      {mode === "monitoramento" && <Check className="w-4 h-4 text-gray-900 mt-0.5" />}
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${message.trim() ? "bg-blue-500 hover:bg-blue-600 cursor-pointer" : "bg-gray-200 cursor-not-allowed"}`}
              >
                <Send className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Updates link */}
        <button
          onClick={handleDigestClick}
          className="group flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-full transition-all cursor-pointer mb-6"
        >
          <Zap className="w-3.5 h-3.5 text-blue-500 group-hover:text-blue-600 transition-colors" />
          <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">{TOTAL_UPDATES} atualizações nas últimas 24h</span>
        </button>

        {/* Footnote */}
        <p className="text-[11px] text-gray-300 text-center leading-relaxed">
          Pesquisa sem opinião jurídica. Consulte especialistas. 
        </p>
      </div>
    </div>
  )

  // ── Chat view ──
  const isShowingArtifact = messages.some(m => m.contextType === "daily-updates" || m.contextType === "monitoring")

  const renderChat = () => (
    <>
      <div className="flex-1 flex flex-col px-4 overflow-y-auto pt-6">
        <div className="max-w-2xl mx-auto w-full space-y-6">
          {messages.map((msg, index) => {
            // Daily updates artifact — rendered inline in chat
            if (msg.role === "assistant" && msg.contextType === "daily-updates") {
              return (
                <div key={index} className="w-full">
                  <DailyUpdatesArtifact />
                </div>
              )
            }

            // Monitoring artifact — rendered inline in chat
            if (msg.role === "assistant" && msg.contextType === "monitoring") {
              return (
                <div key={index} className="w-full">
                  <MonitoringArtifact />
                </div>
              )
            }

            // Digest trigger message — render as the pill it came from
            const isDigestTrigger = msg.role === "user" && msg.content === DIGEST_USER_MSG

            return (
              <div key={index} className="space-y-3">
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {isDigestTrigger ? (
                    <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full bg-white">
                      <Zap className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-xs text-gray-500">{TOTAL_UPDATES} atualizações nas últimas 24h</span>
                    </div>
                  ) : (
                  <div
                    className={`max-w-[80%] px-5 py-3.5 rounded-lg ${
                      msg.role === "user" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className={msg.role === "assistant" ? "text-base" : "text-sm"}>{msg.content}</p>
                  </div>
                  )}
                </div>
                {msg.role === "assistant" && msg.suggestions && (
                  <div className="pl-1 flex items-center gap-2 flex-wrap">
                    <p className="text-xs text-gray-500">
                      {msg.suggestions.length === 1 ? "Sugestão:" : "Sugestões:"}
                    </p>
                    {msg.suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(s)}
                        className="px-3 py-1.5 bg-transparent border border-gray-300 rounded-full text-xs text-gray-600 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom input — hidden when artifact is displayed */}
      {!isShowingArtifact && (
        <>
          <div className="px-4 pb-3 pt-2">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digitar mensagem..."
                  autoFocus
                  className="w-full px-5 py-4 pr-14 border border-gray-200 rounded-full text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-gray-300"
                />
                <button
                  onClick={handleSendMessage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="px-4 pb-4 text-center">
            <p className="text-xs text-gray-400">Direito Tributário Federal</p>
          </div>
        </>
      )}
    </>
  )

  return (
    <div className="flex-1 flex flex-col h-full">
      {messages.length === 0 ? renderWelcome() : renderChat()}
    </div>
  )
}
