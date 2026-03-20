"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  Send,
  Zap,
  Bell,
  Search,
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Check,
  Pencil,
  Lightbulb,
} from "lucide-react"
import { DailyUpdatesArtifact } from "./daily-updates-artifact"
import { cn } from "@/lib/utils"
import type { MonitoringSubscription } from "@/lib/monitoring-data"
import type { InputMode } from "./manor-chat"

// ── Types ─────────────────────────────────────────────────────────

type MonitoringProposalData = {
  topic: string
  summary: string
}

type Message = {
  role: "user" | "assistant"
  content: string
  contextType?: "daily-updates" | "monitoring-proposal" | "research"
  monitoringProposal?: MonitoringProposalData
  query?: string
}

// ── Constants ─────────────────────────────────────────────────────

const DIGEST_USER_MSG = "O que mudou no direito tributário federal nas últimas 24 horas?"
const TOTAL_UPDATES = 103

const MOCK_RESEARCH_CONTENT = `## 1. Conceito e Distinção

O **ágio interno** é gerado em operações societárias entre partes relacionadas, sem efetivo desembolso econômico externo ao grupo. Distingue-se do ágio externo, em que há aquisição de terceiro com pagamento de sobrepreço justificado por rentabilidade futura esperada.

## 2. Posição Consolidada do CARF

O CARF firmou entendimento, por meio de acórdãos paradigmáticos, de que a amortização de ágio interno é inadmissível para fins de apuração do IRPJ e CSLL, por ausência dos requisitos legais previstos no art. 7º da Lei 9.532/97.

- **Fundamento principal:** Ausência de efetivo desembolso e de negócio jurídico real com terceiros
- **Precedentes:** Acórdãos 1402-001.995, 9101-006.078 e 1402-006.038
- **Penalidades:** Multas qualificadas de 150% em casos com indícios de dolo ou fraude

## 3. Posição do STJ

O STJ convergiu com o CARF na vedação à amortização de ágio interno. O tribunal entende que a operação societária deve envolver partes independentes e ter propósito negocial genuíno para que o ágio seja reconhecido fiscalmente.

## 4. Recomendações Práticas

Revise operações com estrutura societária semelhante e documente a racionalidade econômica de cada etapa. A comprovação de propósito negocial genuíno é o elemento central para afastar autuações.`

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
  "Transfer pricing: atualizações da Receita Federal",
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

// ── Monitoring Proposal Bubble ────────────────────────────────────

const JURISDICTIONS = ["Federal", "São Paulo", "Rio de Janeiro", "Minas Gerais", "Todos os estados"]
const PROPOSAL_SOURCES = ["Legislação", "STF", "STJ", "TRFs", "CARF", "Receita Federal"]
const FREQUENCIES = ["Diário", "Semanal"]

function MonitoringProposalBubble({
  data,
  onCreateMonitoring,
}: {
  data: MonitoringProposalData
  onCreateMonitoring: (m: MonitoringSubscription) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<string[]>(["Federal"])
  const [selectedSources, setSelectedSources] = useState<string[]>(["Legislação", "STF", "STJ"])
  const [selectedFrequency, setSelectedFrequency] = useState("Diário")
  // Notification state
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [editingEmail, setEditingEmail] = useState(false)
  const [emailValue, setEmailValue] = useState("rodrigo@manor.com.br")
  const [whatsappEnabled, setWhatsappEnabled] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState("")
  // Share state
  const [shareInput, setShareInput] = useState("")
  const [shareEmails, setShareEmails] = useState<string[]>([])

  const toggleChip = (
    arr: string[],
    setArr: (v: string[]) => void,
    val: string
  ) => {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val])
  }

  const handleConfirm = () => {
    const newMonitoring: MonitoringSubscription = {
      id: `mon-${Date.now()}`,
      name: "Monitoramento Personalizado",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      scope: { sources: selectedSources as any, tributos: [], assuntos: [data.topic] },
      status: "active",
      lastChecked: "agora",
      newCount: 0,
      hasNew: false,
      items: [],
      impactSummary: data.summary,
      suggestions: [
        "Ver atualizações recentes sobre este tema",
        "Expandir fontes monitoradas",
        "Compartilhar com equipe",
      ],
    }
    onCreateMonitoring(newMonitoring)
    setIsConfirmed(true)
  }

  const chipClass = (active: boolean) =>
    cn(
      "px-3 py-1 rounded-full text-xs border transition-colors cursor-pointer",
      active
        ? "bg-gray-900 text-white border-gray-900"
        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
    )

  const handleShareKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && shareInput.trim()) {
      setShareEmails((prev) => [...prev, shareInput.trim()])
      setShareInput("")
    }
  }

  if (isConfirmed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <Check className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900">Monitoramento ativado</span>
        </div>
        <p className="text-xs text-gray-500 mb-4 pl-7">
          Você será notificado quando houver atualizações.
        </p>

        {/* Monitoring details */}
        <div className="border-t border-green-200 pt-3 space-y-2.5 mb-4">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Nome</p>
            <p className="text-sm text-gray-800 mt-0.5">Monitoramento Personalizado</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Escopo</p>
            <p className="text-sm text-gray-800 mt-0.5">{data.summary}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Fontes</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {selectedSources.slice(0, 3).map((s) => (
                <span key={s} className="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="border-t border-green-200 pt-3 mb-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Notificações</p>
          <div className="space-y-3">
            {/* Email */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <button
                    onClick={() => setEmailEnabled((v) => !v)}
                    className={cn(
                      "relative w-9 h-5 rounded-full transition-colors flex-shrink-0 cursor-pointer",
                      emailEnabled ? "bg-green-500" : "bg-gray-200"
                    )}
                  >
                    <span className={cn(
                      "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                      emailEnabled ? "translate-x-4" : "translate-x-0"
                    )} />
                  </button>
                  <span className="text-sm text-gray-700">Email</span>
                </div>
                {emailEnabled && (
                  <div className="flex items-center gap-1.5">
                    {editingEmail ? (
                      <input
                        autoFocus
                        type="email"
                        value={emailValue}
                        onChange={(e) => setEmailValue(e.target.value)}
                        onBlur={() => setEditingEmail(false)}
                        onKeyDown={(e) => e.key === "Enter" && setEditingEmail(false)}
                        className="text-xs border border-green-200 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:border-green-400 w-44"
                      />
                    ) : (
                      <>
                        <span className="text-xs text-gray-400">{emailValue}</span>
                        <button onClick={() => setEditingEmail(true)} className="text-gray-300 hover:text-gray-500 cursor-pointer">
                          <Pencil className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* WhatsApp */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => setWhatsappEnabled((v) => !v)}
                  className={cn(
                    "relative w-9 h-5 rounded-full transition-colors flex-shrink-0 cursor-pointer",
                    whatsappEnabled ? "bg-green-500" : "bg-gray-200"
                  )}
                >
                  <span className={cn(
                    "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                    whatsappEnabled ? "translate-x-4" : "translate-x-0"
                  )} />
                </button>
                <span className="text-sm text-gray-700">WhatsApp</span>
              </div>
              {whatsappEnabled && (
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+55 (11) 00000-0000"
                  className="text-xs border border-green-200 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:border-green-400 placeholder:text-gray-300 w-44"
                />
              )}
            </div>
          </div>
        </div>

        {/* Share */}
        <div className="border-t border-green-200 pt-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Compartilhar</p>
          <div className="space-y-2">
            {shareEmails.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {shareEmails.map((email) => (
                  <span key={email} className="flex items-center gap-1 px-2 py-0.5 bg-white border border-green-200 rounded-full text-xs text-gray-600">
                    {email}
                    <button onClick={() => setShareEmails((prev) => prev.filter((e) => e !== email))} className="cursor-pointer text-gray-400 hover:text-gray-600">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              type="email"
              value={shareInput}
              onChange={(e) => setShareInput(e.target.value)}
              onKeyDown={handleShareKeyDown}
              placeholder="mail de usuário da organização"
              className="w-full px-3 py-1.5 text-sm border border-green-200 rounded-lg bg-white focus:outline-none focus:border-green-400 placeholder:text-gray-300"
            />
            <p className="text-[11px] text-gray-400">Pressione Enter para adicionar. Apenas usuários da sua organização.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      {/* AI summary bubble */}
      <div className="bg-gray-100 rounded-2xl px-5 py-4 mb-3">
        <p className="text-sm text-gray-800 leading-relaxed">{data.summary}</p>
      </div>

      {/* Collapsible refinement section */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mb-3 cursor-pointer"
      >
        3 informações deixariam o monitoramento mais preciso
        <ChevronDown
          className={cn("w-3.5 h-3.5 transition-transform", isExpanded && "rotate-180")}
        />
      </button>

      {isExpanded && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3 space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-2">Jurisdições de interesse</p>
            <div className="flex flex-wrap gap-1.5">
              {JURISDICTIONS.map((j) => (
                <button
                  key={j}
                  onClick={() => toggleChip(selectedJurisdictions, setSelectedJurisdictions, j)}
                  className={chipClass(selectedJurisdictions.includes(j))}
                >
                  {j}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">Fontes para monitoramento</p>
            <div className="flex flex-wrap gap-1.5">
              {PROPOSAL_SOURCES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleChip(selectedSources, setSelectedSources, s)}
                  className={chipClass(selectedSources.includes(s))}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">Frequência de verificação</p>
            <div className="flex flex-wrap gap-1.5">
              {FREQUENCIES.map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFrequency(f)}
                  className={chipClass(selectedFrequency === f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleConfirm}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          Prosseguir com este monitoramento
        </button>
        <button
          onClick={() => setIsExpanded(true)}
          className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Editar monitoramento
        </button>
      </div>
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────

interface ChatAreaProps {
  monitorings: MonitoringSubscription[]
  inputMode: InputMode
  onSetInputMode: (mode: InputMode) => void
  onViewMonitoring: (id: string) => void
  onAddMonitoring: (monitoring: MonitoringSubscription) => void
  onCreateMonitoringFromChat: (monitoring: MonitoringSubscription) => void
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
          <Search className="w-3.5 h-3.5 text-gray-600" />
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
  onCreateMonitoringFromChat,
}: ChatAreaProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const [expandedArtifact, setExpandedArtifact] = useState(false)
  const [expandedResearch, setExpandedResearch] = useState<{ title: string; content: string } | null>(null)
  const plusRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)


  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [messages, inputMode])

  const handleSendMessage = (text?: string, forceMode?: InputMode) => {
    const content = text ?? message
    if (!content.trim()) return
    const mode = forceMode ?? inputMode

    if (mode === "monitorar") {
      const topic = content.trim()
      const summary = `Acompanhar alterações legislativas, jurisprudenciais e normativas relacionadas a: ${topic}. O monitoramento cobrirá mudanças em legislação federal, decisões de tribunais superiores e atos administrativos relevantes para o tema.`

      // Create the monitoring subscription and also show a proposal message in-chat.
      createMonitoring(topic)
      setMessages((prev) => [
        ...prev,
        { role: "user", content: topic },
        {
          role: "assistant",
          content: summary,
          contextType: "monitoring-proposal",
          monitoringProposal: { topic, summary },
        },
      ])

      setMessage("")
      onSetInputMode("default")
      return
    }

    setMessages((prev) => [...prev, { role: "user", content }])
    setMessage("")
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: MOCK_RESEARCH_CONTENT, contextType: "research", query: content },
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
            <PesquisaSuggestions onSelect={(text) => handleSendMessage(text, "pesquisar")} />
          )}

          {inputMode === "monitorar" && (
            <MonitoramentoSuggestions
              onSelect={(s) => handleSendMessage(s.name)}
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
          Pesquisa e monitoramento sem opinião jurídica. Consulte especialistas.
        </p>
      </div>
    </div>
  )

  // ── Chat view ───────────────────────────────────────────────────
  const renderChat = () => (
    <>
      <div className="flex-1 flex flex-col px-4 overflow-y-auto pt-6">
        <div className="max-w-2xl mx-auto w-full space-y-6">
          {messages.map((msg, index) => {
            if (msg.role === "assistant" && msg.contextType === "research") {
              return (
                <div key={index} className="w-full">
                  <button
                    onClick={() => setExpandedResearch({ title: msg.query ?? "Pesquisa", content: msg.content })}
                    className="w-full text-left border border-gray-200 rounded-2xl px-4 py-3.5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer bg-white group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Lightbulb className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{msg.query ?? "Pesquisa"}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Pesquisa · Clique para abrir</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                    </div>
                  </button>
                </div>
              )
            }

            if (msg.role === "assistant" && msg.contextType === "daily-updates") {
              return (
                <div key={index} className="w-full">
                  <button
                    onClick={() => setExpandedArtifact(true)}
                    className="w-full text-left border border-gray-200 rounded-2xl px-4 py-3.5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer bg-white group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Zap className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Atualizações tributárias</p>
                          <p className="text-xs text-gray-400 mt-0.5">{TOTAL_UPDATES} atualizações nas últimas 24h</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                    </div>
                  </button>
                </div>
              )
            }

            if (msg.role === "assistant" && msg.contextType === "monitoring-proposal" && msg.monitoringProposal) {
              return (
                <div key={index} className="flex justify-start">
                  <MonitoringProposalBubble
                    data={msg.monitoringProposal}
                    onCreateMonitoring={onCreateMonitoringFromChat}
                  />
                </div>
              )
            }

            const isDigestTrigger = msg.role === "user" && msg.content === DIGEST_USER_MSG
            const isMonitoringTrigger =
              msg.role === "user" &&
              index + 1 < messages.length &&
              messages[index + 1]?.contextType === "monitoring-proposal"

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
                  ) : isMonitoringTrigger ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                      <Bell className="w-3.5 h-3.5 text-amber-500" />
                      <span>{msg.content}</span>
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
  )

  if (expandedResearch) {
    return (
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white">
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <button
            onClick={() => setExpandedResearch(null)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-8 max-w-2xl mx-auto w-full [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-gray-100">
          <h1 className="text-base font-medium text-gray-900 mb-6 leading-snug">{expandedResearch.title}</h1>
          <div className="text-sm text-gray-600 leading-relaxed space-y-4 whitespace-pre-wrap">
            {expandedResearch.content}
          </div>
        </div>
      </div>
    )
  }

  if (expandedArtifact) {
    return (
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white">
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <button
            onClick={() => setExpandedArtifact(false)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <DailyUpdatesArtifact fullScreen />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {messages.length === 0 ? renderWelcome() : renderChat()}
    </div>
  )
}
