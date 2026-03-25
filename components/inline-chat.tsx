"use client"

import { useState, useRef, useEffect } from "react"
import { X, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { ManorAvatar, TypingIndicator } from "./manor-avatar"
import type { AvatarState } from "./manor-avatar"
import type { MonitoringSubscription } from "@/lib/monitoring-data"

// ── Types ──────────────────────────────────────────────────────────

interface ChatMsg {
  role: "manor" | "user"
  content: string
  chips?: string[]
}

// ── Opener generator ───────────────────────────────────────────────

function buildOpener(m: MonitoringSubscription): { message: string; chips: string[] } {
  if (m.hasNew && m.newCount > 0) {
    const newItem = m.items.find((i) => i.isNew)
    const impactTag =
      newItem?.impact === "alto" ? "impacto alto" : newItem?.impact === "medio" ? "impacto médio" : "impacto baixo"
    return {
      message: `Tenho ${m.newCount} ${m.newCount === 1 ? "novidade" : "novidades"} no **${m.name}**. ${newItem ? `"${newItem.title}" — ${impactTag} para você.` : ""} Quer que eu te explique o que mudou?`,
      chips: ["Me explica", "Ver o acórdão", "Não é urgente agora"],
    }
  }
  if (m.status === "paused") {
    return {
      message: `Esse monitoramento está pausado. Quer que eu retome ou prefere ajustar o escopo antes?`,
      chips: ["Retomar agora", "Ajustar escopo", "Deixa pausado"],
    }
  }
  return {
    message: `**${m.name}** está em dia — nenhuma novidade desde a última verificação. Quer explorar um tema relacionado ou ajustar o escopo?`,
    chips: ["Explorar relacionados", "Ajustar escopo", "Tudo certo"],
  }
}

// ── Simulated responses ────────────────────────────────────────────

const CHIP_REPLIES: Record<string, string> = {
  "Me explica":
    "Claro. O ponto central é que esse precedente reforça uma posição desfavorável ao contribuinte. Se você tem estruturas ativas nesse tema, vale revisão antes do encerramento do exercício. Quer que eu detalhe as implicações práticas?",
  "Ver o acórdão":
    "Posso abrir o documento completo aqui. Mas antes: você quer o texto integral ou um resumo dos pontos-chave para a sua situação?",
  "Não é urgente agora":
    "Entendido. Deixo marcado. Se surgir algo mais crítico, te aviso primeiro.",
  "Retomar agora":
    "Feito, monitoramento ativo novamente. Vou verificar as últimas atualizações e te falo se tiver alguma coisa relevante.",
  "Ajustar escopo":
    "Posso ampliar as fontes, mudar a frequência ou refinar o tema. O que faz mais sentido para você agora?",
  "Deixa pausado":
    "Ok, fica pausado. Me avisa quando quiser retomar.",
  "Explorar relacionados":
    "Para esse tema, monitoro também tópicos adjacentes que costumam aparecer juntos no contencioso. Quer que eu sugira alguns?",
  "Tudo certo":
    "Perfeito. Estarei de olho e te aviso quando aparecer algo relevante.",
}

function getReply(content: string): string {
  return (
    CHIP_REPLIES[content] ??
    (content.includes("?")
      ? "Boa pergunta. Deixa eu verificar nas fontes e te respondo em seguida."
      : "Entendido. Anotado aqui.")
  )
}

// ── Component ──────────────────────────────────────────────────────

interface InlineChatProps {
  monitoring: MonitoringSubscription
  onClose: () => void
  onViewFull: (id: string) => void
}

export function InlineChat({ monitoring, onClose, onViewFull }: InlineChatProps) {
  const opener = buildOpener(monitoring)
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "manor", content: opener.message, chips: opener.chips },
  ])
  const [input, setInput] = useState("")
  const [avatarState, setAvatarState] = useState<AvatarState>("speaking")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setAvatarState("active")
      inputRef.current?.focus()
    }, 1200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const send = (content: string) => {
    if (!content.trim()) return
    setMessages((prev) => [...prev, { role: "user", content }])
    setInput("")
    setIsTyping(true)
    setAvatarState("speaking")

    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [...prev, { role: "manor", content: getReply(content) }])
      setAvatarState("active")
    }, 900)
  }

  const renderContent = (text: string) =>
    text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i} className="font-semibold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      )
    )

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[72vh] flex flex-col animate-manor-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0">
          <div className="w-9 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <ManorAvatar state={avatarState} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight">Manor</p>
              <p className="text-[11px] text-gray-400 truncate max-w-[200px] leading-tight">
                {monitoring.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onViewFull(monitoring.id)}
              className="text-xs text-gray-500 hover:text-gray-900 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Ver completo
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-4 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-gray-100">
          {messages.map((msg, i) => (
            <div
              key={i}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i === 0 ? 0 : 0}ms` }}
            >
              {msg.role === "manor" ? (
                <div className="flex items-start gap-2.5 max-w-[88%]">
                  <ManorAvatar
                    state={i === messages.length - 1 && avatarState === "speaking" ? "speaking" : "idle"}
                    size="xs"
                    className="mt-1 flex-shrink-0"
                  />
                  <div className="space-y-2">
                    <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                      <p className="text-sm text-gray-800 leading-relaxed">{renderContent(msg.content)}</p>
                    </div>
                    {msg.chips && (
                      <div className="flex flex-wrap gap-1.5">
                        {msg.chips.map((chip) => (
                          <button
                            key={chip}
                            onClick={() => send(chip)}
                            className="px-3 py-1.5 text-xs bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-150"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <div className="bg-gray-900 rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[76%]">
                    <p className="text-sm text-white leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start gap-2.5 animate-fade-in-up">
              <ManorAvatar state="speaking" size="xs" className="mt-1 flex-shrink-0" />
              <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-3.5 py-3">
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Responda ao Manor..."
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim()}
              className="p-1.5 bg-gray-900 text-white rounded-lg disabled:opacity-25 hover:bg-gray-700 transition-colors disabled:cursor-not-allowed"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
