"use client"

import { useState, useRef, useEffect } from "react"
import {
  FileText, Gavel, Scale, FileCheck, TrendingUp, Search, X, ChevronDown, ChevronRight, Filter, Clock, Sparkles, Wand2, ArrowRight, Building2, User, Tag, Send, Loader2, Bell
} from "lucide-react"
import { MonitoringSetupFlow } from "./monitoring-setup-flow"
import { cn } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────
type TimeRange = "24h" | "48h" | "7d"
type SourceType = "stf" | "stj" | "trf" | "receita" | "dou" | "carf"
type ItemType = "acordao" | "solucao" | "legislacao"
type Tributo = "IRPJ" | "CSLL" | "PIS" | "COFINS" | "IPI" | "ISS" | "ICMS" | "ITBI" | "ITCMD"

interface UpdateItem {
  id: string
  source: SourceType
  type: ItemType
  orgao: string
  turma?: string
  relator?: string
  date: string
  ementa: string
  tributos: Tributo[]
  assuntos: string[]
  assuntoSugerido?: boolean
}

// ── Mock Data ─────────────────────────────────────────────────────
const MOCK_ITEMS: UpdateItem[] = [
  {
    id: "1",
    source: "stj",
    type: "acordao",
    orgao: "Superior Tribunal de Justiça",
    turma: "1ª Turma",
    relator: "Min. Regina Helena Costa",
    date: "Hoje, 08:30",
    ementa: "TRIBUTÁRIO. IRPJ E CSLL. AMORTIZAÇÃO DE ÁGIO. EMPRESA VEÍCULO. AUSÊNCIA DE PROPÓSITO NEGOCIAL. Não é possível a amortização de ágio quando a operação societária foi realizada com o único propósito de obter vantagem fiscal.",
    tributos: ["IRPJ", "CSLL"],
    assuntos: ["Amortização de ágio", "Propósito negocial"],
  },
  {
    id: "2",
    source: "stf",
    type: "acordao",
    orgao: "Supremo Tribunal Federal",
    turma: "Plenário",
    relator: "Min. Luís Roberto Barroso",
    date: "Hoje, 10:15",
    ementa: "TRIBUTÁRIO. EXCLUSÃO DO ICMS DA BASE DE CÁLCULO DO PIS/COFINS. MODULAÇÃO DE EFEITOS. Definição do marco temporal para produção de efeitos da decisão que excluiu o ICMS da base de cálculo do PIS e da COFINS.",
    tributos: ["PIS", "COFINS", "ICMS"],
    assuntos: ["Exclusão do ICMS", "Modulação de efeitos"],
  },
  {
    id: "3",
    source: "receita",
    type: "solucao",
    orgao: "Receita Federal do Brasil",
    turma: "COSIT",
    date: "Hoje, 11:00",
    ementa: "SOLUÇÃO DE CONSULTA COSIT Nº 45/2024. JCP. DEDUTIBILIDADE. Os juros sobre capital próprio pagos a sócios residentes no exterior são dedutíveis da base de cálculo do IRPJ e da CSLL, observados os limites legais.",
    tributos: ["IRPJ", "CSLL"],
    assuntos: ["JCP", "Dedutibilidade"],
  },
  {
    id: "4",
    source: "trf",
    type: "acordao",
    orgao: "TRF da 3ª Região",
    turma: "3ª Turma",
    relator: "Des. Consuelo Yoshida",
    date: "Hoje, 14:20",
    ementa: "TRIBUTÁRIO. IPI. CRÉDITO PRESUMIDO. EXPORTAÇÃO. O crédito presumido de IPI, como ressarcimento do PIS e da COFINS, não integra a base de cálculo do IRPJ e da CSLL.",
    tributos: ["IPI", "IRPJ", "CSLL"],
    assuntos: ["Crédito presumido", "Exportação"],
  },
  {
    id: "5",
    source: "dou",
    type: "legislacao",
    orgao: "Diário Oficial da União",
    date: "Hoje, 06:00",
    ementa: "LEI Nº 14.XXX/2024. Altera a Lei nº 9.430/1996 para dispor sobre o tratamento tributário aplicável aos juros sobre capital próprio e dá outras providências.",
    tributos: ["IRPJ", "CSLL"],
    assuntos: ["JCP", "Alteração legislativa"],
  },
  {
    id: "6",
    source: "stj",
    type: "acordao",
    orgao: "Superior Tribunal de Justiça",
    turma: "2ª Turma",
    relator: "Min. Mauro Campbell Marques",
    date: "Ontem, 16:45",
    ementa: "TRIBUTÁRIO. PLR. DEDUTIBILIDADE. REQUISITOS LEGAIS. A participação nos lucros e resultados paga aos empregados é dedutível da base de cálculo do IRPJ, desde que observados os requisitos da Lei nº 10.101/2000.",
    tributos: ["IRPJ"],
    assuntos: ["PLR", "Dedutibilidade"],
  },
  {
    id: "7",
    source: "receita",
    type: "solucao",
    orgao: "Receita Federal do Brasil",
    turma: "COSIT",
    date: "Ontem, 09:30",
    ementa: "SOLUÇÃO DE CONSULTA COSIT Nº 44/2024. TRANSFER PRICING. MÉTODO PRL. Esclarecimentos sobre a aplicação do método do preço de revenda menos lucro nas operações de importação.",
    tributos: ["IRPJ", "CSLL"],
    assuntos: ["Transfer pricing", "Preços de transferência"],
  },
  {
    id: "c1",
    source: "carf",
    type: "acordao",
    orgao: "CARF",
    turma: "1ª Turma Ordinária",
    relator: "Cons. Ricardo Morais",
    date: "Hoje, 09:15",
    ementa: "ÁGIO INTERNO. AMORTIZAÇÃO. IMPOSSIBILIDADE. O ágio gerado em operações entre partes relacionadas, sem efetivo desembolso, não pode ser amortizado para fins de apuração do IRPJ e CSLL.",
    tributos: ["IRPJ", "CSLL"],
    assuntos: ["Amortização de ágio", "Planejamento tributário"],
  },
  {
    id: "c2",
    source: "carf",
    type: "acordao",
    orgao: "CARF",
    turma: "3ª Turma Especial",
    relator: "Cons. Ana Paula Lima",
    date: "Ontem, 14:30",
    ementa: "PIS/COFINS. CRÉDITOS. INSUMOS. CONCEITO. Seguindo o entendimento do STJ no REsp 1.221.170, admite-se o creditamento de insumos essenciais e relevantes ao processo produtivo.",
    tributos: ["PIS", "COFINS"],
    assuntos: ["Crédito presumido", "Insumos"],
  },
  {
    id: "8",
    source: "stf",
    type: "acordao",
    orgao: "Supremo Tribunal Federal",
    turma: "1ª Turma",
    relator: "Min. Alexandre de Moraes",
    date: "Ontem, 11:20",
    ementa: "TRIBUTÁRIO. ISS. LOCAL DA PRESTAÇÃO DO SERVIÇO. COMPETÊNCIA. O ISS é devido no local do estabelecimento prestador, e não no local da efetiva prestação do serviço.",
    tributos: ["ISS"],
    assuntos: ["Competência tributária", "Local da prestação"],
  },
]

const SOURCES: { value: SourceType; label: string; icon: React.ElementType }[] = [
  { value: "dou",     label: "DOU",            icon: FileText },
  { value: "stf",     label: "STF",            icon: Scale },
  { value: "stj",     label: "STJ",            icon: Gavel },
  { value: "trf",     label: "TRFs",           icon: Building2 },
  { value: "carf",    label: "CARF",           icon: TrendingUp },
  { value: "receita", label: "RFB",            icon: FileCheck },
]

const TRIBUTOS: Tributo[] = ["IRPJ", "CSLL", "PIS", "COFINS", "IPI", "ISS", "ICMS", "ITBI", "ITCMD"]

const ASSUNTOS = [
  "Amortização de ágio",
  "PLR",
  "JCP",
  "Transfer pricing",
  "Crédito presumido",
  "Exclusão do ICMS",
  "Propósito negocial",
]

const QUICK_PROMPTS = [
  "Resuma o que aconteceu no STJ hoje",
  "atualizações  sobre PIS/COFINS",
  "Atualizações de ágio nas últimas 24h",
]

// Dynamic counts based on time range (simulates real volume)
const BASE_COUNTS: Record<SourceType, number> = {
  dou: 8,
  stf: 12,
  stj: 28,
  trf: 15,
  carf: 18,
  receita: 22,
}

function getCountsByTimeRange(range: TimeRange): Record<SourceType, number> {
  const multipliers: Record<TimeRange, number> = { "24h": 1, "48h": 2.2, "7d": 8 }
  const m = multipliers[range]
  return {
    stf: Math.round(BASE_COUNTS.stf * m),
    stj: Math.round(BASE_COUNTS.stj * m),
    trf: Math.round(BASE_COUNTS.trf * m),
    receita: Math.round(BASE_COUNTS.receita * m),
    dou: Math.round(BASE_COUNTS.dou * m),
    carf: Math.round(BASE_COUNTS.carf * m),
  }
}

// AI-curated highlights (top 3 most important)
const HIGHLIGHTS: UpdateItem[] = [
  MOCK_ITEMS[1], // STF ICMS/PIS/COFINS
  MOCK_ITEMS[0], // STJ ágio
  MOCK_ITEMS[4], // DOU JCP legislation
].filter(Boolean)

// ── Helpers ───────────────────────────────────────────────────────
function getSourceColor(source: SourceType): string {
  const colors: Record<SourceType, string> = {
    stf: "bg-purple-50 text-purple-600",
    stj: "bg-blue-50 text-blue-600",
    trf: "bg-cyan-50 text-cyan-600",
    receita: "bg-amber-50 text-amber-600",
    dou: "bg-emerald-50 text-emerald-600",
    carf: "bg-orange-50 text-orange-600",
  }
  return colors[source]
}

function getTypeLabel(type: ItemType): string {
  const labels: Record<ItemType, string> = {
    acordao: "Acórdão",
    solucao: "Solução de Consulta",
    legislacao: "Legislação",
  }
  return labels[type]
}

function getTimeLabel(range: TimeRange): string {
  const labels: Record<TimeRange, string> = {
    "24h": "24 horas",
    "48h": "48 horas",
    "7d": "7 dias",
  }
  return labels[range]
}

function getTimePhrase(range: TimeRange): string {
  const phrases: Record<TimeRange, string> = {
    "24h": "nas últimas 24 horas",
    "48h": "nas últimas 48 horas",
    "7d": "nos últimos 7 dias",
  }
  return phrases[range]
}

// ── Components ────────────────────────────────────────────────────
function SourceBadge({ source }: { source: SourceType }) {
  const src = SOURCES.find(s => s.value === source)
  if (!src) return null
  const Icon = src.icon
  return (
    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase", getSourceColor(source))}>
      <Icon className="w-2.5 h-2.5" />
      {src.label}
    </span>
  )
}

function SourceChip({
  source,
  count,
  active,
  onClick,
}: {
  source: SourceType
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer",
        active
          ? "bg-gray-900 text-white"
          : "bg-gray-800 text-white hover:bg-gray-700"
      )}
    >
      {SOURCES.find(s => s.value === source)?.label}
      <span className="text-[10px] font-medium text-white/60">
        {count}
      </span>
      {active && <X className="w-2.5 h-2.5 ml-0.5 opacity-60" />}
    </button>
  )
}

function UpdateRow({ item, onClick }: { item: UpdateItem; onClick: () => void }) {
  const src = SOURCES.find(s => s.value === item.source)
  const Icon = src?.icon || FileText
  
  return (
    <button
      onClick={onClick}
      className="w-full text-left py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        {/* Source icon badge */}
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", getSourceColor(item.source))}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          {/* Type + date line */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{getTypeLabel(item.type)}</span>
            <span className="text-[10px] text-gray-300">{item.date}</span>
          </div>
          {/* Ementa - bold title style */}
          <p className="text-[13px] font-semibold text-gray-900 leading-snug mb-2 line-clamp-2">
            {item.ementa}
          </p>
          {/* Metadata row */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-gray-500 mb-2">
            <span>{item.orgao}</span>
            {item.turma && (
              <>
                <span className="text-gray-300">·</span>
                <span>{item.turma}</span>
              </>
            )}
            {item.relator && (
              <>
                <span className="text-gray-300">·</span>
                <span className="flex items-center gap-1 text-gray-400">
                  <User className="w-2.5 h-2.5" />
                  {item.relator}
                </span>
              </>
            )}
          </div>
          {/* Tributo chips - outlined style */}
          {item.tributos.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {item.tributos.slice(0, 4).map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded border border-gray-200 text-gray-500 font-medium bg-white">{t}</span>
              ))}
              {item.tributos.length > 4 && (
                <span className="text-[10px] text-gray-400">+{item.tributos.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

function ItemDetailView({ item, onBack }: { item: UpdateItem; onBack: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <button onClick={onBack} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer">
          <ChevronRight className="w-3 h-3 rotate-180" />
          Voltar
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
        <div className="flex items-center gap-2 mb-3">
          <SourceBadge source={item.source} />
          <span className="text-[10px] text-gray-400">{item.date}</span>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">{getTypeLabel(item.type)}</h3>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">{item.ementa}</p>
        
        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-2">
            <Building2 className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-gray-500">Órgão</p>
              <p className="text-gray-800 font-medium">{item.orgao}</p>
            </div>
          </div>
          {item.turma && (
            <div className="flex items-start gap-2">
              <Scale className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-500">Turma/Câmara</p>
                <p className="text-gray-800 font-medium">{item.turma}</p>
              </div>
            </div>
          )}
          {item.relator && (
            <div className="flex items-start gap-2">
              <User className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-500">Relator</p>
                <p className="text-gray-800 font-medium">{item.relator}</p>
              </div>
            </div>
          )}
          {item.tributos.length > 0 && (
            <div className="flex items-start gap-2">
              <Tag className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-500 mb-1">Tributos</p>
                <div className="flex flex-wrap gap-1">
                  {item.tributos.map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
          {item.assuntos.length > 0 && (
            <div className="flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-500 mb-1">Assuntos</p>
                <div className="flex flex-wrap gap-1">
                  {item.assuntos.map((a, i) => (
                    <span key={i} className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium",
                      item.assuntoSugerido ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-600"
                    )}>
                      {a}
                      {item.assuntoSugerido && i === item.assuntos.length - 1 && (
                        <span className="ml-1 opacity-60">· sugerido</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────
export function DailyUpdatesArtifact({ fullScreen = false }: { fullScreen?: boolean }) {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h")
  const [activeSource, setActiveSource] = useState<SourceType | null>(null)
  const [activeTributo, setActiveTributo] = useState<Tributo | null>(null)
  const [activeAssunto, setActiveAssunto] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<UpdateItem | null>(null)
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchMode, setSearchMode] = useState<"ai" | "filter">("ai")
  const [aiQuery, setAiQuery] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [showMonitoringPrompt, setShowMonitoringPrompt] = useState(false)
  const [showMonitoringSetup, setShowMonitoringSetup] = useState(false)
  const [monitoringCreated, setMonitoringCreated] = useState(false)
  const timeDropdownRef = useRef<HTMLDivElement>(null)
  const aiTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Show monitoring prompt when filters are active
  const canCreateMonitoring = (activeSource || activeTributo || activeAssunto) && !monitoringCreated

  function handleAiSubmit() {
    if (!aiQuery.trim() || aiLoading) return
    setAiLoading(true)
    setAiResponse(null)
    setTimeout(() => {
      setAiLoading(false)
      setAiResponse(`Analisando "${aiQuery}": encontrei 7 decisões relevantes sobre esse tema ${getTimePhrase(timeRange)}. Os principais destaques são o acórdão do STF sobre modulação de efeitos e 3 soluções de consulta da Receita Federal.`)
    }, 2200)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(e.target as Node)) {
        setShowTimeDropdown(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Filter items
  const filteredItems = MOCK_ITEMS.filter(item => {
    if (activeSource && item.source !== activeSource) return false
    if (activeTributo && !item.tributos.includes(activeTributo)) return false
    if (activeAssunto && !item.assuntos.some(a => a.toLowerCase().includes(activeAssunto.toLowerCase()))) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        item.ementa.toLowerCase().includes(q) ||
        item.assuntos.some(a => a.toLowerCase().includes(q)) ||
        item.tributos.some(t => t.toLowerCase().includes(q))
      )
    }
    return true
  })

  // Group by source
  const groupedBySource = SOURCES.reduce((acc, src) => {
    acc[src.value] = filteredItems.filter(i => i.source === src.value)
    return acc
  }, {} as Record<SourceType, UpdateItem[]>)

  const totalCount = filteredItems.length
  const hasActiveFilters = activeSource || activeTributo || activeAssunto || searchQuery
  const activeFilterCount = [activeTributo, activeAssunto].filter(Boolean).length

  // Dynamic counts
  const sourceCounts = getCountsByTimeRange(timeRange)
  const totalDynamicCount = Object.values(sourceCounts).reduce((a, b) => a + b, 0)

  // Item detail view
  if (selectedItem) {
    return (
      <div
        className={cn("bg-white overflow-hidden w-full", fullScreen ? "flex flex-col h-full" : "border border-gray-200 rounded-2xl max-w-[940px]")}
        style={fullScreen ? undefined : { height: "780px" }}
      >
        <ItemDetailView item={selectedItem} onBack={() => setSelectedItem(null)} />
      </div>
    )
  }

  return (
    <div
      className={cn("bg-white overflow-hidden w-full", fullScreen ? "flex flex-col h-full" : "border border-gray-200 rounded-2xl max-w-[940px] shadow-sm")}
      style={fullScreen ? undefined : { height: "780px" }}
    >
      <div className="flex flex-col h-full">

        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          {/* Counter + time picker */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-900">{totalDynamicCount}</span> atualizações {getTimePhrase(timeRange)}
            </p>
            <div className="flex items-center gap-2">
            <div className="relative" ref={timeDropdownRef}>
              <button
                onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-[11px] font-medium text-gray-600 transition-colors cursor-pointer"
              >
                <Clock className="w-3 h-3 text-gray-400" />
                {getTimeLabel(timeRange)}
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              {showTimeDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[110px]">
                  {(["24h", "48h", "7d"] as TimeRange[]).map(t => (
                    <button
                      key={t}
                      onClick={() => { setTimeRange(t); setShowTimeDropdown(false) }}
                      className={cn(
                        "w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 cursor-pointer transition-colors",
                        timeRange === t ? "text-gray-900 font-semibold" : "text-gray-500"
                      )}
                    >
                      {getTimeLabel(t)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Source chips + Mais filtros on same row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {SOURCES.map(src => {
                const count = sourceCounts[src.value]
                return (
                  <SourceChip
                    key={src.value}
                    source={src.value}
                    count={count}
                    active={activeSource === src.value}
                    onClick={() => setActiveSource(activeSource === src.value ? null : src.value)}
                  />
                )
              })}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 cursor-pointer transition-colors flex-shrink-0"
            >
              <Filter className="w-3 h-3" />
              {showFilters ? "Ocultar" : "Mais filtros"}
              {activeFilterCount > 0 && !showFilters && (
                <span className="ml-1 px-1.5 py-0.5 bg-gray-900 text-white text-[9px] rounded-full font-medium">{activeFilterCount}</span>
              )}
            </button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
              {/* Assunto filters - primary based on user feedback */}
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Assunto</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {ASSUNTOS.map(a => {
                    const isActive = activeAssunto === a
                    return (
                      <button
                        key={a}
                        onClick={() => setActiveAssunto(isActive ? null : a)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer",
                          isActive ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {a}
                      </button>
                    )
                  })}
                </div>
              </div>
              {/* Tributo filters */}
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Tributo</p>
                <div className="flex items-center gap-1 flex-wrap">
                  {TRIBUTOS.map(t => {
                    const isActive = activeTributo === t
                    return (
                      <button
                        key={t}
                        onClick={() => setActiveTributo(isActive ? null : t)}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer",
                          isActive ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        )}
                      >
                        {t}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Monitoring prompt - shown when filters are active */}
          {canCreateMonitoring && !showMonitoringSetup && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-600" />
                  <p className="text-xs text-gray-700">
                    Quer ser alertado sempre que algo novo surgir sobre isso?
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowMonitoringSetup(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    Ignorar
                  </button>
                  <button
                    onClick={() => setShowMonitoringSetup(true)}
                    className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    Criar monitoramento
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Monitoring setup flow */}
          {showMonitoringSetup && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <MonitoringSetupFlow
                initialScope={{
                  sources: activeSource ? [activeSource] : [],
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  tributos: activeTributo ? [activeTributo as any] : [],
                  assuntos: activeAssunto ? [activeAssunto] : [],
                }}
                isCustomPrompt={false}
                onComplete={(name, scope) => {
                  setShowMonitoringSetup(false)
                  setMonitoringCreated(true)
                }}
                onCancel={() => setShowMonitoringSetup(false)}
              />
            </div>
          )}

          {/* Success message */}
          {monitoringCreated && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                <Bell className="w-4 h-4 text-emerald-600" />
                <p className="text-xs text-emerald-700 font-medium">
                  Monitoramento criado! Você será alertado quando houver atualizações .
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Search bar — AI (default) or Filter */}
        <div className="px-4 pt-3 pb-2.5 border-b border-gray-100">
          {/* Mode toggle */}
          <div className="flex items-center gap-1 mb-2.5 p-0.5 bg-gray-100 rounded-lg w-fit">
            <button
              onClick={() => { setSearchMode("ai"); setSearchQuery("") }}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer",
                searchMode === "ai" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Wand2 className={cn("w-3 h-3", searchMode === "ai" ? "text-amber-500" : "text-gray-400")} />
              IA
            </button>
            <button
              onClick={() => { setSearchMode("filter"); setAiQuery(""); setAiResponse(null); setAiLoading(false) }}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer",
                searchMode === "filter" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Search className={cn("w-3 h-3", searchMode === "filter" ? "text-gray-700" : "text-gray-400")} />
              Palavra-chave
            </button>
          </div>

          {/* AI mode */}
          {searchMode === "ai" && (
            <div>
              <div className={cn(
                "flex items-end gap-2 px-3 py-2.5 rounded-xl border transition-all",
                aiLoading ? "border-amber-200 bg-amber-50/40" : "border-gray-200 bg-gray-50 focus-within:border-gray-300 focus-within:bg-white focus-within:shadow-sm"
              )}>
                <textarea
                  ref={aiTextareaRef}
                  value={aiQuery}
                  onChange={e => {
                    setAiQuery(e.target.value)
                    if (aiTextareaRef.current) {
                      aiTextareaRef.current.style.height = "auto"
                      aiTextareaRef.current.style.height = Math.min(aiTextareaRef.current.scrollHeight, 80) + "px"
                    }
                  }}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAiSubmit() } }}
                  placeholder="Descreva o que quer encontrar..."
                  rows={1}
                  disabled={aiLoading}
                  className="flex-1 text-xs bg-transparent text-gray-800 placeholder:text-gray-400 outline-none resize-none leading-relaxed disabled:opacity-50"
                />
                <button
                  onClick={handleAiSubmit}
                  disabled={!aiQuery.trim() || aiLoading}
                  className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer mb-0.5",
                    aiQuery.trim() && !aiLoading ? "bg-gray-900 hover:bg-gray-700" : "bg-gray-200 cursor-not-allowed"
                  )}
                >
                  {aiLoading
                    ? <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
                    : <Send className={cn("w-3 h-3", aiQuery.trim() ? "text-white" : "text-gray-400")} />
                  }
                </button>
              </div>
              {/* AI loading state */}
              {aiLoading && (
                <div className="flex items-center gap-2 mt-2 px-1">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-[11px] text-gray-400">Analisando as atualizações...</span>
                </div>
              )}
              {/* AI response */}
              {aiResponse && !aiLoading && (
                <div className="mt-2.5 px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-gray-700 leading-relaxed">{aiResponse}</p>
                  </div>
                  <button
                    onClick={() => { setAiQuery(""); setAiResponse(null) }}
                    className="mt-2 text-[10px] text-amber-600 hover:text-amber-700 cursor-pointer font-medium"
                  >
                    Limpar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Filter mode */}
          {searchMode === "filter" && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 focus-within:border-gray-300 focus-within:bg-white focus-within:shadow-sm transition-all">
              <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por termo, tributo ou assunto..."
                className="flex-1 text-xs bg-transparent text-gray-800 placeholder:text-gray-400 outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600 cursor-pointer flex-shrink-0">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <p className="text-sm font-medium text-gray-700 mb-1">Nenhum resultado</p>
              <p className="text-xs text-gray-400 mb-4">Tente outros termos ou filtros</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {["IRPJ", "PIS/COFINS", "ágio", "JCP"].map(t => (
                  <button
                    key={t}
                    onClick={() => setSearchQuery(t)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-4 py-3">
              {/* Destaques section — AI highlights at top when no filters */}
              {!hasActiveFilters && HIGHLIGHTS.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Destaques</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {HIGHLIGHTS.map(item => (
                      <UpdateRow key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Grouped by source with Ver mais */}
              {!activeSource && !searchQuery ? (
                SOURCES.map(src => {
                  const items = groupedBySource[src.value]
                  if (items.length === 0) return null
                  const Icon = src.icon
                  const displayCount = sourceCounts[src.value]
                  const showItems = items.slice(0, 3) // Show max 3 per section
                  const hasMore = displayCount > 3
                  return (
                    <div key={src.value} className="mb-5 last:mb-2">
                      {/* Group header with Ver mais */}
                      <div className="flex items-center justify-between py-2.5 sticky top-0 bg-white z-10 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-5 h-5 rounded flex items-center justify-center", getSourceColor(src.value))}>
                            <Icon className="w-3 h-3" />
                          </div>
                          <span className="text-xs font-semibold text-gray-700">{src.label}</span>
                          <span className="text-[11px] text-gray-400">({displayCount})</span>
                        </div>
                        {hasMore && (
                          <button
                            onClick={() => setActiveSource(src.value)}
                            className="text-[11px] text-gray-500 hover:text-gray-700 font-medium cursor-pointer transition-colors flex items-center gap-0.5"
                          >
                            Ver mais
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {showItems.map(item => (
                        <UpdateRow key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                      ))}
                    </div>
                  )
                })
              ) : (
                /* Filtered view — show all matching items */
                <>
                  {activeSource && (
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <SourceBadge source={activeSource} />
                        <span className="text-[11px] text-gray-400">{sourceCounts[activeSource]} itens</span>
                      </div>
                      <button
                        onClick={() => setActiveSource(null)}
                        className="text-[11px] text-gray-500 hover:text-gray-700 font-medium cursor-pointer flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Limpar filtro
                      </button>
                    </div>
                  )}
                  {filteredItems.map(item => (
                    <UpdateRow key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
