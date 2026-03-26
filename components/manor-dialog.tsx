"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { ManorAvatar } from "./manor-avatar"

export interface DialogData {
  message: string
  subtext?: string
  confirm: string
  dismiss?: string
  onConfirm: () => void
  onDismiss?: () => void
}

interface ManorDialogProps {
  dialog: DialogData | null
  onClose: () => void
}

export function ManorDialog({ dialog, onClose }: ManorDialogProps) {
  const [avatarState, setAvatarState] = useState<"speaking" | "active">("speaking")
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!dialog) { setVisible(false); return }
    const t1 = setTimeout(() => setVisible(true), 30)
    const t2 = setTimeout(() => setAvatarState("active"), 1400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [dialog])

  if (!dialog) return null

  function handleConfirm() {
    dialog!.onConfirm()
    onClose()
  }

  function handleDismiss() {
    dialog!.onDismiss?.()
    onClose()
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-6 transition-all duration-300",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={handleDismiss}
      />

      {/* Dialog box */}
      <div
        className={cn(
          "relative bg-white rounded-2xl shadow-2xl max-w-xs w-full p-6 flex flex-col items-center gap-5 text-center transition-all duration-300",
          visible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        )}
      >
        {/* Avatar */}
        <ManorAvatar state={avatarState} size="xl" hasNews />

        {/* Message */}
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-900 leading-snug">{dialog.message}</p>
          {dialog.subtext && (
            <p className="text-xs text-gray-400 leading-relaxed">{dialog.subtext}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={handleConfirm}
            className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
          >
            {dialog.confirm}
          </button>
          {dialog.dismiss && (
            <button
              onClick={handleDismiss}
              className="w-full py-2 text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              {dialog.dismiss}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
