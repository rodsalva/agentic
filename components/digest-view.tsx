"use client"

import { ArrowLeft } from "lucide-react"
import { DailyUpdatesArtifact } from "./daily-updates-artifact"
import { AgenticScopedChat } from "./agentic-scoped-chat"
import { ManorAvatar } from "./manor-avatar"

const DIGEST_REPLIES = [
  "O destaque de hoje é o novo acórdão do STJ sobre ágio interno e a modulação de efeitos do STF na exclusão do ICMS do PIS/COFINS. Qual deles te interessa mais?",
  "A legislação publicada hoje no DOU altera o tratamento do JCP — pode impactar clientes com estruturas de capital intensivo. Quer que eu aprofunde?",
  "Há 3 acórdãos do CARF hoje com multa qualificada. Posso filtrar pelos que afetam os temas dos seus monitoramentos ativos.",
]

export function DigestView({ onBack, onStartConversation }: { onBack: () => void; onStartConversation?: (msg: string) => void }) {
  return (
    <div className="flex-1 flex flex-col h-full bg-white min-w-0">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
        <div className="max-w-3xl mx-auto w-full flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <ManorAvatar state="active" size="sm" />
          <div>
            <h1 className="text-sm font-medium text-gray-900">O que aconteceu hoje</h1>
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
        <AgenticScopedChat
          placeholder="Pergunte sobre as atualizações de hoje..."
          replies={DIGEST_REPLIES}
          onSend={onStartConversation}
        />
      </div>

    </div>
  )
}
