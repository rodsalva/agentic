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

// M letterform from manor-05.svg
const M_PATH =
  "M170.9692,116.4327c-4.5887,101.499,6.7994,208.8521.2431,309.4579-2.837,44.8112-19.0157,58.3276-64.5367,56.3806l-3.2006,3.2017-.1758,7.1131,154.8776-.0315-3.3807-10.3126c-14.4031.0022-35.0294-1.2383-46.5901-10.8379-16.7181-14.0439-11.7441-45.3409-15.8379-64.5443l-.0532-266.979c15.9442,18.384,30.7109,38.5805,45.3799,58.6793l-.0065.0771,127.8502,181.0172,44.0982,62.4138,11.9134,16.7148,16.7148-31.4739,14.7591-27.9173v-.178l16.8928-31.6508,127.8502-237.5628v317.0463c0,.89-3.7345,14.7591-4.6234,16.3599-8.5349,17.9597-38.409,19.5594-55.4787,18.4925l-3.5566,10.6686,191.1529-.1769-1.9557-9.6028c-25.0728-1.5997-55.4787-1.7777-61.347-32.1848.534-97.2652-9.2468-204.1332-2.6677-300.8655,3.2017-45.699,20.6273-49.4336,63.8367-49.6105v-10.6697l-131.5848.178-153.0999,288.9521-147.4096-209.2906-.0554-.0391.0619-.0347c-46.6725-64.5063-95.1564-125.5255-188.3984-121.9961l-45.699,6.4011,3.5566,8.5349c44.7114-3.689,80.7078,23.8583,110.4701,54.2697Z"

const SIZE = {
  xs: { outer: "w-5 h-5",   dot: "w-1.5 h-1.5" },
  sm: { outer: "w-7 h-7",   dot: "w-2 h-2"     },
  md: { outer: "w-9 h-9",   dot: "w-2.5 h-2.5" },
  lg: { outer: "w-11 h-11", dot: "w-3 h-3"     },
  xl: { outer: "w-14 h-14", dot: "w-3.5 h-3.5" },
}

export function ManorAvatar({
  state = "idle",
  size = "md",
  className,
  onClick,
  hasNews = false,
}: ManorAvatarProps) {
  const { outer, dot } = SIZE[size]
  const isActive   = state === "active" || hasNews
  const isWaiting  = state === "waiting"

  return (
    <div
      className={cn("relative flex-shrink-0 inline-flex", outer, className)}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {/* Body — octagon clipped dark container */}
      <div
        className={cn(
          "clip-octagon w-full h-full flex items-center justify-center transition-opacity duration-300",
          isWaiting ? "bg-gray-500" : "bg-gray-900",
        )}
      >
        {/* Clean M logo — no transform animations */}
        <svg
          viewBox="40 100 700 390"
          className={cn("w-[82%] h-[82%]", isWaiting && "opacity-40")}
          preserveAspectRatio="xMidYMid meet"
        >
          <path fill="white" d={M_PATH} />
        </svg>
      </div>

      {/* Amber news badge */}
      {hasNews && state === "idle" && (
        <div
          className={cn(
            "absolute -top-0.5 -right-0.5 rounded-full bg-amber-400 border-2 border-white",
            dot
          )}
        />
      )}
    </div>
  )
}

/* ── Typing indicator ── */
export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1 px-1", className)}>
      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-typing-dot" />
      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-typing-dot [animation-delay:200ms]" />
      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-typing-dot [animation-delay:400ms]" />
    </div>
  )
}
