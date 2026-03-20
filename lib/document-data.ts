// ── Types ──────────────────────────────────────────────────────────────────

export interface LegalDocument {
  id: string
  label: string        // shown in panel header, e.g. "OUTROS4 — Lei nº 10.637, de 30 de dezembro de 2002"
  title: string        // for "Ver documento original" link label
  originalUrl?: string
  content: string
}

// ── Mock Documents ─────────────────────────────────────────────────────────

export const MOCK_DOCUMENTS: LegalDocument[] = [
  {
    id: "lei-10637",
    label: "OUTROS4 — Lei nº 10.637, de 30 de dezembro de 2002",
    title: "Lei nº 10.637, de 30 de dezembro de 2002",
    originalUrl: "https://www.planalto.gov.br/ccivil_03/leis/2002/l10637.htm",
    content: `Art. 3o Do valor apurado na forma do art. 2o a pessoa jurídica poderá descontar créditos calculados em relação a: Produção de efeito (Vide Lei nº 11.727, de 2008) (Produção de efeitos) (Vide Medida Provisória nº 497, de 2010) (Regulamento) (Vide Lei Complementar nº 214, de 2025) Produção de efeitos

I - bens adquiridos para revenda, exceto em relação às mercadorias e aos produtos referidos: (Redação dada pela Lei nº 10.865, de 2004)

a) no inciso III do § 3o do art. 1o desta Lei; e (Redação dada pela Lei nº 11.727, de 2008). (Produção de efeitos)

b) nos §§ 1o e 1o-A do art. 2o desta Lei; (Redação dada pela Lei nº 11.787, de 2008) (Vide Lei nº 9.718, de 1998)

II - bens e serviços, utilizados como insumo na prestação de serviços e na produção ou fabricação de bens ou produtos destinados à venda, inclusive combustíveis e lubrificantes, exceto em relação ao pagamento de que trata o art. 2o da Lei no 10.485, de 3 de julho de 2002, devido pelo fabricante ou importador, ao concessionário, pela intermediação ou entrega dos veículos classificados nas posições 87.03 e 87.04 da TIPI; (Redação dada pela Lei nº 10.865, de 2004)

III - (VETADO)

IV – aluguéis de prédios, máquinas e equipamentos, pagos a pessoa jurídica, utilizados nas atividades da empresa;

V – valor das contraprestações de operações de arrendamento mercantil de pessoa jurídica, exceto de optante pelo Sistema Integrado de Pagamento de Impostos e Contribuições das Microempresas e das Empresas de Pequeno Porte - SIMPLES; (Redação dada pela Lei nº 10.865, de 2004)

VI - máquinas, equipamentos e outros bens incorporados ao ativo imobilizado, adquiridos ou fabricados para locação a terceiros ou para utilização na produção de bens destinados à venda ou na prestação de serviços. (Redação dada pela Lei nº 11.196, de 2005)

VII - edificações e benfeitorias em imóveis de terceiros, quando o custo, inclusive de mão-de-obra, tenha sido suportado pela locatária;

VIII - bens recebidos em devolução, cuja receita de venda tenha integrado faturamento do mês ou de mês anterior, e tributada conforme o disposto nesta Lei.

IX - energia elétrica consumida nos estabelecimentos da pessoa jurídica. (Incluído pela Lei nº 10.684, de 30.5.2003)

X - energia elétrica e energia térmica, inclusive sob a forma de vapor, consumidas nos estabelecimentos da pessoa jurídica. (Redação dada pela Lei nº 11.488, de 2007)

XI - vale-transporte, vale-refeição ou vale-alimentação, fardamento ou uniforme fornecidos aos empregados por pessoa jurídica que explore as atividades de prestação de serviços de limpeza, conservação e manutenção. (Incluído pela Lei nº 11.898, de 2009)

XII - bens incorporados ao ativo intangível, adquiridos para utilização na produção de bens destinados a venda ou na prestação de serviços. (Incluído pela Lei nº 12.973, de 2014) (Vigência)

§ 1o O crédito será determinado mediante a aplicação da alíquota prevista no caput do art. 2o desta Lei sobre o valor: (Redação dada pela Lei nº 10.865, de 2004) (Vide Lei nº 11.727, de 2008) (Vigência)

I - dos itens mencionados nos incisos I e II do caput, adquiridos no mês;

II - dos itens mencionados nos incisos III a V e IX a XII do caput, incorridos no mês;

III - dos encargos de depreciação e amortização dos bens mencionados nos incisos VI e XII do caput, incorridos no mês. (Redação dada pela Lei nº 12.973, de 2014) (Vigência)

IV - dos bens mencionados no inciso VII do caput, objeto de locação a terceiros, incorridos no mês.

§ 2o Não dará direito a crédito o valor:

I - de mão-de-obra paga a pessoa física; e

II - da aquisição de bens ou serviços não sujeitos ao pagamento da contribuição, inclusive no caso de isenção, esse último quando revendidos ou utilizados como insumo em produtos ou serviços sujeitos à alíquota 0 (zero), isentos ou não alcançados pela contribuição.

§ 3o O direito ao crédito aplica-se, exclusivamente, em relação:

I - aos bens e serviços adquiridos de pessoa jurídica domiciliada no País;

II - aos custos e despesas incorridos, pagos ou creditados a pessoa jurídica domiciliada no País;

III - aos bens e serviços adquiridos e aos custos e despesas incorridos a partir do mês em que se iniciar a aplicação do disposto nesta Lei.`,
  },
  {
    id: "lei-10833",
    label: "OUTROS4 — Lei nº 10.833, de 29 de dezembro de 2003",
    title: "Lei nº 10.833, de 29 de dezembro de 2003",
    originalUrl: "https://www.planalto.gov.br/ccivil_03/leis/2003/l10833.htm",
    content: `Art. 3o Do valor apurado na forma do art. 2o a pessoa jurídica poderá descontar créditos calculados em relação a: (Regulamento) (Vide Lei Complementar nº 214, de 2025)

I - bens adquiridos para revenda, exceto em relação às mercadorias e aos produtos referidos: (Redação dada pela Lei nº 10.865, de 2004)

a) no inciso III do § 3o do art. 1o desta Lei; e

b) nos §§ 1o e 1o-A do art. 2o desta Lei;

II - bens e serviços, utilizados como insumo na prestação de serviços e na produção ou fabricação de bens ou produtos destinados à venda, inclusive combustíveis e lubrificantes, exceto em relação ao pagamento de que trata o art. 2o da Lei no 10.485, de 3 de julho de 2002, devido pelo fabricante ou importador, ao concessionário, pela intermediação ou entrega dos veículos classificados nas posições 87.03 e 87.04 da TIPI; (Redação dada pela Lei nº 10.865, de 2004)

III - energia elétrica e energia térmica, inclusive sob a forma de vapor, consumidas nos estabelecimentos da pessoa jurídica; (Redação dada pela Lei nº 11.488, de 2007)

IV – aluguéis de prédios, máquinas e equipamentos, pagos a pessoa jurídica, utilizados nas atividades da empresa;

V - máquinas, equipamentos e outros bens incorporados ao ativo imobilizado, adquiridos ou fabricados para locação a terceiros, ou para utilização na produção de bens destinados à venda ou na prestação de serviços; (Redação dada pela Lei nº 11.196, de 2005)

VI - edificações e benfeitorias em imóveis próprios ou de terceiros, utilizados nas atividades da empresa;

VII - bens recebidos em devolução cuja receita de venda tenha integrado faturamento do mês ou de mês anterior, e tributada conforme o disposto nesta Lei;

VIII - armazenagem de mercadoria e frete na operação de venda, nos casos dos incisos I e II, quando o ônus for suportado pelo vendedor.

IX - vale-transporte, vale-refeição ou vale-alimentação, fardamento ou uniforme fornecidos aos empregados por pessoa jurídica que explore as atividades de prestação de serviços de limpeza, conservação e manutenção. (Incluído pela Lei nº 11.898, de 2009)

X - bens incorporados ao ativo intangível, adquiridos para utilização na produção de bens destinados a venda ou na prestação de serviços. (Incluído pela Lei nº 12.973, de 2014) (Vigência)

§ 1o O crédito será determinado mediante a aplicação da alíquota prevista no caput do art. 2o desta Lei sobre o valor:

I - dos itens mencionados nos incisos I, II e III do caput, adquiridos no mês;

II - dos itens mencionados nos incisos IV, V e IX do caput, incorridos no mês;

III - dos encargos de depreciação e amortização dos bens mencionados nos incisos V e X do caput, incorridos no mês;

IV - dos bens mencionados no inciso VI do caput, objeto de locação a terceiros, incorridos no mês.

§ 2o Não dará direito a crédito o valor:

I - de mão-de-obra paga a pessoa física; e

II - da aquisição de bens ou serviços não sujeitos ao pagamento da contribuição, inclusive no caso de isenção, quando revendidos ou utilizados como insumo em produtos ou serviços sujeitos à alíquota 0 (zero), isentos ou não alcançados pela contribuição.`,
  },
  {
    id: "lei-10865",
    label: "OUTROS4 — Lei nº 10.865, de 30 de abril de 2004",
    title: "Lei nº 10.865, de 30 de abril de 2004",
    originalUrl: "https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l10865.htm",
    content: `Art. 15. As pessoas jurídicas sujeitas à apuração da contribuição para o PIS/Pasep e da Cofins, nos termos dos arts. 2o e 3o das Leis nos 10.637, de 30 de dezembro de 2002, e 10.833, de 29 de dezembro de 2003, poderão descontar crédito, para fins de determinação dessas contribuições, em relação às importações sujeitas ao pagamento das contribuições de que trata o art. 1o desta Lei, nas seguintes hipóteses: (Vide Lei Complementar nº 214, de 2025)

I - bens adquiridos para revenda;

II - bens e serviços utilizados como insumo na prestação de serviços e na produção ou fabricação de bens ou produtos destinados à venda, inclusive combustíveis e lubrificantes;

III - energia elétrica e energia térmica, inclusive sob a forma de vapor, consumidas nos estabelecimentos da pessoa jurídica;

IV - aluguéis e contraprestações de arrendamento mercantil de prédios, máquinas e equipamentos, pagos a pessoa jurídica, utilizados nas atividades da empresa;

V - máquinas, equipamentos e outros bens incorporados ao ativo imobilizado, adquiridos para locação a terceiros ou para utilização na produção de bens destinados à venda ou na prestação de serviços.

§ 1o O crédito de que trata o caput será determinado mediante a aplicação, sobre o valor que serviu de base de cálculo das contribuições, dos percentuais:

I - de 9,25% (nove inteiros e vinte e cinco centésimos por cento), na hipótese do inciso I;

II - de 7,60% (sete inteiros e sessenta centésimos por cento), no caso das hipóteses dos incisos II a V do caput, quando os bens e serviços importados forem utilizados na produção ou fabricação de bens ou produtos destinados à venda;

§ 2o O crédito de que trata o caput somente será aproveitado a partir do mês em que os bens e serviços importados estiverem contabilizados em conta de ativo ou forem utilizados na prestação de serviços ou na produção ou fabricação de bens ou produtos a serem vendidos.

§ 3o Será aplicável, ainda, o disposto nos §§ 3o e 4o do art. 3o da Lei no 10.637, de 2002, e nos §§ 3o e 4o do art. 3o da Lei no 10.833, de 2003.`,
  },
  {
    id: "sc-cosit-32-2021",
    label: "Solução de Consulta COSIT nº 32/2021",
    title: "Solução de Consulta COSIT nº 32/2021",
    content: `SOLUÇÃO DE CONSULTA COSIT Nº 32, DE 16 DE MARÇO DE 2021

ASSUNTO: Contribuição para o PIS/Pasep

EMENTA: INSUMOS. CONCEITO. CRITÉRIOS DE ESSENCIALIDADE E RELEVÂNCIA.

Para fins de apuração de créditos da Contribuição para o PIS/Pasep no regime de apuração não cumulativa, considera-se insumo o bem ou serviço que seja essencial ou relevante para o desenvolvimento da atividade econômica desenvolvida pela pessoa jurídica, nos termos do julgamento do REsp 1.221.170/PR pelo Superior Tribunal de Justiça.

O critério da essencialidade diz respeito ao item do qual depende, intrínseca e fundamentalmente, o produto ou o serviço, constituindo elemento estrutural e inseparável do processo produtivo ou da execução do serviço.

O critério de relevância é identificado no item cuja falta, embora não impeça a produção ou a prestação do serviço, implique imposição de obstáculos ao exercício dessa atividade ou que resulte em substancial perda de qualidade do produto ou serviço daí resultante.

DISPOSITIVOS LEGAIS: Lei nº 10.637, de 2002, art. 3º, II; Lei nº 10.833, de 2003, art. 3º, II; IN RFB nº 2.121, de 2022, art. 176.

SOLUÇÃO DE CONSULTA COSIT Nº 155, DE 2023

Em alinhamento com o entendimento consolidado no REsp 1.221.170/PR, a Receita Federal confirma que a análise do conceito de insumo deve ser feita caso a caso, considerando a atividade econômica concreta da pessoa jurídica consulente. A aplicação dos critérios de essencialidade e relevância não comporta solução abstrata desvinculada da realidade operacional da empresa.`,
  },
  {
    id: "acordao-carf-3302-014351",
    label: "Acórdão CARF nº 3302-014.351",
    title: "Acórdão CARF nº 3302-014.351",
    content: `ACÓRDÃO 3302-014.351
3ª Seção de Julgamento / 3ª Câmara / 2ª Turma Ordinária

Processo nº: [número do processo]
Recurso: Voluntário
Recorrente: Contribuinte
Recorrida: Fazenda Nacional

ASSUNTO: Contribuição para o Financiamento da Seguridade Social - Cofins
Período de apuração: 01/01/2017 a 31/12/2018

EMENTA: COFINS NÃO CUMULATIVA. INSUMOS. CONCEITO. CRITÉRIOS DE ESSENCIALIDADE E RELEVÂNCIA. REsp 1.221.170/PR. Após o julgamento do REsp 1.221.170/PR pelo STJ, o conceito de insumos para fins de creditamento da COFINS não cumulativa deve ser aferido à luz dos critérios de essencialidade ou relevância do bem ou serviço para a atividade econômica desempenhada pelo contribuinte. A análise deve considerar as circunstâncias específicas de cada caso concreto.

GASTOS COM FRETES. INSUMOS. HIPÓTESES DE CREDITAMENTO. Os gastos com frete, quando diretamente vinculados ao processo produtivo ou à atividade fim da empresa, podem ser considerados insumos para fins de creditamento da COFINS não cumulativa, desde que comprovada sua essencialidade ou relevância para o desenvolvimento da atividade econômica.

SERVIÇOS DE SEGURANÇA E VIGILÂNCIA. INSUMOS. Os serviços de segurança e vigilância prestados nas dependências onde ocorre o processo produtivo podem ser considerados insumos, quando demonstrada sua relevância para a continuidade e regularidade das atividades da pessoa jurídica.

Por unanimidade de votos, DAR PROVIMENTO PARCIAL ao recurso voluntário do contribuinte.`,
  },
]

export function findDocument(id: string): LegalDocument | undefined {
  return MOCK_DOCUMENTS.find((d) => d.id === id)
}
