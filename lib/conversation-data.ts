import type { MonitoringSubscription } from "./monitoring-data"

// ── Types ──────────────────────────────────────────────────────────────────

export interface PesquisaData {
  id: string
  title: string
  expandedQuery: string
  content: string
  timestamp: string
  isNew?: boolean
}

export type ConvMsgType = "text" | "pesquisa-proposal" | "pesquisa-result" | "monitoring-proposal" | "monitoring-created"

export interface ConvMessage {
  role: "user" | "assistant"
  content?: string
  type?: ConvMsgType
  pesquisaId?: string
  monitoringId?: string
}

export interface ConversationData {
  id: string
  title: string
  pesquisas: PesquisaData[]
  monitoramentos: MonitoringSubscription[]
  chatMessages: ConvMessage[]
}

// ── Mock Conversations ─────────────────────────────────────────────────────

export const MOCK_CONVERSATIONS: ConversationData[] = [
  // ── 1. Ágio Interno · CARF e STJ ──────────────────────────────────────
  {
    id: "1",
    title: "Ágio Interno · CARF e STJ",
    pesquisas: [
      {
        id: "p1-1",
        title: "Ágio interno: vedação à amortização pelo CARF",
        expandedQuery:
          "Quais são os critérios adotados pelo CARF para vedar a amortização de ágio interno para fins de apuração de IRPJ e CSLL, considerando os requisitos legais do art. 7º da Lei 9.532/97 e os precedentes administrativos mais recentes?",
        timestamp: "hoje, 14h22",
        isNew: true,
        content: `## 1. Conceito e Distinção

O **ágio interno** é gerado em operações societárias entre partes relacionadas, sem efetivo desembolso econômico externo ao grupo. Distingue-se do ágio externo, em que há aquisição de terceiro com pagamento de sobrepreço justificado por rentabilidade futura esperada.

## 2. Posição Consolidada do CARF

O CARF firmou entendimento, por meio de acórdãos paradigmáticos, de que a amortização de ágio interno é inadmissível para fins de IRPJ e CSLL, por ausência dos requisitos legais previstos no art. 7º da Lei 9.532/97.

- **Fundamento principal:** Ausência de efetivo desembolso e de negócio jurídico real com terceiros
- **Precedentes:** Acórdãos 1402-001.995, 9101-006.078 e 1402-006.038
- **Penalidades:** Multas qualificadas de 150% em casos com indícios de dolo ou fraude

## 3. Posição do STJ

A 1ª e 2ª Turmas do STJ convergem para a vedação da amortização de ágio interno, afastando a possibilidade de aproveitamento via incorporação reversa sem propósito negocial comprovado.

## 4. Implicações Práticas

- **Risco de autuação:** Alto para estruturas com ágio interno ativo em balanço
- **Documentação:** Imprescindível comprovar a racionalidade econômica de cada etapa
- **Revisão:** Recomendada para exercícios ainda sujeitos à decadência (últimos 5 anos)`,
      },
      {
        id: "p1-2",
        title: "Propósito negocial em reestruturações societárias",
        expandedQuery:
          "Como os tribunais superiores e o CARF avaliam a existência de propósito negocial em reestruturações societárias para fins de reconhecimento da legitimidade do planejamento tributário, e quais são os critérios de prova exigidos?",
        timestamp: "ontem, 10h15",
        content: `## 1. O Conceito de Propósito Negocial

O **propósito negocial** (business purpose) é critério central na avaliação da legitimidade de planejamentos tributários no Brasil, exigindo que as operações societárias tenham motivação econômica real, além da mera economia de tributos.

## 2. Critérios de Avaliação

### STJ — Teoria da Substância sobre a Forma
O STJ aplica a doutrina da substância sobre a forma, examinando se os efeitos econômicos da operação justificam sua estrutura jurídica independentemente do resultado fiscal.

### CARF — Indícios de Artificialidade
O CARF analisa a sequência de atos, o intervalo temporal entre as operações e a existência de contrapartida econômica real:

- **Intervalo temporal:** Operações realizadas em dias ou semanas são fortemente questionadas
- **Partes envolvidas:** Transações exclusivamente entre empresas do mesmo grupo econômico
- **Resultado líquido:** Se a única vantagem identificável é fiscal, presume-se ausência de propósito negocial

## 3. Ônus da Prova

A jurisprudência distribui o ônus da prova da seguinte forma:
- **Fisco:** Demonstrar a artificialidade e o resultado fiscal obtido
- **Contribuinte:** Comprovar a racionalidade econômica e a existência de propósito negocial legítimo

## 4. Documentação Recomendada

- **Laudos de avaliação** independentes contemporâneos à operação
- **Atas e deliberações** societárias documentando a motivação econômica
- **Análises econômico-financeiras** demonstrando ganhos operacionais esperados`,
      },
      {
        id: "p1-3",
        title: "Empresa veículo: planejamento tributário abusivo",
        expandedQuery:
          "Quais são os parâmetros jurisprudenciais para caracterização de empresa veículo em planejamentos tributários envolvendo ágio, e quais são as consequências tributárias e penais para o contribuinte?",
        timestamp: "há 3 dias",
        content: `## 1. Definição de Empresa Veículo

A **empresa veículo** é uma sociedade criada ou utilizada exclusivamente para viabilizar uma operação societária com efeitos fiscais, sem substância econômica própria, ativos relevantes ou atividade operacional efetiva.

## 2. Caracterização pelo STJ

O STJ caracteriza a empresa veículo pelos seguintes elementos:

- Ausência de patrimônio líquido relevante antes da operação
- Constituição próxima à data da reestruturação societária
- Única finalidade identificável é a geração ou transferência de ágio
- Dissolução ou incorporação logo após a conclusão da operação

## 3. Consequências Tributárias

### Glosa do Ágio
O ágio gerado via empresa veículo é integralmente glosado, com exigência do IRPJ e CSLL não recolhidos acrescidos de:
- Multa de ofício de 75% sobre o valor principal
- Multa qualificada de 150% em casos com dolo comprovado
- Juros SELIC desde o vencimento original

### Responsabilidade dos Sócios
Em casos extremos, o Fisco tem arguido responsabilidade pessoal dos administradores com base no art. 135 do CTN.

## 4. Orientação Prática

- **Evitar** estruturas com empresa veículo sem substância econômica comprovada
- **Documentar** detalhadamente a motivação e os benefícios operacionais de cada etapa
- **Consultar** previamente a possibilidade de solução de consulta vinculante junto à Receita Federal`,
      },
    ],
    monitoramentos: [
      {
        id: "conv1-mon-1",
        name: "Ágio · CARF · IRPJ/CSLL",
        scope: { sources: ["carf", "stj"], tributos: ["IRPJ", "CSLL"], assuntos: ["Amortização de ágio", "Propósito negocial"] },
        status: "active",
        lastChecked: "há 12 min",
        newCount: 2,
        hasNew: true,
        impactSummary:
          "Novo acórdão do CARF reforça vedação ao ágio interno com multa qualificada. STJ mantém linha restritiva. Risco elevado para contribuintes com estruturas ativas — revisão urgente recomendada.",
        suggestions: [
          "Analisar impacto nos clientes com ágio ativo em balanço",
          "Verificar possibilidade de autorregularização",
          "Comparar com precedentes favoráveis do período 2019–2021",
        ],
        items: [
          {
            id: "c1m1-1",
            source: "carf",
            type: "acordao",
            orgao: "CARF",
            turma: "1ª Turma Ordinária",
            relator: "Cons. Ricardo Morais",
            date: "Hoje, 09:15",
            title: "Ágio interno: multa qualificada mantida em 150%",
            ementa:
              "ÁGIO INTERNO. AMORTIZAÇÃO. IMPOSSIBILIDADE. MULTA QUALIFICADA. Mantida a multa qualificada de 150% em caso de amortização de ágio gerado entre partes relacionadas, sem efetivo desembolso e propósito negocial comprovado.",
            implications:
              "Confirma linha mais agressiva do CARF. Contribuintes com auto de infração pendente devem avaliar riscos de litigância administrativa.",
            impact: "alto",
            isNew: true,
          },
          {
            id: "c1m1-2",
            source: "stj",
            type: "acordao",
            orgao: "Superior Tribunal de Justiça",
            turma: "2ª Turma",
            relator: "Min. Mauro Campbell",
            date: "Ontem, 16:40",
            title: "Incorporação reversa sem propósito negocial: glosa mantida",
            ementa:
              "TRIBUTÁRIO. IRPJ/CSLL. ÁGIO. INCORPORAÇÃO REVERSA. EMPRESA VEÍCULO. A utilização de empresa veículo para geração de ágio interno, sem substância econômica, não viabiliza a dedutibilidade das despesas de amortização.",
            implications:
              "STJ reafirma posição restritiva. Sem divergência entre as turmas. Possibilidade de afetação ao rito repetitivo reduzida — entendimento já consolidado.",
            impact: "alto",
            isNew: true,
          },
          {
            id: "c1m1-3",
            source: "receita",
            type: "solucao",
            orgao: "Receita Federal do Brasil",
            turma: "COSIT",
            date: "há 4 dias",
            title: "Solução de Consulta COSIT nº 52/2024 — Registro contábil de ágio",
            ementa:
              "ÁGIO. REGISTRO CONTÁBIL. Esclarecimentos sobre procedimentos para registro e controle de ágio em operações de combinação de negócios conforme CPC 15.",
            impact: "medio",
            isNew: false,
          },
        ],
      },
      {
        id: "conv1-mon-2",
        name: "Propósito Negocial · STJ",
        scope: { sources: ["stj", "stf"], tributos: ["IRPJ", "CSLL"], assuntos: ["Propósito negocial", "Planejamento tributário"] },
        status: "active",
        lastChecked: "há 2 horas",
        newCount: 0,
        hasNew: false,
        impactSummary:
          "Sem novas decisões relevantes desde a última verificação. O entendimento do STJ permanece estável: propósito negocial é requisito essencial para validade de reestruturações com efeitos fiscais.",
        suggestions: [
          "Verificar repercussão geral no STF sobre o tema",
          "Acompanhar projetos de lei sobre norma antielisiva geral",
          "Comparar com posição dos TRFs sobre o mesmo tema",
        ],
        items: [
          {
            id: "c1m2-1",
            source: "stj",
            type: "acordao",
            orgao: "Superior Tribunal de Justiça",
            turma: "1ª Turma",
            relator: "Min. Regina Helena Costa",
            date: "há 6 dias",
            title: "Planejamento tributário: limites da elisão fiscal",
            ementa:
              "TRIBUTÁRIO. PLANEJAMENTO TRIBUTÁRIO. ELISÃO FISCAL. LIMITES. A fronteira entre elisão lícita e evasão fiscal é definida pela existência de substância econômica e propósito negocial nas operações estruturadas.",
            implications:
              "Decisão didática que reafirma os critérios de legitimidade do planejamento. Útil como precedente favorável quando a operação tem substância comprovada.",
            impact: "medio",
            isNew: false,
          },
        ],
      },
    ],
    chatMessages: [
      { role: "user", content: "Tenho vários clientes com estruturas de ágio interno em andamento. Precisamos avaliar o risco diante do cenário atual no CARF e STJ." },
      { role: "assistant", type: "pesquisa-proposal", pesquisaId: "p1-1" },
      { role: "user", content: "Prosseguir" },
      { role: "assistant", type: "pesquisa-result", pesquisaId: "p1-1" },
      { role: "user", content: "Preciso entender melhor os critérios de propósito negocial especificamente." },
      { role: "assistant", type: "pesquisa-proposal", pesquisaId: "p1-2" },
      { role: "user", content: "Prosseguir" },
      { role: "assistant", type: "pesquisa-result", pesquisaId: "p1-2" },
      { role: "user", content: "E sobre empresa veículo? Um dos meus clientes pode ter uma estrutura desse tipo." },
      { role: "assistant", type: "pesquisa-proposal", pesquisaId: "p1-3" },
      { role: "user", content: "Prosseguir" },
      { role: "assistant", type: "pesquisa-result", pesquisaId: "p1-3" },
      { role: "user", content: "Quero monitorar as novidades do CARF e STJ sobre ágio e amortização." },
      { role: "assistant", type: "monitoring-proposal", monitoringId: "conv1-mon-1" },
      { role: "user", content: "Confirmar" },
      { role: "assistant", type: "monitoring-created", monitoringId: "conv1-mon-1" },
      { role: "user", content: "Crie também um monitoramento para propósito negocial e planejamento tributário no STJ." },
      { role: "assistant", type: "monitoring-proposal", monitoringId: "conv1-mon-2" },
      { role: "user", content: "Confirmar" },
      { role: "assistant", type: "monitoring-created", monitoringId: "conv1-mon-2" },
    ],
  },

  // ── 2. IRPF sobre Pensão Alimentícia ──────────────────────────────────
  {
    id: "2",
    title: "IRPF sobre Pensão Alimentícia",
    pesquisas: [
      {
        id: "p2-1",
        title: "Incidência de IRPF sobre pensão alimentícia — ADI 5422",
        expandedQuery:
          "Quais são as regras atuais de incidência do IRPF sobre valores recebidos a título de pensão alimentícia no Brasil, considerando o julgamento da ADI 5422 pelo STF e seus efeitos sobre os contribuintes?",
        timestamp: "hoje, 09h05",
        isNew: true,
        content: `## 1. O Julgamento da ADI 5422

O Supremo Tribunal Federal, no julgamento da **ADI 5422**, declarou inconstitucional a incidência do IRPF sobre os valores recebidos a título de alimentos ou pensões alimentícias decorrentes do direito de família.

- **Eficácia:** Erga omnes e vinculante
- **Modulação:** Os efeitos retroagem à data de publicação da Lei 7.713/1988
- **Placar:** 8 × 3 (maioria ampla)

## 2. Situação Atual dos Alimentandos (Quem Recebe)

**Não há mais incidência de IRPF** sobre os valores recebidos como pensão alimentícia. Isso significa:

- Não é necessário oferecer esses valores à tributação via carnê-leão
- Não devem ser incluídos na base de cálculo da Declaração de Ajuste Anual
- Valores já retidos indevidamente podem ser objeto de pedido de restituição

## 3. Situação dos Alimentantes (Quem Paga)

Para quem paga, a dedução das pensões alimentícias na base de cálculo do IRPF **permanece permitida**, conforme art. 8º, II, "f", da Lei 9.250/95.

- **Dedução integral:** O valor pago é deduzido da base de cálculo do IRPF
- **Requisito:** A pensão deve estar fixada por decisão judicial, acordo homologado ou escritura pública

## 4. Restituição de Valores Retidos Indevidamente

Contribuintes que recolheram IRPF sobre pensão alimentícia podem pleitear restituição:

- **Via administrativa:** Pedido de restituição na Receita Federal (PERDCOMP)
- **Prazo:** 5 anos a partir do pagamento indevido
- **Via judicial:** Ação de repetição de indébito com correção pela SELIC`,
      },
      {
        id: "p2-2",
        title: "Carnê-leão e obrigações acessórias do alimentante",
        expandedQuery:
          "Quais são as obrigações do alimentante em relação ao carnê-leão, retenção na fonte e declaração de ajuste anual após o julgamento da ADI 5422, e como deve ser feito o tratamento na DIRPF?",
        timestamp: "ontem, 16h30",
        content: `## 1. Obrigações do Alimentante Após a ADI 5422

Com a decisão do STF na ADI 5422, as obrigações do alimentante se mantêm inalteradas quanto à dedução, mas são modificadas quanto à retenção na fonte.

## 2. Retenção na Fonte (Fonte Pagadora)

A fonte pagadora **não deve mais reter IRPF** sobre os valores de pensão alimentícia pagos ao alimentando, pois esses valores são isentos para quem recebe.

- **Prática:** Emitir recibo sem retenção de IRPF
- **Risco:** Reter indevidamente e não repassar ao Fisco gera responsabilidade da fonte

## 3. Declaração de Ajuste Anual (DIRPF)

### Para o Alimentante
- Informar os valores pagos na ficha **"Pagamentos Efetuados"**
- Código 30 (pensão alimentícia judicial) ou código específico conforme instrução vigente
- O valor deduzido reduz a base de cálculo do IRPF

### Para o Alimentando
- **Não informar** os valores recebidos como rendimento tributável
- Podem ser declarados na ficha de **"Rendimentos Isentos e Não Tributáveis"** como boa prática documental

## 4. Documentação Recomendada

- **Decisão judicial** ou acordo homologado estabelecendo a obrigação alimentar
- **Comprovantes de pagamento** (extratos bancários, recibos)
- **Declaração do beneficiário** confirmando o recebimento (para fins de dedução)`,
      },
    ],
    monitoramentos: [
      {
        id: "conv2-mon-1",
        name: "IRPF · Pensão Alimentícia · STF",
        scope: { sources: ["stf", "receita"], tributos: ["IRPJ"], assuntos: ["Pensão alimentícia", "ADI 5422"] },
        status: "active",
        lastChecked: "há 3 horas",
        newCount: 0,
        hasNew: false,
        impactSummary:
          "O cenário permanece estável após o julgamento da ADI 5422. Não há novas manifestações do STF ou da Receita Federal sobre o tema. A orientação vigente é de não tributação dos valores recebidos pelo alimentando.",
        suggestions: [
          "Verificar instruções normativas da RFB sobre a DIRPF 2025",
          "Conferir possibilidade de restituição para clientes com retenções anteriores",
          "Monitorar eventuais recursos com repercussão no STJ",
        ],
        items: [
          {
            id: "c2m1-1",
            source: "receita",
            type: "solucao",
            orgao: "Receita Federal do Brasil",
            turma: "COSIT",
            date: "há 2 semanas",
            title: "Orientação sobre preenchimento da DIRPF 2025 — Pensão Alimentícia",
            ementa:
              "IRPF. PENSÃO ALIMENTÍCIA. DIRPF 2025. Orientações sobre o correto preenchimento da Declaração de Ajuste Anual referente aos valores de pensão alimentícia, em conformidade com a decisão do STF na ADI 5422.",
            implications:
              "Confirma a orientação de não tributação. Contribuintes com dúvidas sobre exercícios anteriores devem consultar o posicionamento da RFB para retificação.",
            impact: "medio",
            isNew: false,
          },
        ],
      },
    ],
    chatMessages: [
      { role: "user", content: "Preciso de orientação sobre a situação atual do IRPF sobre pensão alimentícia após a ADI 5422." },
      { role: "assistant", type: "pesquisa-proposal", pesquisaId: "p2-1" },
      { role: "user", content: "Prosseguir" },
      { role: "assistant", type: "pesquisa-result", pesquisaId: "p2-1" },
      { role: "user", content: "E as obrigações do alimentante quanto ao carnê-leão e à DIRPF?" },
      { role: "assistant", type: "pesquisa-proposal", pesquisaId: "p2-2" },
      { role: "user", content: "Prosseguir" },
      { role: "assistant", type: "pesquisa-result", pesquisaId: "p2-2" },
      { role: "user", content: "Crie um monitoramento para acompanhar novidades da Receita Federal e do STF sobre o tema." },
      { role: "assistant", type: "monitoring-proposal", monitoringId: "conv2-mon-1" },
      { role: "user", content: "Confirmar" },
      { role: "assistant", type: "monitoring-created", monitoringId: "conv2-mon-1" },
    ],
  },

  // ── 3. Reforma Tributária · IBS e CBS ─────────────────────────────────
  {
    id: "3",
    title: "Reforma Tributária · IBS e CBS",
    pesquisas: [
      {
        id: "p3-1",
        title: "Cronograma de transição IBS/CBS 2026–2033",
        expandedQuery:
          "Qual é o cronograma oficial de implementação do IBS e CBS no Brasil, incluindo as fases de transição previstas pela Reforma Tributária (Emenda Constitucional 132/2023), as alíquotas de referência e os setores com regimes diferenciados?",
        timestamp: "hoje, 11h48",
        isNew: true,
        content: `## 1. Fundamento Constitucional

A Reforma Tributária foi instituída pela **Emenda Constitucional 132/2023**, que substituiu o PIS/COFINS e o ICMS/ISS pelo CBS (federal) e IBS (subnacional), além de criar o Imposto Seletivo (IS).

## 2. Fases do Cronograma de Transição

### 2026 — Fase Piloto
- CBS e IBS cobrados à alíquota de **0,9%** e **0,1%** respectivamente
- Apenas para fins de adaptação e teste dos sistemas
- Créditos gerados podem ser compensados

### 2027–2028 — Início da Transição
- PIS e COFINS extintos; CBS passa a vigorar plenamente
- IPI mantido apenas para produtos de Zona Franca de Manaus
- Alíquotas de referência publicadas pelo Comitê Gestor do IBS

### 2029–2032 — Transição ICMS/ISS
- Redução gradual de 10 pontos percentuais por ano nas alíquotas de ICMS e ISS
- Aumento proporcional do IBS
- Período de máxima complexidade — operação simultânea dos dois sistemas

### 2033 — Sistema Pleno
- ICMS e ISS extintos definitivamente
- IBS e CBS em plena vigência
- Fim do período de transição

## 3. Setores com Regimes Diferenciados

- **Saúde e Educação:** Alíquotas reduzidas em 60%
- **Cesta Básica Nacional:** Alíquota zero
- **Agropecuária:** Regime específico com crédito presumido
- **Serviços Financeiros:** Regime específico a ser regulamentado

## 4. Impacto para Contribuintes

- **Curto prazo (2025–2026):** Adaptação de sistemas de ERP e NF-e
- **Médio prazo (2027–2029):** Reestruturação de cadeias de fornecimento
- **Longo prazo (2030+):** Revisão de estratégias de precificação e localização`,
      },
    ],
    monitoramentos: [
      {
        id: "conv3-mon-1",
        name: "Reforma Tributária · IBS/CBS · Regulamentação",
        scope: { sources: ["dou", "stf"], tributos: ["PIS", "COFINS"], assuntos: ["IBS", "CBS", "Comitê Gestor"] },
        status: "active",
        lastChecked: "há 25 min",
        newCount: 1,
        hasNew: true,
        impactSummary:
          "Publicada nova resolução do Comitê Gestor do IBS definindo critérios de rateio entre municípios para o período de transição. Impacto relevante para contribuintes com operações em múltiplos municípios.",
        suggestions: [
          "Analisar impacto do rateio nas operações interestaduais",
          "Verificar se setor do cliente está na lista de regimes diferenciados",
          "Acompanhar regulamentação do Imposto Seletivo",
        ],
        items: [
          {
            id: "c3m1-1",
            source: "dou",
            type: "legislacao",
            orgao: "Comitê Gestor do IBS",
            date: "Hoje, 07:30",
            title: "Resolução CG-IBS nº 08/2025 — Critérios de rateio municipal",
            ementa:
              "IBS. RATEIO. MUNICÍPIOS. Publicados os critérios de rateio da arrecadação do IBS entre municípios no período de transição, considerando o destino dos bens e a localização do tomador de serviços.",
            implications:
              "Contribuintes com operações em múltiplos municípios devem revisar seus sistemas de faturamento para adequação ao novo critério de destino. Impacto em planejamento de localização de estabelecimentos.",
            impact: "alto",
            isNew: true,
          },
          {
            id: "c3m1-2",
            source: "dou",
            type: "legislacao",
            orgao: "Diário Oficial da União",
            date: "há 3 dias",
            title: "Decreto regulamenta alíquotas de referência do IBS 2026",
            ementa:
              "IBS. ALÍQUOTAS DE REFERÊNCIA. Publicado decreto definindo as alíquotas de referência do Imposto sobre Bens e Serviços para o período piloto de 2026.",
            impact: "medio",
            isNew: false,
          },
        ],
      },
    ],
    chatMessages: [
      { role: "user", content: "Preciso de uma visão completa do cronograma de implementação do IBS e CBS para apresentar aos clientes." },
      { role: "assistant", type: "pesquisa-proposal", pesquisaId: "p3-1" },
      { role: "user", content: "Prosseguir" },
      { role: "assistant", type: "pesquisa-result", pesquisaId: "p3-1" },
      { role: "user", content: "Crie um monitoramento para acompanhar as publicações do Comitê Gestor e novas regulamentações do IBS e CBS." },
      { role: "assistant", type: "monitoring-proposal", monitoringId: "conv3-mon-1" },
      { role: "user", content: "Confirmar" },
      { role: "assistant", type: "monitoring-created", monitoringId: "conv3-mon-1" },
    ],
  },

  // ── 4. Transfer Pricing · Métodos RFB ─────────────────────────────────
  {
    id: "4",
    title: "Transfer Pricing · Métodos RFB",
    pesquisas: [
      {
        id: "p4-1",
        title: "Novos métodos de transfer pricing — IN RFB 2.161/2023",
        expandedQuery:
          "Quais são os novos métodos de preços de transferência introduzidos pela IN RFB 2.161/2023, alinhados ao padrão OCDE, e como diferem dos métodos anteriores previstos na Lei 9.430/96?",
        timestamp: "hoje, 08h20",
        isNew: true,
        content: `## 1. A Reforma do Transfer Pricing Brasileiro

A **Instrução Normativa RFB 2.161/2023** implementou no Brasil o padrão OCDE de preços de transferência (Princípio Arm's Length), substituindo os métodos fixos anteriores por metodologia baseada em análise funcional e comparabilidade.

## 2. Métodos Aprovados (Padrão OCDE)

### Métodos Tradicionais Baseados em Transações
- **PCI (Preço Independente Comparável):** Comparação direta com transações entre partes não relacionadas — método preferencial
- **PRL (Preço de Revenda menos Lucro):** Baseado no preço de revenda deduzido de margem bruta
- **MCL (Margem de Custo Adicionado):** Custo de produção mais margem bruta comparável

### Métodos Baseados em Lucro
- **MLT (Método da Margem Líquida da Transação):** Análise da margem operacional líquida
- **MDL (Método de Divisão do Lucro):** Alocação do lucro combinado entre as partes

## 3. Principais Diferenças em Relação ao Regime Anterior

| Aspecto | Regime Anterior (Lei 9.430/96) | Novo Regime (IN 2.161/2023) |
|---------|-------------------------------|----------------------------|
| Base | Margens fixas | Comparabilidade funcional |
| Flexibilidade | Baixa | Alta |
| Alinhamento OCDE | Parcial | Total |
| Documentação | Simplificada | Detalhada |

## 4. Cronograma de Adoção

- **2023:** Regime opcional para contribuintes que desejam antecipar a transição
- **2024:** Continuidade do regime opcional
- **2025:** Regime obrigatório para todos os contribuintes`,
      },
      {
        id: "p4-2",
        title: "Análise comparativa: PCI, PECEX e novos métodos OCDE",
        expandedQuery:
          "Como os métodos PCI e PECEX do regime anterior se comparam aos novos métodos baseados no padrão OCDE, e quais são os principais impactos para grupos multinacionais com operações no Brasil?",
        timestamp: "ontem, 14h10",
        content: `## 1. Métodos do Regime Anterior (Lei 9.430/96)

### PCI — Preços de Importação Comparados
Utilizava o menor preço praticado em importações de bens idênticos ou similares, com margem de até 5% para comparabilidade.

### PECEX — Preços de Exportação Comparados
Utilizava o maior preço praticado em exportações, com comparação a preços de mercado público quando disponível (ex: commodities na bolsa).

## 2. Críticas ao Regime Anterior

- **Margens fixas** sem correlação com a realidade econômica das transações
- **Não reconhecia** ativos intangíveis e serviços intragrupo adequadamente
- **Divergência** com padrões internacionais gerava dupla tributação

## 3. Vantagens dos Novos Métodos

### Para o Contribuinte
- Maior flexibilidade na escolha do método mais adequado à transação
- Reconhecimento de intangíveis valiosos (marcas, patentes, know-how)
- Redução de riscos de dupla tributação internacional

### Para Grupos Multinacionais
- Alinhamento com políticas globais de transfer pricing já adotadas
- Aceitação mais ampla da documentação existente
- Menos ajustes necessários para adequação ao mercado brasileiro

## 4. Pontos de Atenção

- **Análise funcional:** Exige mapeamento detalhado de funções, ativos e riscos assumidos por cada entidade
- **Documentação master file e local file:** Requerida para grupos acima de R$ 2,4 bilhões de receita
- **Acordos de compartilhamento de custos:** Tratamento específico na nova regulamentação`,
      },
      {
        id: "p4-3",
        title: "Documentação obrigatória para transfer pricing 2025",
        expandedQuery:
          "Quais são os requisitos de documentação obrigatória para transfer pricing em 2025 conforme a IN RFB 2.161/2023, incluindo master file, local file e country-by-country reporting?",
        timestamp: "há 2 dias",
        content: `## 1. Estrutura da Documentação (OCDE — Três Níveis)

A IN RFB 2.161/2023 adotou a estrutura de três níveis de documentação recomendada pelo Plano de Ação 13 do Projeto BEPS da OCDE.

## 2. Arquivo Mestre (Master File)

Contém informações sobre o grupo multinacional como um todo:

- **Estrutura organizacional** e descrição dos negócios
- **Intangíveis** do grupo e políticas de preços de transferência
- **Atividades financeiras** intragrupo
- **Posição fiscal e tributária** consolidada

**Obrigatoriedade:** Grupos com receita consolidada acima de R$ 2,4 bilhões.

## 3. Arquivo Local (Local File)

Específico para as operações do contribuinte brasileiro:

- **Análise funcional** detalhada da entidade local
- **Transações controladas** realizadas no período
- **Método selecionado** e justificativa da escolha
- **Dados comparáveis** utilizados na análise de comparabilidade

**Obrigatoriedade:** Todos os contribuintes com transações controladas acima de R$ 500 mil por tipo.

## 4. Declaração País-a-País (CbCR)

- **Quem declara:** Grupo com receita consolidada acima de R$ 2,4 bilhões
- **Prazo:** 12 meses após o encerramento do exercício fiscal do grupo
- **Conteúdo:** Receita, lucro, impostos pagos e número de empregados por jurisdição

## 5. Penalidades por Descumprimento

- Ausência de documentação: multa de 0,2% a 5% do valor das transações
- Documentação incompleta: 0,1% a 3% do valor das transações
- Descumprimento do CbCR: R$ 1.500 a R$ 1.500.000 por omissão`,
      },
      {
        id: "p4-4",
        title: "Safe harbors em transfer pricing: condições e limites",
        expandedQuery:
          "Quais são os safe harbors previstos na regulamentação brasileira de transfer pricing conforme a IN RFB 2.161/2023, e quais são as condições para sua aplicação?",
        timestamp: "há 4 dias",
        content: `## 1. O Conceito de Safe Harbor

**Safe harbors** são regras simplificadas que permitem ao contribuinte presumir conformidade com o princípio arm's length sem a necessidade de uma análise completa de preços de transferência, desde que determinadas condições sejam atendidas.

## 2. Safe Harbors Previstos na IN 2.161/2023

### Safe Harbor de Lucro Mínimo (Low Value-Adding Services)
- Aplicável a serviços intragrupo de baixo valor agregado
- Margem de lucro presumida: 5% sobre os custos incorridos
- **Condições:** Serviços não devem envolver intangíveis únicos, risco significativo ou atividades principais do grupo

### Safe Harbor para Transações Financeiras
- Aplicável a empréstimos e financiamentos intragrupo
- Intervalo de taxas de juros aceitáveis publicado anualmente pela RFB
- **Condições:** Prazo máximo e moeda específicos

### Safe Harbor para Pequenas Transações
- Transações anuais abaixo de R$ 500 mil por categoria
- Dispensadas de documentação formal detalhada
- **Atenção:** Ainda sujeitas ao princípio arm's length

## 3. Vantagens e Limitações

### Vantagens
- Reduz custos de compliance para transações de baixa materialidade
- Proporciona certeza jurídica e previsibilidade
- Diminui risco de autuação para transações elegíveis

### Limitações
- Não se aplica a transações com intangíveis valiosos
- Pode resultar em tributação maior que a exigida pelo arm's length
- Fisco pode questionar o enquadramento se houver evidências de preço inadequado

## 4. Recomendação de Uso

O safe harbor deve ser adotado apenas quando a margem resultante for próxima à obtida em análise completa. Quando há potencial de preços favoráveis ao contribuinte, a análise arm's length plena é mais vantajosa.`,
      },
    ],
    monitoramentos: [],
    chatMessages: [
      { role: "user", content: "Quais são os novos métodos de transfer pricing introduzidos pela IN RFB 2.161/2023?" },
      { role: "assistant", type: "pesquisa-proposal", pesquisaId: "p4-1" },
      { role: "user", content: "Prosseguir" },
      { role: "assistant", type: "pesquisa-result", pesquisaId: "p4-1" },
      { role: "user", content: "Como esses métodos se comparam ao regime anterior da Lei 9.430/96 — PCI, PECEX e demais?" },
      { role: "assistant", type: "pesquisa-proposal", pesquisaId: "p4-2" },
      { role: "user", content: "Prosseguir" },
      { role: "assistant", type: "pesquisa-result", pesquisaId: "p4-2" },
      { role: "user", content: "Preciso dos detalhes sobre a documentação obrigatória para 2025." },
      { role: "assistant", type: "pesquisa-proposal", pesquisaId: "p4-3" },
      { role: "user", content: "Prosseguir" },
      { role: "assistant", type: "pesquisa-result", pesquisaId: "p4-3" },
      { role: "user", content: "E quais são as condições para uso dos safe harbors?" },
      { role: "assistant", type: "pesquisa-proposal", pesquisaId: "p4-4" },
      { role: "user", content: "Prosseguir" },
      { role: "assistant", type: "pesquisa-result", pesquisaId: "p4-4" },
    ],
  },
]
