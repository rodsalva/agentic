"use client"

import { ChevronLeft, ChevronRight, LogOut, BookOpen, Bell, Sparkles, Scale } from "lucide-react"
import type { MonitoringSubscription } from "@/lib/monitoring-data"
import { ManorAvatar } from "./manor-avatar"

// ── Shared palette ────────────────────────────────────────────────
const BG       = "#0b0919"
const BORDER   = "rgba(255,255,255,0.07)"
const TEXT_HI  = "rgba(255,255,255,0.82)"
const TEXT_MID = "rgba(255,255,255,0.45)"
const TEXT_LO  = "rgba(255,255,255,0.28)"

// ── Props ─────────────────────────────────────────────────────────

export type ActiveChatContext =
  | { type: "general" }
  | { type: "monitoring"; name: string; color?: string }
  | null

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  monitorings: MonitoringSubscription[]
  selectedMonitoringId: string | null
  selectedConversationId: string | null
  showDigest: boolean
  showMonitoringsList: boolean
  showDocumentsList: boolean
  showLitigationMap: boolean
  onSelectMonitoring: (id: string) => void
  onSelectConversation: (id: string) => void
  onShowDigest: () => void
  onShowMonitoringsList: () => void
  onShowDocumentsList: () => void
  onShowLitigationMap: () => void
  onNewMonitoring: () => void
  onNewPesquisa: () => void
  onOpenInlineChat?: (monitoring: MonitoringSubscription) => void
  onOpenGeneralChat?: () => void
  chatMonitoringCount: number
  hasChatMessages: boolean
  activeChatContext?: ActiveChatContext
}

// ── Collapsed sidebar ─────────────────────────────────────────────

function CollapsedSidebar({
  onToggle,
  monitorings,
  onOpenGeneralChat,
}: {
  onToggle: () => void
  monitorings: MonitoringSubscription[]
  onOpenGeneralChat?: () => void
}) {
  const hasNews = monitorings.some((m) => m.hasNew)

  return (
    <div
      style={{
        width: 52,
        background: BG,
        borderRight: `1px solid ${BORDER}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 20,
        paddingBottom: 16,
        gap: 14,
        height: "100%",
      }}
    >
      {/* Chat button — always visible even when collapsed */}
      <button
        onClick={onOpenGeneralChat}
        title="Falar com a Manor"
        style={{
          width: 36, height: 36,
          borderRadius: 10,
          background: "linear-gradient(135deg, rgba(245,158,11,0.14), rgba(129,140,248,0.1))",
          border: "1px solid rgba(245,158,11,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 0 16px rgba(245,158,11,0.14)",
          transition: "all 0.2s ease",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(245,158,11,0.6)"
          e.currentTarget.style.boxShadow   = "0 0 22px rgba(245,158,11,0.28)"
          e.currentTarget.style.background  = "linear-gradient(135deg, rgba(245,158,11,0.22), rgba(129,140,248,0.15))"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"
          e.currentTarget.style.boxShadow   = "0 0 16px rgba(245,158,11,0.14)"
          e.currentTarget.style.background  = "linear-gradient(135deg, rgba(245,158,11,0.14), rgba(129,140,248,0.1))"
        }}
      >
        <Sparkles style={{ width: 15, height: 15, color: "#f59e0b", strokeWidth: 1.5 }} />
      </button>

      {/* New items indicator */}
      {hasNews && (
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#f59e0b",
          boxShadow: "0 0 8px rgba(245,158,11,0.8)",
          animation: "manor-glow 2.5s ease-in-out infinite",
        }} />
      )}

      <div style={{ flex: 1 }} />

      {/* Expand */}
      <button
        onClick={onToggle}
        style={{ color: TEXT_LO, background: "none", border: "none", cursor: "pointer", padding: 4, transition: "color 0.15s" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = TEXT_HI }}
        onMouseLeave={(e) => { e.currentTarget.style.color = TEXT_LO }}
      >
        <ChevronRight style={{ width: 14, height: 14 }} />
      </button>
    </div>
  )
}

// ── Nav button ─────────────────────────────────────────────────────

function NavItem({
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: React.ElementType
  label: string
  active: boolean
  badge?: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 10px",
        borderRadius: 9,
        background: active ? "rgba(255,255,255,0.09)" : "transparent",
        border: "none",
        cursor: "pointer",
        transition: "background 0.15s, color 0.15s",
        color: active ? TEXT_HI : TEXT_MID,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "rgba(255,255,255,0.05)"
          e.currentTarget.style.color = "rgba(255,255,255,0.7)"
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent"
          e.currentTarget.style.color = TEXT_MID
        }
      }}
    >
      <Icon style={{ width: 15, height: 15, flexShrink: 0, strokeWidth: 1.6, opacity: active ? 0.9 : 0.7 }} />
      <span style={{ fontSize: 13, fontWeight: active ? 500 : 400, letterSpacing: "0.01em", flex: 1, textAlign: "left" }}>
        {label}
      </span>
      {badge != null && badge > 0 && (
        <span style={{
          minWidth: 18, height: 18, borderRadius: 9,
          background: "#f59e0b",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 800, color: "white", padding: "0 4px",
          boxShadow: "0 0 8px rgba(245,158,11,0.55)",
        }}>
          {badge}
        </span>
      )}
    </button>
  )
}

// ── Main sidebar ───────────────────────────────────────────────────

export function Sidebar({
  isOpen,
  onToggle,
  monitorings,
  selectedMonitoringId,
  selectedConversationId,
  showDigest,
  showMonitoringsList,
  showDocumentsList,
  onSelectMonitoring,
  onSelectConversation,
  onShowDigest,
  onShowMonitoringsList,
  onShowDocumentsList,
  onShowLitigationMap,
  showLitigationMap,
  onNewMonitoring,
  onNewPesquisa,
  onOpenInlineChat,
  onOpenGeneralChat,
  chatMonitoringCount,
  hasChatMessages,
  activeChatContext,
}: SidebarProps) {

  if (!isOpen) {
    return (
      <CollapsedSidebar
        onToggle={onToggle}
        monitorings={monitorings}
        onOpenGeneralChat={onOpenGeneralChat}
      />
    )
  }

  const totalUpdates = monitorings.reduce((acc, m) => acc + (m.newCount ?? 0), 0)
  const newMonitorings = monitorings.filter((m) => m.hasNew)

  return (
    <div
      style={{
        width: 256,
        background: BG,
        borderRight: `1px solid ${BORDER}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* ── Header ── */}
      <div style={{
        padding: "20px 16px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <a href="/" style={{ cursor: "pointer", lineHeight: 0 }}>
          <img
            src="/manor-01.svg"
            alt="Manor"
            style={{ height: 14, width: "auto", filter: "invert(1) brightness(1.8)", opacity: 0.82 }}
          />
        </a>
        <button
          onClick={onToggle}
          style={{ color: TEXT_LO, background: "none", border: "none", cursor: "pointer", padding: 4, transition: "color 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = TEXT_HI }}
          onMouseLeave={(e) => { e.currentTarget.style.color = TEXT_LO }}
        >
          <ChevronLeft style={{ width: 14, height: 14 }} />
        </button>
      </div>

      {/* ── Chat context area ── */}
      <div style={{ padding: "0 12px 20px", display: "flex", flexDirection: "column", gap: 8 }}>

        {/* Active chat context banner */}
        {activeChatContext && (
          <div style={{
            padding: "9px 13px",
            borderRadius: 10,
            background: activeChatContext.type === "general"
              ? "rgba(129,140,248,0.1)"
              : `${activeChatContext.color ?? "#f59e0b"}14`,
            border: activeChatContext.type === "general"
              ? "1px solid rgba(129,140,248,0.35)"
              : `1px solid ${activeChatContext.color ?? "#f59e0b"}50`,
            boxShadow: activeChatContext.type === "general"
              ? "0 0 18px rgba(129,140,248,0.12)"
              : `0 0 18px ${activeChatContext.color ?? "#f59e0b"}18`,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              color: activeChatContext.type === "general" ? "rgba(129,140,248,0.7)" : `${activeChatContext.color ?? "#f59e0b"}aa`,
              marginBottom: 3,
            }}>
              Conversa ativa
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                background: activeChatContext.type === "general" ? "#818cf8" : (activeChatContext.color ?? "#f59e0b"),
                boxShadow: activeChatContext.type === "general"
                  ? "0 0 7px rgba(129,140,248,0.9)"
                  : `0 0 7px ${activeChatContext.color ?? "#f59e0b"}cc`,
                animation: "manor-glow 2.5s ease-in-out infinite",
              }} />
              <span style={{
                fontSize: 13, fontWeight: 600,
                color: activeChatContext.type === "general" ? "rgba(129,140,248,0.95)" : TEXT_HI,
                letterSpacing: "0.01em",
                overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
              }}>
                {activeChatContext.type === "general" ? "Conversa Geral" : activeChatContext.name}
              </span>
            </div>
          </div>
        )}

        {/* Falar com a Manor button */}
        <button
          onClick={onOpenGeneralChat}
          style={{
            width: "100%",
            display: "flex", alignItems: "center", gap: 9,
            padding: "10px 13px",
            borderRadius: 12,
            background: "linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(129,140,248,0.08) 100%)",
            border: "1px solid rgba(245,158,11,0.22)",
            cursor: "pointer",
            boxShadow: "0 0 24px rgba(245,158,11,0.08)",
            transition: "all 0.22s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(245,158,11,0.5)"
            e.currentTarget.style.boxShadow   = "0 0 32px rgba(245,158,11,0.18)"
            e.currentTarget.style.background  = "linear-gradient(135deg, rgba(245,158,11,0.16) 0%, rgba(129,140,248,0.13) 100%)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(245,158,11,0.22)"
            e.currentTarget.style.boxShadow   = "0 0 24px rgba(245,158,11,0.08)"
            e.currentTarget.style.background  = "linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(129,140,248,0.08) 100%)"
          }}
        >
          <div style={{
            width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
            background: "#f59e0b",
            boxShadow: "0 0 8px rgba(245,158,11,0.9)",
            animation: "manor-glow 2.5s ease-in-out infinite",
          }} />
          <span style={{ fontSize: 12.5, fontWeight: 500, color: TEXT_HI, letterSpacing: "0.01em", flex: 1, textAlign: "left" }}>
            Falar com a Manor
          </span>
          <Sparkles style={{ width: 13, height: 13, color: "rgba(245,158,11,0.65)", strokeWidth: 1.5, flexShrink: 0 }} />
        </button>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: BORDER, margin: "0 16px 16px" }} />

      {/* ── Nav items ── */}
      <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        <NavItem
          icon={BookOpen}
          label="Documentos"
          active={showDocumentsList}
          onClick={onShowDocumentsList}
        />
        <NavItem
          icon={Bell}
          label="Monitoramentos"
          active={showMonitoringsList}
          badge={totalUpdates}
          onClick={onShowMonitoringsList}
        />
        <NavItem
          icon={Scale}
          label="Mapa Contencioso"
          active={showLitigationMap}
          onClick={onShowLitigationMap}
        />
      </div>

      {/* ── Active monitorings mini-list ── */}
      {newMonitorings.length > 0 && (
        <div style={{ padding: "8px 8px 0", display: "flex", flexDirection: "column", gap: 1 }}>
          {newMonitorings.map((m) => (
            <button
              key={m.id}
              onClick={() => onOpenInlineChat ? onOpenInlineChat(m) : onSelectMonitoring(m.id)}
              style={{
                width: "100%",
                display: "flex", alignItems: "center", gap: 8,
                padding: "7px 10px",
                borderRadius: 8,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(245,158,11,0.07)" }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
            >
              <div style={{
                width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
                background: "#f59e0b",
                boxShadow: "0 0 5px rgba(245,158,11,0.7)",
              }} />
              <span style={{
                fontSize: 11.5, color: TEXT_MID, flex: 1,
                textAlign: "left", overflow: "hidden",
                whiteSpace: "nowrap", textOverflow: "ellipsis",
              }}>
                {m.name}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", flexShrink: 0 }}>
                {m.newCount}
              </span>
            </button>
          ))}
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* ── User profile ── */}
      <div style={{
        padding: "12px 14px",
        borderTop: `1px solid ${BORDER}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            overflow: "hidden", flexShrink: 0,
            border: "1px solid rgba(255,255,255,0.12)",
          }}>
            <img src="/male-user-avatar.png" alt="User avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span style={{ fontSize: 12.5, fontWeight: 500, color: TEXT_HI, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Rodrigo A. Salvador
            </span>
            <span style={{ fontSize: 10.5, color: TEXT_LO, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              rodsalva@gmail.com
            </span>
          </div>
        </div>
        <button
          style={{ color: TEXT_LO, background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0, transition: "color 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = TEXT_HI }}
          onMouseLeave={(e) => { e.currentTarget.style.color = TEXT_LO }}
        >
          <LogOut style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  )
}
