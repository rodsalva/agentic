"use client"

import { useState } from "react"
import {
  Bell,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  FileText,
  Scale,
  Gavel,
  Building2,
  User,
  ExternalLink,
  Search,
  FileSearch,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────
type SourceType = "stf" | "stj" | "trf" | "receita" | "dou" | "carf"
type ItemType = "acordao" | "solucao" | "legislacao"
type ImpactLevel = "alto" | "medio" | "baixo"

interface MonitoringItem {
  id: string
  source: SourceType
  type: ItemType
  orgao: string
  turma?: string
  relator?: string
  date: string
  title: string
  ementa: string
  impact: ImpactLevel
  isNew: boolean
}

interface MonitoringArtifactProps {
  name: string
  lastChecked: string
  newCount: number
  items: MonitoringItem[]
  impactSummary: string
  suggestions: string[]
  onSuggestionClick?: (suggestion: string) => void
  onBack?: () => void
}

// ── Mock Data ─────────────────────────────────────────────────────
const MOCK_ITEMS: MonitoringItem[] = [
  {
    id: "m1",
    source: "carf",
    type: "acordao",
    orgao: "CARF",
    turma: "1ª Turma Ordinária",
    relator: "Cons. Ricardo Morais",
    date: "Hoje, 09:15",
    title: "Ágio interno: novo precedente reforça vedação",
    ementa:
      "ÁGIO INTERNO. AMORTIZAÇÃO. IMPOSSIBILIDADE. O ágio gerado em operações entre partes relacionadas, sem efetivo desembolso, não pode ser amortizado para fins de apuração do IRPJ e CSLL.",
    impact: "alto",
    isNew: true,
  },
  {
    id: "m2",
    source: "stj",
    type: "acordao",
    orgao: "Superior Tribunal de Justiça",
    turma: "1ª Turma",
    relator: "Min. Regina Helena Costa",
    date: "Ontem, 14:30",
    title: "Empresa veículo e propósito negocial",
    ementa:
      "TRIBUTÁRIO. IRPJ E CSLL. AMORTIZAÇÃO DE ÁGIO. EMPRESA VEÍCULO. AUSÊNCIA DE PROPÓSITO NEGOCIAL. Não é possível a amortização de ágio quando a operação societária foi realizada com o único propósito de obter vantagem fiscal.",
    impact: "alto",
    isNew: true,
  },
  {
    id: "m3",
    source: "receita",
    type: "solucao",
    orgao: "Receita Federal do Brasil",
    turma: "COSIT",
    date: "Ontem, 11:00",
    title: "Orientação sobre registro contábil",
    ementa:
      "SOLUÇÃO DE CONSULTA COSIT Nº 48/2024. ÁGIO. REGISTRO CONTÁBIL. Esclarecimentos sobre os requisitos formais para registro de ágio e sua posterior amortização fiscal.",
    impact: "medio",
    isNew: false,
  },
]

const MOCK_IMPACT_SUMMARY =
  "O novo acórdão do CARF reforça a vedação ao ágio interno, criando precedente desfavorável para reestruturações societárias sem propósito negocial comprovado. Recomenda-se revisão de operações em curso."

const MOCK_SUGGESTIONS = [
  "Ver todos os acórdãos sobre ágio",
  "Criar alerta para STJ sobre o mesmo tema",
  "Analisar impacto no meu caso",
]

// ── Helpers ───────────────────────────────────────────────────────
const SOURCES: Record<SourceType, { label: string; icon: React.ElementType }> = {
  stf: { label: "STF", icon: Scale },
  stj: { label: "STJ", icon: Gavel },
  trf: { label: "TRFs", icon: Building2 },
  receita: { label: "RFB", icon: FileText },
  dou: { label: "DOU", icon: FileText },
  carf: { label: "CARF", icon: TrendingUp },
}

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

function getImpactStyles(impact: ImpactLevel) {
  const styles: Record<ImpactLevel, { bg: string; text: string; label: string }> = {
    alto: { bg: "bg-red-50", text: "text-red-600", label: "Alto" },
    medio: { bg: "bg-amber-50", text: "text-amber-600", label: "Médio" },
    baixo: { bg: "bg-green-50", text: "text-green-600", label: "Baixo" },
  }
  return styles[impact]
}

// ── Components ────────────────────────────────────────────────────
function MonitoringItemRow({
  item,
  onClick,
}: {
  item: MonitoringItem
  onClick: () => void
}) {
  const src = SOURCES[item.source]
  const Icon = src.icon
  const impactStyle = getImpactStyles(item.impact)

  return (
    <button
      onClick={onClick}
      className="w-full text-left py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        {/* Source icon */}
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            getSourceColor(item.source)
          )}
        >
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {src.label}
            </span>
            <span className="text-[10px] text-gray-300">{item.date}</span>
            {item.isNew && (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-600 text-[9px] font-semibold rounded uppercase">
                Novo
              </span>
            )}
          </div>

          {/* Title */}
          <p className="text-[13px] font-semibold text-gray-900 leading-snug mb-1.5">
            {item.title}
          </p>

          {/* Ementa preview */}
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">
            {item.ementa}
          </p>

          {/* Impact + metadata */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold",
                impactStyle.bg,
                impactStyle.text
              )}
            >
              <AlertTriangle className="w-2.5 h-2.5" />
              Impacto {impactStyle.label}
            </span>
            {item.turma && (
              <span className="text-[10px] text-gray-400">{item.turma}</span>
            )}
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-1" />
      </div>
    </button>
  )
}

// ── Main Component ────────────────────────────────────────────────
export function MonitoringArtifact({
  name = "Ágio · CARF · IRPJ",
  lastChecked = "há 2 horas",
  newCount = 2,
  items = MOCK_ITEMS,
  impactSummary = MOCK_IMPACT_SUMMARY,
  suggestions = MOCK_SUGGESTIONS,
  onSuggestionClick,
  onBack,
}: Partial<MonitoringArtifactProps>) {
  const [selectedItem, setSelectedItem] = useState<MonitoringItem | null>(null)

  // Item detail view
  if (selectedItem) {
    const src = SOURCES[selectedItem.source]
    const Icon = src.icon
    const impactStyle = getImpactStyles(selectedItem.impact)

    return (
      <div
        className="bg-white border border-gray-200 rounded-2xl overflow-hidden w-full max-w-[940px] shadow-sm"
        style={{ height: "780px" }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <button
              onClick={() => setSelectedItem(null)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <ChevronRight className="w-3 h-3 rotate-180" />
              Voltar
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            <div className="flex items-center gap-2 mb-3">
              <div
                className={cn(
                  "w-6 h-6 rounded flex items-center justify-center",
                  getSourceColor(selectedItem.source)
                )}
              >
                <Icon className="w-3 h-3" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {src.label}
              </span>
              <span className="text-[10px] text-gray-300">{selectedItem.date}</span>
              {selectedItem.isNew && (
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-600 text-[9px] font-semibold rounded uppercase">
                  Novo
                </span>
              )}
            </div>

            <h2 className="text-base font-semibold text-gray-900 mb-3">
              {selectedItem.title}
            </h2>

            {/* Impact badge */}
            <div className="mb-4">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold",
                  impactStyle.bg,
                  impactStyle.text
                )}
              >
                <AlertTriangle className="w-3 h-3" />
                Impacto {impactStyle.label}
              </span>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed mb-5">
              {selectedItem.ementa}
            </p>

            {/* Metadata */}
            <div className="space-y-3 text-xs border-t border-gray-100 pt-4">
              <div className="flex items-start gap-2">
                <Building2 className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-500">Órgão</p>
                  <p className="text-gray-800 font-medium">{selectedItem.orgao}</p>
                </div>
              </div>
              {selectedItem.turma && (
                <div className="flex items-start gap-2">
                  <Scale className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500">Turma/Câmara</p>
                    <p className="text-gray-800 font-medium">{selectedItem.turma}</p>
                  </div>
                </div>
              )}
              {selectedItem.relator && (
                <div className="flex items-start gap-2">
                  <User className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500">Relator</p>
                    <p className="text-gray-800 font-medium">{selectedItem.relator}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main view
  return (
    <div
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden w-full max-w-[940px] shadow-sm"
      style={{ height: "780px" }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Bell className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{name}</h2>
                <p className="text-[10px] text-gray-400">
                  Última verificação: {lastChecked}
                </p>
              </div>
            </div>
            {newCount > 0 && (
              <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg">
                {newCount} {newCount === 1 ? "novidade" : "atualizações "}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Section: O que é novo */}
          <div className="px-5 pt-4 pb-2">
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                O que é novo
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {items.map((item) => (
                <MonitoringItemRow
                  key={item.id}
                  item={item}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </div>
          </div>

          {/* Section: Impacto */}
          <div className="px-5 py-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5 mb-3">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Impacto
              </span>
            </div>
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed">{impactSummary}</p>
            </div>
          </div>

          {/* Section: Sugestões */}
          <div className="px-5 py-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-3 h-3 text-blue-500" />
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Sugestões recomendadas
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onSuggestionClick?.(suggestion)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  {idx === 0 && <Search className="w-3 h-3" />}
                  {idx === 1 && <Bell className="w-3 h-3" />}
                  {idx === 2 && <FileSearch className="w-3 h-3" />}
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
