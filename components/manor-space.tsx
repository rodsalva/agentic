"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import {
  Bell, BookOpen, Scale, FileText, Gavel, Building2,
  Sparkles,
} from "lucide-react"
import { MOCK_CONVERSATIONS } from "@/lib/conversation-data"
import type { MonitoringSubscription, MonitoringItem } from "@/lib/monitoring-data"

// ── Constants ─────────────────────────────────────────────────────

// ── Domain node definitions ───────────────────────────────────────

interface DomainNode {
  id: string; label: string; sub: string
  Icon: React.ElementType
  x: number; y: number; depth: number; color: string
}

const DOMAINS: DomainNode[] = [
  { id: "jurisprudencia", label: "Jurisprudência",    sub: "STJ · STF · TRFs",   Icon: Scale,     x: 18, y: 22, depth: 0.65, color: "#a78bfa" },
  { id: "legislacao",     label: "Legislação",         sub: "Leis · Decretos",    Icon: FileText,  x: 50, y: 10, depth: 0.60, color: "#60a5fa" },
  { id: "reforma",        label: "Reforma Tributária", sub: "IBS · CBS · IS",     Icon: Sparkles,  x: 82, y: 22, depth: 0.65, color: "#f472b6" },
  { id: "carf",           label: "CARF",               sub: "Acórdãos · Súmulas", Icon: Gavel,     x: 15, y: 64, depth: 0.60, color: "#34d399" },
  { id: "solucoes",       label: "Soluções RF",        sub: "Consultas · SC",     Icon: Building2, x: 85, y: 64, depth: 0.58, color: "#fb923c" },
]

// ── Domain → monitoring item mapping ─────────────────────────────

interface DomainStats {
  total:    number
  newCount: number
  items:    (MonitoringItem & { monName: string })[]
}

function getDomainStats(id: string, monitorings: MonitoringSubscription[]): DomainStats {
  const tagged = monitorings.flatMap((m) =>
    m.items.map((i) => ({ ...i, monName: m.name.split("·")[0].trim() }))
  )

  let items: typeof tagged = []

  switch (id) {
    case "jurisprudencia":
      items = tagged.filter((i) => ["stj", "stf", "trf"].includes(i.source))
      break
    case "carf":
      items = tagged.filter((i) => i.source === "carf")
      break
    case "legislacao":
      items = tagged.filter((i) => i.type === "legislacao" || i.source === "dou")
      break
    case "reforma":
      items = monitorings
        .filter((m) => m.name.toLowerCase().includes("reforma"))
        .flatMap((m) => m.items.map((i) => ({ ...i, monName: m.name.split("·")[0].trim() })))
      break
    case "solucoes":
      items = tagged.filter((i) => i.type === "solucao" || i.source === "receita")
      break
  }

  const sorted = [...items].sort((a, b) =>
    a.impact === "alto" ? -1 : b.impact === "alto" ? 1 : a.isNew ? -1 : 1
  )

  return {
    total:    items.length,
    newCount: items.filter((i) => i.isNew).length,
    items:    sorted.slice(0, 4),
  }
}

// ── Star field ────────────────────────────────────────────────────

function buildStars(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const frac = (x: number) => { const v = Math.abs(Math.sin(x) * 43758.5453); return v - Math.floor(v) }
    return {
      x:       frac(i * 127.1 + 1) * 100,
      y:       frac(i * 311.7 + 2) * 100,
      r:       frac(i * 74.7  + 3) * 1.3 + 0.25,
      o:       frac(i * 19.1  + 4) * 0.45 + 0.08,
      p:       frac(i * 53.3  + 5) * 0.28 + 0.03,
      twinkle: frac(i * 89.3  + 6) > 0.72,
      period:  frac(i * 37.1  + 7) * 3 + 2,
    }
  })
}

// ── Hover card ────────────────────────────────────────────────────

interface HoverCardProps {
  nodeId:   string
  nodeX:    number
  nodeY:    number
  nodeSize: number
  depth:    number
  color:    string
  label:    string
  dx: number; dy: number
  stats:    DomainStats | null
  onOpenChat: () => void
  onHoverEnter?: () => void
  onHoverLeave?: () => void
  // for personal nodes
  monitorings?: MonitoringSubscription[]
  pesquisas?: { id: string; title: string; timestamp: string }[]
}

function HoverCard({ nodeId, nodeX, nodeY, nodeSize, depth, color, label, dx, dy, stats, onOpenChat, onHoverEnter, onHoverLeave, monitorings, pesquisas }: HoverCardProps) {
  const px      = dx * depth * 68
  const py      = dy * depth * 68
  const isLeft  = nodeX < 52   // card goes to the right of the node
  const cardW   = 252

  // Offset from node center to card edge
  const hOffset = nodeSize / 2 + 14

  const style: React.CSSProperties = {
    position:  "absolute",
    left:      isLeft
      ? `calc(${nodeX}% + ${px + hOffset}px)`
      : `calc(${nodeX}% + ${px - hOffset - cardW}px)`,
    top:       `calc(${nodeY}% + ${py}px)`,
    transform: "translateY(-50%)",
    width:     cardW,
    zIndex:    50,
    animation: isLeft ? "space-card-in 0.22s cubic-bezier(0.16,1,0.3,1) forwards"
                      : "space-card-in-left 0.22s cubic-bezier(0.16,1,0.3,1) forwards",
    background:          "rgba(6, 4, 18, 0.88)",
    border:              `1px solid ${color}30`,
    backdropFilter:      "blur(20px)",
    WebkitBackdropFilter:"blur(20px)",
    borderRadius:        14,
    padding:             "13px 14px",
    boxShadow:           `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${color}18`,
  }

  return (
    <div style={style} onMouseEnter={onHoverEnter} onMouseLeave={onHoverLeave}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: "0.01em" }}>
          {label}
        </span>
        {stats && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {stats.newCount > 0 && (
              <span style={{
                fontSize: 9.5, fontWeight: 700, color: "#f59e0b",
                background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.4)",
                padding: "1px 7px", borderRadius: 20,
              }}>
                {stats.newCount} novos
              </span>
            )}
            <span style={{ fontSize: 9.5, color: `${color}99` }}>
              {stats.total} {stats.total === 1 ? "item" : "itens"}
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: `${color}18`, marginBottom: 10 }} />

      {/* Domain items */}
      {stats && stats.items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {stats.items.map((item, i) => (
            <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div style={{
                width: 5, height: 5, borderRadius: "50%", flexShrink: 0, marginTop: 4,
                background: item.impact === "alto" ? "#f59e0b" : item.isNew ? color : "rgba(255,255,255,0.25)",
                boxShadow: item.impact === "alto" ? "0 0 6px rgba(245,158,11,0.8)"
                         : item.isNew             ? `0 0 5px ${color}80`
                         : "none",
              }} />
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 10.5, color: item.isNew ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)",
                  lineHeight: 1.4, fontWeight: item.isNew ? 450 : 400,
                  overflow: "hidden", display: "-webkit-box",
                  WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 8.5, color: `${color}80`, marginTop: 2.5, letterSpacing: "0.01em" }}>
                  {item.orgao}
                  {item.impact === "alto" && (
                    <span style={{ color: "#f59e0b", fontWeight: 600, marginLeft: 5 }}>· impacto alto</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {stats && stats.items.length === 0 && (
        <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.22)", fontStyle: "italic", margin: 0 }}>
          Nenhum item monitorado nesta área.
        </p>
      )}

      {/* Monitoramentos personal node */}
      {monitorings && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {monitorings.slice(0, 5).map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
                background: m.hasNew ? "#f59e0b" : m.status === "paused" ? "rgba(255,255,255,0.2)" : "#34d399",
                boxShadow: m.hasNew ? "0 0 6px rgba(245,158,11,0.7)" : "none",
              }} />
              <span style={{
                fontSize: 10.5, flex: 1,
                color: m.hasNew ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.45)",
                overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                fontWeight: m.hasNew ? 450 : 400,
              }}>
                {m.name}
              </span>
              {m.newCount > 0 && (
                <span style={{
                  fontSize: 9, fontWeight: 700, color: "#f59e0b",
                  background: "rgba(245,158,11,0.15)", padding: "0 5px", borderRadius: 10,
                  flexShrink: 0,
                }}>
                  +{m.newCount}
                </span>
              )}
              {m.status === "paused" && (
                <span style={{ fontSize: 8.5, color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>pausado</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pesquisas personal node */}
      {pesquisas && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pesquisas.slice(0, 4).map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div style={{
                width: 5, height: 5, borderRadius: "50%", flexShrink: 0, marginTop: 4,
                background: p.id.includes("new") ? "#818cf8" : "rgba(255,255,255,0.2)",
              }} />
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 10.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.4,
                  overflow: "hidden", display: "-webkit-box",
                  WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 8.5, color: "rgba(129,140,248,0.6)", marginTop: 2 }}>
                  {p.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* ── Falar com a Manor ── */}
      <div style={{ height: 1, background: `${color}18`, margin: "12px 0 10px" }} />
      <button
        onClick={onOpenChat}
        style={{
          width: "100%",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "7px 0",
          borderRadius: 8,
          background: `${color}12`,
          border: `1px solid ${color}28`,
          cursor: "pointer",
          transition: "all 0.18s ease",
          pointerEvents: "auto",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `${color}22`
          e.currentTarget.style.borderColor = `${color}50`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = `${color}12`
          e.currentTarget.style.borderColor = `${color}28`
        }}
      >
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
        <span style={{ fontSize: 10.5, fontWeight: 500, color: "rgba(255,255,255,0.72)", letterSpacing: "0.02em" }}>
          Falar com a Manor
        </span>
      </button>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────

interface ManorSpaceProps {
  monitorings: MonitoringSubscription[]
  onOpenChat: () => void
}

export function ManorSpace({ monitorings, onOpenChat }: ManorSpaceProps) {
  const [mouse, setMouse]         = useState({ x: 0.5, y: 0.5 })
  const [hovered, setHovered]     = useState<string | null>(null)
  const [clicked, setClicked]     = useState<string | null>(null)
  const hoverLeaveTimer           = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleHoverClear = () => {
    hoverLeaveTimer.current = setTimeout(() => setHovered(null), 180)
  }
  const cancelHoverClear = () => {
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current)
  }

  const stars = useMemo(() => buildStars(180), [])

  // ── Derived data ───────────────────────────────────────────────

  const totalPesquisas  = useMemo(() => MOCK_CONVERSATIONS.flatMap((c) => c.pesquisas).length, [])
  const totalConversas  = MOCK_CONVERSATIONS.length
  const newItemsCount = useMemo(() => monitorings.reduce((acc, m) => acc + m.newCount, 0), [monitorings])

  const domainStats = useMemo(() =>
    Object.fromEntries(DOMAINS.map((d) => [d.id, getDomainStats(d.id, monitorings)])),
    [monitorings]
  )

  const recentPesquisas = useMemo(() =>
    MOCK_CONVERSATIONS
      .flatMap((c) => c.pesquisas.map((p) => ({ ...p, timestamp: p.timestamp ?? "" })))
      .slice(0, 4),
    []
  )

  // ── Effects ────────────────────────────────────────────────────

  useEffect(() => {
    const fn = (e: MouseEvent) =>
      setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
    window.addEventListener("mousemove", fn, { passive: true })
    return () => window.removeEventListener("mousemove", fn)
  }, [])

  const dx = mouse.x - 0.5
  const dy = mouse.y - 0.5

  const handleClick = (id: string) => {
    setClicked(id)
    setTimeout(() => setClicked(null), 360)
    onOpenChat()
  }

  // ── Personal nodes (defined here to use derived data) ──────────

  const personalNodes = [
    {
      id: "monitoramentos", label: "Meus Monitoramentos",
      Icon: Bell, color: "#f59e0b", x: 37, y: 44,
      count: monitorings.length,
      badge: newItemsCount > 0 ? newItemsCount : null,
      sub: `${monitorings.filter((m) => m.status === "active").length} ativos`,
    },
    {
      id: "pesquisas", label: "Minhas Pesquisas",
      Icon: BookOpen, color: "#818cf8", x: 63, y: 44,
      count: totalPesquisas,
      badge: null,
      sub: `${totalConversas} conversas`,
    },
  ]

  // Resolve hover card data
  const hoveredDomain   = DOMAINS.find((d) => d.id === hovered)
  const hoveredPersonal = personalNodes.find((p) => p.id === hovered)

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      style={{
        background:
          "radial-gradient(ellipse 140% 100% at 42% 48%, #190e34 0%, #0d0921 28%, #07061a 58%, #030310 100%)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* ── Nebula ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: [
          "radial-gradient(ellipse 55% 38% at 18% 22%, rgba(167,139,250,0.08) 0%, transparent 70%)",
          "radial-gradient(ellipse 50% 32% at 50% 10%, rgba(96,165,250,0.07) 0%, transparent 70%)",
          "radial-gradient(ellipse 55% 38% at 82% 22%, rgba(244,114,182,0.07) 0%, transparent 70%)",
          "radial-gradient(ellipse 45% 32% at 15% 65%, rgba(52,211,153,0.06) 0%, transparent 70%)",
          "radial-gradient(ellipse 45% 32% at 85% 65%, rgba(251,146,60,0.06) 0%, transparent 70%)",
          "radial-gradient(ellipse 35% 28% at 50% 46%, rgba(245,158,11,0.05) 0%, transparent 65%)",
        ].join(", "),
      }} />

      {/* ── Stars ── */}
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            width:  s.r * 2,
            height: s.r * 2,
            left:   `calc(${s.x}% + ${dx * s.p * 80}px)`,
            top:    `calc(${s.y}% + ${dy * s.p * 80}px)`,
            opacity: s.twinkle ? undefined : s.o,
            transition: "left 1.4s ease-out, top 1.4s ease-out",
            animation: s.twinkle
              ? `space-star-twinkle ${s.period}s ease-in-out ${-(s.period * s.p * 8).toFixed(2)}s infinite`
              : undefined,
          }}
        />
      ))}

      {/* ── Domain nodes ── */}
      {DOMAINS.map((node, idx) => {
        const isHov     = hovered === node.id
        const isClicked = clicked === node.id
        const size      = Math.round(40 + node.depth * 26)
        const px        = dx * node.depth * 68
        const py        = dy * node.depth * 68
        const stats     = domainStats[node.id]

        return (
          <div
            key={node.id}
            className="absolute cursor-pointer"
            style={{
              left:       `calc(${node.x}% + ${px}px)`,
              top:        `calc(${node.y}% + ${py}px)`,
              zIndex:     Math.round(node.depth * 8),
              transition: "left 0.22s ease-out, top 0.22s ease-out",
              animation:  `space-node-float ${4.2 + idx * 0.4}s ease-in-out ${-idx * 0.9}s infinite`,
            }}
            onMouseEnter={() => { cancelHoverClear(); setHovered(node.id) }}
            onMouseLeave={scheduleHoverClear}
            onClick={() => handleClick(node.id)}
          >
            {/* Ambient glow */}
            <div className="absolute rounded-full pointer-events-none" style={{
              width: size * 2.8, height: size * 2.8,
              left: "50%", top: "50%",
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle, ${node.color}${isHov ? "1f" : "0b"} 0%, transparent 70%)`,
              transition: "background 0.4s",
            }} />

            {/* Orb */}
            <div style={{
              width: size, height: size,
              borderRadius: "50%",
              background: `radial-gradient(circle at 33% 28%, ${node.color}55, ${node.color}1a 55%, ${node.color}08)`,
              border: `1px solid ${node.color}${isHov ? "72" : "30"}`,
              boxShadow: isHov
                ? `0 0 ${size}px ${node.color}48, 0 0 ${size * 0.4}px ${node.color}30, inset 0 0 ${size * 0.3}px ${node.color}20`
                : `0 0 ${size * 0.5}px ${node.color}22, inset 0 0 ${size * 0.15}px ${node.color}10`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column", gap: 2,
              transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transform: isClicked ? "scale(0.91)" : isHov ? "scale(1.14)" : "scale(1)",
            }}>
              <node.Icon style={{
                width: size * 0.3, height: size * 0.3,
                color: node.color,
                opacity: isHov ? 1 : 0.65,
                transition: "opacity 0.2s",
                strokeWidth: 1.5,
              }} />
              {/* Count — visible at rest */}
              {stats.total > 0 && (
                <span style={{
                  fontSize: size * 0.18,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.75)",
                  lineHeight: 1,
                  letterSpacing: "-0.01em",
                }}>
                  {stats.total}
                </span>
              )}
            </div>

            {/* New-items badge */}
            {stats.newCount > 0 && (
              <div style={{
                position: "absolute", top: -3, right: -3,
                minWidth: 18, height: 18, borderRadius: 9,
                background: "#f59e0b",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 800, color: "white",
                padding: "0 4px",
                boxShadow: "0 0 10px rgba(245,158,11,0.7)",
                animation: "space-orb-pulse 2s ease-in-out infinite",
              }}>
                {stats.newCount}
              </div>
            )}

            {/* Label */}
            <div className="absolute text-center pointer-events-none" style={{
              top: "100%", left: "50%",
              transform: "translateX(-50%)",
              marginTop: 8, whiteSpace: "nowrap",
              opacity: isHov ? 1 : 0.52,
              transition: "opacity 0.25s",
            }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: isHov ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.72)", letterSpacing: "0.03em" }}>
                {node.label}
              </div>
              <div style={{ fontSize: 8, color: isHov ? `${node.color}bb` : "rgba(255,255,255,0.24)", marginTop: 2, letterSpacing: "0.025em" }}>
                {node.sub}
              </div>
            </div>
          </div>
        )
      })}

      {/* ── Personal nodes (center) ── */}
      {personalNodes.map((node) => {
        const isHov     = hovered === node.id
        const isClicked = clicked === node.id
        const SIZE      = 88
        const px        = dx * 0.88 * 68
        const py        = dy * 0.88 * 68
        const period    = node.id === "monitoramentos" ? 4.8 : 5.3
        const delay     = node.id === "monitoramentos" ? "0" : "-1.9"

        return (
          <div
            key={node.id}
            className="absolute cursor-pointer"
            style={{
              left:       `calc(${node.x}% + ${px}px)`,
              top:        `calc(${node.y}% + ${py}px)`,
              zIndex:     18,
              transition: "left 0.18s ease-out, top 0.18s ease-out",
              animation:  `space-node-float ${period}s ease-in-out ${delay}s infinite`,
            }}
            onMouseEnter={() => { cancelHoverClear(); setHovered(node.id) }}
            onMouseLeave={scheduleHoverClear}
            onClick={() => handleClick(node.id)}
          >
            {/* Large glow */}
            <div className="absolute rounded-full pointer-events-none" style={{
              width: SIZE * 3.2, height: SIZE * 3.2,
              left: "50%", top: "50%",
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle, ${node.color}${isHov ? "22" : "12"} 0%, transparent 65%)`,
              transition: "background 0.4s",
            }} />

            {/* Orb */}
            <div style={{
              width: SIZE, height: SIZE,
              borderRadius: "50%",
              background: `radial-gradient(circle at 32% 28%, ${node.color}68, ${node.color}2a 48%, ${node.color}0d)`,
              border: `1.5px solid ${node.color}${isHov ? "85" : "42"}`,
              boxShadow: isHov
                ? `0 0 ${SIZE * 1.1}px ${node.color}52, 0 0 ${SIZE * 0.5}px ${node.color}38, inset 0 0 ${SIZE * 0.35}px ${node.color}28`
                : `0 0 ${SIZE * 0.65}px ${node.color}2a, inset 0 0 ${SIZE * 0.2}px ${node.color}15`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column", gap: 3,
              position: "relative",
              transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transform: isClicked ? "scale(0.94)" : isHov ? "scale(1.09)" : "scale(1)",
            }}>
              <node.Icon style={{
                width: SIZE * 0.3, height: SIZE * 0.3,
                color: node.color, opacity: isHov ? 1 : 0.78,
                transition: "opacity 0.2s", strokeWidth: 1.5,
              }} />
              <div style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.92)", lineHeight: 1, letterSpacing: "-0.01em" }}>
                {node.count}
              </div>

              {/* Badge */}
              {node.badge && (
                <div style={{
                  position: "absolute", top: -5, right: -5,
                  minWidth: 22, height: 22, borderRadius: 11,
                  background: "#f59e0b",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800, color: "white", padding: "0 5px",
                  boxShadow: "0 0 12px rgba(245,158,11,0.75)",
                  animation: "space-orb-pulse 2s ease-in-out infinite",
                }}>
                  {node.badge}
                </div>
              )}
            </div>

            {/* Label */}
            <div className="absolute text-center pointer-events-none" style={{
              top: "100%", left: "50%",
              transform: "translateX(-50%)",
              marginTop: 11, whiteSpace: "nowrap",
              opacity: isHov ? 1 : 0.72,
              transition: "opacity 0.25s",
            }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: isHov ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.82)", letterSpacing: "0.015em" }}>
                {node.label}
              </div>
              <div style={{ fontSize: 9, color: isHov ? `${node.color}cc` : "rgba(255,255,255,0.3)", marginTop: 2 }}>
                {node.sub}
              </div>
            </div>
          </div>
        )
      })}

      {/* ── Hover card layer (above everything) ── */}
      {hoveredDomain && (
        <HoverCard
          nodeId={hoveredDomain.id}
          nodeX={hoveredDomain.x}
          nodeY={hoveredDomain.y}
          nodeSize={Math.round(40 + hoveredDomain.depth * 26)}
          depth={hoveredDomain.depth}
          color={hoveredDomain.color}
          label={hoveredDomain.label}
          dx={dx} dy={dy}
          stats={domainStats[hoveredDomain.id]}
          onOpenChat={onOpenChat}
          onHoverEnter={cancelHoverClear}
          onHoverLeave={scheduleHoverClear}
        />
      )}
      {hoveredPersonal && (
        <HoverCard
          nodeId={hoveredPersonal.id}
          nodeX={hoveredPersonal.x}
          nodeY={hoveredPersonal.y}
          nodeSize={88}
          depth={0.88}
          color={hoveredPersonal.color}
          label={hoveredPersonal.label}
          dx={dx} dy={dy}
          stats={null}
          onOpenChat={onOpenChat}
          onHoverEnter={cancelHoverClear}
          onHoverLeave={scheduleHoverClear}
          monitorings={hoveredPersonal.id === "monitoramentos" ? monitorings : undefined}
          pesquisas={hoveredPersonal.id === "pesquisas" ? recentPesquisas : undefined}
        />
      )}

    </div>
  )
}
