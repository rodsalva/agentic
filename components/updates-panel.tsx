"use client"

import { useState, useRef, useEffect } from "react"
import {
  X, ChevronLeft, FileText, TrendingUp, Scale, FileCheck,
  Sparkles, ArrowRight, Send, Loader2, ChevronDown, ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────
export type UpdateItem = {
  id: string
  title: string
  date: string
  source: string
  categoryType: string
  categoryLabel: string
}

export type UpdateCategory = {
  type: string
  label: string
  shortLabel: string
  icon: React.ElementType
  updates: Omit<UpdateItem, "categoryType" | "categoryLabel">[]
}

type TimeRangePreset = "24h" | "7d"

type ChatMessage = {
  role: "user" | "assistant"
  text: string
  items?: UpdateItem[]
}

// ── Data ──────────────────────────────────────────────────────────
const allCategories: UpdateCategory[] = [
  {
    type: "legislation",
    label: "Legislação",
    shortLabel: "Legislação",
    icon: FileText,
    updates: [
      { id: "leg-1", title: "Instrução Normativa RFB nº 2.228/2024 – Alteração no prazo de entrega da DCTF", date: "Hoje, 08h14", source: "RFB" },
      { id: "leg-2", title: "Portaria ME nº 571/2024 – Atualização da tabela de IRPF", date: "Hoje, 07h52", source: "ME" },
      { id: "leg-3", title: "IN RFB nº 2.229/2024 – Regras para compensação de prejuízos fiscais", date: "Hoje, 05h45", source: "RFB" },
      { id: "leg-4", title: "Súmula Vinculante nº 52 – Contribuição ao Funrural", date: "Hoje, 04h20", source: "STF" },
      { id: "leg-5", title: "Lei nº 14.973/2024 – Tributação de offshores e fundos exclusivos", date: "Hoje, 03h10", source: "Congresso" },
      { id: "leg-6", title: "Parecer PGFN nº 891/2024 – Exclusão do ICMS da base do PIS/COFINS", date: "Hoje, 02h00", source: "PGFN" },
      { id: "leg-7", title: "Portaria Conjunta RFB/PGFN nº 3/2024 – Transação tributária", date: "Hoje, 01h15", source: "RFB/PGFN" },
      { id: "leg-8", title: "IN RFB nº 2.230/2024 – ECF 2024: novos campos obrigatórios", date: "Ontem, 22h30", source: "RFB" },
      { id: "leg-9", title: "Resolução CGSN nº 175/2024 – Simples Nacional: novas tabelas", date: "Ontem, 21h00", source: "CGSN" },
    ],
  },
  {
    type: "jurisprudencia",
    label: "Jurisprudência",
    shortLabel: "Jurisprudência",
    icon: Scale,
    updates: [
      { id: "jur-1", title: "Acórdão STJ – REsp 2.145.331 – Dedutibilidade de despesas com PLR", date: "Hoje, 06h30", source: "STJ" },
      { id: "jur-2", title: "Decisão monocrática STF – ADI 7.325 – CSLL sobre exportações", date: "Ontem, 23h45", source: "STF" },
      { id: "jur-3", title: "Acórdão STF – RE 1.240.122 – ITBI sobre integralização de capital", date: "Ontem, 19h50", source: "STF" },
      { id: "jur-4", title: "Súmula STJ – Contribuinte de boa-fé em operação com documento falso", date: "Ontem, 17h20", source: "STJ" },
      { id: "jur-5", title: "Decisão TRF-2ª Região – IRPJ: dedutibilidade de gastos com treinamento", date: "Ontem, 15h00", source: "TRF-2" },
      { id: "jur-6", title: "Precedente STF – Imunidade tributária para entidades filantrópicas", date: "2 dias atrás, 10h30", source: "STF" },
    ],
  },
  {
    type: "reforma",
    label: "Reforma tributária",
    shortLabel: "Reforma",
    icon: TrendingUp,
    updates: [
      { id: "ref-1", title: "Regulamentação do IBS: publicado decreto com alíquotas de referência", date: "Hoje, 09h00", source: "MF" },
      { id: "ref-2", title: "CBS – Comitê Gestor divulga cronograma de implementação 2025–2033", date: "Hoje, 07h30", source: "Comitê Gestor" },
      { id: "ref-3", title: "Período de transição: governo publica simulador oficial IBS/CBS", date: "Hoje, 06h00", source: "MF" },
      { id: "ref-4", title: "Imposto Seletivo: lista de bens e serviços é ampliada por decreto", date: "Hoje, 04h45", source: "Congresso" },
      { id: "ref-5", title: "Fundo de Desenvolvimento Regional: critérios de distribuição aprovados", date: "Hoje, 03h20", source: "Senado" },
      { id: "ref-6", title: "PEC complementar à reforma tributária é protocolada na Câmara", date: "Ontem, 22h10", source: "Câmara" },
      { id: "ref-7", title: "Nota técnica MF: impacto setorial da reforma sobre o agronegócio", date: "Ontem, 20h30", source: "MF" },
      { id: "ref-8", title: "Cashback do IBS: regulamentação para contribuintes de baixa renda", date: "Ontem, 18h00", source: "MF" },
    ],
  },
  {
    type: "carf",
    label: "Acórdãos do CARF",
    shortLabel: "CARF",
    icon: FileText,
    updates: [
      { id: "carf-1", title: "Ac. 1302-007.541 – Ágio interno em reorganização societária: indedutível", date: "Hoje, 10h05", source: "CARF 1ª Turma" },
      { id: "carf-2", title: "Ac. 2401-012.890 – JCP retroativo: possibilidade e limites", date: "Hoje, 09h30", source: "CARF 2ª Turma" },
      { id: "carf-3", title: "Ac. 3302-014.220 – PIS/COFINS: insumos na atividade de transporte", date: "Hoje, 08h45", source: "CARF 3ª Turma" },
      { id: "carf-4", title: "Ac. 1401-005.678 – Planejamento tributário abusivo: propósito negocial", date: "Hoje, 07h20", source: "CSRF" },
      { id: "carf-5", title: "Ac. 2302-010.334 – IRPJ: dedutibilidade de multas contratuais", date: "Hoje, 06h10", source: "CARF 2ª Turma" },
    ],
  },
  {
    type: "rfb",
    label: "Soluções da Receita Federal",
    shortLabel: "Soluções da RFB",
    icon: FileCheck,
    updates: [
      { id: "rfb-1", title: "SC COSIT nº 112/2024 – IRPF: ganho de capital na venda de imóvel herdado", date: "Hoje, 08h30", source: "COSIT" },
      { id: "rfb-2", title: "SC COSIT nº 113/2024 – PIS/COFINS: regime monofásico de combustíveis", date: "Hoje, 07h15", source: "COSIT" },
      { id: "rfb-3", title: "SC COSIT nº 114/2024 – IRPJ: provisão para créditos de liquidação duvidosa", date: "Hoje, 06h00", source: "COSIT" },
      { id: "rfb-4", title: "SC COSIT nº 115/2024 – CSLL: apuração em SCP", date: "Hoje, 04h30", source: "COSIT" },
      { id: "rfb-5", title: "SC DISIT/SRRF04 nº 4.012/2024 – IOF em mútuo entre coligadas", date: "Hoje, 03h00", source: "SRRF04" },
      { id: "rfb-6", title: "SC COSIT nº 116/2024 – Simples Nacional: atividade de factoring", date: "Ontem, 22h45", source: "COSIT" },
    ],
  },
]

const AI_HIGHLIGHTS_24H = [
  {
    id: "h1",
    title: "RFB alterou prazo de compensação de prejuízos fiscais",
    summary: "IN RFB nº 2.229/2024 restringe o uso de prejuízos fiscais de períodos anteriores.",
    categoryType: "legislation",
    categoryLabel: "Legislação",
    source: "RFB",
    date: "Hoje, 05h45",
    itemId: "leg-3",
    priority: "high" as const,
  },
  {
    id: "h2",
    title: "STJ firmou entendimento sobre dedutibilidade de PLR",
    summary: "Acórdão consolida posição favorável: despesas com PLR são dedutíveis.",
    categoryType: "jurisprudencia",
    categoryLabel: "Jurisprudência",
    source: "STJ",
    date: "Hoje, 06h30",
    itemId: "jur-1",
    priority: "high" as const,
  },
  {
    id: "h3",
    title: "Reforma tributária: alíquotas do IBS publicadas",
    summary: "Decreto define as alíquotas iniciais do IBS para 2026–2028.",
    categoryType: "reforma",
    categoryLabel: "Reforma",
    source: "MF",
    date: "Hoje, 09h00",
    itemId: "ref-1",
    priority: "medium" as const,
  },
]

const AI_HIGHLIGHTS_7D = [
  ...AI_HIGHLIGHTS_24H,
  {
    id: "h4",
    title: "CARF manteve ágio interno como indedutível",
    summary: "Precedente reforça vedação ao aproveitamento de ágio em reorganizações internas.",
    categoryType: "carf",
    categoryLabel: "CARF",
    source: "CARF 1ª Turma",
    date: "3 dias atrás",
    itemId: "carf-1",
    priority: "high" as const,
  },
  {
    id: "h5",
    title: "COSIT esclareceu tratamento de SCP na CSLL",
    summary: "Solução define critérios de apuração para sociedades em conta de participação.",
    categoryType: "rfb",
    categoryLabel: "Soluções da RFB",
    source: "COSIT",
    date: "4 dias atrás",
    itemId: "rfb-4",
    priority: "medium" as const,
  },
  {
    id: "h6",
    title: "STF decidiu sobre ITBI em integralização de capital",
    summary: "Acórdão define limites de incidência do ITBI em aportes societários.",
    categoryType: "jurisprudencia",
    categoryLabel: "Jurisprudência",
    source: "STF",
    date: "5 dias atrás",
    itemId: "jur-3",
    priority: "medium" as const,
  },
]

// ── Helpers ───────────────────────────────────────────────────────
function getAllUpdates(): UpdateItem[] {
  return allCategories.flatMap(cat =>
    cat.updates.map(u => ({ ...u, categoryType: cat.type, categoryLabel: cat.shortLabel }))
  )
}

function getCategoryColor(type: string): string {
  const map: Record<string, string> = {
    legislation:    "bg-blue-50 text-blue-600",
    jurisprudencia: "bg-orange-50 text-orange-600",
    reforma:        "bg-amber-50 text-amber-600",
    carf:           "bg-purple-50 text-purple-600",
    rfb:            "bg-emerald-50 text-emerald-600",
  }
  return map[type] ?? "bg-gray-50 text-gray-600"
}

// Simulated AI: interprets natural language and returns matching items + a reply sentence
function simulateAiSearch(query: string): { reply: string; items: UpdateItem[] } {
  const q = query.toLowerCase()
  let items = getAllUpdates()

  if (/legisla|lei|portaria|instrução|normativa|in rfb/i.test(q)) {
    items = items.filter(i => i.categoryType === "legislation")
  } else if (/jurisprudên|acórdão|stj|stf|trf|súmula|decisão/i.test(q)) {
    items = items.filter(i => i.categoryType === "jurisprudencia")
  } else if (/carf|turma|csrf/i.test(q)) {
    items = items.filter(i => i.categoryType === "carf")
  } else if (/reforma|ibs|cbs|imposto seletivo/i.test(q)) {
    items = items.filter(i => i.categoryType === "reforma")
  } else if (/solução|cosit|rfb|receita federal/i.test(q)) {
    items = items.filter(i => i.categoryType === "rfb")
  }

  const terms = q
    .replace(/quais?|sobre|tem|me|o que|há|existe|mostre|ver|preciso/gi, "")
    .trim()
    .split(/\s+/)
    .filter(t => t.length > 3)

  if (terms.length > 0) {
    const matched = items.filter(i => terms.some(t => i.title.toLowerCase().includes(t)))
    if (matched.length > 0) items = matched
  }

  const count = items.length
  const reply = count > 0
    ? `Encontrei ${count} atualização${count > 1 ? "s" : ""} relevante${count > 1 ? "s" : ""} para sua pergunta.`
    : "Não encontrei atualizações específicas para essa consulta no período selecionado."

  return { reply, items: items.slice(0, 10) }
}

// ── Sub-components ────────────────────────────────────────────────
function CategoryBadge({ type, label }: { type: string; label: string }) {
  return (
    <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", getCategoryColor(type))}>
      {label}
    </span>
  )
}

function UpdateRow({ item, onClick }: { item: UpdateItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-0 py-2.5 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
    >
      <p className="text-xs font-medium text-gray-800 leading-snug mb-1 group-hover:text-gray-900">
        {item.title}
      </p>
      <div className="flex items-center gap-1.5">
        <CategoryBadge type={item.categoryType} label={item.categoryLabel} />
        <span className="text-[10px] text-gray-400">{item.date}</span>
        <span className="text-[10px] text-gray-300">&middot;</span>
        <span className="text-[10px] text-gray-400">{item.source}</span>
      </div>
    </button>
  )
}

function CollapsibleCategory({
  category,
  onSelect,
}: {
  category: UpdateCategory
  onSelect: (type: string) => void
}) {
  const Icon = category.icon

  return (
    <div className="border-b border-gray-50 last:border-0">
      <button
        onClick={() => onSelect(category.type)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <div className={cn("w-5 h-5 rounded flex items-center justify-center flex-shrink-0", getCategoryColor(category.type))}>
            <Icon className="w-3 h-3" />
          </div>
          <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">{category.shortLabel}</span>
          <span className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded bg-gray-100 text-[10px] font-semibold text-gray-500">
            {category.updates.length}
          </span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
      </button>
    </div>
  )
}

// ── Item detail view ──────────────────────────────────────────────
function DetailView({
  item,
  onBack,
  onClose,
}: {
  item: UpdateItem
  onBack: () => void
  onClose: () => void
}) {
  return (
    <div className="absolute inset-0 bg-white flex flex-col z-20">
      <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-2 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3 h-3" />
            <span>Voltar</span>
          </button>
          <div className="flex items-center gap-2 mb-1.5">
            <CategoryBadge type={item.categoryType} label={item.categoryLabel} />
            <span className="text-xs text-gray-400">{item.source}</span>
            <span className="text-xs text-gray-300">&middot;</span>
            <span className="text-xs text-gray-400">{item.date}</span>
          </div>
          <h2 className="text-sm font-semibold text-gray-900 leading-snug">{item.title}</h2>
        </div>
        <button onClick={onClose} className="flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="text-sm text-gray-700 leading-relaxed">
          {`Este documento apresenta as disposições normativas referentes ao tema indicado. A análise completa do texto legal, incluindo seus impactos práticos e possíveis desdobramentos, encontra-se disponível para consulta detalhada.\n\nPara uma interpretação aprofundada, recomenda-se a leitura integral do dispositivo em conjunto com a legislação correlata e a jurisprudência aplicável ao caso concreto.`}
        </p>
      </div>
    </div>
  )
}

// ── Chat box ──────────────────────────────────────────────────────
interface ChatBoxProps {
  onSelectItem: (item: UpdateItem) => void
  onSearchStateChange: (hasResults: boolean, results: UpdateItem[], query: string) => void
  onClear: () => void
  isSearchActive: boolean
}

function ChatBox({ onSelectItem, onSearchStateChange, onClear, isSearchActive }: ChatBoxProps) {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSend() {
    const q = input.trim()
    if (!q || loading) return
    setInput("")
    setLoading(true)
    setTimeout(() => {
      const { items } = simulateAiSearch(q)
      onSearchStateChange(true, items, q)
      setLoading(false)
    }, 900)
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function handleClear() {
    onClear()
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + "px"
    }
  }, [input])

  return (
    <div className={cn(
      "border-t flex flex-col transition-all",
      focused || isSearchActive ? "border-gray-200 bg-gray-50/50" : "border-gray-100"
    )}>
      {/* Input row */}
      <div className="p-3">
        <div className={cn(
          "flex items-start gap-2 px-3 py-2 rounded-2xl border transition-all",
          focused
            ? "border-gray-300 bg-white shadow-sm ring-2 ring-gray-100"
            : "border-gray-200 bg-white hover:border-gray-300"
        )}>
          <Sparkles className={cn(
            "w-4 h-4 flex-shrink-0 transition-colors mt-1",
            focused ? "text-amber-500" : "text-gray-300"
          )} />
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Busque por algo específico..."
            rows={1}
            className={cn(
              "flex-1 text-xs bg-transparent text-gray-900 placeholder:text-gray-400 outline-none resize-none leading-relaxed transition-all",
              focused ? "min-h-[60px]" : "min-h-[20px]"
            )}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all mt-0.5",
              input.trim() && !loading
                ? "bg-gray-900 hover:bg-gray-700 hover:scale-105 cursor-pointer"
                : "bg-gray-100 cursor-not-allowed"
            )}
          >
            {loading
              ? <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
              : <Send className={cn("w-3 h-3", input.trim() && !loading ? "text-white" : "text-gray-400")} />
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Search results view ───────────────────────────────────────────
function SearchResultsView({
  results,
  query,
  onSelectItem,
  onBack,
  noResults,
}: {
  results: UpdateItem[]
  query: string
  onSelectItem: (item: UpdateItem) => void
  onBack: () => void
  noResults: boolean
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header with back button */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Voltar
        </button>

      </div>

      {/* No results state */}
      {noResults && (
        <div className="px-5 py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 font-medium mb-1">Nenhum resultado encontrado</p>
          <p className="text-xs text-gray-400 mb-4">Tente termos como:</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {["IRPJ", "PIS/COFINS", "STJ", "ágio", "PLR"].map(t => (
              <span key={t} className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-500">{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Results list */}
      {!noResults && results.length > 0 && (
        <div className="px-5 py-3">
          <p className="text-[10px] text-gray-400 mb-3">{results.length} resultado{results.length !== 1 ? "s" : ""}</p>
          <div className="flex flex-col divide-y divide-gray-50">
            {results.map(item => (
              <UpdateRow key={item.id} item={item} onClick={() => onSelectItem(item)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────
interface UpdatesPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function UpdatesPanel({ isOpen, onClose }: UpdatesPanelProps) {
  const [selectedItem, setSelectedItem] = useState<UpdateItem | null>(null)
  const [timePreset, setTimePreset] = useState<TimeRangePreset>("24h")
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)
  const [activeSource, setActiveSource] = useState<string | null>(null)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchResults, setSearchResults] = useState<UpdateItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [noSearchResults, setNoSearchResults] = useState(false)
  const timeDropdownRef = useRef<HTMLDivElement>(null)

  const highlights = timePreset === "24h" ? AI_HIGHLIGHTS_24H : AI_HIGHLIGHTS_7D
  const activeCategory = activeSource ? allCategories.find(c => c.type === activeSource) : null

  function handleSearchStateChange(hasResults: boolean, results: UpdateItem[], query: string) {
    setIsSearchActive(true)
    setSearchResults(results)
    setSearchQuery(query)
    setNoSearchResults(results.length === 0)
    setActiveSource(null) // Clear source filter when searching
  }

  function handleSearchClear() {
    setIsSearchActive(false)
    setSearchResults([])
    setSearchQuery("")
    setNoSearchResults(false)
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

  useEffect(() => {
    if (!isOpen) {
      setSelectedItem(null)
      setTimePreset("24h")
      setShowTimeDropdown(false)
      setActiveSource(null)
      setIsSearchActive(false)
      setSearchResults([])
      setSearchQuery("")
      setNoSearchResults(false)
    }
  }, [isOpen])

  const TIME_OPTIONS: { value: TimeRangePreset; label: string }[] = [
    { value: "24h", label: "24 horas" },
    { value: "7d",  label: "7 dias" },
  ]

  return (
    <div
      className={cn(
        "h-full border-l border-gray-200 bg-white flex flex-col transition-all duration-300 ease-in-out overflow-hidden relative",
        isOpen ? "w-96" : "w-0"
      )}
    >
      {isOpen && (
        <>
          {/* Detail overlay */}
          {selectedItem && (
            <DetailView
              item={selectedItem}
              onBack={() => setSelectedItem(null)}
              onClose={onClose}
            />
          )}

          {/* ── Header ── */}
          <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-gray-900">Atualizações</h2>
              {/* Time range dropdown */}
              <div className="relative" ref={timeDropdownRef}>
                <button
                  onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-medium text-gray-600">
                    {TIME_OPTIONS.find(o => o.value === timePreset)?.label}
                  </span>
                  <ChevronDown className={cn("w-3 h-3 text-gray-400 transition-transform", showTimeDropdown && "rotate-180")} />
                </button>
                {showTimeDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                    {TIME_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setTimePreset(opt.value); setShowTimeDropdown(false) }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer",
                          timePreset === opt.value ? "font-medium text-gray-900 bg-gray-50" : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto min-h-0">

            {/* Fontes — clickable chips */}
            <div className="px-5 pt-4 pb-3 border-b border-gray-50">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-2.5">Fontes:</p>
              <div className="flex flex-wrap gap-1">
                {allCategories.map(cat => {
                  const Icon = cat.icon
                  const isActive = activeSource === cat.type
                  return (
                    <button
                      key={cat.type}
                      onClick={() => setActiveSource(isActive ? null : cat.type)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full transition-all cursor-pointer",
                        isActive
                          ? "bg-gray-900 text-white"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-600"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="text-[11px] font-medium">{cat.shortLabel}</span>
                      <span className={cn(
                        "inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-semibold",
                        isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"
                      )}>
                        {cat.updates.length}
                      </span>
                      {isActive && <X className="w-2.5 h-2.5 ml-0.5 opacity-70" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Source list view — when a source is selected */}
            {activeSource && activeCategory && (
              <div className="px-5 py-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-5 h-5 rounded flex items-center justify-center", getCategoryColor(activeCategory.type))}>
                      <activeCategory.icon className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-semibold text-gray-800">{activeCategory.label}</span>
                    <span className="text-[10px] text-gray-400">({activeCategory.updates.length})</span>
                  </div>
                  <button
                    onClick={() => setActiveSource(null)}
                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-3 h-3" />
                    Voltar
                  </button>
                </div>
                <div className="flex flex-col divide-y divide-gray-50">
                  {activeCategory.updates.map(u => {
                    const item = { ...u, categoryType: activeCategory.type, categoryLabel: activeCategory.shortLabel }
                    return <UpdateRow key={u.id} item={item} onClick={() => setSelectedItem(item)} />
                  })}
                </div>
              </div>
            )}

            {/* Search results view */}
            {isSearchActive && !activeSource && (
              <SearchResultsView
                results={searchResults}
                query={searchQuery}
                onSelectItem={setSelectedItem}
                onBack={handleSearchClear}
                noResults={noSearchResults}
              />
            )}

            {/* Default view: highlights */}
            {!activeSource && !isSearchActive && (
              <div className="px-5 pt-4 pb-3">
                <div className="flex items-center gap-1.5 mb-3">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                    Destaques {timePreset === "7d" ? "da semana" : "do dia"}
                  </p>
                  <span className="text-[10px] text-gray-400">({highlights.length})</span>
                </div>
                <div className="flex flex-col gap-2">
                  {highlights.map(h => (
                    <button
                      key={h.id}
                      onClick={() => {
                        const all = getAllUpdates()
                        const item = all.find(u => u.id === h.itemId)
                        if (item) setSelectedItem(item)
                      }}
                      className="group w-full text-left p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                          h.priority === "high" ? "bg-red-400" : "bg-amber-400"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 leading-snug mb-0.5">{h.title}</p>
                          <p className="text-[11px] text-gray-500 leading-relaxed mb-1.5">{h.summary}</p>
                          <div className="flex items-center gap-1.5">
                            <CategoryBadge type={h.categoryType} label={h.categoryLabel} />
                            <span className="text-[10px] text-gray-400">{h.date}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-0.5 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ── Chat box pinned at bottom ── */}
          <div className="flex-shrink-0">
            <ChatBox
              onSelectItem={setSelectedItem}
              onSearchStateChange={handleSearchStateChange}
              onClear={handleSearchClear}
              isSearchActive={isSearchActive}
            />
          </div>
        </>
      )}
    </div>
  )
}
