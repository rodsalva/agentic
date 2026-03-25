"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, X, Check, ChevronRight, Edit3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ManorAvatar, TypingIndicator } from "./manor-avatar"

type SourceType = "stf" | "stj" | "trf" | "receita" | "dou" | "carf"
type Tributo = "IRPJ" | "CSLL" | "PIS" | "COFINS" | "IPI" | "ISS" | "ICMS"

interface MonitoringScope {
  sources: SourceType[]
  tributos: Tributo[]
  assuntos: string[]
  customPrompt?: string
}

interface MonitoringSetupFlowProps {
  initialScope?: MonitoringScope
  isCustomPrompt?: boolean
  onComplete: (name: string, scope: MonitoringScope) => void
  onCancel: () => void
}

const SOURCE_LABELS: Record<SourceType, string> = {
  stf: "STF",
  stj: "STJ",
  trf: "TRFs",
  receita: "RFB",
  dou: "DOU",
  carf: "CARF",
}

export function MonitoringSetupFlow({
  initialScope,
  isCustomPrompt = false,
  onComplete,
  onCancel,
}: MonitoringSetupFlowProps) {
  // Step: 1 = refinement (for custom), 2 = confirm & name
  const [step, setStep] = useState(isCustomPrompt ? 1 : 2)
  const [isRefining, setIsRefining] = useState(false)
  const [scope, setScope] = useState<MonitoringScope>(
    initialScope || {
      sources: ["carf"],
      tributos: ["IRPJ", "CSLL"],
      assuntos: ["Amortização de ágio"],
    }
  )
  const [suggestedName, setSuggestedName] = useState("")
  const [editingName, setEditingName] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Generate name suggestion
  useEffect(() => {
    const parts: string[] = []
    if (scope.assuntos.length > 0) parts.push(scope.assuntos[0])
    if (scope.sources.length > 0) parts.push(SOURCE_LABELS[scope.sources[0]])
    if (scope.tributos.length > 0) parts.push(scope.tributos.slice(0, 2).join("/"))
    setSuggestedName(parts.join(" · ") || "Novo Monitoramento")
  }, [scope])

  // Auto-focus name input when editing
  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus()
      nameInputRef.current.select()
    }
  }, [editingName])

  // Simulate AI refinement
  const handleRefine = () => {
    setIsRefining(true)
    setTimeout(() => {
      setIsRefining(false)
      setStep(2)
    }, 1800)
  }

  const handleCreate = () => {
    onComplete(suggestedName, scope)
  }

  const toggleSource = (src: SourceType) => {
    setScope((prev) => ({
      ...prev,
      sources: prev.sources.includes(src)
        ? prev.sources.filter((s) => s !== src)
        : [...prev.sources, src],
    }))
  }

  const toggleTributo = (t: Tributo) => {
    setScope((prev) => ({
      ...prev,
      tributos: prev.tributos.includes(t)
        ? prev.tributos.filter((x) => x !== t)
        : [...prev.tributos, t],
    }))
  }

  // Step 1: Refinement
  if (step === 1) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-5 max-w-lg mx-auto shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <ManorAvatar state="active" size="sm" />
            <span className="text-sm font-semibold text-gray-900">Refinar monitoramento</span>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isRefining ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <ManorAvatar state="speaking" size="lg" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Organizando o escopo</span>
              <TypingIndicator />
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500 mb-2">Vou monitorar:</p>
              <p className="text-sm text-gray-800 font-medium leading-relaxed">
                Acórdãos e decisões sobre{" "}
                <span className="text-amber-600">{scope.assuntos.join(", ")}</span>.{" "}
                Fontes: <span className="text-amber-600">{scope.sources.map((s) => SOURCE_LABELS[s]).join(", ")}</span>.{" "}
                Tributos: <span className="text-amber-600">{scope.tributos.join(", ")}</span>.
              </p>
            </div>

            {/* Editable chips */}
            <div className="space-y-3 mb-5">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">
                  Fontes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(SOURCE_LABELS) as SourceType[]).map((src) => (
                    <button
                      key={src}
                      onClick={() => toggleSource(src)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer",
                        scope.sources.includes(src)
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      )}
                    >
                      {SOURCE_LABELS[src]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">
                  Tributos
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(["IRPJ", "CSLL", "PIS", "COFINS", "IPI", "ISS", "ICMS"] as Tributo[]).map(
                    (t) => (
                      <button
                        key={t}
                        onClick={() => toggleTributo(t)}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer",
                          scope.tributos.includes(t)
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        )}
                      >
                        {t}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleRefine}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                Confirmar escopo
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  // Step 2: Confirm & Name
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 max-w-lg mx-auto shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <ManorAvatar state="active" size="sm" />
          <span className="text-sm font-semibold text-gray-900">Tudo certo. Posso criar?</span>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Summary card */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          {editingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={suggestedName}
              onChange={(e) => setSuggestedName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
              className="flex-1 text-sm font-semibold text-gray-900 bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-gray-400"
            />
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">{suggestedName}</h3>
              <button
                onClick={() => setEditingName(true)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Fontes:</span>
            <div className="flex flex-wrap gap-1">
              {scope.sources.map((src) => (
                <span
                  key={src}
                  className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-medium"
                >
                  {SOURCE_LABELS[src]}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Tributos:</span>
            <div className="flex flex-wrap gap-1">
              {scope.tributos.map((t) => (
                <span
                  key={t}
                  className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Assuntos:</span>
            <div className="flex flex-wrap gap-1">
              {scope.assuntos.map((a) => (
                <span
                  key={a}
                  className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-medium"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Estarei de olho nesse tema e te aviso quando aparecer algo relevante.
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          onClick={handleCreate}
          className="flex-1 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          Criar monitoramento
        </button>
      </div>
    </div>
  )
}
