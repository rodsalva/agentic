"use client"

import { useState, useRef } from "react"
import { ArrowLeft, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { DailyUpdatesArtifact } from "./daily-updates-artifact"

const MOCK_REPLIES = [
  "Com base nas atualizações de hoje, o destaque é o novo acórdão do STJ sobre ágio interno e a modulação de efeitos do STF na exclusão do ICMS da base do PIS/COFINS. Posso detalhar algum deles.",
  "A legislação publicada hoje no DOU altera o tratamento do JCP — isso pode impactar clientes com estruturas de capital intensivo. Quer que eu aprofunde?",
  "Há 3 acórdãos do CARF hoje com multa qualificada. Posso filtrar pelos que afetam os temas dos seus monitoramentos ativos.",
]

function ScopedChat({ onStartConversation }: { onStartConversation?: (msg: string) => void }) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const replyIdx = useRef(0)

  function send() {
    const text = input.trim()
    if (!text || loading) return
    if (onStartConversation) {
      onStartConversation(text)
      return
    }
    setMessages((p) => [...p, { role: "user", text }])
    setInput("")
    setLoading(true)
    const idx = replyIdx.current % MOCK_REPLIES.length
    replyIdx.current++
    setTimeout(() => {
      setMessages((p) => [...p, { role: "assistant", text: MOCK_REPLIES[idx] }])
      setLoading(false)
    }, 1200)
  }

  return (
    <div className="border-t border-gray-100 px-6 py-3">
      {messages.length > 0 && (
        <div className="max-w-sm mx-auto mb-2 space-y-1.5 max-h-32 overflow-y-auto [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-gray-200">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <p className={cn(
                "max-w-[80%] text-xs leading-relaxed px-3 py-1.5 rounded-2xl",
                m.role === "user" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
              )}>
                {m.text}
              </p>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <p className="text-xs text-gray-400 px-3 py-1.5 bg-gray-100 rounded-2xl">...</p>
            </div>
          )}
        </div>
      )}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 w-full max-w-sm border border-gray-200 rounded-2xl px-3.5 py-2 bg-white">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Digitar mensagem..."
            className="flex-1 text-xs text-gray-700 placeholder:text-gray-400 bg-transparent outline-none"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className={cn(
              "flex-shrink-0 transition-colors",
              input.trim() && !loading ? "text-gray-500 hover:text-gray-900 cursor-pointer" : "text-gray-300 cursor-not-allowed"
            )}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  )
}

export function DigestView({ onBack, onStartConversation }: { onBack: () => void; onStartConversation?: (msg: string) => void }) {
  return (
    <div className="flex-1 flex flex-col h-full bg-white min-w-0">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
        <div className="max-w-3xl mx-auto w-full flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-medium text-gray-900">Atualizações</h1>
            <p className="text-xs text-gray-400 mt-0.5">Direito tributário federal</p>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-gray-100">
        <div className="max-w-3xl mx-auto w-full h-full">
          <DailyUpdatesArtifact fullScreen />
        </div>
      </div>

      {/* ── Chat ───────────────────────────────────────────────── */}
      <div className="flex-shrink-0 max-w-3xl mx-auto w-full">
        <ScopedChat onStartConversation={onStartConversation} />
      </div>

    </div>
  )
}
