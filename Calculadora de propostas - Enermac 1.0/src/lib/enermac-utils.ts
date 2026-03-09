// Utilitários para a Calculadora de Proposta Enermac
// Lógica de cálculo financeiro corrigida

import { 
  Substrato, 
  Gerador, 
  ModeloBiodigestor, 
  BIODIGESTORES, 
  TARIFAS_VENDA_PADRAO,
  SUBSTRATOS,
  GERADORES,
  calcularTratamento,
  PERCENTUAL_EQUIPAMENTOS_CAPEX,
  ParametrosManutencao
} from './enermac-data';

// Formatação de moeda brasileira
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

// Formatação de número com decimais
export function formatarNumero(valor: number, decimais: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais,
  }).format(valor);
}

// Formatação de número inteiro
export function formatarInteiro(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0,
  }).format(valor);
}

// Margem de segurança do biodigestor (20%)
export const MARGEM_SEGURANCA_BIODIGESTOR = 0.20;

// Resultado do dimensionamento de resíduos e biogás
export interface ResultadoDimensionamento {
  volResiduoDia: number;
  volResiduoMes: number;
  biogasDia: number;
  biogasMes: number;
  stSubstrato: number | null;
  svSubstrato: number | null;
  trhUtilizado: number;
  volBiodigestorNecessario: number;
}

// Resultado do biodigestor recomendado
export interface ResultadoBiodigestor {
  volumeNecessario: number;
  volumeComMargem: number;
  tipoRecomendado: string;
  modeloSelecionado: ModeloBiodigestor;
  alternativas: {
    acima: ModeloBiodigestor | null;
    abaixo: ModeloBiodigestor | null;
  };
  margemAplicada: number;
  ajustadoProporcionalmente: boolean;
  precoM3Calculado?: number;
}

// Resultado por gerador com CAPEX completo
export interface ResultadoGerador {
  gerador: Gerador;
  horasOperacaoDia: number;
  qtdGeradores: number;
  horasReaisPorGerador: number;
  kwhDia: number;
  kwhMes: number;
  kwhAno: number;
  
  // CAPEX Detalhado (unitário)
  precoBiodigestorUnitario: number;
  precoGeradorUnitario: number;
  precoSecadorUnitario: number;
  precoFiltroCarvaoUnitario: number;
  precoBiodessulfurizacaoUnitario: number;
  precoTratamentoTotalUnitario: number;
  
  // CAPEX com quantidades aplicadas
  precoBiodigestorTotal: number;
  precoGeradorTotal: number;
  precoTratamentoTotal: number;
  capexEquipamentos: number;
  capexInfraestrutura: number;
  capexTotal: number;
}

// Resultado completo da proposta
export interface ResultadoProposta {
  dimensionamento: ResultadoDimensionamento;
  biodigestor: ResultadoBiodigestor;
  geradores: ResultadoGerador[];
  alertas: string[];
  notasTecnicas: string[];
}

// Determinar tipo de biodigestor baseado no ST
function determinarTipoBiodigestor(st: number | null): string {
  if (st === null) {
    return 'blc_circular';
  }
  if (st <= 2) {
    return 'lagoa_coberta';
  }
  if (st <= 3) {
    return 'blc_circular';
  }
  return 'blc_retangular';
}

// Calcular preço proporcional por m³
function calcularPrecoProporcional(
  volumeDesejado: number, 
  modeloReferencia: ModeloBiodigestor
): number {
  const precoPorM3 = modeloReferencia.preco / modeloReferencia.volume;
  return volumeDesejado * precoPorM3;
}

/**
 * Encontrar modelo de biodigestor adequado com margem de 20% OBRIGATÓRIA
 */
function encontrarModeloBiodigestor(
  volumeNecessario: number, 
  tipo: string
): { 
  selecionado: ModeloBiodigestor; 
  acima: ModeloBiodigestor | null; 
  abaixo: ModeloBiodigestor | null;
  margemAplicada: number;
  ajustadoProporcionalmente: boolean;
  precoM3Calculado?: number;
} {
  const biodigestorTipo = BIODIGESTORES[tipo];
  const catalogo = biodigestorTipo 
    ? [...biodigestorTipo.modelos] 
    : [...BIODIGESTORES['blc_circular'].modelos];
  
  const modelosOrdenados = catalogo.sort((a, b) => a.volume - b.volume);
  const volumeMinimoComMargem = volumeNecessario * (1 + MARGEM_SEGURANCA_BIODIGESTOR);
  
  const modeloCatalogo = modelosOrdenados.find(m => m.volume >= volumeMinimoComMargem);
  
  let selecionado: ModeloBiodigestor;
  let ajustadoProporcionalmente = false;
  let precoM3Calculado: number | undefined;
  let margemAplicada: number;
  
  if (modeloCatalogo) {
    selecionado = modeloCatalogo;
    margemAplicada = (modeloCatalogo.volume - volumeNecessario) / volumeNecessario;
    ajustadoProporcionalmente = false;
  } else {
    const maiorModelo = modelosOrdenados[modelosOrdenados.length - 1];
    const precoCalculado = calcularPrecoProporcional(volumeMinimoComMargem, maiorModelo);
    
    selecionado = {
      volume: volumeMinimoComMargem,
      nome: `${maiorModelo.nome} (calculado)`,
      dimensoes: `${maiorModelo.dimensoes} (calculado)`,
      preco: precoCalculado
    };
    
    margemAplicada = MARGEM_SEGURANCA_BIODIGESTOR;
    ajustadoProporcionalmente = true;
    precoM3Calculado = precoCalculado / volumeMinimoComMargem;
  }
  
  const indice = modelosOrdenados.findIndex(m => m.volume === selecionado.volume);
  
  let acima: ModeloBiodigestor | null = null;
  let abaixo: ModeloBiodigestor | null = null;
  
  if (ajustadoProporcionalmente) {
    abaixo = modelosOrdenados[modelosOrdenados.length - 1];
  } else {
    acima = indice >= 0 && indice < modelosOrdenados.length - 1 
      ? modelosOrdenados[indice + 1] 
      : null;
    abaixo = indice > 0 
      ? modelosOrdenados[indice - 1] 
      : null;
  }

  return { 
    selecionado, 
    acima, 
    abaixo, 
    margemAplicada,
    ajustadoProporcionalmente,
    precoM3Calculado
  };
}

// Função principal de cálculo
export function calcularProposta(
  substratoId: string,
  quantidade: number,
  eficienciaPct: number
): ResultadoProposta | null {
  const substrato = SUBSTRATOS.find(s => s.id === substratoId);
  if (!substrato) return null;

  const fatoresEficiencia: Record<number, number> = { 60: 0.75, 80: 1.0, 100: 1.25 };
  const fatorEf = fatoresEficiencia[eficienciaPct] || 1.0;

  // 1. Dimensionamento de resíduos e biogás
  const volResiduoDia = quantidade * substrato.vol_biomassa_dia;
  const volResiduoMes = volResiduoDia * 30;
  const biogasDia = quantidade * substrato.biogas_80pct * fatorEf;
  const biogasMes = biogasDia * 30;
  const volBiodigestorNecessario = volResiduoDia * substrato.TRH;

  const dimensionamento: ResultadoDimensionamento = {
    volResiduoDia,
    volResiduoMes,
    biogasDia,
    biogasMes,
    stSubstrato: substrato.ST,
    svSubstrato: substrato.SV,
    trhUtilizado: substrato.TRH,
    volBiodigestorNecessario,
  };

  // 2. Seleção do biodigestor
  const tipoBiodigestor = determinarTipoBiodigestor(substrato.ST);
  const { 
    selecionado, 
    acima, 
    abaixo, 
    margemAplicada,
    ajustadoProporcionalmente,
    precoM3Calculado
  } = encontrarModeloBiodigestor(volBiodigestorNecessario, tipoBiodigestor);

  const biodigestor: ResultadoBiodigestor = {
    volumeNecessario: volBiodigestorNecessario,
    volumeComMargem: selecionado.volume,
    tipoRecomendado: BIODIGESTORES[tipoBiodigestor]?.nome || 'BLC Circular',
    modeloSelecionado: selecionado,
    alternativas: { acima, abaixo },
    margemAplicada,
    ajustadoProporcionalmente,
    precoM3Calculado,
  };

  // 3. Cálculo para cada gerador
  const alertas: string[] = [];
  const notasTecnicas: string[] = [];

  if (ajustadoProporcionalmente) {
    notasTecnicas.push(
      `Volume necessário (${formatarNumero(volBiodigestorNecessario)} m³) excede o maior modelo do catálogo. ` +
      `Biodigestor calculado proporcionalmente (${formatarNumero(selecionado.volume)} m³) ` +
      `para garantir margem de segurança de 20%. ` +
      `Preço por m³: ${formatarMoeda(precoM3Calculado || 0)}.`
    );
  }

  if (volBiodigestorNecessario > 20000) {
    alertas.push(`Volume de biodigestor necessário (${formatarNumero(volBiodigestorNecessario)} m³) excede 20.000 m³. Consulte a equipe técnica.`);
  }

  if (substrato.ST && substrato.ST > 15) {
    notasTecnicas.push(`O substrato possui ST de ${substrato.ST}% (> 15%), o que pode requerer diluição ou sistema de mistura especial.`);
  }

  const resultadosGeradores: ResultadoGerador[] = GERADORES.map((gerador) => {
    const horasOperacaoDia = biogasDia / gerador.consumo_nm3h;
    const qtdGeradoresSugerida = Math.max(1, Math.ceil(horasOperacaoDia / 24));
    const horasReaisPorGerador = horasOperacaoDia / qtdGeradoresSugerida;
    
    const kwhDiaPotencia = gerador.potencia_kw * horasReaisPorGerador * qtdGeradoresSugerida;
    const kwhDiaFator = biogasDia * gerador.fator_conversao;
    const kwhDia = Math.min(kwhDiaPotencia, kwhDiaFator);
    
    const kwhMes = kwhDia * (365 / 12);
    const kwhAno = kwhDia * 365;
    
    const tratamento = calcularTratamento(gerador.potencia_kw);
    
    const precoBiodigestorUnitario = selecionado.preco;
    const precoGeradorUnitario = gerador.preco_kit;
    const precoSecadorUnitario = tratamento.secador;
    const precoFiltroCarvaoUnitario = tratamento.filtro_carvao;
    const precoBiodessulfurizacaoUnitario = tratamento.biodessulfurizacao;
    const precoTratamentoTotalUnitario = tratamento.total;
    
    const precoBiodigestorTotal = precoBiodigestorUnitario;
    const precoGeradorTotal = precoGeradorUnitario;
    const precoTratamentoTotal = precoTratamentoTotalUnitario;
    
    const capexEquipamentos = precoBiodigestorTotal + precoTratamentoTotal + precoGeradorTotal;
    const capexTotal = capexEquipamentos / PERCENTUAL_EQUIPAMENTOS_CAPEX;
    const capexInfraestrutura = capexTotal - capexEquipamentos;

    return {
      gerador,
      horasOperacaoDia,
      qtdGeradores: qtdGeradoresSugerida,
      horasReaisPorGerador,
      kwhDia,
      kwhMes,
      kwhAno,
      precoBiodigestorUnitario,
      precoGeradorUnitario,
      precoSecadorUnitario,
      precoFiltroCarvaoUnitario,
      precoBiodessulfurizacaoUnitario,
      precoTratamentoTotalUnitario,
      precoBiodigestorTotal,
      precoGeradorTotal,
      precoTratamentoTotal,
      capexEquipamentos,
      capexInfraestrutura,
      capexTotal,
    };
  });

  const menorConsumo = Math.min(...GERADORES.map(g => g.consumo_nm3h));
  if (biogasDia < menorConsumo) {
    alertas.push(`Volume de biogás insuficiente para operação contínua de qualquer gerador. Considere aumentar o rebanho/volume.`);
  }

  return {
    dimensionamento,
    biodigestor,
    geradores: resultadosGeradores,
    alertas,
    notasTecnicas,
  };
}

// Função para recalcular CAPEX com quantidades customizáveis e descontos
export function recalcularCapex(
  gerador: ResultadoGerador,
  qtdBiodigestores: number,
  qtdGeradores: number,
  qtdTratamentos: number,
  descontoBiodigestorPct: number = 0,
  descontoGeradorPct: number = 0,
  descontoTratamentoPct: number = 0
): {
  precoBiodigestorTotal: number;
  precoGeradorTotal: number;
  precoTratamentoTotal: number;
  capexEquipamentos: number;
  capexInfraestrutura: number;
  capexTotal: number;
} {
  // Aplicar descontos (limitados a 5%)
  const descBio = Math.min(Math.max(0, descontoBiodigestorPct), 5) / 100;
  const descGer = Math.min(Math.max(0, descontoGeradorPct), 5) / 100;
  const descTrat = Math.min(Math.max(0, descontoTratamentoPct), 5) / 100;
  
  const precoBiodigestorTotal = gerador.precoBiodigestorUnitario * qtdBiodigestores * (1 - descBio);
  const precoGeradorTotal = gerador.precoGeradorUnitario * qtdGeradores * (1 - descGer);
  const precoTratamentoTotal = gerador.precoTratamentoTotalUnitario * qtdTratamentos * (1 - descTrat);
  
  const capexEquipamentos = precoBiodigestorTotal + precoTratamentoTotal + precoGeradorTotal;
  const capexTotal = capexEquipamentos / PERCENTUAL_EQUIPAMENTOS_CAPEX;
  const capexInfraestrutura = capexTotal - capexEquipamentos;
  
  return {
    precoBiodigestorTotal,
    precoGeradorTotal,
    precoTratamentoTotal,
    capexEquipamentos,
    capexInfraestrutura,
    capexTotal,
  };
}

// Obter substrato por ID
export function getSubstratoById(id: string): Substrato | undefined {
  return SUBSTRATOS.find(s => s.id === id);
}

// Obter gerador por ID
export function getGeradorById(id: string): Gerador | undefined {
  return GERADORES.find(g => g.id === id);
}

// Obter tarifa realista padrão
export function getTarifaRealista(): number {
  return TARIFAS_VENDA_PADRAO.realista;
}

// ===== FUNÇÕES DE FINANCIAMENTO =====

// Resultado do financiamento
export interface ResultadoFinanciamento {
  valorCapexTotal: number;      // Valor total do equipamento (CAPEX)
  percentualEntrada: number;    // Percentual de entrada
  valorEntrada: number;         // Valor da entrada (pago à vista)
  valorPrincipal: number;       // Valor financiado (CAPEX - entrada)
  prazoAnos: number;
  carenciaAnos: number;
  taxaJurosAnual: number;
  taxaJurosMensal: number;
  parcelasCarencia: number;
  parcelasAmortizacao: number;
  valorParcelaCarencia: number;
  valorParcelaAmortizacao: number;
  totalJurosCarencia: number;
  totalJurosAmortizacao: number;
  totalJuros: number;
  valorTotalPago: number;       // Total pago no financiamento (principal + juros)
  valorTotalInvestimento: number; // Entrada + valorTotalPago (custo total para o cliente)
}

/**
 * Calcula o financiamento com juros compostos
 * - Parcelas anuais cobradas no último mês do ano
 * - Na carência: paga apenas juros (não amortiza principal)
 * - Após carência: amortização com parcelas fixas (Price)
 */
export function calcularFinanciamento(
  valorCapexTotal: number,
  prazoAnos: number,
  carenciaAnos: number,
  taxaJurosAnual: number,
  descontoTaxaJuros: number = 0,
  percentualEntrada: number = 5
): ResultadoFinanciamento {
  // Calcular entrada e valor financiado
  const valorEntrada = valorCapexTotal * (percentualEntrada / 100);
  const valorPrincipal = valorCapexTotal - valorEntrada;
  
  const taxaEfetiva = Math.max(0, taxaJurosAnual - descontoTaxaJuros);
  const taxaMensal = Math.pow(1 + taxaEfetiva / 100, 1/12) - 1;
  
  const parcelasCarencia = carenciaAnos;
  const parcelasAmortizacao = prazoAnos - carenciaAnos;
  
  // Durante carência: juros sobre o principal financiado
  const jurosAnoCarencia = valorPrincipal * (Math.pow(1 + taxaMensal, 12) - 1);
  const valorParcelaCarencia = jurosAnoCarencia;
  const totalJurosCarencia = valorParcelaCarencia * carenciaAnos;
  
  const taxaAnualEfetiva = Math.pow(1 + taxaMensal, 12) - 1;
  
  let valorParcelaAmortizacao = 0;
  let totalJurosAmortizacao = 0;
  
  if (parcelasAmortizacao > 0) {
    valorParcelaAmortizacao = valorPrincipal * 
      (taxaAnualEfetiva * Math.pow(1 + taxaAnualEfetiva, parcelasAmortizacao)) / 
      (Math.pow(1 + taxaAnualEfetiva, parcelasAmortizacao) - 1);
    
    totalJurosAmortizacao = (valorParcelaAmortizacao * parcelasAmortizacao) - valorPrincipal;
  }
  
  const totalJuros = totalJurosCarencia + totalJurosAmortizacao;
  const valorTotalPago = valorPrincipal + totalJuros;
  const valorTotalInvestimento = valorEntrada + valorTotalPago;
  
  return {
    valorCapexTotal,
    percentualEntrada,
    valorEntrada,
    valorPrincipal,
    prazoAnos,
    carenciaAnos,
    taxaJurosAnual: taxaEfetiva,
    taxaJurosMensal: taxaMensal * 100,
    parcelasCarencia,
    parcelasAmortizacao,
    valorParcelaCarencia,
    valorParcelaAmortizacao,
    totalJurosCarencia,
    totalJurosAmortizacao,
    totalJuros,
    valorTotalPago,
    valorTotalInvestimento
  };
}

// Tipo de cenário
export type TipoCenario = 'pessimista' | 'realista' | 'otimista' | 'media';

// Resultado dos custos de manutenção
export interface ResultadoManutencao {
  // Parâmetros de entrada
  distanciaKm: number;
  horasFuncionamentoGeradorDia: number;
  // Cálculos intermediários
  qtdDiarias: number;
  qtdAlimentacao: number;
  despesasDiariasAlimentacao: number;
  // Resultados finais
  custoFixoPorVisita: number;
  custoFixoMensal: number;
  custoVariavelMensal: number;
  custoTotalMensal: number;
}

/**
 * Calcula os custos de manutenção conforme regras especificadas
 */
export function calcularManutencao(
  params: ParametrosManutencao,
  horasFuncionamentoGeradorDia: number
): ResultadoManutencao {
  // Regra de hospedagem por distância
  let qtdDiarias = 0;
  let qtdAlimentacao = 0;
  
  if (params.distanciaKm <= 250) {
    // Até 250 km → sem diárias + alimentação
    qtdDiarias = 0;
    qtdAlimentacao = 0;
  } else if (params.distanciaKm <= 650) {
    // Entre 251 km e 650 km → (1 diária + 1 alimentação)
    qtdDiarias = 1;
    qtdAlimentacao = 1;
  } else {
    // Acima de 650 km → (2 diárias + 2 alimentação)
    qtdDiarias = 2;
    qtdAlimentacao = 2;
  }
  
  const despesasDiariasAlimentacao = 
    (qtdDiarias * params.diariaHospedagem) + 
    (qtdAlimentacao * params.alimentacaoDiaria);
  
  // Custo Fixo por visita
  const custoFixoPorVisita = 
    (params.custoKm * params.distanciaKm) + 
    (params.custoHoraTecnico * params.horasTecnicasVisita) + 
    despesasDiariasAlimentacao;
  
  // Custo Fixo Mensal (frequência de visitas/mês)
  const custoFixoMensal = custoFixoPorVisita * params.frequenciaMensal;
  
  // Custo Variável Mensal
  const custoVariavelMensal = 
    (params.custoHoraGerador * horasFuncionamentoGeradorDia) * 31;
  
  // Custo Médio Total com Manutenção/mês
  const custoTotalMensal = custoFixoMensal + custoVariavelMensal;
  
  return {
    distanciaKm: params.distanciaKm,
    horasFuncionamentoGeradorDia,
    qtdDiarias,
    qtdAlimentacao,
    despesasDiariasAlimentacao,
    custoFixoPorVisita,
    custoFixoMensal,
    custoVariavelMensal,
    custoTotalMensal,
  };
}

// Fluxo de caixa por ano (para financiamento)
export interface FluxoCaixaAno {
  ano: number;
  fase: 'carencia' | 'amortizacao' | 'pos_financiamento';
  energiaGeradaKwhAno: number;
  receitaBrutaAno: number;
  gastoEnergiaAno: number;
  receitaLiquidaAno: number;
  parcelaFinanciamentoAno: number;
  saldoAno: number;
}

// Cenário de viabilidade completo
export interface CenarioViabilidade {
  nome: TipoCenario;
  tarifaVendaKwh: number;
  
  // Bloco 1 – Produção de Energia
  kwhDia: number;
  kwhMes: number;
  kwhAno: number;
  
  // Bloco 2 – Economia com Energia
  economiaEnergiaMes: number;
  economiaEnergiaAno: number;
  
  // Receita com venda
  receitaVendaMes: number;
  receitaVendaAno: number;
  
  // Bloco 3 – Período de Carência
  custoMedioCarenciaAno: number;
  receitaLiquidaCarenciaMes: number;
  receitaLiquidaCarenciaAno: number;
  
  // Bloco 4 – Período Pós-Carência (financiamento ainda ativo)
  custoMedioPosCarenciaAno: number;
  receitaLiquidaPosCarenciaMes: number;
  receitaLiquidaPosCarenciaAno: number;
  
  // Bloco 5 – Período Pós-Financiamento (financiamento quitado)
  custoMedioPosFinanciamentoAno: number;
  receitaLiquidaPosFinanciamentoMes: number;
  receitaLiquidaPosFinanciamentoAno: number;
  
  // Bloco 6 – Totais Acumulados
  receitaLiquidaTotalCarencia: number;      // Total acumulado até fim da carência
  receitaLiquidaTotalFinanciamento: number; // Total acumulado até fim do financiamento
  
  // Bloco 7 – Balanço Geral 20 Anos (vida útil)
  receitaTotal20Anos: number;
  despesasFinanciamento20Anos: number;
  despesasManutencao20Anos: number;
  resultadoLiquido20Anos: number;
  
  // Indicadores de Retorno
  anosPontoEquilibrio: number | null;  // Anos até atingir ponto de equilíbrio (break-even)
  anosPayback: number | null;          // Anos até recuperar o investimento (payback)
  
  // Parcelas do financiamento (para referência)
  parcelaCarenciaAno: number;
  parcelaAmortizacaoAno: number;
  
  // Custos de manutenção (para referência)
  custoFixoMensal: number;
  custoVariavelMensal: number;
  custoTotalMensal: number;
  
  // Fluxo detalhado por ano
  fluxoCaixa: FluxoCaixaAno[];
}

// Interface para tarifas de venda
export interface TarifasVendaEnergia {
  pessimista: number;
  realista: number;
  otimista: number;
}

// Resultado completo com cenários com e sem manutenção
export interface CenariosCompletos {
  comManutencao: CenarioViabilidade[];
  semManutencao: CenarioViabilidade[];
}

/**
 * Função interna para calcular cenários (com ou sem manutenção)
 */
function calcularCenarios(
  kwhDiaTotal: number,
  kwhMesTotal: number,
  kwhAnoTotal: number,
  tarifasVenda: TarifasVendaEnergia,
  gastoMensalEnergia: number,
  financiamento: ResultadoFinanciamento,
  custoTotalMensal: number,
  custoFixoMensal: number = 0,
  custoVariavelMensal: number = 0,
  capexTotal: number = 0
): CenarioViabilidade[] {
  const custoTotalAno = custoTotalMensal * 12;
  
  // Economia com energia própria (gasto que deixará de ter)
  const economiaEnergiaMes = gastoMensalEnergia;
  const economiaEnergiaAno = economiaEnergiaMes * 12;
  
  // Parcelas do financiamento
  const parcelaCarenciaAno = financiamento.valorParcelaCarencia;
  const parcelaAmortizacaoAno = financiamento.valorParcelaAmortizacao;
  
  // Calcular os 3 cenários principais
  const cenarios: { nome: TipoCenario; tarifaVenda: number }[] = [
    { nome: 'pessimista', tarifaVenda: tarifasVenda.pessimista },
    { nome: 'realista', tarifaVenda: tarifasVenda.realista },
    { nome: 'otimista', tarifaVenda: tarifasVenda.otimista },
  ];
  
  const resultados: CenarioViabilidade[] = cenarios.map(cenario => {
    const tarifaVendaKwh = cenario.tarifaVenda;
    
    // Receita com venda de energia (valor bruto)
    const receitaVendaMes = kwhMesTotal * tarifaVendaKwh;
    const receitaVendaAno = kwhAnoTotal * tarifaVendaKwh;
    
    // IMPORTANTE: A economia de energia vem DE DENTRO da receita de venda
    // O cliente usa parte da receita para compensar sua conta de luz
    // Receita bruta disponível = Receita venda - Economia (que foi "consumida")
    const receitaBrutaDisponivelMes = receitaVendaMes - economiaEnergiaMes;
    const receitaBrutaDisponivelAno = receitaVendaAno - economiaEnergiaAno;
    
    // ===== BLOCO 3 – Período de Carência =====
    // Custo médio em carência/ano = Parcela do financiamento + Custo Manutenção Ano
    const custoMedioCarenciaAno = parcelaCarenciaAno + custoTotalAno;
    // Receita líquida/mês = Receita bruta disponível - Custo manutenção/mês
    // (parcela anual é paga uma vez por ano, não mensalmente)
    const receitaLiquidaCarenciaMes = receitaBrutaDisponivelMes - custoTotalMensal;
    // Receita líquida/ano = Receita bruta disponível anual - Parcela/ano - Custo manutenção/ano
    const receitaLiquidaCarenciaAno = receitaBrutaDisponivelAno - parcelaCarenciaAno - custoTotalAno;
    
    // ===== BLOCO 4 – Período Pós-Carência (financiamento ainda ativo) =====
    const custoMedioPosCarenciaAno = parcelaAmortizacaoAno + custoTotalAno;
    // Receita líquida/mês = Receita bruta disponível - Custo manutenção/mês
    // (parcela anual é paga uma vez por ano, não mensalmente)
    const receitaLiquidaPosCarenciaMes = receitaBrutaDisponivelMes - custoTotalMensal;
    // Receita líquida/ano = Receita bruta disponível anual - Parcela/ano - Custo manutenção/ano
    const receitaLiquidaPosCarenciaAno = receitaBrutaDisponivelAno - parcelaAmortizacaoAno - custoTotalAno;
    
    // ===== BLOCO 5 – Período Pós-Financiamento (financiamento quitado) =====
    const custoMedioPosFinanciamentoAno = custoTotalAno;
    // Sem parcela de financiamento
    const receitaLiquidaPosFinanciamentoMes = receitaBrutaDisponivelMes - custoTotalMensal;
    const receitaLiquidaPosFinanciamentoAno = receitaBrutaDisponivelAno - custoTotalAno;
    
    // Fluxo de caixa detalhado ano a ano
    const fluxoCaixa: FluxoCaixaAno[] = [];
    const prazoTotal = financiamento.prazoAnos;
    const carenciaAnos = financiamento.carenciaAnos;
    
    for (let ano = 1; ano <= prazoTotal; ano++) {
      let fase: 'carencia' | 'amortizacao' | 'pos_financiamento';
      let parcelaAno: number;
      
      if (ano <= carenciaAnos) {
        fase = 'carencia';
        parcelaAno = parcelaCarenciaAno;
      } else {
        fase = 'amortizacao';
        parcelaAno = parcelaAmortizacaoAno;
      }
      
      // Receita bruta disponível = Receita venda - Economia (consumida para compensar conta)
      const receitaBrutaDisponivel = receitaVendaAno - economiaEnergiaAno;
      const saldoAno = receitaBrutaDisponivel - parcelaAno - custoTotalAno;
      
      fluxoCaixa.push({
        ano,
        fase,
        energiaGeradaKwhAno: kwhAnoTotal,
        receitaBrutaAno: receitaVendaAno,
        gastoEnergiaAno: economiaEnergiaAno,
        receitaLiquidaAno: receitaBrutaDisponivel,
        parcelaFinanciamentoAno: parcelaAno,
        saldoAno
      });
    }
    
    // ===== Calcular Ponto de Equilíbrio e Payback =====
    let acumulado = 0;
    let anosPontoEquilibrio: number | null = null;
    let anosPayback: number | null = null;
    
    // O payback considera a entrada como investimento inicial do cliente
    const valorEntrada = financiamento.valorEntrada;
    
    // Simular ano a ano por 20 anos (vida útil)
    for (let ano = 1; ano <= 20; ano++) {
      let receitaAno: number;
      
      if (ano <= carenciaAnos) {
        // Período de carência
        receitaAno = receitaLiquidaCarenciaAno;
      } else if (ano <= prazoTotal) {
        // Período de amortização
        receitaAno = receitaLiquidaPosCarenciaAno;
      } else {
        // Pós-financiamento
        receitaAno = receitaLiquidaPosFinanciamentoAno;
      }
      
      acumulado += receitaAno;
      
      // Ponto de equilíbrio: quando acumulado passa de negativo para positivo
      if (anosPontoEquilibrio === null && acumulado >= 0) {
        anosPontoEquilibrio = ano;
      }
      
      // Payback: quando acumulado supera a entrada (investimento inicial do cliente)
      if (anosPayback === null && acumulado >= valorEntrada) {
        anosPayback = ano;
      }
      
      // Se já encontrou ambos, pode parar
      if (anosPontoEquilibrio !== null && anosPayback !== null) {
        break;
      }
    }
    
    return {
      nome: cenario.nome,
      tarifaVendaKwh,
      kwhDia: kwhDiaTotal,
      kwhMes: kwhMesTotal,
      kwhAno: kwhAnoTotal,
      economiaEnergiaMes,
      economiaEnergiaAno,
      receitaVendaMes,
      receitaVendaAno,
      custoMedioCarenciaAno,
      receitaLiquidaCarenciaMes,
      receitaLiquidaCarenciaAno,
      custoMedioPosCarenciaAno,
      receitaLiquidaPosCarenciaMes,
      receitaLiquidaPosCarenciaAno,
      custoMedioPosFinanciamentoAno,
      receitaLiquidaPosFinanciamentoMes,
      receitaLiquidaPosFinanciamentoAno,
      // Bloco 6 – Totais Acumulados
      receitaLiquidaTotalCarencia: receitaLiquidaCarenciaAno * financiamento.carenciaAnos,
      receitaLiquidaTotalFinanciamento: (receitaLiquidaCarenciaAno * financiamento.carenciaAnos) + (receitaLiquidaPosCarenciaAno * (financiamento.prazoAnos - financiamento.carenciaAnos)),
      // Bloco 7 – Balanço Geral 20 Anos
      receitaTotal20Anos: receitaBrutaDisponivelAno * 20,
      despesasFinanciamento20Anos: financiamento.valorTotalPago,
      despesasManutencao20Anos: custoTotalAno * 20,
      resultadoLiquido20Anos: (receitaBrutaDisponivelAno * 20) - financiamento.valorTotalPago - (custoTotalAno * 20),
      // Indicadores de Retorno
      anosPontoEquilibrio,
      anosPayback,
      parcelaCarenciaAno,
      parcelaAmortizacaoAno,
      custoFixoMensal,
      custoVariavelMensal,
      custoTotalMensal,
      fluxoCaixa
    };
  });
  
  // Cenário MÉDIA
  const tarifaMedia = (tarifasVenda.pessimista + tarifasVenda.realista + tarifasVenda.otimista) / 3;
  const receitaVendaMesMedia = kwhMesTotal * tarifaMedia;
  const receitaVendaAnoMedia = kwhAnoTotal * tarifaMedia;
  
  // Receita bruta disponível = Receita venda - Economia
  const receitaBrutaDisponivelMesMedia = receitaVendaMesMedia - economiaEnergiaMes;
  const receitaBrutaDisponivelAnoMedia = receitaVendaAnoMedia - economiaEnergiaAno;
  
  const custoMedioCarenciaAnoMedia = parcelaCarenciaAno + custoTotalAno;
  // Mensal: não inclui parcela anual (paga uma vez por ano)
  const receitaLiquidaCarenciaMesMedia = receitaBrutaDisponivelMesMedia - custoTotalMensal;
  const receitaLiquidaCarenciaAnoMedia = receitaBrutaDisponivelAnoMedia - parcelaCarenciaAno - custoTotalAno;
  
  const custoMedioPosCarenciaAnoMedia = parcelaAmortizacaoAno + custoTotalAno;
  // Mensal: não inclui parcela anual (paga uma vez por ano)
  const receitaLiquidaPosCarenciaMesMedia = receitaBrutaDisponivelMesMedia - custoTotalMensal;
  const receitaLiquidaPosCarenciaAnoMedia = receitaBrutaDisponivelAnoMedia - parcelaAmortizacaoAno - custoTotalAno;
  
  const custoMedioPosFinanciamentoAnoMedia = custoTotalAno;
  const receitaLiquidaPosFinanciamentoMesMedia = receitaBrutaDisponivelMesMedia - custoTotalMensal;
  const receitaLiquidaPosFinanciamentoAnoMedia = receitaBrutaDisponivelAnoMedia - custoTotalAno;
  
  // Fluxo de caixa para média
  const fluxoCaixaMedia: FluxoCaixaAno[] = [];
  for (let ano = 1; ano <= financiamento.prazoAnos; ano++) {
    let fase: 'carencia' | 'amortizacao' | 'pos_financiamento';
    let parcelaAno: number;
    
    if (ano <= financiamento.carenciaAnos) {
      fase = 'carencia';
      parcelaAno = parcelaCarenciaAno;
    } else {
      fase = 'amortizacao';
      parcelaAno = parcelaAmortizacaoAno;
    }
    
    // Receita bruta disponível = Receita venda - Economia
    const receitaBrutaDisponivelMedia = receitaVendaAnoMedia - economiaEnergiaAno;
    const saldoAno = receitaBrutaDisponivelMedia - parcelaAno - custoTotalAno;
    
    fluxoCaixaMedia.push({
      ano,
      fase,
      energiaGeradaKwhAno: kwhAnoTotal,
      receitaBrutaAno: receitaVendaAnoMedia,
      gastoEnergiaAno: economiaEnergiaAno,
      receitaLiquidaAno: receitaBrutaDisponivelMedia,
      parcelaFinanciamentoAno: parcelaAno,
      saldoAno
    });
  }
  
  // ===== Calcular Ponto de Equilíbrio e Payback para MÉDIA =====
  let acumuladoMedia = 0;
  let anosPontoEquilibrioMedia: number | null = null;
  let anosPaybackMedia: number | null = null;
  
  const prazoTotalMedia = financiamento.prazoAnos;
  const carenciaAnosMedia = financiamento.carenciaAnos;
  const valorEntradaMedia = financiamento.valorEntrada;
  
  for (let ano = 1; ano <= 20; ano++) {
    let receitaAno: number;
    
    if (ano <= carenciaAnosMedia) {
      receitaAno = receitaLiquidaCarenciaAnoMedia;
    } else if (ano <= prazoTotalMedia) {
      receitaAno = receitaLiquidaPosCarenciaAnoMedia;
    } else {
      receitaAno = receitaLiquidaPosFinanciamentoAnoMedia;
    }
    
    acumuladoMedia += receitaAno;
    
    if (anosPontoEquilibrioMedia === null && acumuladoMedia >= 0) {
      anosPontoEquilibrioMedia = ano;
    }
    
    // Payback: quando acumulado supera a entrada (investimento inicial do cliente)
    if (anosPaybackMedia === null && acumuladoMedia >= valorEntradaMedia) {
      anosPaybackMedia = ano;
    }
    
    if (anosPontoEquilibrioMedia !== null && anosPaybackMedia !== null) {
      break;
    }
  }
  
  const mediaCenario: CenarioViabilidade = {
    nome: 'media',
    tarifaVendaKwh: tarifaMedia,
    kwhDia: kwhDiaTotal,
    kwhMes: kwhMesTotal,
    kwhAno: kwhAnoTotal,
    economiaEnergiaMes,
    economiaEnergiaAno,
    receitaVendaMes: receitaVendaMesMedia,
    receitaVendaAno: receitaVendaAnoMedia,
    custoMedioCarenciaAno: custoMedioCarenciaAnoMedia,
    receitaLiquidaCarenciaMes: receitaLiquidaCarenciaMesMedia,
    receitaLiquidaCarenciaAno: receitaLiquidaCarenciaAnoMedia,
    custoMedioPosCarenciaAno: custoMedioPosCarenciaAnoMedia,
    receitaLiquidaPosCarenciaMes: receitaLiquidaPosCarenciaMesMedia,
    receitaLiquidaPosCarenciaAno: receitaLiquidaPosCarenciaAnoMedia,
    custoMedioPosFinanciamentoAno: custoMedioPosFinanciamentoAnoMedia,
    receitaLiquidaPosFinanciamentoMes: receitaLiquidaPosFinanciamentoMesMedia,
    receitaLiquidaPosFinanciamentoAno: receitaLiquidaPosFinanciamentoAnoMedia,
    // Bloco 6 – Totais Acumulados
    receitaLiquidaTotalCarencia: receitaLiquidaCarenciaAnoMedia * financiamento.carenciaAnos,
    receitaLiquidaTotalFinanciamento: (receitaLiquidaCarenciaAnoMedia * financiamento.carenciaAnos) + (receitaLiquidaPosCarenciaAnoMedia * (financiamento.prazoAnos - financiamento.carenciaAnos)),
    // Bloco 7 – Balanço Geral 20 Anos
    receitaTotal20Anos: receitaBrutaDisponivelAnoMedia * 20,
    despesasFinanciamento20Anos: financiamento.valorTotalPago,
    despesasManutencao20Anos: custoTotalAno * 20,
    resultadoLiquido20Anos: (receitaBrutaDisponivelAnoMedia * 20) - financiamento.valorTotalPago - (custoTotalAno * 20),
    // Indicadores de Retorno
    anosPontoEquilibrio: anosPontoEquilibrioMedia,
    anosPayback: anosPaybackMedia,
    parcelaCarenciaAno,
    parcelaAmortizacaoAno,
    custoFixoMensal,
    custoVariavelMensal,
    custoTotalMensal,
    fluxoCaixa: fluxoCaixaMedia
  };
  
  return [...resultados, mediaCenario];
}

/**
 * Calcula os cenários de viabilidade econômica COM e SEM manutenção
 */
export function calcularCenariosCompletos(
  kwhDia: number,
  kwhMes: number,
  kwhAno: number,
  tarifasVenda: TarifasVendaEnergia,
  gastoMensalEnergia: number,
  financiamento: ResultadoFinanciamento,
  manutencao: ResultadoManutencao,
  qtdGeradores: number = 1,
  capexTotal: number = 0
): CenariosCompletos {
  const kwhDiaTotal = kwhDia * qtdGeradores;
  const kwhMesTotal = kwhMes * qtdGeradores;
  const kwhAnoTotal = kwhAno * qtdGeradores;
  
  // Cenários COM manutenção
  const comManutencao = calcularCenarios(
    kwhDiaTotal,
    kwhMesTotal,
    kwhAnoTotal,
    tarifasVenda,
    gastoMensalEnergia,
    financiamento,
    manutencao.custoTotalMensal,
    manutencao.custoFixoMensal,
    manutencao.custoVariavelMensal,
    capexTotal
  );
  
  // Cenários SEM manutenção (custo = 0)
  const semManutencao = calcularCenarios(
    kwhDiaTotal,
    kwhMesTotal,
    kwhAnoTotal,
    tarifasVenda,
    gastoMensalEnergia,
    financiamento,
    0, // custoTotalMensal = 0
    0, // custoFixoMensal = 0
    0,  // custoVariavelMensal = 0
    capexTotal
  );
  
  return {
    comManutencao,
    semManutencao
  };
}

/**
 * Mantida para compatibilidade - usa calcularCenariosCompletos internamente
 */
export function calcularCenariosViabilidade(
  capexTotal: number,
  kwhDia: number,
  kwhMes: number,
  kwhAno: number,
  tarifasVenda: TarifasVendaEnergia,
  gastoMensalEnergia: number,
  financiamento: ResultadoFinanciamento,
  manutencao: ResultadoManutencao,
  qtdGeradores: number = 1
): CenariosCompletos {
  return calcularCenariosCompletos(
    kwhDia,
    kwhMes,
    kwhAno,
    tarifasVenda,
    gastoMensalEnergia,
    financiamento,
    manutencao,
    qtdGeradores
  );
}
