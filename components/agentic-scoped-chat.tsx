"use client"

import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { ManorAvatar, TypingIndicator } from "./manor-avatar"

interface ScopedMsg {
  role: "user" | "manor"
  text: string
}

interface AgenticScopedChatProps {
  placeholder?: string
  replies?: string[]
  onSend?: (text: string) => void
  className?: string
}

const DEFAULT_REPLIES = [
  "Entendido. Com base no que está disponível aqui, posso detalhar qualquer ponto específico.",
  "Boa pergunta. Deixa eu cruzar com as fontes relevantes para te dar uma resposta mais completa.",
  "Isso tem nuances importantes. Quer que eu aprofunde ou prefere um resumo rápido?",
]

export function AgenticScopedChat({
  placeholder = "Pergunte ao Manor sobre isso...",
  replies = DEFAULT_REPLIES,
  onSend,
  className,
}: AgenticScopedChatProps) {
  const [messages, setMessages] = useState<ScopedMsg[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [avatarState, setAvatarState] = useState<"idle" | "speaking">("idle")
  const replyIdx = useRef(0)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  function send() {
    const text = input.trim()
    if (!text || loading) return

    if (onSend) {
      onSend(text)
      return
    }

    setMessages((p) => [...p, { role: "user", text }])
    setInput("")
    setLoading(true)
    setAvatarState("speaking")

    const idx = replyIdx.current % replies.length
    replyIdx.current++

    setTimeout(() => {
      setMessages((p) => [...p, { role: "manor", text: replies[idx] }])
      setLoading(false)
      setAvatarState("idle")
    }, 1000)
  }

  return (
    <div className={cn("border-t border-gray-100 px-5 py-3", className)}>
      {/* Messages */}
      {(messages.length > 0 || loading) && (
        <div className="max-w-lg mx-auto mb-3 space-y-2 max-h-36 overflow-y-auto [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-gray-100">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex items-end gap-2 animate-fade-in-up", m.role === "user" ? "justify-end" : "justify-start")}>
              {m.role === "manor" && (
                <ManorAvatar state="idle" size="xs" className="flex-shrink-0 mb-0.5" />
              )}
              <p className={cn(
                "max-w-[78%] text-xs leading-relaxed px-3 py-1.5 rounded-2xl",
                m.role === "user"
                  ? "bg-gray-900 text-white rounded-br-sm"
                  : "bg-gray-50 text-gray-700 rounded-bl-sm"
              )}>
                {m.text}
              </p>
            </div>
          ))}
          {loading && (
            <div className="flex items-end gap-2 justify-start animate-fade-in-up">
              <ManorAvatar state="speaking" size="xs" className="flex-shrink-0 mb-0.5" />
              <div className="bg-gray-50 rounded-2xl rounded-bl-sm px-3 py-2">
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      {/* Input row */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 w-full max-w-lg bg-gray-50 border border-gray-100 rounded-2xl px-3.5 py-2 focus-within:border-gray-200 focus-within:bg-white transition-all">
          <ManorAvatar
            state={avatarState}
            size="xs"
            className="flex-shrink-0"
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={placeholder}
            className="flex-1 text-xs text-gray-700 placeholder:text-gray-400 bg-transparent outline-none"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className={cn(
              "flex-shrink-0 p-1 rounded-lg transition-colors",
              input.trim() && !loading
                ? "text-gray-900 hover:bg-gray-200 cursor-pointer"
                : "text-gray-300 cursor-not-allowed"
            )}
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
