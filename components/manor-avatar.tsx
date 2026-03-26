"use client"

import { cn } from "@/lib/utils"

export type AvatarState = "idle" | "active" | "speaking" | "waiting"

interface ManorAvatarProps {
  state?: AvatarState
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
  onClick?: () => void
  hasNews?: boolean
}

const SIZE = {
  xs: { outer: "w-5 h-5", eye: "w-[3px] h-[3px]", gap: "gap-[3px]", dot: "w-1.5 h-1.5" },
  sm: { outer: "w-7 h-7", eye: "w-1 h-1", gap: "gap-1", dot: "w-2 h-2" },
  md: { outer: "w-9 h-9", eye: "w-[5px] h-[5px]", gap: "gap-1.5", dot: "w-2.5 h-2.5" },
  lg: { outer: "w-11 h-11", eye: "w-[6px] h-[6px]", gap: "gap-2", dot: "w-3 h-3" },
  xl: { outer: "w-14 h-14", eye: "w-2 h-2", gap: "gap-2.5", dot: "w-3.5 h-3.5" },
}

export function ManorAvatar({
  state = "idle",
  size = "md",
  className,
  onClick,
  hasNews = false,
}: ManorAvatarProps) {
  const { outer, eye, gap, dot } = SIZE[size]
  const isAnimated = state === "active" || state === "speaking"

  return (
    <div
      className={cn("relative flex items-center justify-center flex-shrink-0", outer, className)}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {/* Pulsing outer ring when news or active */}
      {(hasNews || isAnimated) && (
        <div
          className={cn(
            "absolute inset-[-3px] rounded-full border-2 animate-manor-ring pointer-events-none",
            hasNews ? "border-amber-400" : "border-gray-400"
          )}
        />
      )}

      {/* Main orb */}
      <div
        className={cn(
          "relative w-full h-full rounded-full flex items-center justify-center overflow-hidden transition-all duration-300",
          state === "waiting" ? "bg-gray-600" : "bg-gray-900",
          hasNews && "animate-manor-glow"
        )}
      >
        {/* Eyes row */}
        <div className={cn("flex items-center", gap)}>
          <div
            className={cn(
              "rounded-full bg-white transition-all duration-150",
              eye,
              state === "speaking" && "animate-manor-blink",
              state === "waiting" && "opacity-40"
            )}
          />
          <div
            className={cn(
              "rounded-full bg-white transition-all duration-150",
              eye,
              state === "speaking" && "animate-manor-blink [animation-delay:120ms]",
              state === "waiting" && "opacity-40"
            )}
          />
        </div>

        {/* Speaking wave */}
        {state === "speaking" && (
          <div className="absolute bottom-[18%] flex items-end gap-[2px]">
            <div className="w-[2px] h-[3px] rounded-full bg-white/50 animate-manor-speaking" />
            <div className="w-[2px] h-[4px] rounded-full bg-white/70 animate-manor-speaking [animation-delay:200ms]" />
            <div className="w-[2px] h-[3px] rounded-full bg-white/50 animate-manor-speaking [animation-delay:400ms]" />
          </div>
        )}
      </div>

      {/* News badge dot */}
      {hasNews && state === "idle" && (
        <div
          className={cn(
            "absolute -top-0.5 -right-0.5 rounded-full bg-amber-400 border-2 border-white animate-manor-dot",
            dot
          )}
        />
      )}
    </div>
  )
}

/* Typing indicator (three bouncing dots) used in chat */
export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1 px-1", className)}>
      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-typing-dot" />
      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-typing-dot [animation-delay:200ms]" />
      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-typing-dot [animation-delay:400ms]" />
    </div>
  )
}
