"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ManorAvatar } from "./manor-avatar"

export interface NudgeData {
  id: string
  message: string
  chips?: string[]
  onChip?: (chip: string) => void
  autoDismiss?: number // ms
}

interface ManorNudgeProps {
  nudge: NudgeData
  onDismiss: (id: string) => void
}

export function ManorNudge({ nudge, onDismiss }: ManorNudgeProps) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    // Slide in
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!nudge.autoDismiss) return
    const t = setTimeout(() => dismiss(), nudge.autoDismiss)
    return () => clearTimeout(t)
  }, [nudge.autoDismiss]) // eslint-disable-line react-hooks/exhaustive-deps

  function dismiss() {
    setLeaving(true)
    setTimeout(() => onDismiss(nudge.id), 300)
  }

  function handleChip(chip: string) {
    nudge.onChip?.(chip)
    dismiss()
  }

  return (
    <div
      className={cn(
        "w-72 bg-white border border-gray-100 rounded-2xl shadow-lg p-4 transition-all duration-300",
        visible && !leaving ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <div className="flex items-start gap-3">
        <ManorAvatar state="active" size="sm" hasNews className="flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-700 leading-relaxed">{nudge.message}</p>
          {nudge.chips && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {nudge.chips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChip(chip)}
                  className="px-2.5 py-1 text-[11px] bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-150"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={dismiss}
          className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 p-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

// ── Nudge container — fixed bottom-right ──────────────────────────

interface ManorNudgeContainerProps {
  nudges: NudgeData[]
  onDismiss: (id: string) => void
}

export function ManorNudgeContainer({ nudges, onDismiss }: ManorNudgeContainerProps) {
  if (nudges.length === 0) return null
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 items-end pointer-events-none">
      {nudges.map((n) => (
        <div key={n.id} className="pointer-events-auto">
          <ManorNudge nudge={n} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}
