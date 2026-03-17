# Manor Monitoring — Implementation Plan

## Context

Manor is an AI-powered Brazilian federal tax law intelligence product with two modes:
- **Research** (active, query-driven): User asks → gets answers in a chat
- **Monitoring** (passive, subscription-driven): System watches topics → notifies user

This plan covers converting the prototype-level monitoring integration into a simple,
effective, first-class feature that coexists with research without confusion.

---

## What Was Wrong

| Issue | Root Cause |
|---|---|
| No way to see all monitoring subscriptions | Monitoring artifacts lived inside chat messages |
| Mode switcher was invisible and confusing | 3-mode dropdown in bottom-right of input |
| `onComplete` created monitoring but nothing captured it | No shared state, no list |
| Sidebar mixed monitoring conversations with research chats | No structural separation |
| Monitoring detail was a chat bubble, not a first-class view | Artifact embedded in message |

---

## Decisions

### 1. Sidebar split: MONITORAMENTOS above CONVERSAS

The sidebar becomes the persistent control surface for monitoring. Two clear sections:

```
MONITORAMENTOS
  ● Ágio · CARF · IRPJ/CSLL      [2 new]
  ● PIS/COFINS · STJ              [1 new]
  + Novo monitoramento

CONVERSAS
  Nova Conversa
  Questão Tributária Gen...
  ...
```

- Monitoring items have amber dots when there are new updates
- "+" opens MonitoringSetupFlow inline in main area
- Clicking a monitoring opens MonitoringDetailView (not a chat)

### 2. MonitoringDetailView as a first-class main-area view

When a monitoring is selected, the main area renders a dedicated full-screen layout:

```
[Monitoring name]  [scope pills]  [last checked]  [Editar] [Pausar]

── O QUE É NOVO ─────────────────────────────────
  [items — same visual as before, full width]

── IMPACTO ──────────────────────────────────────
  [AI impact summary]

── SUGESTÕES ────────────────────────────────────
  [suggestion chips]

──────────────────────────────────────────────────
  [chat input: "Pergunte sobre estas atualizações"]
```

The chat input at the bottom creates a scoped research thread — a natural bridge
back to research mode. Same pattern as the existing monitoring artifact but
full-width, full-height, not inside a bubble.

### 3. Kill the mode switcher. Add a Bell pill on welcome screen.

Remove the "Pesquisa: Chat / Pesquisa: Completa / Monitoramento" dropdown.

Replace with:

```
[input field                           ] [🔔 Monitorar] [→]
```

A `Bell` pill button next to the send button. Clicking it reveals
`MonitoringSetupFlow` inline below the input. This makes monitoring creation
discoverable without polluting the primary search flow.

### 4. `manor-chat.tsx` owns monitoring state

`manor-chat.tsx` holds:
- `monitorings: MonitoringSubscription[]` (loaded from mock data)
- `selectedMonitoringId: string | null`
- `onAddMonitoring(monitoring)` callback passed down to ChatArea → MonitoringSetupFlow

View routing:
- `selectedMonitoringId !== null` → render `MonitoringDetailView`
- otherwise → render `ChatArea` (welcome or chat)

---

## Architecture

```
manor-chat.tsx (state owner + router)
├── Sidebar
│   ├── MONITORAMENTOS section (props: monitorings, onSelect, onNew)
│   └── CONVERSAS section (existing)
└── Main area
    ├── ChatArea (welcome / research chat)
    │   ├── MonitoringSetupFlow (inline, triggered by Bell button)
    │   └── DailyUpdatesArtifact (existing, monitoring creation hook)
    └── MonitoringDetailView (new, full-screen)
        ├── Header (name, scope, status, actions)
        ├── Items list
        ├── Impact + suggestions
        └── Scoped chat input
```

---

## Data Model

```typescript
// lib/monitoring-data.ts

interface MonitoringSubscription {
  id: string
  name: string
  scope: {
    sources: SourceType[]
    tributos: Tributo[]
    assuntos: string[]
  }
  status: 'active' | 'paused'
  lastChecked: string
  newCount: number
  hasNew: boolean
  items: MonitoringItem[]      // from monitoring-artifact.tsx
  impactSummary: string
  suggestions: string[]
}
```

---

## Build Order

### Step 1 — `lib/monitoring-data.ts`
Mock data: 2 active subscriptions with items, impact, suggestions.
This is the shared source of truth for sidebar + detail view.

### Step 2 — `sidebar.tsx`
Split into two sections. Accept `monitorings`, `selectedMonitoringId`,
`onSelectMonitoring`, `onNewMonitoring` props.

### Step 3 — `components/monitoring-detail-view.tsx`
New component. Full-screen layout. Receives a `MonitoringSubscription`.
Scoped chat at the bottom (mock AI responses).

### Step 4 — `manor-chat.tsx`
Add state. Wire view routing. Pass callbacks to Sidebar and ChatArea.

### Step 5 — `chat-area.tsx`
Remove mode switcher. Add Bell pill → inline MonitoringSetupFlow.
Wire `onAddMonitoring` callback up to `manor-chat.tsx`.

---

## What We're NOT Building (yet)

- Editing monitoring scope (UI only, no persistence)
- Pausing / deleting (UI affordances only)
- Real AI responses in scoped chat
- Push notifications
- Backend / API
- Multiple conversations per monitoring

---

## Design Principles

1. **Monitoring is created in context, managed independently**
2. **Amber = monitoring** (consistent color language throughout)
3. **Don't add a new page/route** — all navigation happens within the same layout
4. **The chat is always one tap away** — monitoring detail has a chat input at the bottom
