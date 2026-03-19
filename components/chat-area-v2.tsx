"use client"

import React, { useState, useRef, useEffect } from "react"
import { Send, Zap, Bell, Search, BookOpen, Plus, X, ArrowRight, ChevronDown, Check, Pencil, Copy, Share2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MonitoringSubscription } from "@/lib/monitoring-data"
import type { InputMode } from "./manor-chat"

// ── Types ─────────────────────────────────────────────────────────

type MonitoringProposalData = {
  topic: string
  summary: string
}

type PesquisaProposalData = {
  query: string
  expandedQuery: string
}

type Message = {
  role: "user" | "assistant"
  content: string
  contextType?: "monitoring-proposal" | "monitoring-created" | "pesquisa-proposal" | "pesquisa-result" | "digest-artifact"
  monitoringProposal?: MonitoringProposalData
  pesquisaProposal?: PesquisaProposalData
  pesquisaResult?: { query: string; expandedQuery: string }
}

// ── Constants ─────────────────────────────────────────────────────

const TOTAL_UPDATES = 103

const PLACEHOLDERS: Record<InputMode, string> = {
  default: "Criar pesquisa ou monitoramento...",
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

// ── Pesquisa helpers ──────────────────────────────────────────────

const LOADING_STEPS = [
  "Identificando tributos e fato gerador",
  "Consultando legislação federal",
  "Verificando jurisprudência do STF",
  "Analisando acórdãos do CARF",
  "Verificando jurisprudência do STJ",
  "Cruzando fontes normativas",
  "Estruturando análise tributária",
  "Finalizando pesquisa",
]

function expandQuery(input: string): string {
  return `Quais são as regras de incidência, legislação aplicável, jurisprudência relevante e o entendimento dos tribunais superiores e da Receita Federal sobre ${input.toLowerCase()}, no âmbito do direito tributário federal brasileiro, considerando as disposições legais vigentes e os precedentes administrativos e judiciais mais recentes?`
}

function generateMockResult(query: string): { title: string; content: string } {
  const words = query.trim().split(/\s+/)
  const title = words.slice(0, 6).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  const content = `## 1. Visão Geral

A questão relacionada a **${query}** no âmbito do direito tributário federal envolve análise integrada da legislação vigente, da jurisprudência dos tribunais superiores e das orientações normativas das autoridades fiscais federais.

## 2. Legislação Aplicável

**Base normativa:** A disciplina legal do tema decorre da Constituição Federal, do Código Tributário Nacional e de legislação federal específica, incluindo leis ordinárias, decretos e instruções normativas da Receita Federal do Brasil.

**Normas complementares:** Soluções de consulta da COSIT e pareceres normativos integram o arcabouço regulatório e vinculam a administração tributária.

## 3. Jurisprudência

### STF
O Supremo Tribunal Federal já se pronunciou sobre aspectos constitucionais da matéria, com decisões de eficácia vinculante e erga omnes que balizam a interpretação de toda a cadeia normativa.

### STJ
A 1ª e 2ª Turmas do Superior Tribunal de Justiça consolidaram entendimento sobre os principais aspectos do tema, com precedentes repetitivos de observância obrigatória pelos demais tribunais e pela administração tributária.

### CARF
O Conselho Administrativo de Recursos Fiscais possui acórdãos relevantes sobre a matéria, refletindo o posicionamento fiscal federal e antecipando tendências da contencioso administrativo.

## 4. Implicações Tributárias

- **Incidência:** Análise do fato gerador e da base de cálculo aplicável conforme legislação vigente
- **Alíquotas:** Variação conforme legislação específica e eventuais benefícios, isenções ou reduções aplicáveis
- **Regimes especiais:** Possibilidade de enquadramento em regimes diferenciados dependendo das características da operação

## 5. Obrigações Acessórias

- **Declaração:** Procedimentos declaratórios exigidos pela Receita Federal, incluindo prazos e formas de entrega
- **Documentação:** Comprovantes e registros contábeis necessários para suportar a posição fiscal adotada
- **Controles internos:** Recomendações de governança tributária para mitigar risco de autuação`
  return { title, content }
}

// ── Shared UI ─────────────────────────────────────────────────────

function MIcon() {
  return (
    <div className="w-6 h-6 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
      <span className="text-[13px] font-normal text-gray-800 leading-none" style={{ fontFamily: "var(--font-playfair)" }}>M</span>
    </div>
  )
}

function RSAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
      <span className="text-[10px] font-bold text-white leading-none">RS</span>
    </div>
  )
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
      : <React.Fragment key={i}>{part}</React.Fragment>
  )
}

function RenderContent({ content }: { content: string }) {
  const lines = content.split("\n")
  return (
    <div className="text-sm text-gray-700 leading-relaxed space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />
        if (line.startsWith("## ")) return <p key={i} className="font-semibold text-gray-900 text-sm mt-4 mb-1">{line.slice(3)}</p>
        if (line.startsWith("### ")) return <p key={i} className="font-medium text-gray-800 text-sm mt-2">{line.slice(4)}</p>
        if (line.startsWith("- ")) return (
          <div key={i} className="flex gap-2 ml-1">
            <span className="text-gray-400 flex-shrink-0">•</span>
            <span>{renderInline(line.slice(2))}</span>
          </div>
        )
        return <p key={i}>{renderInline(line)}</p>
      })}
    </div>
  )
}

// ── Pesquisa Proposal Bubble ──────────────────────────────────────

function PesquisaProposalBubble({
  data,
  onConfirmed,
}: {
  data: PesquisaProposalData
  onConfirmed: (expandedQuery: string) => void
}) {
  const [queryValue, setQueryValue] = useState(data.expandedQuery)
  const [editing, setEditing] = useState(false)

  return (
    <div className="max-w-lg w-full">
      <div className="flex items-center gap-2 mb-3">
        <MIcon />
      </div>

      {/* Expanded query — editable */}
      <div
        className="bg-gray-100 rounded-2xl px-5 py-4 mb-3 cursor-text"
        onClick={() => setEditing(true)}
      >
        {editing ? (
          <textarea
            autoFocus
            value={queryValue}
            onChange={(e) => setQueryValue(e.target.value)}
            onBlur={() => setEditing(false)}
            className="w-full text-sm text-gray-800 leading-relaxed bg-transparent resize-none outline-none"
            rows={3}
          />
        ) : (
          <p className="text-sm text-gray-800 leading-relaxed">{queryValue}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onConfirmed(queryValue)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          Prosseguir com esta pesquisa
        </button>
        <button
          onClick={() => setEditing(true)}
          className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Editar pesquisa
        </button>
      </div>
    </div>
  )
}

// ── Pesquisa Result Bubble ────────────────────────────────────────

function PesquisaResultBubble({
  expandedQuery,
  onViewPesquisa,
}: {
  expandedQuery: string
  onViewPesquisa: (p: { id: string; title: string; expandedQuery: string; content: string; timestamp: string }) => void
}) {
  const [stepIdx, setStepIdx] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const { title, content } = generateMockResult(expandedQuery)

  useEffect(() => {
    if (isLoaded) return
    const timer = setInterval(() => {
      setStepIdx((prev) => {
        const next = prev + 1
        if (next >= LOADING_STEPS.length) {
          clearInterval(timer)
          setTimeout(() => setIsLoaded(true), 400)
          return prev
        }
        return next
      })
    }, 450)
    return () => clearInterval(timer)
  }, [isLoaded])

  return (
    <div className="w-full">
      {!isLoaded ? (
        <div className="flex items-center gap-2">
          <MIcon />
          <span className="text-sm text-gray-500">
            Etapa {stepIdx + 1}/{LOADING_STEPS.length}: {LOADING_STEPS[stepIdx]}...
          </span>
          <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin ml-auto" />
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <MIcon />
          <button
            onClick={() => onViewPesquisa({ id: `p-${Date.now()}`, title, expandedQuery, content, timestamp: "agora" })}
            className="border border-gray-100 rounded-xl px-4 py-3 max-w-md bg-white text-left hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-3 h-3 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 flex-1 min-w-0 truncate">{title}</p>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{expandedQuery}</p>
          </button>
        </div>
      )}
    </div>
  )
}

// ── Monitoring Proposal Bubble ────────────────────────────────────

const JURISDICTIONS = ["Federal", "São Paulo", "Rio de Janeiro", "Minas Gerais", "Todos os estados"]
const PROPOSAL_SOURCES = ["Legislação", "STF", "STJ", "TRFs", "CARF", "Receita Federal"]
const FREQUENCIES = ["Diário", "Semanal"]

function MonitoringProposalBubble({
  data,
  onCreateMonitoring,
  onConfirmed,
}: {
  data: MonitoringProposalData
  onCreateMonitoring: (m: MonitoringSubscription) => void
  onConfirmed: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<string[]>(["Federal"])
  const [selectedSources, setSelectedSources] = useState<string[]>(["Legislação", "STF", "STJ"])
  const [selectedFrequency, setSelectedFrequency] = useState("Diário")
  // Notification state
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [editingEmail, setEditingEmail] = useState(false)
  const [emailValue, setEmailValue] = useState("rodrigo@manor.com.br")
  const [whatsappEnabled, setWhatsappEnabled] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState("")
  // Share state
  const [shareInput, setShareInput] = useState("")
  const [shareEmails, setShareEmails] = useState<string[]>([])
  // Editable summary
  const [summaryValue, setSummaryValue] = useState(data.summary)
  const [editingSummary, setEditingSummary] = useState(false)

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
    onConfirmed()
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
          Você será notificado quando houver novidades.
        </p>

        {/* Monitoring details */}
        <div className="border-t border-green-200 pt-3 space-y-2.5 mb-4">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Nome</p>
            <p className="text-sm text-gray-800 mt-0.5">Monitoramento Personalizado</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Escopo</p>
            <p className="text-sm text-gray-800 mt-0.5">{summaryValue}</p>
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
                  <span className="text-xs text-gray-400">{emailValue}</span>
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
              placeholder="Email de usuário da organização"
              className="w-full px-3 py-1.5 text-sm border border-green-200 rounded-lg bg-white focus:outline-none focus:border-green-400 placeholder:text-gray-300"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      {/* AI summary bubble — click to edit */}
      <div
        className="bg-gray-100 rounded-2xl px-5 py-4 mb-3 cursor-text"
        onClick={() => setEditingSummary(true)}
      >
        {editingSummary ? (
          <textarea
            autoFocus
            value={summaryValue}
            onChange={(e) => setSummaryValue(e.target.value)}
            onBlur={() => setEditingSummary(false)}
            className="w-full text-sm text-gray-800 leading-relaxed bg-transparent resize-none outline-none"
            rows={4}
          />
        ) : (
          <p className="text-sm text-gray-800 leading-relaxed">{summaryValue}</p>
        )}
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
  onViewPesquisa: (p: { id: string; title: string; expandedQuery: string; content: string; timestamp: string }) => void
  onShowDigest: () => void
  onAddMonitoring: (monitoring: MonitoringSubscription) => void
  onCreateMonitoringFromChat: (monitoring: MonitoringSubscription) => void
  onFirstMessage?: () => void
  digestInitialMessage?: string
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
          <BookOpen className="w-3.5 h-3.5 text-gray-600" />
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

type PesquisaDepth = "padrao" | "completa"

function ModeTag({
  mode,
  onRemove,
  pesquisaDepth,
  onDepthChange,
}: {
  mode: "pesquisar" | "monitorar"
  onRemove: () => void
  pesquisaDepth?: PesquisaDepth
  onDepthChange?: (d: PesquisaDepth) => void
}) {
  const [depthOpen, setDepthOpen] = useState(false)

  if (mode === "pesquisar") {
    return (
      <span className="inline-flex items-center gap-2 flex-shrink-0">
        {/* Mode tag */}
        <span className="group inline-flex items-center gap-1 pl-2 pr-1 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
          <BookOpen className="w-3 h-3 text-gray-500" />
          Pesquisa
          <button
            onClick={onRemove}
            className="ml-0.5 p-0.5 rounded hover:bg-gray-200 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
          >
            <X className="w-2.5 h-2.5 text-gray-400" />
          </button>
        </span>

        {/* Depth selector */}
        <span className="relative">
          <button
            onClick={() => setDepthOpen((v) => !v)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors cursor-pointer text-xs bg-white"
          >
            {pesquisaDepth === "completa" ? "Completa" : "Padrão"}
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
          {depthOpen && (
            <div className="absolute left-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-50 w-56 overflow-hidden">
              <button
                onClick={() => { onDepthChange?.("padrao"); setDepthOpen(false) }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50"
              >
                <p className="text-xs font-medium text-gray-800 mb-0.5">Padrão</p>
                <p className="text-[11px] text-gray-400 leading-snug">Mais rápida. Cobre as principais fontes.</p>
              </button>
              <button
                onClick={() => { onDepthChange?.("completa"); setDepthOpen(false) }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <p className="text-xs font-medium text-gray-800 mb-0.5">Completa</p>
                <p className="text-[11px] text-gray-400 leading-snug">Mais demorada. Análise aprofundada de todas as fontes.</p>
              </button>
            </div>
          )}
        </span>
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
  onViewPesquisa,
  onShowDigest,
  onAddMonitoring,
  onCreateMonitoringFromChat,
  onFirstMessage,
  digestInitialMessage,
}: ChatAreaProps) {
  const [message, setMessage] = useState("")
  const [pesquisaDepth, setPesquisaDepth] = useState<PesquisaDepth>("padrao")
  const hasCalledFirstMessage = useRef(!!digestInitialMessage)
  const [messages, setMessages] = useState<Message[]>(() => {
    if (!digestInitialMessage) return []
    const query = digestInitialMessage
    const expandedQuery = expandQuery(query)
    return [
      { role: "assistant", content: "", contextType: "digest-artifact" },
      { role: "user", content: query },
      { role: "assistant", content: "", contextType: "pesquisa-proposal", pesquisaProposal: { query, expandedQuery } },
    ]
  })
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const plusRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)


  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [messages, inputMode])

  const handleSendMessage = (text?: string) => {
    const content = text ?? message
    if (!content.trim()) return

    if (!hasCalledFirstMessage.current) {
      hasCalledFirstMessage.current = true
      onFirstMessage?.()
    }

    if (inputMode === "monitorar") {
      const topic = content.trim()
      const summary = `Acompanhar alterações legislativas, jurisprudenciais e normativas relacionadas a: ${topic}. O monitoramento cobrirá mudanças em legislação federal, decisões de tribunais superiores e atos administrativos relevantes para o tema.`
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

    if (inputMode === "pesquisar") {
      const query = content.trim()
      const expandedQuery = expandQuery(query)
      setMessages((prev) => [
        ...prev,
        { role: "user", content: query },
        { role: "assistant", content: "", contextType: "pesquisa-proposal", pesquisaProposal: { query, expandedQuery } },
      ])
      setMessage("")
      onSetInputMode("default")
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
    onShowDigest()
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
        <p className="text-sm text-gray-400 mb-12">Inteligência para o direito tributário federal</p>


        {/* Updates pill — above input, default mode only */}
        {inputMode === "default" && (
          <div className="flex justify-center mb-8">
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
                  <ModeTag mode={inputMode} onRemove={handleRemoveTag} pesquisaDepth={pesquisaDepth} onDepthChange={setPesquisaDepth} />

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
              onSelect={(s) => handleSendMessage(s.name)}
            />
          )}

        </div>

        {/* Footnote */}
        <p className="text-[11px] text-gray-300 text-center leading-relaxed mt-8">
          Pesquisa e monitoramento sem opinião jurídica. Consulte especialistas.
        </p>
      </div>
    </div>
  )

  // ── Chat view ───────────────────────────────────────────────────
  const isShowingMonitoringProposal = messages.some((m) => m.contextType === "monitoring-proposal")
    && !messages.some((m) => m.contextType === "monitoring-created")
  const isShowingPesquisaProposal = messages.some((m) => m.contextType === "pesquisa-proposal")
    && !messages.some((m) => m.contextType === "pesquisa-result")

  const isDigestConversation = messages.length > 0 && messages[0]?.contextType === "digest-artifact"
  const [digestDropdownOpen, setDigestDropdownOpen] = useState(false)

  const renderChat = () => (
    <>
      {isDigestConversation && (
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="max-w-2xl mx-auto w-full">
            <h1 className="text-base font-semibold text-gray-900 mb-3">Atualizações</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setDigestDropdownOpen((v) => !v)}
                  className="flex items-center gap-1.5 hover:opacity-60 transition-opacity cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600">1 documento</span>
                </button>
                {digestDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-50 w-80">
                    <button
                      onClick={() => { setDigestDropdownOpen(false); onShowDigest() }}
                      className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 text-left cursor-pointer transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gray-300" />
                      <span className="text-sm text-gray-700 leading-snug">Atualizações</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col px-4 overflow-y-auto pt-6">
        <div className="max-w-2xl mx-auto w-full space-y-6">
          {messages.map((msg, index) => {
            if (msg.role === "assistant" && msg.contextType === "digest-artifact") {
              return (
                <div key={index} className="w-full">
                  <div className="flex items-start gap-2">
                    <MIcon />
                    <button
                      onClick={onShowDigest}
                      className="border border-gray-100 rounded-xl px-4 py-3 max-w-md bg-white text-left hover:bg-gray-50 transition-colors cursor-pointer w-full"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-3 h-3 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">Atualizações</p>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">Direito tributário federal</p>
                    </button>
                  </div>
                </div>
              )
            }

            if (msg.role === "assistant" && msg.contextType === "pesquisa-proposal" && msg.pesquisaProposal) {
              return (
                <div key={index} className="flex justify-start w-full">
                  <PesquisaProposalBubble
                    data={msg.pesquisaProposal}
                    onConfirmed={(expandedQuery) => setMessages((prev) => [
                      ...prev,
                      { role: "assistant", content: "", contextType: "pesquisa-result", pesquisaResult: { query: msg.pesquisaProposal!.query, expandedQuery } },
                    ])}
                  />
                </div>
              )
            }

            if (msg.role === "assistant" && msg.contextType === "pesquisa-result" && msg.pesquisaResult) {
              return (
                <div key={index} className="w-full">
                  <PesquisaResultBubble expandedQuery={msg.pesquisaResult.expandedQuery} onViewPesquisa={onViewPesquisa} />
                </div>
              )
            }

            if (msg.role === "assistant" && msg.contextType === "monitoring-proposal" && msg.monitoringProposal) {
              return (
                <div key={index} className="flex justify-start">
                  <MonitoringProposalBubble
                    data={msg.monitoringProposal}
                    onCreateMonitoring={onCreateMonitoringFromChat}
                    onConfirmed={() => setMessages((prev) => [
                      ...prev,
                      { role: "assistant", content: "Monitoramento criado. Posso ajudar em algo mais?", contextType: "monitoring-created" },
                    ])}
                  />
                </div>
              )
            }

            if (msg.contextType === "monitoring-created") {
              return (
                <div key={index} className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-5 py-3.5">
                    <p className="text-sm text-gray-800">{msg.content}</p>
                  </div>
                </div>
              )
            }

            const isMonitoringTrigger =
              msg.role === "user" &&
              index + 1 < messages.length &&
              messages[index + 1]?.contextType === "monitoring-proposal"
            const isPesquisaTrigger =
              msg.role === "user" &&
              index + 1 < messages.length &&
              messages[index + 1]?.contextType === "pesquisa-proposal"

            return (
              <div key={index} className="space-y-3">
                <div className={`flex items-start gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {isMonitoringTrigger || isPesquisaTrigger ? (
                    <>
                      <div className="px-4 py-2 border border-gray-200 rounded-full bg-white text-sm text-gray-700">
                        {msg.content}
                      </div>
                      <RSAvatar />
                    </>
                  ) : msg.role === "user" ? (
                    <>
                      <div className="max-w-[70%] px-4 py-2.5 rounded-2xl border border-gray-200 bg-white">
                        <p className="text-sm text-gray-800">{msg.content}</p>
                      </div>
                      <RSAvatar />
                    </>
                  ) : (
                    <div className="bg-gray-100 rounded-2xl px-5 py-3.5 max-w-[80%]">
                      <p className="text-sm text-gray-800">{msg.content}</p>
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
    </>
  )

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {messages.length === 0 ? renderWelcome() : renderChat()}
    </div>
  )
}
