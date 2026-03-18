// ── Types ──────────────────────────────────────────────────────────────────

export type SourceType = "stf" | "stj" | "trf" | "receita" | "dou" | "carf"
export type Tributo = "IRPJ" | "CSLL" | "PIS" | "COFINS" | "IPI" | "ISS" | "ICMS"
export type ImpactLevel = "alto" | "medio" | "baixo"
export type ItemType = "acordao" | "solucao" | "legislacao"

export interface MonitoringItem {
  id: string
  source: SourceType
  type: ItemType
  orgao: string
  turma?: string
  relator?: string
  date: string
  title: string
  ementa: string
  implications?: string
  impact: ImpactLevel
  isNew: boolean
}

export interface MonitoringScope {
  sources: SourceType[]
  tributos: Tributo[]
  assuntos: string[]
}

export interface MonitoringSubscription {
  id: string
  name: string
  scope: MonitoringScope
  status: "active" | "paused"
  lastChecked: string
  newCount: number
  hasNew: boolean
  items: MonitoringItem[]
  impactSummary: string
  suggestions: string[]
}

// ── Mock Data ──────────────────────────────────────────────────────────────

export const MOCK_MONITORINGS: MonitoringSubscription[] = [
  {
    id: "mon-1",
    name: "Ágio · CARF · IRPJ/CSLL",
    scope: {
      sources: ["carf", "stj"],
      tributos: ["IRPJ", "CSLL"],
      assuntos: ["Amortização de ágio", "Propósito negocial"],
    },
    status: "active",
    lastChecked: "há 12 min",
    newCount: 2,
    hasNew: true,
    impactSummary:
      "O novo acórdão do CARF reforça a vedação ao ágio interno, criando precedente desfavorável para reestruturações societárias sem propósito negocial comprovado. O STJ acompanha a mesma linha. Recomenda-se revisão de operações em curso antes do encerramento do exercício.",
    suggestions: [
      "Ver todos os acórdãos sobre ágio",
      "Criar alerta para STF sobre o mesmo tema",
      "Analisar impacto no meu caso",
    ],
    items: [
      {
        id: "m1-1",
        source: "carf",
        type: "acordao",
        orgao: "CARF",
        turma: "1ª Turma Ordinária",
        relator: "Cons. Ricardo Morais",
        date: "Hoje, 09:15",
        title: "Ágio interno: novo precedente reforça vedação",
        ementa:
          "ÁGIO INTERNO. AMORTIZAÇÃO. IMPOSSIBILIDADE. O ágio gerado em operações entre partes relacionadas, sem efetivo desembolso, não pode ser amortizado para fins de apuração do IRPJ e CSLL.",
        implications: "Contribuintes com estruturas de ágio interno ativo devem revisar posições fiscais. Risco de autuação aumentado. Recomenda-se análise do planejamento societário antes do encerramento do exercício.",
        impact: "alto",
        isNew: true,
      },
      {
        id: "m1-2",
        source: "stj",
        type: "acordao",
        orgao: "Superior Tribunal de Justiça",
        turma: "1ª Turma",
        relator: "Min. Regina Helena Costa",
        date: "Ontem, 14:30",
        title: "Empresa veículo e propósito negocial",
        ementa:
          "TRIBUTÁRIO. IRPJ E CSLL. AMORTIZAÇÃO DE ÁGIO. EMPRESA VEÍCULO. AUSÊNCIA DE PROPÓSITO NEGOCIAL. Não é possível a amortização de ágio quando a operação societária foi realizada com o único propósito de obter vantagem fiscal.",
        implications: "Consolida o entendimento contrário ao contribuinte. Operações em curso sem propósito negocial documentado estão expostas a autuação. Documentação robusta da racionalidade econômica é essencial.",
        impact: "alto",
        isNew: true,
      },
      {
        id: "m1-3",
        source: "receita",
        type: "solucao",
        orgao: "Receita Federal do Brasil",
        turma: "COSIT",
        date: "Ontem, 11:00",
        title: "Orientação sobre registro contábil de ágio",
        ementa:
          "SOLUÇÃO DE CONSULTA COSIT Nº 48/2024. ÁGIO. REGISTRO CONTÁBIL. Esclarecimentos sobre os requisitos formais para registro de ágio e sua posterior amortização fiscal.",
        impact: "medio",
        isNew: false,
      },
    ],
  },
  {
    id: "mon-2",
    name: "PIS/COFINS · STJ · Insumos",
    scope: {
      sources: ["stj", "carf"],
      tributos: ["PIS", "COFINS"],
      assuntos: ["Crédito de insumos", "Conceito de essencialidade"],
    },
    status: "active",
    lastChecked: "há 2 horas",
    newCount: 1,
    hasNew: true,
    impactSummary:
      "O STJ expandiu o conceito de insumos essenciais para atividades de serviços, abrindo espaço para creditamento de despesas anteriormente não reconhecidas. Avaliar impacto em clientes do setor de serviços e tecnologia.",
    suggestions: [
      "Quais setores mais impactados?",
      "Ver acórdãos do CARF sobre o mesmo tema",
      "Comparar com decisões anteriores do STJ",
    ],
    items: [
      {
        id: "m2-1",
        source: "stj",
        type: "acordao",
        orgao: "Superior Tribunal de Justiça",
        turma: "1ª Seção",
        relator: "Min. Gurgel de Faria",
        date: "Hoje, 06:30",
        title: "Insumos em serviços: conceito ampliado",
        ementa:
          "TRIBUTÁRIO. PIS/COFINS. INSUMOS. SERVIÇOS. ESSENCIALIDADE E RELEVÂNCIA. O conceito de insumos deve ser interpretado à luz da atividade concreta do contribuinte, abrangendo despesas essenciais ou relevantes ao processo produtivo de serviços.",
        implications: "Abre oportunidade de recuperação de créditos de PIS/COFINS não aproveitados em exercícios anteriores. Empresas de serviços e tecnologia devem revisar base de creditamento com urgência.",
        impact: "alto",
        isNew: true,
      },
      {
        id: "m2-2",
        source: "carf",
        type: "acordao",
        orgao: "CARF",
        turma: "3ª Turma Especial",
        relator: "Cons. Ana Paula Lima",
        date: "3 dias atrás",
        title: "Creditamento em transporte: insumos admitidos",
        ementa:
          "PIS/COFINS. CRÉDITOS. INSUMOS. CONCEITO. Seguindo o entendimento do STJ no REsp 1.221.170, admite-se o creditamento de insumos essenciais e relevantes ao processo produtivo da atividade de transporte.",
        impact: "medio",
        isNew: false,
      },
    ],
  },
  {
    id: "mon-3",
    name: "Reforma Tributária · IBS/CBS",
    scope: {
      sources: ["dou"],
      tributos: ["PIS", "COFINS"],
      assuntos: ["IBS", "CBS", "Período de transição"],
    },
    status: "active",
    lastChecked: "há 5 horas",
    newCount: 0,
    hasNew: false,
    impactSummary:
      "Sem novas atualizações relevantes desde a última verificação. O cronograma de transição IBS/CBS permanece conforme publicado pelo Comitê Gestor.",
    suggestions: [
      "Ver publicações do Diário Oficial",
      "Simular impacto setorial do IBS",
      "Acompanhar regulamentação do Imposto Seletivo",
    ],
    items: [
      {
        id: "m3-1",
        source: "dou",
        type: "legislacao",
        orgao: "Diário Oficial da União",
        date: "3 dias atrás",
        title: "Decreto regulamenta alíquotas de referência do IBS",
        ementa:
          "REFORMA TRIBUTÁRIA. IBS. ALÍQUOTAS. Publicado decreto que define as alíquotas de referência do Imposto sobre Bens e Serviços para o período de transição 2026–2028.",
        impact: "medio",
        isNew: false,
      },
      {
        id: "m3-2",
        source: "dou",
        type: "legislacao",
        orgao: "Comitê Gestor do IBS",
        date: "5 dias atrás",
        title: "Cronograma de implementação CBS 2025–2033",
        ementa:
          "CBS – COMITÊ GESTOR. CRONOGRAMA. Divulgado o cronograma oficial de implementação gradual da Contribuição sobre Bens e Serviços, com etapas de transição e metas por setor.",
        impact: "medio",
        isNew: false,
      },
    ],
  },
]
