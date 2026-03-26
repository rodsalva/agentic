"use client"

import { useState, useRef, useEffect } from "react"
import { X, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { TypingIndicator } from "./manor-avatar"
import type { MonitoringSubscription, MonitoringItem } from "@/lib/monitoring-data"

const M_PATH =
  "M170.9692,116.4327c-4.5887,101.499,6.7994,208.8521.2431,309.4579-2.837,44.8112-19.0157,58.3276-64.5367,56.3806l-3.2006,3.2017-.1758,7.1131,154.8776-.0315-3.3807-10.3126c-14.4031.0022-35.0294-1.2383-46.5901-10.8379-16.7181-14.0439-11.7441-45.3409-15.8379-64.5443l-.0532-266.979c15.9442,18.384,30.7109,38.5805,45.3799,58.6793l-.0065.0771,127.8502,181.0172,44.0982,62.4138,11.9134,16.7148,16.7148-31.4739,14.7591-27.9173v-.178l16.8928-31.6508,127.8502-237.5628v317.0463c0,.89-3.7345,14.7591-4.6234,16.3599-8.5349,17.9597-38.409,19.5594-55.4787,18.4925l-3.5566,10.6686,191.1529-.1769-1.9557-9.6028c-25.0728-1.5997-55.4787-1.7777-61.347-32.1848.534-97.2652-9.2468-204.1332-2.6677-300.8655,3.2017-45.699,20.6273-49.4336,63.8367-49.6105v-10.6697l-131.5848.178-153.0999,288.9521-147.4096-209.2906-.0554-.0391.0619-.0347c-46.6725-64.5063-95.1564-125.5255-188.3984-121.9961l-45.699,6.4011,3.5566,8.5349c44.7114-3.689,80.7078,23.8583,110.4701,54.2697Z"

// ── Types ──────────────────────────────────────────────────────────

interface ChatMsg {
  role: "manor" | "user"
  content: string
  chips?: string[]
}

// ── Opener generator — item level ──────────────────────────────────

function buildItemOpener(item: MonitoringItem): { message: string; chips: string[] } {
  const impactLabel =
    item.impact === "alto" ? "impacto alto" : item.impact === "medio" ? "impacto médio" : "impacto baixo"
  const detail = item.implications ?? item.ementa
  return {
    message: `**"${item.title}"** — ${item.orgao}${item.turma ? `, ${item.turma}` : ""} · ${item.date}. ${detail} Quer que eu te explique o que isso significa para você?`,
    chips: ["Me explica", "Ver o documento", "Não é urgente agora"],
  }
}

// ── Opener generator — general (no specific context) ───────────────

export const GENERAL_MONITORING_ID = "__general__"

// ── Opener generator — monitoring level ────────────────────────────

function buildOpener(m: MonitoringSubscription): { message: string; chips: string[] } {
  if (m.id === GENERAL_MONITORING_ID) {
    return {
      message: "Olá! Posso te ajudar com qualquer dúvida sobre tributário, pesquisas ou monitoramentos. O que você precisa?",
      chips: ["O que tem de novo?", "Criar monitoramento", "Pesquisar algo"],
    }
  }
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
  item?: MonitoringItem
  onClose: () => void
  onViewFull: (id: string) => void
}

export function InlineChat({ monitoring, item, onClose, onViewFull }: InlineChatProps) {
  const opener = item ? buildItemOpener(item) : buildOpener(monitoring)
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "manor", content: opener.message, chips: opener.chips },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus()
    }, 300)
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

    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [...prev, { role: "manor", content: getReply(content) }])
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
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Plain M — no octagon, only instance in the UI */}
            <svg viewBox="40 100 700 390" className="w-5 h-5 flex-shrink-0" preserveAspectRatio="xMidYMid meet">
              <path fill="#111827" d={M_PATH} />
            </svg>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold text-gray-900 leading-none">Manor</span>
              {monitoring.id !== GENERAL_MONITORING_ID && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide bg-amber-50 text-amber-600 border border-amber-200 truncate max-w-[220px]">
                  {item ? `${monitoring.name} · ${item.orgao}` : monitoring.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {monitoring.id !== GENERAL_MONITORING_ID && (
              <button
                onClick={() => onViewFull(monitoring.id)}
                className="text-xs text-gray-500 hover:text-gray-900 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Ver completo
              </button>
            )}
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
                <div className="flex flex-col gap-2 max-w-[88%]">
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
            <div className="flex items-start animate-fade-in-up">
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
