"use client"

import React, { useState, useRef, useEffect } from "react"
import { Send, Zap, Bell, Search, Plus, X, ArrowRight, Lightbulb } from "lucide-react"
import { DailyUpdatesArtifact } from "./daily-updates-artifact"
import { cn } from "@/lib/utils"
import type { MonitoringSubscription } from "@/lib/monitoring-data"
import type { InputMode } from "./manor-chat"

// ── Types ─────────────────────────────────────────────────────────

type Message = {
  role: "user" | "assistant"
  content: string
  contextType?: string
}

// ── Constants ─────────────────────────────────────────────────────

const DIGEST_USER_MSG = "O que mudou no direito tributário federal nas últimas 24 horas?"
const TOTAL_UPDATES = 103

const DIGEST_RESPONSE: Message = {
  role: "assistant",
  content: "",
  contextType: "daily-updates",
}

const PLACEHOLDERS: Record<InputMode, string> = {
  default: "Pesquise ou crie um monitoramento...",
  pesquisar: "O que você quer pesquisar?",
  monitorar: "Descreva o tema a monitorar...",
}

const PESQUISA_SUGGESTIONS = [
  "Resuma o que aconteceu no STJ hoje",
  "Decisões sobre ágio nas últimas 24h",
  "Atualizações sobre PIS/COFINS e insumos",
  "Impacto da reforma tributária no IRPJ",
  "Jurisprudência sobre JCP e dedutibilidade",
  "Transfer pricing: novidades da Receita Federal",
]

const MONITORAMENTO_SUGGESTIONS: Array<{
  name: string
  description: string
  scope: { sources: string[]; tributos: string[]; assuntos: string[] }
}> = [
  {
    name: "Ágio · CARF · IRPJ/CSLL",
    description: "Amortização de ágio e propósito negocial",
    scope: { sources: ["carf", "stj"], tributos: ["IRPJ", "CSLL"], assuntos: ["Amortização de ágio"] },
  },
  {
    name: "PIS/COFINS · Insumos",
    description: "Crédito de insumos e essencialidade",
    scope: { sources: ["stj", "carf"], tributos: ["PIS", "COFINS"], assuntos: ["Crédito de insumos"] },
  },
  {
    name: "Reforma Tributária · IBS/CBS",
    description: "IBS, CBS e período de transição",
    scope: { sources: ["dou"], tributos: ["PIS", "COFINS"], assuntos: ["IBS", "CBS"] },
  },
  {
    name: "Transfer Pricing · RFB",
    description: "Preços de transferência e métodos",
    scope: { sources: ["receita", "stj"], tributos: ["IRPJ", "CSLL"], assuntos: ["Transfer pricing"] },
  },
  {
    name: "JCP · Dedutibilidade",
    description: "Juros sobre capital próprio",
    scope: { sources: ["receita", "stj"], tributos: ["IRPJ", "CSLL"], assuntos: ["JCP"] },
  },
  {
    name: "ISS · Local de prestação",
    description: "Competência tributária e municípios",
    scope: { sources: ["stf", "stj"], tributos: ["ISS"], assuntos: ["Competência tributária"] },
  },
]

// ── Props ─────────────────────────────────────────────────────────

interface ChatAreaProps {
  monitorings: MonitoringSubscription[]
  inputMode: InputMode
  onSetInputMode: (mode: InputMode) => void
  onViewMonitoring: (id: string) => void
  onAddMonitoring: (monitoring: MonitoringSubscription) => void
}

// ── Plus menu ─────────────────────────────────────────────────────

function PlusMenu({
  onSelect,
  onClose,
}: {
  onSelect: (mode: "pesquisar" | "monitorar") => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50"
    >
      <button
        onClick={() => onSelect("pesquisar")}
        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer text-left"
      >
        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-gray-600" />
        </div>
        <p className="text-sm font-medium text-gray-900">Fazer pesquisa</p>
      </button>
      <button
        onClick={() => onSelect("monitorar")}
        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer text-left"
      >
        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Bell className="w-3.5 h-3.5 text-amber-600" />
        </div>
        <p className="text-sm font-medium text-gray-900">Criar monitoramento</p>
      </button>
    </div>
  )
}

// ── Mode tag (inside input) ───────────────────────────────────────

function ModeTag({
  mode,
  onRemove,
}: {
  mode: "pesquisar" | "monitorar"
  onRemove: () => void
}) {
  if (mode === "pesquisar") {
    return (
      <span className="group inline-flex items-center gap-1 pl-2 pr-1 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium flex-shrink-0">
        <Lightbulb className="w-3 h-3 text-gray-500" />
        Pesquisa
        <button
          onClick={onRemove}
          className="ml-0.5 p-0.5 rounded hover:bg-gray-200 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
        >
          <X className="w-2.5 h-2.5 text-gray-400" />
        </button>
      </span>
    )
  }
  return (
    <span className="group inline-flex items-center gap-1 pl-2 pr-1 py-0.5 bg-amber-100 text-amber-700 rounded-md text-xs font-medium flex-shrink-0">
      <Bell className="w-3 h-3 text-amber-500" />
      Monitorar
      <button
        onClick={onRemove}
        className="ml-0.5 p-0.5 rounded hover:bg-amber-200 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
      >
        <X className="w-2.5 h-2.5 text-amber-400" />
      </button>
    </span>
  )
}

// ── Contextual suggestions ────────────────────────────────────────

function PesquisaSuggestions({
  onSelect,
}: {
  onSelect: (text: string) => void
}) {
  return (
    <div className="w-full mt-3">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
        Sugestões
      </p>
      <div className="grid grid-cols-2 gap-2">
        {PESQUISA_SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s)}
            className="flex items-start gap-2 text-left px-3 py-2.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all cursor-pointer group"
          >
            <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-0.5 transition-colors" />
            <span className="text-xs text-gray-600 leading-snug">{s}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function MonitoramentoSuggestions({
  onSelect,
}: {
  onSelect: (suggestion: typeof MONITORAMENTO_SUGGESTIONS[0]) => void
}) {
  return (
    <div className="w-full mt-3">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
        Temas sugeridos
      </p>
      <div className="grid grid-cols-2 gap-2">
        {MONITORAMENTO_SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s)}
            className="flex items-start gap-2.5 text-left px-3 py-2.5 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/40 transition-all cursor-pointer group"
          >
            <Bell className="w-3 h-3 text-gray-300 group-hover:text-amber-500 flex-shrink-0 mt-0.5 transition-colors" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-800 leading-snug truncate">{s.name}</p>
              <p className="text-[10px] text-gray-400 leading-snug mt-0.5">{s.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────

export function ChatArea({
  monitorings,
  inputMode,
  onSetInputMode,
  onViewMonitoring,
  onAddMonitoring,
}: ChatAreaProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const plusRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)


  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [messages, inputMode])

  const handleSendMessage = (text?: string) => {
    const content = text ?? message
    if (!content.trim()) return

    if (inputMode === "monitorar") {
      // Create a monitoring from the typed text
      createMonitoring(content.trim())
      setMessage("")
      return
    }

    setMessages([...messages, { role: "user", content }])
    setMessage("")
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Entendido. Estou processando sua solicitação..." },
      ])
    }, 500)
  }

  const createMonitoring = (name: string, scope?: { sources: string[]; tributos: string[]; assuntos: string[] }) => {
    const newMonitoring: MonitoringSubscription = {
      id: `mon-${Date.now()}`,
      name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      scope: (scope as any) ?? { sources: [], tributos: [], assuntos: [name] },
      status: "active",
      lastChecked: "agora",
      newCount: 0,
      hasNew: false,
      items: [],
      impactSummary: "Monitoramento recém-criado. As primeiras atualizações aparecerão em breve.",
      suggestions: [
        "Ver atualizações recentes sobre este tema",
        "Expandir fontes monitoradas",
        "Compartilhar com equipe",
      ],
    }
    onAddMonitoring(newMonitoring)
  }

  const handleDigestClick = () => {
    setMessages([
      { role: "user", content: DIGEST_USER_MSG },
      DIGEST_RESPONSE,
    ])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Auto-resize textarea up to 8 lines
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    const el = e.target
    el.style.height = "auto"
    const lineHeight = 20 // px — matches text-sm leading
    const maxHeight = lineHeight * 8
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px"
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden"
  }

  const handleModeSelect = (mode: "pesquisar" | "monitorar") => {
    onSetInputMode(mode)
    setShowPlusMenu(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleRemoveTag = () => {
    onSetInputMode("default")
    setMessage("")
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  // ── Welcome screen ──────────────────────────────────────────────
  const renderWelcome = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
      <div className="max-w-lg w-full flex flex-col items-center">

        {/* Brand */}
        <img src="/manor-logo.svg" alt="Manor" className="h-10 mb-3" />
        <p className="text-sm text-gray-400 mb-8">Inteligência para o direito tributário federal</p>


        {/* ── Input box ──────────────────────────────────────────── */}
        <div className="w-full relative">
          <div className={cn(
            "w-full border rounded-2xl bg-white transition-all",
            inputMode === "monitorar" ? "border-amber-200" : "border-gray-200",
          )}>
            {inputMode === "default" ? (
              /* Single-row layout (default) */
              <div className="flex items-center gap-2 px-3 py-3">
                {/* Plus button */}
                <div className="relative flex-shrink-0" ref={plusRef}>
                  <button
                    onClick={() => setShowPlusMenu((v) => !v)}
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer",
                      showPlusMenu ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  {showPlusMenu && (
                    <PlusMenu
                      onSelect={handleModeSelect}
                      onClose={() => setShowPlusMenu(false)}
                    />
                  )}
                </div>

                {/* Textarea */}
                <textarea
                  ref={inputRef}
                  value={message}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder={PLACEHOLDERS[inputMode]}
                  rows={1}
                  autoFocus
                  className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent min-w-0 resize-none leading-5 overflow-hidden [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full"
                  style={{ height: "20px" }}
                />

                {/* Send button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!message.trim()}
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                    message.trim()
                      ? "bg-gray-900 hover:bg-gray-700 cursor-pointer"
                      : "bg-gray-200 cursor-not-allowed"
                  )}
                >
                  <Send className="w-3 h-3 text-white" />
                </button>
              </div>
            ) : (
              /* Two-row layout (mode selected) */
              <>
                {/* Top row: textarea */}
                <div className="px-4 pt-3.5 pb-1">
                  <textarea
                    ref={inputRef}
                    value={message}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder={PLACEHOLDERS[inputMode]}
                    rows={1}
                    className="w-full text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent resize-none leading-5 overflow-hidden [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full"
                    style={{ height: "20px" }}
                  />
                </div>

                {/* Bottom row: + button, mode tag, send button */}
                <div className="flex items-center gap-2 px-3 pb-3">
                  {/* Plus button */}
                  <div className="relative flex-shrink-0" ref={plusRef}>
                    <button
                      onClick={() => setShowPlusMenu((v) => !v)}
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer",
                        showPlusMenu ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    {showPlusMenu && (
                      <PlusMenu
                        onSelect={handleModeSelect}
                        onClose={() => setShowPlusMenu(false)}
                      />
                    )}
                  </div>

                  {/* Mode tag */}
                  <ModeTag mode={inputMode} onRemove={handleRemoveTag} />

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Send button */}
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!message.trim()}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                      message.trim()
                        ? inputMode === "monitorar"
                          ? "bg-amber-500 hover:bg-amber-600 cursor-pointer"
                          : "bg-gray-900 hover:bg-gray-700 cursor-pointer"
                        : "bg-gray-200 cursor-not-allowed"
                    )}
                  >
                    <Send className="w-3 h-3 text-white" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ── Contextual suggestions ─────────────────────────── */}
          {inputMode === "pesquisar" && (
            <PesquisaSuggestions onSelect={(text) => handleSendMessage(text)} />
          )}

          {inputMode === "monitorar" && (
            <MonitoramentoSuggestions
              onSelect={(s) => createMonitoring(s.name, s.scope as any)}
            />
          )}

          {/* Updates pill — default mode only */}
          {inputMode === "default" && (
            <div className="flex justify-center mt-5">
              <button
                onClick={handleDigestClick}
                className="group flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-full transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-blue-500 group-hover:text-blue-600 transition-colors" />
                <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                  {TOTAL_UPDATES} atualizações nas últimas 24h
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Footnote */}
        <p className="text-[11px] text-gray-300 text-center leading-relaxed mt-6">
          Pesquisa sem opinião jurídica. Consulte especialistas.
        </p>
      </div>
    </div>
  )

  // ── Chat view ───────────────────────────────────────────────────
  const isShowingArtifact = messages.some((m) => m.contextType === "daily-updates")

  const renderChat = () => (
    <>
      <div className="flex-1 flex flex-col px-4 overflow-y-auto pt-6">
        <div className="max-w-2xl mx-auto w-full space-y-6">
          {messages.map((msg, index) => {
            if (msg.role === "assistant" && msg.contextType === "daily-updates") {
              return (
                <div key={index} className="w-full">
                  <DailyUpdatesArtifact />
                </div>
              )
            }

            const isDigestTrigger = msg.role === "user" && msg.content === DIGEST_USER_MSG

            return (
              <div key={index} className="space-y-3">
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {isDigestTrigger ? (
                    <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full bg-white">
                      <Zap className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-xs text-gray-500">
                        {TOTAL_UPDATES} atualizações nas últimas 24h
                      </span>
                    </div>
                  ) : (
                    <div className={`max-w-[80%] px-5 py-3.5 rounded-lg ${
                      msg.role === "user" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
                    }`}>
                      <p className={msg.role === "assistant" ? "text-base" : "text-sm"}>
                        {msg.content}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {!isShowingArtifact && (
        <>
          <div className="px-4 pb-3 pt-2">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digitar mensagem..."
                  autoFocus
                  className="w-full px-5 py-4 pr-14 border border-gray-200 rounded-full text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-gray-300"
                />
                <button
                  onClick={() => handleSendMessage()}
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
    <div className="flex-1 flex flex-col h-full min-w-0">
      {messages.length === 0 ? renderWelcome() : renderChat()}
    </div>
  )
}
