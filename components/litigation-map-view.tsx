"use client"

import { useState } from "react"
import { Check, ChevronRight, Scale, ArrowRight, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react"

// ── Palette ───────────────────────────────────────────────────────
const BG     = "#08061a"
const AMBER  = "#f59e0b"
const WHITE  = "rgba(255,255,255,0.88)"
const MID    = "rgba(255,255,255,0.45)"
const LOW    = "rgba(255,255,255,0.22)"
const DIMMED = "rgba(255,255,255,0.09)"
const BORDER = "rgba(255,255,255,0.08)"
const CARD   = "rgba(255,255,255,0.035)"

// Subtle column tints — same darkness, just different hue
const ADMIN_TINT    = "rgba(6,182,212,0.07)"    // faint teal
const ADMIN_BORDER  = "rgba(6,182,212,0.18)"
const ADMIN_LABEL   = "rgba(6,182,212,0.85)"
const JUDICIAL_TINT   = "rgba(139,92,246,0.07)"  // faint purple
const JUDICIAL_BORDER = "rgba(139,92,246,0.18)"
const JUDICIAL_LABEL  = "rgba(139,92,246,0.85)"

// ── Hierarchy data ────────────────────────────────────────────────

const ADMIN_NODES = [
  {
    id:     "carf",
    tier:   "2ª Instância Administrativa",
    name:   "CARF",
    full:   "Conselho Administrativo de Recursos Fiscais",
    status: "active" as const,   // ← case is here
    date:   "Pauta: Jun/2025",
    detail: "1ª Turma da 3ª Câmara. Relator ainda não designado. Recurso voluntário protocolado em Jan/2023.",
  },
  {
    id:          "drj",
    tier:        "1ª Instância Administrativa",
    name:        "DRJ",
    full:        "Delegacias de Julgamento da Receita Federal",
    status:      "done_bad" as const,
    date:        "Nov 2022",
    verdict:     "Lançamento mantido",
    verdictNote: "Acórdão unânime. Negado propósito negocial.",
    detail:      "Acórdão unânime manteve o lançamento. Negado propósito negocial à operação. Recurso voluntário enviado ao CARF em Jan/2023.",
  },
  {
    id:          "rfb",
    tier:        "Fiscalização e Autuação",
    name:        "RFB",
    full:        "Receita Federal do Brasil",
    status:      "done_bad" as const,
    date:        "Mar 2021",
    verdict:     "Autuação lavrada",
    verdictNote: "Multa qualificada 75% · R$ 47,3M",
    detail:      "Autuação lavrada com multa qualificada de 75%. AIRPF nº 10830.720.123/2021-41.",
  },
]

const JUDICIAL_NODES = [
  {
    id:     "stf",
    tier:   "3ª e última instância — Matéria Constitucional",
    name:   "STF",
    full:   "Supremo Tribunal Federal",
    status: "pending" as const,
  },
  {
    id:     "stj",
    tier:   "3ª e última instância — Matéria Infraconstitucional",
    name:   "STJ",
    full:   "Superior Tribunal de Justiça",
    status: "pending" as const,
  },
  {
    id:     "trf",
    tier:   "2ª Instância",
    name:   "TRF",
    full:   "Tribunais Regionais Federais",
    status: "pending" as const,
  },
  {
    id:     "jf",
    tier:   "1ª Instância",
    name:   "JF",
    full:   "Justiça Federal",
    status: "pending" as const,
    detail: "Porta de entrada do Judiciário. Ação anulatória ou MS podem ser distribuídos aqui após decisão do CARF.",
  },
]

const BRIDGE = [
  {
    Icon:  ArrowRight,
    color: MID,
    text:  "A qualquer momento o contribuinte pode ir ao Judiciário",
  },
  {
    Icon:  XCircle,
    color: LOW,
    text:  "Ao discutir o mérito no Judiciário, o administrativo perde o objeto",
  },
  {
    Icon:  AlertTriangle,
    color: LOW,
    text:  "Questões pontuais podem coexistir sem tocar o mérito",
  },
  {
    Icon:  CheckCircle2,
    color: MID,
    text:  "Vitória no CARF é definitiva — Fisco não pode ir ao Judiciário",
  },
]

// ── Scenarios & actions ───────────────────────────────────────────

const SCENARIOS = [
  {
    id:          "a",
    label:       "Cenário A",
    title:       "Vitória no CARF",
    probability: "32%",
    outcome:     "Caso encerrado.",
    description: "Se o CARF reverter o lançamento, o crédito é cancelado definitivamente. O Fisco não pode recorrer ao Judiciário. Fim do contencioso.",
    path:        ["CARF reverte", "Acórdão favorável", "Crédito cancelado"],
    signal:      "best" as const,
    note:        null,
  },
  {
    id:          "b",
    label:       "Cenário B",
    title:       "Derrota no CARF",
    probability: "68%",
    outcome:     "Abre caminho judicial.",
    description: "Se o CARF mantiver o lançamento, a próxima etapa é a ação anulatória na Justiça Federal. A via administrativa se encerra aqui.",
    path:        ["CARF mantém", "Ação anulatória — JF", "TRF → STJ / STF"],
    signal:      "neutral" as const,
    note:        "Estimativa: 4–8 anos no Judiciário",
  },
  {
    id:          "c",
    label:       "Cenário C",
    title:       "Ir ao Judiciário agora",
    probability: "Possível",
    outcome:     "Abandona o CARF.",
    description: "O contribuinte pode judicializar a qualquer momento, mas ao discutir o mérito lá, a via administrativa perde o objeto imediatamente. Não há retorno.",
    path:        ["Ação no JF agora", "CARF perde o objeto", "Recomeça do zero"],
    signal:      "warn" as const,
    note:        "Perde a instância administrativa sem aproveitar o precedente",
  },
]

const ACTIONS = [
  {
    priority: 1,
    when: "Agora",
    what: "Preparar a ação anulatória preventiva",
    why:  "Se perder no CARF, o prazo para distribuição é crítico. Ter a petição pronta elimina risco de perda de prazo e permite resposta imediata.",
  },
  {
    priority: 2,
    when: "Próximas semanas",
    what: "Protocolar memoriais ao relator do CARF",
    why:  "A turma tem precedentes mistos. Memoriais focados no Acórdão 1201-005.654 (propósito negocial reconhecido) aumentam a chance de reviravolta.",
  },
  {
    priority: 3,
    when: "Contínuo",
    what: "Monitorar pautas e composição da turma",
    why:  "Mudanças no relator ou na composição podem alterar o cenário. Se aparecer pauta com maioria desfavorável, avaliar pedido de retirada.",
  },
]

// ── Sub-components ────────────────────────────────────────────────

type NodeStatus = "active" | "done_bad" | "done_ok" | "pending"

function nodeStyle(status: NodeStatus, isSelected: boolean, tint: string, borderClr: string) {
  if (status === "active") return {
    background: `linear-gradient(135deg, ${AMBER}14, ${AMBER}08)`,
    border: `1.5px solid ${AMBER}55`,
    boxShadow: `0 0 28px ${AMBER}18`,
    opacity: 1,
  }
  if (status === "pending") return {
    background: DIMMED,
    border: `1px solid ${BORDER}`,
    opacity: 0.5,
  }
  // done
  return {
    background: isSelected ? `${tint}` : CARD,
    border: `1px solid ${isSelected ? borderClr : BORDER}`,
    opacity: 1,
  }
}

function AdminNode({
  node, selected, onSelect,
}: {
  node: typeof ADMIN_NODES[0]
  selected: boolean
  onSelect: () => void
}) {
  const s = nodeStyle(node.status, selected, ADMIN_TINT, ADMIN_BORDER)
  return (
    <button
      onClick={onSelect}
      style={{
        width: "100%", textAlign: "center", cursor: "pointer",
        padding: "16px 14px 14px",
        borderRadius: 12,
        transition: "all 0.18s ease",
        ...s,
      }}
    >
      <div style={{
        fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: node.status === "active" ? AMBER : node.status === "pending" ? LOW : ADMIN_LABEL,
        marginBottom: 6, lineHeight: 1.4,
      }}>
        {node.tier}
      </div>
      <div style={{
        fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1,
        color: node.status === "active" ? AMBER : node.status === "pending" ? LOW : WHITE,
      }}>
        {node.name}
      </div>
      <div style={{ fontSize: 11, color: node.status === "pending" ? LOW : MID, marginTop: 5, lineHeight: 1.4 }}>
        {node.full}
      </div>
      {node.status === "active" && (
        <div style={{
          marginTop: 8, fontSize: 10, fontWeight: 600, color: AMBER,
          display: "inline-flex", alignItems: "center", gap: 5,
        }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: AMBER, boxShadow: `0 0 6px ${AMBER}` }} />
          {node.date}
        </div>
      )}

      {(node.status === "done_bad" || node.status === "done_ok") && (
        <div style={{
          marginTop: 10,
          borderTop: `1px solid ${BORDER}`,
          paddingTop: 9,
          display: "flex", flexDirection: "column", gap: 3,
        }}>
          {/* "Concluído em" */}
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: LOW }}>
            Concluído em {node.date}
          </div>
          {/* Verdict pill */}
          {"verdict" in node && node.verdict && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "3px 9px", borderRadius: 5,
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.25)",
              alignSelf: "center",
            }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(239,68,68,0.8)", flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(239,68,68,0.9)" }}>
                {(node as any).verdict}
              </span>
            </div>
          )}
          {"verdictNote" in node && node.verdictNote && (
            <div style={{ fontSize: 10, color: LOW, lineHeight: 1.4 }}>
              {(node as any).verdictNote}
            </div>
          )}
        </div>
      )}
    </button>
  )
}

function JudicialNode({
  node, selected, onSelect,
}: {
  node: typeof JUDICIAL_NODES[0]
  selected: boolean
  onSelect: () => void
}) {
  const s = nodeStyle(node.status, selected, JUDICIAL_TINT, JUDICIAL_BORDER)
  return (
    <button
      onClick={onSelect}
      style={{
        width: "100%", textAlign: "center", cursor: "pointer",
        padding: "14px 14px 12px",
        borderRadius: 12,
        transition: "all 0.18s ease",
        ...s,
      }}
    >
      <div style={{
        fontSize: 8.5, fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: JUDICIAL_LABEL, marginBottom: 5, lineHeight: 1.4,
        opacity: 0.6,
      }}>
        {node.tier}
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1, color: LOW }}>
        {node.name}
      </div>
      <div style={{ fontSize: 10.5, color: DIMMED, marginTop: 4, lineHeight: 1.3 }}>
        {node.full}
      </div>
    </button>
  )
}

function VConnector({ color = BORDER, size = 18 }: { color?: string; size?: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", height: size }}>
      <div style={{
        width: 0, borderLeft: `1px solid ${color}`,
        height: "100%",
      }} />
    </div>
  )
}

function UpArrow({ color = LOW }: { color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", height: 20, position: "relative" }}>
      <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)" }}>
        {/* Triangle pointing up */}
        <div style={{
          width: 0, height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderBottom: `7px solid ${color}`,
        }} />
      </div>
      <div style={{ width: 1, height: "100%", background: color, marginTop: 0 }} />
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────

export function LitigationMapView() {
  const [selectedAdmin,    setSelectedAdmin]    = useState<string | null>("carf")
  const [selectedJudicial, setSelectedJudicial] = useState<string | null>(null)
  const [activeScenario,   setActiveScenario]   = useState<string | null>(null)

  const adminDetail    = ADMIN_NODES.find(n => n.id === selectedAdmin)
  const judicialDetail = JUDICIAL_NODES.find(n => n.id === selectedJudicial)

  return (
    <div style={{
      flex: 1, minWidth: 0, height: "100%", overflowY: "auto",
      background: BG,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 32px 64px" }}>

        {/* ── Title ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
          <Scale style={{ width: 13, height: 13, color: AMBER, strokeWidth: 1.5 }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: AMBER }}>
            Contencioso Tributário
          </span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: WHITE, letterSpacing: "-0.025em", margin: "0 0 3px", lineHeight: 1.1 }}>
          Ágio Interno na Reorganização Societária
        </h1>
        <p style={{ fontSize: 13, color: MID, margin: 0 }}>
          IRPJ · CSLL · Grupo Industrial Alfa S.A. · Autuação: Mar/2021
        </p>

        {/* ── Metrics ── */}
        <div style={{
          display: "flex", gap: 1, marginTop: 22, marginBottom: 36,
          background: BORDER, borderRadius: 12, overflow: "hidden",
        }}>
          {[
            { label: "Débito total",   value: "R$ 47,3M",  note: "principal + multa + juros", hi: true  },
            { label: "Principal",      value: "R$ 27,1M",  note: "IRPJ + CSLL s/ ágio glosado" },
            { label: "Multa",          value: "R$ 14,0M",  note: "75% qualificada (dolo)" },
            { label: "Juros SELIC",    value: "R$ 6,2M",   note: "acumulados até Jun/2025" },
            { label: "Fase atual",     value: "CARF",      note: "Pauta prevista: Jun/2025" },
          ].map(m => (
            <div key={m.label} style={{ flex: 1, background: CARD, padding: "15px 18px" }}>
              <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: LOW, marginBottom: 6 }}>
                {m.label}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: m.hi ? AMBER : WHITE, letterSpacing: "-0.02em", lineHeight: 1 }}>
                {m.value}
              </div>
              <div style={{ fontSize: 10, color: LOW, marginTop: 4 }}>{m.note}</div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════
            HIERARCHY MAP
        ══════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: LOW, marginBottom: 20 }}>
            Onde estamos
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 200px 1fr", gap: 20, alignItems: "start" }}>

            {/* ── Admin column ── */}
            <div>
              {/* Column label */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 14px", borderRadius: 20, marginBottom: 16,
                background: ADMIN_TINT, border: `1px solid ${ADMIN_BORDER}`,
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ADMIN_LABEL }}>
                  Administrativa
                </span>
              </div>

              {/* Nodes: top = highest instance */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <AdminNode
                  node={ADMIN_NODES[0]}
                  selected={selectedAdmin === "carf"}
                  onSelect={() => setSelectedAdmin(p => p === "carf" ? null : "carf")}
                />
                <UpArrow color={`${AMBER}40`} />
                <AdminNode
                  node={ADMIN_NODES[1]}
                  selected={selectedAdmin === "drj"}
                  onSelect={() => setSelectedAdmin(p => p === "drj" ? null : "drj")}
                />
                <UpArrow color={BORDER} />
                <AdminNode
                  node={ADMIN_NODES[2]}
                  selected={selectedAdmin === "rfb"}
                  onSelect={() => setSelectedAdmin(p => p === "rfb" ? null : "rfb")}
                />
              </div>
            </div>

            {/* ── Bridge rules ── */}
            <div style={{ paddingTop: 52, display: "flex", flexDirection: "column", gap: 10 }}>
              {BRIDGE.map((rule, i) => (
                <div key={i} style={{
                  padding: "10px 12px", borderRadius: 9,
                  background: CARD, border: `1px solid ${BORDER}`,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <rule.Icon style={{ width: 11, height: 11, color: rule.color, strokeWidth: 1.8, flexShrink: 0, marginTop: 1 }} />
                    <p style={{ margin: 0, fontSize: 10.5, color: LOW, lineHeight: 1.55 }}>
                      {rule.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Judicial column ── */}
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 14px", borderRadius: 20, marginBottom: 16,
                background: JUDICIAL_TINT, border: `1px solid ${JUDICIAL_BORDER}`,
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: JUDICIAL_LABEL }}>
                  Judicial
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                {JUDICIAL_NODES.map((node, i) => (
                  <div key={node.id}>
                    <JudicialNode
                      node={node}
                      selected={selectedJudicial === node.id}
                      onSelect={() => setSelectedJudicial(p => p === node.id ? null : node.id)}
                    />
                    {i < JUDICIAL_NODES.length - 1 && <UpArrow color={BORDER} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detail drawer for selected node */}
        {(adminDetail || judicialDetail) && (() => {
          const node = adminDetail ?? judicialDetail!
          const isAdmin = !!adminDetail
          return (
            <div style={{
              marginTop: 12, marginBottom: 8,
              padding: "14px 18px",
              borderRadius: 10,
              background: CARD,
              border: `1px solid ${node.status === "active" ? `${AMBER}30` : BORDER}`,
            }}>
              <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: node.detail ? 6 : 0 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: node.status === "active" ? AMBER : WHITE }}>{node.name}</span>
                <span style={{ fontSize: 11, color: MID }}>{node.full}</span>
                {"date" in node && node.date && (
                  <span style={{ fontSize: 10, color: LOW, marginLeft: "auto" }}>{node.date}</span>
                )}
              </div>
              {node.detail && (
                <p style={{ margin: 0, fontSize: 12.5, color: MID, lineHeight: 1.7 }}>{node.detail}</p>
              )}
              {node.status === "pending" && !node.detail && (
                <p style={{ margin: 0, fontSize: 12.5, color: LOW, lineHeight: 1.7, fontStyle: "italic" }}>
                  Esta instância ainda não foi acionada. Aguardando decisão do CARF.
                </p>
              )}
            </div>
          )
        })()}

        {/* ══════════════════════════════════════════════════════════
            SCENARIOS
        ══════════════════════════════════════════════════════════ */}
        <div style={{ marginTop: 44 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: LOW, marginBottom: 20 }}>
            O que pode acontecer a partir daqui
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {SCENARIOS.map(s => {
              const isSelected = activeScenario === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveScenario(p => p === s.id ? null : s.id)}
                  style={{
                    textAlign: "left",
                    background: isSelected ? "rgba(255,255,255,0.06)" : CARD,
                    border: `1px solid ${isSelected ? "rgba(255,255,255,0.2)" : BORDER}`,
                    borderRadius: 12, padding: "20px 20px 18px",
                    cursor: "pointer", transition: "all 0.15s ease",
                    opacity: s.signal === "warn" ? 0.65 : 1,
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = CARD }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: LOW }}>
                      {s.label}
                    </span>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700,
                      color: s.signal === "best" ? WHITE : MID,
                      padding: "2px 8px", borderRadius: 20,
                      background: s.signal === "best" ? "rgba(255,255,255,0.1)" : "transparent",
                    }}>
                      {s.probability}
                    </span>
                  </div>

                  <div style={{ fontSize: 16, fontWeight: 800, color: WHITE, letterSpacing: "-0.015em", marginBottom: 3, lineHeight: 1.2 }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: MID, marginBottom: 10 }}>
                    {s.outcome}
                  </div>
                  <p style={{ margin: "0 0 14px", fontSize: 11.5, color: LOW, lineHeight: 1.65 }}>
                    {s.description}
                  </p>

                  {/* Path steps */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                    {s.path.map((step, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{
                          fontSize: 9.5, fontWeight: 600,
                          color: i === 0 ? AMBER : MID,
                          padding: "2px 8px", borderRadius: 4,
                          background: i === 0 ? `${AMBER}15` : "rgba(255,255,255,0.05)",
                        }}>
                          {step}
                        </span>
                        {i < s.path.length - 1 && (
                          <ChevronRight style={{ width: 8, height: 8, color: LOW, flexShrink: 0 }} />
                        )}
                      </div>
                    ))}
                  </div>

                  {s.note && (
                    <div style={{ marginTop: 10, fontSize: 10.5, color: LOW, borderTop: `1px solid ${BORDER}`, paddingTop: 10 }}>
                      {s.note}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            RECOMMENDATION
        ══════════════════════════════════════════════════════════ */}
        <div style={{ marginTop: 44 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: LOW, marginBottom: 20 }}>
            O que fazer
          </div>

          {/* Headline card */}
          <div style={{
            padding: "26px 28px",
            borderRadius: 14,
            border: `1px solid ${AMBER}30`,
            background: `linear-gradient(135deg, ${AMBER}08 0%, transparent 55%)`,
            marginBottom: 12,
          }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: `${AMBER}16`, border: `1px solid ${AMBER}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Scale style={{ width: 14, height: 14, color: AMBER, strokeWidth: 1.5 }} />
              </div>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: AMBER, marginBottom: 5 }}>
                  Recomendação
                </div>
                <div style={{ fontSize: 19, fontWeight: 800, color: WHITE, letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 10 }}>
                  Aguardar o CARF e preparar o Judiciário em paralelo
                </div>
                <p style={{ margin: 0, fontSize: 13.5, color: MID, lineHeight: 1.75 }}>
                  A probabilidade de vitória no CARF é baixa (32%), mas ir ao Judiciário agora significa abrir mão do processo administrativo
                  sem aproveitar o precedente que está em jogo. O caminho ótimo é usar os próximos meses para fortalecer a defesa no CARF
                  e ter a ação anulatória pronta para distribuição imediata se a decisão for desfavorável.
                </p>
              </div>
            </div>
          </div>

          {/* Action rows: when / what / why */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ACTIONS.map(a => (
              <div key={a.priority} style={{
                display: "grid", gridTemplateColumns: "44px 1fr 1.8fr",
                borderRadius: 10, border: `1px solid ${BORDER}`, overflow: "hidden",
              }}>
                <div style={{
                  background: a.priority === 1 ? `${AMBER}12` : CARD,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRight: `1px solid ${BORDER}`,
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: a.priority === 1 ? AMBER : DIMMED,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {a.priority === 1
                      ? <Check style={{ width: 11, height: 11, color: "#000", strokeWidth: 2.5 }} />
                      : <span style={{ fontSize: 10, fontWeight: 700, color: LOW }}>{a.priority}</span>
                    }
                  </div>
                </div>
                <div style={{ padding: "14px 18px", background: CARD, borderRight: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: LOW, marginBottom: 4 }}>
                    {a.when}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: WHITE, lineHeight: 1.4 }}>
                    {a.what}
                  </div>
                </div>
                <div style={{ padding: "14px 20px", background: CARD }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: LOW, marginBottom: 4 }}>
                    Por quê
                  </div>
                  <div style={{ fontSize: 12, color: MID, lineHeight: 1.65 }}>{a.why}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
