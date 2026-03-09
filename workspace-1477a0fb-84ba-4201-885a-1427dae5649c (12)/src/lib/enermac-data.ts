// Dados para a Calculadora de Proposta Enermac
// Atualizado conforme planilha EVTF - Preços de Venda (Margens aplicadas: 30,192% sobre custo)

// Grupos de substratos
export const GRUPOS_SUBSTRATO = [
  { id: 'Suínos', nome: 'Suínos' },
  { id: 'Bovinos', nome: 'Bovinos' },
  { id: 'Aves', nome: 'Aves' },
  { id: 'Agroindustrial Líquido', nome: 'Agroindustrial Líquido' },
  { id: 'Agroindustrial Sólido', nome: 'Agroindustrial Sólido / Industrial' },
];

// Interface do substrato
export interface Substrato {
  id: string;
  nome: string;
  grupo: string;
  unidade: string;            // unidade base (cabeça, m³, tonelada)
  unidadeLabel: string;       // label para exibição no campo quantidade
  vol_biomassa_dia: number;   // m³ por unidade por dia
  biogas_80pct: number;       // Nm³ por unidade por dia a 80% eficiência
  ST: number | null;          // Sólidos Totais %
  SV: number | null;          // Sólidos Voláteis %
  biogas_kgSV: number | null; // Litros de biogás por kg de SV
  densidade: number | null;   // kg/m³
  TRH: number;                // Tempo de Retenção Hidráulica (dias)
}

// Catálogo de substratos - Base de dados extraída da aba "Base Codigestão" da planilha EVTF
// Todos os valores de biogás são referentes à eficiência de 80%
// Multiplicar por 0.75 para 60% e por 1.25 para 100%
export const SUBSTRATOS: Substrato[] = [
  // ===== SUÍNOS =====
  {
    id: "suino_terminacao",
    nome: "Suíno Terminação (Lâmina d'água)",
    grupo: "Suínos",
    unidade: "cabeça",
    unidadeLabel: "cabeças",
    vol_biomassa_dia: 0.01,
    biogas_80pct: 0.16,
    ST: 2.44,
    SV: 76.2,
    biogas_kgSV: 474.5,
    densidade: 1022.5,
    TRH: 30
  },
  {
    id: "suino_crechario",
    nome: "Suíno Crechário (Lâmina d'água)",
    grupo: "Suínos",
    unidade: "cabeça",
    unidadeLabel: "cabeças",
    vol_biomassa_dia: 0.0014,
    biogas_80pct: 0.01,
    ST: 2.06,
    SV: 68.04,
    biogas_kgSV: 970.2,
    densidade: 1022.5,
    TRH: 30
  },
  {
    id: "suino_upl",
    nome: "Suíno UPL",
    grupo: "Suínos",
    unidade: "cabeça",
    unidadeLabel: "cabeças",
    vol_biomassa_dia: 0.0284,
    biogas_80pct: 0.34,
    ST: 3.9,
    SV: 66.7,
    biogas_kgSV: 215.4,
    densidade: 1022.5,
    TRH: 30
  },
  {
    id: "suino_matriz_upd",
    nome: "Suíno Matriz UPD",
    grupo: "Suínos",
    unidade: "cabeça",
    unidadeLabel: "cabeças",
    vol_biomassa_dia: 0.024,
    biogas_80pct: 0.28,
    ST: null,
    SV: null,
    biogas_kgSV: null,
    densidade: 479,
    TRH: 30
  },
  {
    id: "suino_abate",
    nome: "Suíno Abate (Resíduos Frigorífico)",
    grupo: "Suínos",
    unidade: "cabeça",
    unidadeLabel: "cabeças",
    vol_biomassa_dia: 0.15,
    biogas_80pct: 1.8,
    ST: 24.17,
    SV: 16.55,
    biogas_kgSV: null,
    densidade: null,
    TRH: 30
  },
  {
    id: "ciclo_completo",
    nome: "Ciclo Completo (Suíno)",
    grupo: "Suínos",
    unidade: "cabeça",
    unidadeLabel: "cabeças",
    vol_biomassa_dia: 0.09,
    biogas_80pct: 1.05,
    ST: null,
    SV: null,
    biogas_kgSV: null,
    densidade: null,
    TRH: 30
  },
  // ===== BOVINOS =====
  {
    id: "bovino_corte",
    nome: "Bovino de Corte (Raspagem)",
    grupo: "Bovinos",
    unidade: "cabeça",
    unidadeLabel: "cabeças",
    vol_biomassa_dia: 0.0606,
    biogas_80pct: 1.18,
    ST: 25.6,
    SV: 89.0,
    biogas_kgSV: 232.8,
    densidade: 990,
    TRH: 30
  },
  {
    id: "bovino_leite_compost",
    nome: "Bovino de Leite Compost",
    grupo: "Bovinos",
    unidade: "cabeça",
    unidadeLabel: "cabeças",
    vol_biomassa_dia: 0.0789,
    biogas_80pct: 1.34,
    ST: 4.3,
    SV: 75.7,
    biogas_kgSV: null,
    densidade: 1027,
    TRH: 30
  },
  {
    id: "bovino_leite_freestall",
    nome: "Bovino de Leite Free Stall",
    grupo: "Bovinos",
    unidade: "cabeça",
    unidadeLabel: "cabeças",
    vol_biomassa_dia: 0.124,
    biogas_80pct: 2.01,
    ST: 4.3,
    SV: 75.7,
    biogas_kgSV: 400,
    densidade: 1027,
    TRH: 30
  },
  {
    id: "bovino_abate",
    nome: "Bovino Abate (Resíduos Frigorífico)",
    grupo: "Bovinos",
    unidade: "cabeça",
    unidadeLabel: "cabeças",
    vol_biomassa_dia: 1.0,
    biogas_80pct: 3.6,
    ST: null,
    SV: null,
    biogas_kgSV: null,
    densidade: null,
    TRH: 30
  },
  // ===== AVES =====
  {
    id: "aves_corte_fresco",
    nome: "Aves de Corte (Cama de Frango) — lote fresco",
    grupo: "Aves",
    unidade: "cabeça",
    unidadeLabel: "cabeças",
    vol_biomassa_dia: 0.000004109,
    biogas_80pct: 0.000885,
    ST: 78.1,
    SV: 71.0,
    biogas_kgSV: 244.6,
    densidade: 1022.5,
    TRH: 30
  },
  {
    id: "aves_corte_6meses",
    nome: "Aves de Corte (Cama de Frango) 6 Meses",
    grupo: "Aves",
    unidade: "cabeça",
    unidadeLabel: "cabeças",
    vol_biomassa_dia: 0.000004109,
    biogas_80pct: 0.000963,
    ST: 80.0,
    SV: 68.8,
    biogas_kgSV: 251.8,
    densidade: 1022.5,
    TRH: 30
  },
  {
    id: "aves_corte_12meses",
    nome: "Aves de Corte (Cama de Frango) 12 Meses",
    grupo: "Aves",
    unidade: "cabeça",
    unidadeLabel: "cabeças",
    vol_biomassa_dia: 0.000004109,
    biogas_80pct: 0.000826,
    ST: 74.5,
    SV: 61.9,
    biogas_kgSV: 208.8,
    densidade: 1022.5,
    TRH: 30
  },
  {
    id: "aves_poedeiras",
    nome: "Aves Poedeiras (Raspagem)",
    grupo: "Aves",
    unidade: "cabeça",
    unidadeLabel: "cabeças",
    vol_biomassa_dia: 0.0015,
    biogas_80pct: 0.014,
    ST: 28.84,
    SV: 62.8,
    biogas_kgSV: null,
    densidade: null,
    TRH: 30
  },
  {
    id: "aves_abate",
    nome: "Aves Abate (Resíduos Frigorífico)",
    grupo: "Aves",
    unidade: "cabeça",
    unidadeLabel: "cabeças",
    vol_biomassa_dia: 0.03,
    biogas_80pct: 0.054,
    ST: null,
    SV: null,
    biogas_kgSV: null,
    densidade: null,
    TRH: 30
  },
  // ===== AGROINDUSTRIAL LÍQUIDO =====
  {
    id: "vinhaca_cana",
    nome: "Vinhaça de Cana",
    grupo: "Agroindustrial Líquido",
    unidade: "m³",
    unidadeLabel: "m³/dia de efluente",
    vol_biomassa_dia: 1.0,
    biogas_80pct: 7.0,
    ST: null,
    SV: null,
    biogas_kgSV: null,
    densidade: null,
    TRH: 30
  },
  {
    id: "vinhaca_milho",
    nome: "Vinhaça de Milho",
    grupo: "Agroindustrial Líquido",
    unidade: "m³",
    unidadeLabel: "m³/dia de efluente",
    vol_biomassa_dia: 1.0,
    biogas_80pct: 24.0,
    ST: null,
    SV: null,
    biogas_kgSV: null,
    densidade: null,
    TRH: 30
  },
  {
    id: "fecularia",
    nome: "Fecularia (mandioca)",
    grupo: "Agroindustrial Líquido",
    unidade: "m³",
    unidadeLabel: "m³/dia de efluente",
    vol_biomassa_dia: 1.0,
    biogas_80pct: 26.25,
    ST: null,
    SV: null,
    biogas_kgSV: null,
    densidade: null,
    TRH: 30
  },
  // ===== AGROINDUSTRIAL SÓLIDO / INDUSTRIAL =====
  {
    id: "rso",
    nome: "RSO — Resíduo Sólido Orgânico",
    grupo: "Agroindustrial Sólido",
    unidade: "tonelada",
    unidadeLabel: "toneladas/dia",
    vol_biomassa_dia: 1.0,
    biogas_80pct: 81.6,
    ST: 76.5,
    SV: 94.7,
    biogas_kgSV: 350,
    densidade: 1000,
    TRH: 30
  },
  {
    id: "rsu",
    nome: "RSU — Resíduo Sólido Urbano",
    grupo: "Agroindustrial Sólido",
    unidade: "tonelada",
    unidadeLabel: "toneladas/dia",
    vol_biomassa_dia: 1.0,
    biogas_80pct: 40.2,
    ST: 33.0,
    SV: 80.0,
    biogas_kgSV: null,
    densidade: null,
    TRH: 30
  },
  {
    id: "lisogoma",
    nome: "Lisogoma",
    grupo: "Agroindustrial Sólido",
    unidade: "tonelada",
    unidadeLabel: "toneladas/dia",
    vol_biomassa_dia: 1.0,
    biogas_80pct: 17.45,
    ST: 6.07,
    SV: 82.0,
    biogas_kgSV: 764,
    densidade: 1022.5,
    TRH: 21
  },
  {
    id: "lisogoma_potencial",
    nome: "Lisogoma — Potencial",
    grupo: "Agroindustrial Sólido",
    unidade: "tonelada",
    unidadeLabel: "toneladas/dia",
    vol_biomassa_dia: 1.0,
    biogas_80pct: 176.5,
    ST: 17.46,
    SV: 88.08,
    biogas_kgSV: 1113,
    densidade: 1022.5,
    TRH: 16
  },
  {
    id: "lodo_biodiesel",
    nome: "Lodo Flotado ETE Biodiesel",
    grupo: "Agroindustrial Sólido",
    unidade: "tonelada",
    unidadeLabel: "toneladas/dia",
    vol_biomassa_dia: 1.0,
    biogas_80pct: 67.25,
    ST: 6.06,
    SV: 91.63,
    biogas_kgSV: 1271,
    densidade: 1022.5,
    TRH: 36
  },
  {
    id: "lodo_belo_vale_tarde",
    nome: "Lodo Belo Vale Tarde",
    grupo: "Agroindustrial Sólido",
    unidade: "tonelada",
    unidadeLabel: "toneladas/dia",
    vol_biomassa_dia: 1.0,
    biogas_80pct: 67.25,
    ST: 8.59,
    SV: 96.29,
    biogas_kgSV: 812.58,
    densidade: 1022.5,
    TRH: 31
  },
  {
    id: "lodo_belo_vale_manha",
    nome: "Lodo Belo Vale Manhã",
    grupo: "Agroindustrial Sólido",
    unidade: "tonelada",
    unidadeLabel: "toneladas/dia",
    vol_biomassa_dia: 1.0,
    biogas_80pct: 67.25,
    ST: 20.1,
    SV: 95.2,
    biogas_kgSV: 350.56,
    densidade: 1022.5,
    TRH: 31
  }
];

// Interface do gerador
export interface Gerador {
  id: string;
  modelo: string;
  potencia_kw: number;          // Potência em kW
  consumo_nm3h: number;         // Consumo de biogás em Nm³/h
  fator_conversao: number;      // Fator de conversão de biogás para kWh
  preco_kit: number;            // Preço do kit completo (Preço de VENDA sem crédito ICMS)
}

// Catálogo de geradores - Preços de VENDA SEM CRÉDITO DE ICMS
// Extraído da aba BASE GERADORES da planilha EVTF
export const GERADORES: Gerador[] = [
  { 
    id: 'g75', 
    modelo: 'GMG FPT 04 75kW', 
    potencia_kw: 75, 
    consumo_nm3h: 40,            // Consumo de biogás em Nm³/h
    fator_conversao: 1.88,       // kWh por Nm³ de biogás
    preco_kit: 336000.00         // Preço de VENDA sem crédito ICMS
  },
  { 
    id: 'g108', 
    modelo: 'GMG FPT 06 108kW', 
    potencia_kw: 108, 
    consumo_nm3h: 56,
    fator_conversao: 1.93,       // kWh por Nm³ de biogás
    preco_kit: 395000.00         // Preço de VENDA sem crédito ICMS
  },
  { 
    id: 'g260', 
    modelo: 'GMG SCANIA OC13 260kW', 
    potencia_kw: 260, 
    consumo_nm3h: 118,
    fator_conversao: 2.20,       // kWh por Nm³ de biogás
    preco_kit: 972000.00         // Preço de VENDA sem crédito ICMS
  },
];

// Interface do sistema de tratamento de biogás
export interface SistemaTratamento {
  secador: number;           // Preço do secador de biogás
  filtro_carvao: number;     // Preço do filtro de carvão ativado
  biodessulfurizacao: number; // Preço do sistema de biodessulfurização
  total: number;             // Preço total do tratamento
}

// Calcular preço do sistema de tratamento (Preço de VENDA)
// Valores baseados na potência do gerador
export function calcularTratamento(potenciaKw: number): SistemaTratamento {
  let secador: number;
  let filtro_carvao: number;
  let biodessulfurizacao: number;
  
  if (potenciaKw <= 75) {
    secador = 25000;
    filtro_carvao = 12000;
    biodessulfurizacao = 8000;
  } else if (potenciaKw <= 108) {
    secador = 35000;
    filtro_carvao = 18000;
    biodessulfurizacao = 12000;
  } else {
    secador = 60000;
    filtro_carvao = 30000;
    biodessulfurizacao = 20000;
  }
  
  return {
    secador,
    filtro_carvao,
    biodessulfurizacao,
    total: secador + filtro_carvao + biodessulfurizacao
  };
}

// Interface do modelo de biodigestor
export interface ModeloBiodigestor {
  volume: number;
  nome: string;
  dimensoes: string;
  preco: number;  // Preço de VENDA (padrão, sem BDI adicional)
}

// Interface do tipo de biodigestor
export interface TipoBiodigestor {
  nome: string;
  descricao: string;
  modelos: ModeloBiodigestor[];
}

// Catálogo de biodigestores
// Fórmula: Preço de Venda = Custo ÷ (1 − 30,192%) = Custo × 1,4325
// Extraído da aba CAPEX 1 da planilha EVTF
export const BIODIGESTORES: Record<string, TipoBiodigestor> = {
  // BIODIGESTORES CIRCULARES (Mistura Completa)
  // Indicado para: ST intermediário. TRH padrão: 30 dias.
  blc_circular: {
    nome: 'BLC Circular',
    descricao: 'Biodigestor de Mistura Completa — Circular',
    modelos: [
      { volume: 1500, nome: 'BLC-C1500', dimensoes: 'Ø25m × 4,5m prof', preco: 260182.30 },
      { volume: 2000, nome: 'BLC-C2000', dimensoes: 'Ø28m × 4,5m prof', preco: 292928.98 },
      { volume: 2500, nome: 'BLC-C2500', dimensoes: 'Ø30m × 4,5m prof', preco: 416345.58 },
      { volume: 3000, nome: 'BLC-C3000', dimensoes: 'Ø34m × 4,5m prof', preco: 449063.60 },
      { volume: 3500, nome: 'BLC-C3500', dimensoes: 'Ø36m × 4,5m prof', preco: 451155.05 },
      { volume: 4000, nome: 'BLC-C4000', dimensoes: 'Ø38m × 4,5m prof', preco: 581705.51 },
      { volume: 4500, nome: 'BLC-C4500', dimensoes: 'Ø40m × 4,5m prof', preco: 614394.88 },
      { volume: 5000, nome: 'BLC-C5000', dimensoes: 'Ø42m × 4,5m prof', preco: 622202.01 },
    ]
  },

  // BIODIGESTORES RETANGULARES BLC
  // Indicado para: maiores volumes. TRH padrão: 30 dias.
  blc_retangular: {
    nome: 'BLC Retangular',
    descricao: 'Biodigestor de Mistura Completa — Retangular',
    modelos: [
      { volume: 2000, nome: 'BLC-R2000', dimensoes: '46m × 15m × 4,5m', preco: 315711.18 },
      { volume: 3000, nome: 'BLC-R3000', dimensoes: '54m × 18m × 4,5m', preco: 340140.76 },
      { volume: 4000, nome: 'BLC-R4000', dimensoes: '60m × 21m × 4,5m', preco: 476157.63 },
      { volume: 5000, nome: 'BLC-R5000', dimensoes: '67m × 22m × 4,5m', preco: 481002.06 },
      { volume: 6000, nome: 'BLC-R6000', dimensoes: '73m × 24m × 4,5m', preco: 707027.33 },
      { volume: 7000, nome: 'BLC-R7000', dimensoes: '75m × 25m × 5m', preco: 711138.61 },
      { volume: 8000, nome: 'BLC-R8000', dimensoes: '77m × 26m × 5,5m', preco: 989079.99 },
      { volume: 9000, nome: 'BLC-R9000', dimensoes: '81m × 27m × 5,5m', preco: 1043949.92 },
      { volume: 10000, nome: 'BLC-R10000', dimensoes: '85m × 28m × 5,5m', preco: 1048075.52 },
      { volume: 12000, nome: 'BLC-R12000', dimensoes: '90m × 30m × 6m', preco: 1052258.42 },
      { volume: 14000, nome: 'BLC-R14000', dimensoes: '96m × 32m × 6m', preco: 1362932.16 },
      { volume: 20000, nome: 'BLC-R20000', dimensoes: '116m × 39m × 6m', preco: 1520155.97 },
    ]
  },

  // LAGOAS DE DIGESTATO
  // Para armazenamento e tratamento secundário
  lagoa_digestato: {
    nome: 'Lagoa de Digestato',
    descricao: 'Lagoa para armazenamento de digestato',
    modelos: [
      { volume: 2000, nome: 'LD-2000', dimensoes: '46m × 15m × 4,5m', preco: 81762.26 },
      { volume: 3000, nome: 'LD-3000', dimensoes: '54m × 18m × 4,5m', preco: 101894.34 },
      { volume: 4000, nome: 'LD-4000', dimensoes: '60m × 21m × 4,5m', preco: 107002.75 },
      { volume: 5000, nome: 'LD-5000', dimensoes: '67m × 22m × 4,5m', preco: 127134.83 },
      { volume: 6000, nome: 'LD-6000', dimensoes: '73m × 24m × 4,5m', preco: 127175.97 },
      { volume: 7000, nome: 'LD-7000', dimensoes: '75m × 25m × 5m', preco: 132243.24 },
      { volume: 8000, nome: 'LD-8000', dimensoes: '77m × 26m × 5,5m', preco: 166078.73 },
      { volume: 9000, nome: 'LD-9000', dimensoes: '81m × 27m × 5,5m', preco: 186210.81 },
      { volume: 10000, nome: 'LD-10000', dimensoes: '85m × 28m × 5,5m', preco: 191319.22 },
      { volume: 12000, nome: 'LD-12000', dimensoes: '90m × 30m × 6m', preco: 196427.63 },
      { volume: 14000, nome: 'LD-14000', dimensoes: '96m × 32m × 6m', preco: 230263.12 },
      { volume: 20000, nome: 'LD-20000', dimensoes: '116m × 39m × 6m', preco: 318454.05 },
    ]
  },

  // COBERTURAS DE LAGOA RETANGULAR
  // Para captação de biogás em lagoas existentes
  cobertura_lagoa: {
    nome: 'Cobertura de Lagoa',
    descricao: 'Cobertura retangular para captação de biogás',
    modelos: [
      { volume: 2000, nome: 'CL-2000', dimensoes: '46m × 15m × 4,5m', preco: 137777.05 },
      { volume: 3000, nome: 'CL-3000', dimensoes: '54m × 18m × 4,5m', preco: 138017.71 },
      { volume: 4000, nome: 'CL-4000', dimensoes: '60m × 21m × 4,5m', preco: 181711.55 },
      { volume: 5000, nome: 'CL-5000', dimensoes: '67m × 22m × 4,5m', preco: 181894.91 },
      { volume: 6000, nome: 'CL-6000', dimensoes: '73m × 24m × 4,5m', preco: 194919.21 },
      { volume: 7000, nome: 'CL-7000', dimensoes: '75m × 25m × 5m', preco: 194999.43 },
      { volume: 8000, nome: 'CL-8000', dimensoes: '77m × 26m × 5,5m', preco: 248428.55 },
      { volume: 9000, nome: 'CL-9000', dimensoes: '81m × 27m × 5,5m', preco: 279166.86 },
      { volume: 10000, nome: 'CL-10000', dimensoes: '85m × 28m × 5,5m', preco: 290426.31 },
      { volume: 12000, nome: 'CL-12000', dimensoes: '90m × 30m × 6m', preco: 303427.69 },
      { volume: 14000, nome: 'CL-14000', dimensoes: '96m × 32m × 6m', preco: 389743.87 },
      { volume: 20000, nome: 'CL-20000', dimensoes: '116m × 39m × 6m', preco: 473295.32 },
    ]
  },

  // LAGOA COBERTA (compatibilidade com versão anterior)
  lagoa_coberta: {
    nome: 'Lagoa Coberta',
    descricao: 'Lagoa com Cobertura — para efluentes líquidos (ST ≤ 2%)',
    modelos: [
      { volume: 2000, nome: 'LC-2000', dimensoes: '46m × 15m × 4,5m', preco: 219539.31 },
      { volume: 3000, nome: 'LC-3000', dimensoes: '54m × 18m × 4,5m', preco: 239912.05 },
      { volume: 4000, nome: 'LC-4000', dimensoes: '60m × 21m × 4,5m', preco: 288714.30 },
      { volume: 5000, nome: 'LC-5000', dimensoes: '67m × 22m × 4,5m', preco: 309029.74 },
      { volume: 6000, nome: 'LC-6000', dimensoes: '73m × 24m × 4,5m', preco: 322444.18 },
      { volume: 7000, nome: 'LC-7000', dimensoes: '75m × 25m × 5m', preco: 327242.66 },
      { volume: 8000, nome: 'LC-8000', dimensoes: '77m × 26m × 5,5m', preco: 414507.28 },
      { volume: 9000, nome: 'LC-9000', dimensoes: '81m × 27m × 5,5m', preco: 465377.67 },
      { volume: 10000, nome: 'LC-10000', dimensoes: '85m × 28m × 5,5m', preco: 481745.53 },
      { volume: 12000, nome: 'LC-12000', dimensoes: '90m × 30m × 6m', preco: 499586.11 },
      { volume: 14000, nome: 'LC-14000', dimensoes: '96m × 32m × 6m', preco: 620006.99 },
      { volume: 20000, nome: 'LC-20000', dimensoes: '116m × 39m × 6m', preco: 791750.37 },
    ]
  },
};

// Estados do Brasil
export const ESTADOS_BRASIL = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' },
];

// Tarifas de energia por estado (R$/kWh)
export const TARIFAS_ESTADO: Record<string, number> = {
  AC: 0.72, AL: 0.68, AP: 0.75, AM: 0.78, BA: 0.65,
  CE: 0.70, DF: 0.62, ES: 0.68, GO: 0.58, MA: 0.72,
  MT: 0.55, MS: 0.60, MG: 0.68, PA: 0.76, PB: 0.70,
  PR: 0.58, PE: 0.72, PI: 0.74, RJ: 0.72, RN: 0.72,
  RS: 0.65, RO: 0.72, RR: 0.78, SC: 0.62, SE: 0.70,
  SP: 0.62, TO: 0.70,
};

// Constantes de cálculo
export const VIDA_UTIL_ANOS = 20;
export const PERCENTUAL_EQUIPAMENTOS_CAPEX = 0.85;
export const PERCENTUAL_INFRAESTRUTURA_CAPEX = 0.15;

// Tarifas de venda de energia padrão (R$/kWh)
export const TARIFAS_VENDA_PADRAO = {
  pessimista: 0.30,
  realista: 0.45,
  otimista: 0.60,
};

export interface TarifasVendaEnergia {
  pessimista: number;
  realista: number;
  otimista: number;
}

// Tipo de frequência de parcelas
export type FrequenciaParcela = 'mensal' | 'trimestral' | 'semestral' | 'anual';

// Parâmetros de financiamento padrão
export interface ParametrosFinanciamento {
  prazoAnos: number;
  carenciaAnos: number;
  taxaJurosAnual: number;
  descontoTaxaJuros: number;
  percentualEntrada: number;
  frequenciaParcela: FrequenciaParcela;
}

export const FINANCIAMENTO_PADRAO: ParametrosFinanciamento = {
  prazoAnos: 12,
  carenciaAnos: 2,
  taxaJurosAnual: 8.5,
  descontoTaxaJuros: 5,
  percentualEntrada: 5,
  frequenciaParcela: 'anual',
};

// Fator de multiplicação por frequência
export const FATORES_FREQUENCIA: Record<FrequenciaParcela, number> = {
  mensal: 12,
  trimestral: 4,
  semestral: 2,
  anual: 1,
};

// Parâmetros de Custos com Manutenção
export interface ParametrosManutencao {
  custoKm: number;
  distanciaKm: number;
  custoHoraGerador: number;
  frequenciaMensal: number;
  horasTecnicasVisita: number;
  custoHoraTecnico: number;
  diariaHospedagem: number;
  alimentacaoDiaria: number;
}

export const MANUTENCAO_PADRAO: ParametrosManutencao = {
  custoKm: 2.10,
  distanciaKm: 100,
  custoHoraGerador: 7.46,
  frequenciaMensal: 2,
  horasTecnicasVisita: 12,
  custoHoraTecnico: 60.00,
  diariaHospedagem: 200.00,
  alimentacaoDiaria: 100.00,
};

// Opções de eficiência do sistema
export const EFICIENCIA_OPCOES = [
  { valor: 60, label: '60% — Solução de Geração', fator: 0.75 },
  { valor: 80, label: '80% — Solução Completa (Padrão)', fator: 1.0 },
  { valor: 100, label: '100% — Máxima Eficiência', fator: 1.25 },
];
