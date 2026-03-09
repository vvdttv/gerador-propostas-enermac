'use client'

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator, 
  Printer, 
  FileDown, 
  Zap, 
  Droplets, 
  Factory, 
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  DollarSign,
  Shield,
  PiggyBank,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Bolt
} from 'lucide-react';
import { CORES } from '@/lib/enermac-colors';
import { 
  GRUPOS_SUBSTRATO, 
  SUBSTRATOS, 
  ESTADOS_BRASIL,
  PERCENTUAL_EQUIPAMENTOS_CAPEX,
  TARIFAS_VENDA_PADRAO,
  FINANCIAMENTO_PADRAO,
  MANUTENCAO_PADRAO,
  type TarifasVendaEnergia,
  type ParametrosFinanciamento,
  type ParametrosManutencao,
  type FrequenciaParcela
} from '@/lib/enermac-data';
import { 
  calcularProposta, 
  recalcularCapex,
  calcularFinanciamento,
  calcularManutencao,
  calcularCenariosCompletos,
  calcularFluxoCaixa10Anos,
  formatarMoeda, 
  formatarNumero,
  formatarInteiro,
  MARGEM_SEGURANCA_BIODIGESTOR,
  type ResultadoProposta,
  type ResultadoFinanciamento,
  type ResultadoManutencao,
  type CenarioViabilidade,
  type CenariosCompletos,
  type FluxoCaixa10Anos
} from '@/lib/enermac-utils';

export default function Home() {
  // Estados do formulário - Dados do cliente
  const [nomePropriedade, setNomePropriedade] = useState<string>('');
  const [nomePessoa, setNomePessoa] = useState<string>('');
  const [telefone, setTelefone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [cidade, setCidade] = useState<string>('');
  const [gastoMensalEnergia, setGastoMensalEnergia] = useState<string>('');
  
  // Estados do formulário - Dados técnicos
  const [substratoId, setSubstratoId] = useState<string>('');
  const [quantidade, setQuantidade] = useState<string>('');
  const [eficiencia, setEficiencia] = useState<string>('80');
  const [estado, setEstado] = useState<string>('PR');
  
  // Estados de quantidades customizáveis (permite zero)
  const [qtdBiodigestores, setQtdBiodigestores] = useState<string>('1');
  const [qtdGeradores, setQtdGeradores] = useState<string>('1');
  const [qtdTratamentos, setQtdTratamentos] = useState<string>('1');
  
  // Estados de descontos (máximo 5%)
  const [descontoBiodigestor, setDescontoBiodigestor] = useState<string>('0');
  const [descontoGerador, setDescontoGerador] = useState<string>('0');
  const [descontoTratamento, setDescontoTratamento] = useState<string>('0');
  
  // Handlers para limitar desconto máximo a 5%
  const handleDescontoBiodigestor = (value: string) => {
    const num = parseFloat(value) || 0;
    const limitado = Math.min(Math.max(0, num), 5);
    setDescontoBiodigestor(limitado.toString());
  };
  
  const handleDescontoGerador = (value: string) => {
    const num = parseFloat(value) || 0;
    const limitado = Math.min(Math.max(0, num), 5);
    setDescontoGerador(limitado.toString());
  };
  
  const handleDescontoTratamento = (value: string) => {
    const num = parseFloat(value) || 0;
    const limitado = Math.min(Math.max(0, num), 5);
    setDescontoTratamento(limitado.toString());
  };
  
  // Estado para contrato de manutenção
  const [comContratoManutencao, setComContratoManutencao] = useState<boolean>(true);
  
  // Estados de tarifas de venda de energia (editáveis)
  const [tarifasVenda, setTarifasVenda] = useState<TarifasVendaEnergia>(TARIFAS_VENDA_PADRAO);
  
  // Estados de financiamento (editáveis)
  const [financiamento, setFinanciamento] = useState<ParametrosFinanciamento>(FINANCIAMENTO_PADRAO);
  
  // Estados de custos com manutenção (editáveis)
  const [manutencao, setManutencao] = useState<ParametrosManutencao>(MANUTENCAO_PADRAO);
  
  // Estado do resultado
  const [resultado, setResultado] = useState<ResultadoProposta | null>(null);
  const [geradorSelecionadoIndex, setGeradorSelecionadoIndex] = useState<number>(0);
  const [calculado, setCalculado] = useState(false);
  const [gerandoPdf, setGerandoPdf] = useState(false);

  // Obter substrato selecionado
  const substratoSelecionado = useMemo(() => {
    return SUBSTRATOS.find(s => s.id === substratoId);
  }, [substratoId]);

  // Label dinâmico para o campo quantidade
  const labelQuantidade = useMemo(() => {
    if (!substratoSelecionado) return 'Quantidade';
    return `Quantidade (${substratoSelecionado.unidadeLabel})`;
  }, [substratoSelecionado]);

  // Obter gerador selecionado com quantidades e descontos aplicadas
  const geradorComQuantidades = useMemo(() => {
    if (!resultado || geradorSelecionadoIndex < 0) return null;
    
    const g = resultado.geradores[geradorSelecionadoIndex];
    const qtdBio = Math.max(0, parseInt(qtdBiodigestores) || 0);
    const qtdGer = Math.max(0, parseInt(qtdGeradores) || 0);
    const qtdTrat = Math.max(0, parseInt(qtdTratamentos) || 0);
    
    // Permite zero em todos - o CAPEX será zero, mas os cenários ainda serão mostrados
    
    // Obter descontos (já limitados a 5% pelos handlers)
    const descBio = parseFloat(descontoBiodigestor) || 0;
    const descGer = parseFloat(descontoGerador) || 0;
    const descTrat = parseFloat(descontoTratamento) || 0;
    
    const capex = recalcularCapex(g, qtdBio, qtdGer, qtdTrat, descBio, descGer, descTrat);
    
    return {
      ...g,
      ...capex,
      qtdGeradores: qtdGer,
    };
  }, [resultado, geradorSelecionadoIndex, qtdBiodigestores, qtdGeradores, qtdTratamentos, descontoBiodigestor, descontoGerador, descontoTratamento]);

  // Calcular financiamento
  const resultadoFinanciamento = useMemo(() => {
    if (!geradorComQuantidades) return null;
    
    return calcularFinanciamento(
      geradorComQuantidades.capexTotal,
      financiamento.prazoAnos,
      financiamento.carenciaAnos,
      financiamento.taxaJurosAnual,
      financiamento.descontoTaxaJuros,
      financiamento.percentualEntrada,
      financiamento.frequenciaParcela
    );
  }, [geradorComQuantidades, financiamento]);

  // Calcular custos de manutenção
  const resultadoManutencao = useMemo(() => {
    if (!geradorComQuantidades || !comContratoManutencao) return null;
    
    // Horas de funcionamento do gerador por dia
    const qtdGer = Math.max(0, parseInt(qtdGeradores) || 0);
    const horasFuncionamentoDia = geradorComQuantidades.horasReaisPorGerador * qtdGer;
    
    return calcularManutencao(manutencao, horasFuncionamentoDia);
  }, [geradorComQuantidades, manutencao, qtdGeradores, comContratoManutencao]);

  // Calcular cenários de viabilidade (com e sem manutenção)
  const cenariosViabilidade = useMemo(() => {
    if (!geradorComQuantidades || !resultadoFinanciamento) return null;
    
    const gastoMensal = parseFloat(gastoMensalEnergia) || 0;
    const qtdGer = Math.max(0, parseInt(qtdGeradores) || 0);
    
    // Se não tiver contrato de manutenção, cria um resultado de manutenção com zeros
    const manutencaoParaCalculo = resultadoManutencao || {
      distanciaKm: manutencao.distanciaKm,
      horasFuncionamentoGeradorDia: 0,
      qtdDiarias: 0,
      qtdAlimentacao: 0,
      despesasDiariasAlimentacao: 0,
      custoFixoPorVisita: 0,
      custoFixoMensal: 0,
      custoVariavelMensal: 0,
      custoTotalMensal: 0,
    };
    
    return calcularCenariosCompletos(
      geradorComQuantidades.kwhDia,
      geradorComQuantidades.kwhMes,
      geradorComQuantidades.kwhAno,
      tarifasVenda,
      gastoMensal,
      resultadoFinanciamento,
      manutencaoParaCalculo,
      qtdGer,
      geradorComQuantidades.capexTotal
    );
  }, [geradorComQuantidades, resultadoFinanciamento, resultadoManutencao, tarifasVenda, gastoMensalEnergia, manutencao, qtdGeradores]);

  // Calcular fluxo de caixa de 10 anos
  const fluxoCaixa10Anos = useMemo((): FluxoCaixa10Anos | null => {
    if (!geradorComQuantidades || !resultadoFinanciamento) return null;
    
    const gastoMensal = parseFloat(gastoMensalEnergia) || 0;
    const custoManutencao = comContratoManutencao && resultadoManutencao 
      ? resultadoManutencao.custoTotalMensal 
      : 0;
    
    return calcularFluxoCaixa10Anos(
      geradorComQuantidades.kwhAno,
      gastoMensal,
      tarifasVenda.realista,
      resultadoFinanciamento,
      custoManutencao,
      resultadoFinanciamento.valorEntrada
    );
  }, [geradorComQuantidades, resultadoFinanciamento, gastoMensalEnergia, tarifasVenda.realista, comContratoManutencao, resultadoManutencao]);

  // Função para calcular
  const handleCalcular = () => {
    const qtd = parseFloat(quantidade);
    if (!substratoId || isNaN(qtd) || qtd <= 0) {
      return;
    }

    const ef = parseInt(eficiencia);
    const result = calcularProposta(substratoId, qtd, ef);
    
    if (result) {
      setResultado(result);
      setGeradorSelecionadoIndex(0); // Primeiro gerador por padrão
      setCalculado(true);
      
      // Resetar quantidades para 1
      setQtdBiodigestores('1');
      setQtdGeradores('1');
      setQtdTratamentos('1');
      
      // Resetar descontos para 0
      setDescontoBiodigestor('0');
      setDescontoGerador('0');
      setDescontoTratamento('0');
    }
  };

  // Função para selecionar gerador
  const handleSelecionarGerador = (index: number) => {
    if (!resultado) return;
    setGeradorSelecionadoIndex(index);
    
    // Resetar quantidade de geradores para 1 ao mudar de gerador
    setQtdGeradores('1');
  };



  // Função para exportar PDF
  const handleExportarPdf = async () => {
    if (!resultado || !geradorComQuantidades) return;
    
    setGerandoPdf(true);
    
    try {
      const estadoObjCliente = ESTADOS_BRASIL.find(e => e.sigla === estado);
      
      // Calcular preços com desconto
      const precoBiodigestorFinal = resultado.biodigestor.modeloSelecionado.preco * parseInt(qtdBiodigestores || '0') * (1 - (parseFloat(descontoBiodigestor || '0') / 100));
      const precoGeradorFinal = geradorComQuantidades.precoGeradorUnitario * parseInt(qtdGeradores || '0') * (1 - (parseFloat(descontoGerador || '0') / 100));
      const precoTratamentoFinal = geradorComQuantidades.precoTratamentoTotalUnitario * parseInt(qtdTratamentos || '0') * (1 - (parseFloat(descontoTratamento || '0') / 100));
      const totalEquipamentos = precoBiodigestorFinal + precoGeradorFinal + precoTratamentoFinal;
      
      // Sinal de 5%
      const valorSinal = totalEquipamentos * 0.05;
      
      const dadosProposta = {
        cliente: {
          nomePropriedade,
          nomePessoa,
          telefone,
          email,
          cidade,
          estado: estadoObjCliente?.nome || estado,
          estadoSigla: estado,
        },
        fonteGeradora: {
          id: substratoId,
          nome: substratoSelecionado?.nome || '',
          quantidade: parseFloat(quantidade),
          unidade: substratoSelecionado?.unidadeLabel || '',
        },
        gastoMensalEnergia: parseFloat(gastoMensalEnergia) || 0,
        geracao: {
          kwhMes: geradorComQuantidades.kwhMes * parseInt(qtdGeradores),
          receitaMes: geradorComQuantidades.kwhMes * tarifasVenda.realista * parseInt(qtdGeradores),
        },
        cenarios: {
          pessimista: tarifasVenda.pessimista,
          realista: tarifasVenda.realista,
          otimista: tarifasVenda.otimista,
        },
        // Produtos selecionados
        produtos: {
          biodigestor: {
            selecionado: parseInt(qtdBiodigestores || '0') > 0,
            quantidade: parseInt(qtdBiodigestores || '0'),
            tipo: resultado.biodigestor.tipoRecomendado,
            volume: resultado.biodigestor.volumeComMargem,
            dimensoes: resultado.biodigestor.modeloSelecionado.dimensoes,
            precoUnitario: resultado.biodigestor.modeloSelecionado.preco,
            desconto: parseFloat(descontoBiodigestor || '0'),
            precoFinal: precoBiodigestorFinal,
          },
          gerador: {
            selecionado: parseInt(qtdGeradores || '0') > 0,
            quantidade: parseInt(qtdGeradores || '0'),
            modelo: geradorComQuantidades.gerador.modelo,
            potencia: geradorComQuantidades.gerador.potencia_kw,
            precoUnitario: geradorComQuantidades.precoGeradorUnitario,
            desconto: parseFloat(descontoGerador || '0'),
            precoFinal: precoGeradorFinal,
          },
          tratamento: {
            selecionado: parseInt(qtdTratamentos || '0') > 0,
            quantidade: parseInt(qtdTratamentos || '0'),
            componentes: 'Secador + Filtro Carvão + Biodessulfurização',
            precoUnitario: geradorComQuantidades.precoTratamentoTotalUnitario,
            desconto: parseFloat(descontoTratamento || '0'),
            precoFinal: precoTratamentoFinal,
          },
          totalEquipamentos,
          capexTotal: geradorComQuantidades.capexTotal,
          valorSinal,
        },
        // Contrato de manutenção
        manutencao: {
          comContrato: comContratoManutencao,
          custoMensal: resultadoManutencao?.custoTotalMensal || 0,
        },
        // Fluxo de caixa de 10 anos
        fluxoCaixa10Anos: fluxoCaixa10Anos ? {
          anos: fluxoCaixa10Anos.anos.map(ano => ({
            ano: ano.ano,
            fase: ano.fase,
            receitaTotal: ano.receitaTotal,
            despesaTotal: ano.despesaTotal,
            resultadoAno: ano.resultadoAno,
            acumulado: ano.acumulado,
          })),
          totalReceitas: fluxoCaixa10Anos.totalReceitas,
          totalDespesas: fluxoCaixa10Anos.totalDespesas,
          resultadoFinal: fluxoCaixa10Anos.resultadoFinal,
          taxaTarifa: fluxoCaixa10Anos.taxaTarifa,
        } : null,
        // Average monthly net results for PDF
        cenariosResultadoMedio: {
          pessimista: cenariosViabilidade?.semManutencao[0]?.resultadoLiquidoMedioMensal || 0,
          realista: cenariosViabilidade?.semManutencao[1]?.resultadoLiquidoMedioMensal || 0,
          otimista: cenariosViabilidade?.semManutencao[2]?.resultadoLiquidoMedioMensal || 0,
        },
        dataEmissao: new Date().toLocaleDateString('pt-BR'),
      };
      
      const response = await fetch('/api/gerar-proposta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosProposta),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao gerar PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proposta-enermac-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao gerar o PDF. Tente novamente.');
    } finally {
      setGerandoPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Logo Enermac */}
            <img 
              src="/enermac_logo_oficial.png" 
              alt="Enermac - Gerador de Pré-propostas" 
              className="flex-shrink-0 h-10 w-auto object-contain"
            />
            <span className="text-xs text-gray-500 hidden sm:inline">
              Gerador de Pré-propostas
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Seção de Dados de Entrada */}
        <Card className="mb-6">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="w-5 h-5" style={{ color: CORES.AZUL_PRINCIPAL }} />
              Dados de Entrada
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Fonte Geradora */}
              <div className="space-y-2">
                <Label htmlFor="substrato">Fonte Geradora</Label>
                <Select value={substratoId} onValueChange={setSubstratoId}>
                  <SelectTrigger id="substrato" className="w-full">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {GRUPOS_SUBSTRATO.map(grupo => (
                      <SelectGroup key={grupo.id}>
                        <SelectLabel>{grupo.nome}</SelectLabel>
                        {SUBSTRATOS
                          .filter(s => s.grupo === grupo.id)
                          .map(s => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.nome}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantidade */}
              <div className="space-y-2">
                <Label htmlFor="quantidade">{labelQuantidade}</Label>
                <Input
                  id="quantidade"
                  type="number"
                  placeholder="0"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  min="0"
                  step="1"
                />
              </div>

              {/* Eficiência */}
              <div className="space-y-2">
                <Label htmlFor="eficiencia">Eficiência</Label>
                <Select value={eficiencia} onValueChange={setEficiencia}>
                  <SelectTrigger id="eficiencia" className="w-full">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">60%</SelectItem>
                    <SelectItem value="80">80% (Padrão)</SelectItem>
                    <SelectItem value="100">100%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dados do Cliente */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Dados do Cliente
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomePropriedade">Nome da Propriedade</Label>
                  <Input
                    id="nomePropriedade"
                    type="text"
                    placeholder="Ex: Fazenda São João"
                    value={nomePropriedade}
                    onChange={(e) => setNomePropriedade(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nomePessoa">Nome do Responsável</Label>
                  <Input
                    id="nomePessoa"
                    type="text"
                    placeholder="Ex: João da Silva"
                    value={nomePessoa}
                    onChange={(e) => setNomePessoa(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    type="tel"
                    placeholder="Ex: (44) 99999-9999"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ex: joao@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    type="text"
                    placeholder="Ex: Cascavel"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estadoCliente">Estado</Label>
                  <Select value={estado} onValueChange={setEstado}>
                    <SelectTrigger id="estadoCliente" className="w-full">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {ESTADOS_BRASIL.map(e => (
                        <SelectItem key={e.sigla} value={e.sigla}>
                          {e.sigla} - {e.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gastoMensal">Gasto Mensal com Energia (R$)</Label>
                  <Input
                    id="gastoMensal"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ex: 5000"
                    value={gastoMensalEnergia}
                    onChange={(e) => setGastoMensalEnergia(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Tarifas de Venda de Energia */}
            <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: '#FFF3E0', borderColor: CORES.LARANJA_CLARO }}>
              <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: CORES.LARANJA_ESCURO }}>
                <Zap className="w-4 h-4" />
                Tarifas de Venda de Energia (R$/kWh)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tarifaPessimista" className="text-red-700">Cenário Pessimista</Label>
                  <Input
                    id="tarifaPessimista"
                    type="number"
                    step="0.01"
                    value={tarifasVenda.pessimista}
                    onChange={(e) => setTarifasVenda(prev => ({ ...prev, pessimista: parseFloat(e.target.value) || 0 }))}
                    className="border-red-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tarifaRealista" className="text-blue-700">Cenário Realista</Label>
                  <Input
                    id="tarifaRealista"
                    type="number"
                    step="0.01"
                    value={tarifasVenda.realista}
                    onChange={(e) => setTarifasVenda(prev => ({ ...prev, realista: parseFloat(e.target.value) || 0 }))}
                    className="border-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tarifaOtimista" className="text-green-700">Cenário Otimista</Label>
                  <Input
                    id="tarifaOtimista"
                    type="number"
                    step="0.01"
                    value={tarifasVenda.otimista}
                    onChange={(e) => setTarifasVenda(prev => ({ ...prev, otimista: parseFloat(e.target.value) || 0 }))}
                    className="border-green-200"
                  />
                </div>
              </div>
            </div>

            {/* Parâmetros de Financiamento */}
            <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: '#E3F2FD', borderColor: CORES.AZUL_CLARO }}>
              <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: CORES.AZUL_ESCURO }}>
                <DollarSign className="w-4 h-4" />
                Parâmetros de Financiamento
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prazoAnos">Prazo (anos)</Label>
                  <Input
                    id="prazoAnos"
                    type="number"
                    min="1"
                    max="20"
                    value={financiamento.prazoAnos}
                    onChange={(e) => setFinanciamento(prev => ({ ...prev, prazoAnos: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carenciaAnos">Carência (anos)</Label>
                  <Input
                    id="carenciaAnos"
                    type="number"
                    min="0"
                    max="5"
                    value={financiamento.carenciaAnos}
                    onChange={(e) => setFinanciamento(prev => ({ ...prev, carenciaAnos: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxaJuros">Taxa de Juros (% a.a.)</Label>
                  <Input
                    id="taxaJuros"
                    type="number"
                    step="0.1"
                    min="0"
                    value={financiamento.taxaJurosAnual}
                    onChange={(e) => setFinanciamento(prev => ({ ...prev, taxaJurosAnual: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descontoTaxa">Desconto na Taxa (%)</Label>
                  <Input
                    id="descontoTaxa"
                    type="number"
                    step="0.1"
                    min="0"
                    value={financiamento.descontoTaxaJuros}
                    onChange={(e) => setFinanciamento(prev => ({ ...prev, descontoTaxaJuros: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="frequenciaParcela">Frequência das Parcelas</Label>
                  <Select 
                    value={financiamento.frequenciaParcela} 
                    onValueChange={(val) => setFinanciamento(prev => ({ ...prev, frequenciaParcela: val as FrequenciaParcela }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                      <SelectItem value="semestral">Semestral</SelectItem>
                      <SelectItem value="anual">Anual (Padrão)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-3">
                * Parcelas cobradas conforme frequência selecionada. Na carência, paga-se apenas juros.
              </p>
            </div>

            {/* Custos com Manutenção */}
            <div className="mt-4 p-4 rounded-lg border bg-green-50 border-green-200">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                <Factory className="w-4 h-4" />
                Custos com Manutenção
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="custoKm">Custo por km (R$)</Label>
                  <Input
                    id="custoKm"
                    type="number"
                    step="0.01"
                    min="0"
                    value={manutencao.custoKm}
                    onChange={(e) => setManutencao(prev => ({ ...prev, custoKm: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distanciaKm">Distância Enermac × Propriedade (km)</Label>
                  <Input
                    id="distanciaKm"
                    type="number"
                    min="0"
                    value={manutencao.distanciaKm}
                    onChange={(e) => setManutencao(prev => ({ ...prev, distanciaKm: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custoHoraGerador">Custo/hora gerador (R$)</Label>
                  <Input
                    id="custoHoraGerador"
                    type="number"
                    step="0.01"
                    min="0"
                    value={manutencao.custoHoraGerador}
                    onChange={(e) => setManutencao(prev => ({ ...prev, custoHoraGerador: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequenciaMensal">Frequência mensal de manutenção</Label>
                  <Input
                    id="frequenciaMensal"
                    type="number"
                    min="1"
                    value={manutencao.frequenciaMensal}
                    onChange={(e) => setManutencao(prev => ({ ...prev, frequenciaMensal: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="horasTecnicasVisita">Horas técnicas por visita</Label>
                  <Input
                    id="horasTecnicasVisita"
                    type="number"
                    min="1"
                    value={manutencao.horasTecnicasVisita}
                    onChange={(e) => setManutencao(prev => ({ ...prev, horasTecnicasVisita: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custoHoraTecnico">Custo/hora técnico (R$)</Label>
                  <Input
                    id="custoHoraTecnico"
                    type="number"
                    step="0.01"
                    min="0"
                    value={manutencao.custoHoraTecnico}
                    onChange={(e) => setManutencao(prev => ({ ...prev, custoHoraTecnico: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diariaHospedagem">Diária de hospedagem (R$)</Label>
                  <Input
                    id="diariaHospedagem"
                    type="number"
                    step="0.01"
                    min="0"
                    value={manutencao.diariaHospedagem}
                    onChange={(e) => setManutencao(prev => ({ ...prev, diariaHospedagem: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alimentacaoDiaria">Alimentação por diária (R$)</Label>
                  <Input
                    id="alimentacaoDiaria"
                    type="number"
                    step="0.01"
                    min="0"
                    value={manutencao.alimentacaoDiaria}
                    onChange={(e) => setManutencao(prev => ({ ...prev, alimentacaoDiaria: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <p className="text-xs text-green-600 mt-3">
                * Diárias e alimentação são calculadas automaticamente: até 250km = 0, 251-650km = 1, acima de 650km = 2, a cada 650km adicional = +2.
              </p>
            </div>

            {/* Botões */}
            <div className="flex flex-wrap gap-3 mt-6">
              <Button 
                onClick={handleCalcular}
                className="gap-2"
                style={{ backgroundColor: CORES.AZUL_PRINCIPAL }}
                disabled={!substratoId || !quantidade}
              >
                <Calculator className="w-4 h-4" />
                Calcular Proposta
              </Button>
              <Button variant="outline" className="gap-2" disabled={!calculado}>
                <Printer className="w-4 h-4" />
                Imprimir
              </Button>
              <Button 
                variant="outline" 
                className="gap-2" 
                disabled={!calculado || gerandoPdf}
                onClick={handleExportarPdf}
              >
                <FileDown className="w-4 h-4" />
                {gerandoPdf ? 'Gerando...' : 'Exportar PDF'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados - só mostra após calcular */}
        {!calculado || !resultado ? (
          <Card className="bg-gray-50">
            <CardContent className="py-12 text-center text-gray-500">
              <Calculator className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Preencha os dados de entrada e clique em &quot;Calcular Proposta&quot; para ver os resultados.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Alertas */}
            {resultado.alertas.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {resultado.alertas.map((alerta, idx) => (
                      <li key={idx}>{alerta}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Notas Técnicas */}
            {resultado.notasTecnicas.length > 0 && (
              <Alert className="border-amber-200 bg-amber-50">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <ul className="list-disc list-inside space-y-1">
                    {resultado.notasTecnicas.map((nota, idx) => (
                      <li key={idx} className="whitespace-pre-wrap">{nota}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Cards de Resultado - Primeira Linha */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1 - Dimensionamento de Resíduos e Biogás */}
              <Card>
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Droplets className="w-5 h-5" style={{ color: CORES.AZUL_PRINCIPAL }} />
                    Dimensionamento de Resíduos e Biogás
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Volume de resíduo/dia</p>
                      <p className="text-xl font-semibold">{formatarNumero(resultado.dimensionamento.volResiduoDia)} m³</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Volume de resíduo/mês</p>
                      <p className="text-xl font-semibold">{formatarNumero(resultado.dimensionamento.volResiduoMes)} m³</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Biogás gerado/dia</p>
                      <p className="text-xl font-semibold" style={{ color: CORES.AZUL_PRINCIPAL }}>{formatarNumero(resultado.dimensionamento.biogasDia)} Nm³</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Biogás gerado/mês</p>
                      <p className="text-xl font-semibold" style={{ color: CORES.AZUL_PRINCIPAL }}>{formatarNumero(resultado.dimensionamento.biogasMes)} Nm³</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">%ST do substrato</p>
                      <p className="text-xl font-semibold">
                        {resultado.dimensionamento.stSubstrato !== null 
                          ? `${resultado.dimensionamento.stSubstrato}%` 
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">%SV do substrato</p>
                      <p className="text-xl font-semibold">
                        {resultado.dimensionamento.svSubstrato !== null 
                          ? `${resultado.dimensionamento.svSubstrato}%` 
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">TRH utilizado</p>
                      <p className="text-xl font-semibold">{resultado.dimensionamento.trhUtilizado} dias</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2 - Biodigestor Recomendado */}
              <Card>
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Factory className="w-5 h-5" style={{ color: CORES.AZUL_PRINCIPAL }} />
                    Biodigestor Recomendado
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Volume necessário (cálculo)</p>
                        <p className="text-xl font-semibold">{formatarNumero(resultado.biodigestor.volumeNecessario)} m³</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tipo recomendado</p>
                        <p className="text-xl font-semibold" style={{ color: CORES.AZUL_PRINCIPAL }}>{resultado.biodigestor.tipoRecomendado}</p>
                      </div>
                    </div>
                    
                    {/* Margem de Segurança */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800">
                          Margem de Segurança: {formatarNumero(resultado.biodigestor.margemAplicada * 100, 1)}%
                        </p>
                        <p className="text-blue-700">
                          Volume final: <strong>{formatarNumero(resultado.biodigestor.volumeComMargem)} m³</strong>
                          {resultado.biodigestor.ajustadoProporcionalmente && (
                            <span className="text-amber-700 ml-2">(calculado proporcionalmente)</span>
                          )}
                        </p>
                        {resultado.biodigestor.precoM3Calculado && (
                          <p className="text-blue-600 mt-1">
                            Preço por m³: {formatarMoeda(resultado.biodigestor.precoM3Calculado)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 border-2" style={{ borderColor: CORES.AZUL_PRINCIPAL }}>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5" style={{ color: CORES.AZUL_PRINCIPAL }} />
                        <span className="font-semibold">Modelo Selecionado</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Volume:</span>{' '}
                          <span className="font-medium">{formatarNumero(resultado.biodigestor.modeloSelecionado.volume)} m³</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Dimensões:</span>{' '}
                          <span className="font-medium">{resultado.biodigestor.modeloSelecionado.dimensoes}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Preço unitário:</span>{' '}
                          <span className="font-semibold text-lg" style={{ color: CORES.AZUL_PRINCIPAL }}>
                            {formatarMoeda(resultado.biodigestor.modeloSelecionado.preco)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Alternativas */}
                    <div className="grid grid-cols-2 gap-4">
                      {resultado.biodigestor.alternativas.abaixo && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Opção menor</p>
                          <p className="font-medium">{resultado.biodigestor.alternativas.abaixo.volume} m³</p>
                          <p className="text-sm text-gray-600">{formatarMoeda(resultado.biodigestor.alternativas.abaixo.preco)}</p>
                        </div>
                      )}
                      {resultado.biodigestor.alternativas.acima && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Opção maior</p>
                          <p className="font-medium">{resultado.biodigestor.alternativas.acima.volume} m³</p>
                          <p className="text-sm text-gray-600">{formatarMoeda(resultado.biodigestor.alternativas.acima.preco)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Card 3 - Tabela de Produtos Dimensionados */}
            <Card>
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Factory className="w-5 h-5" style={{ color: CORES.AZUL_PRINCIPAL }} />
                  Tabela de Produtos Dimensionados
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Produto</TableHead>
                        <TableHead className="whitespace-nowrap">Especificação</TableHead>
                        <TableHead className="whitespace-nowrap">Qtd</TableHead>
                        <TableHead className="whitespace-nowrap">Preço Unit.</TableHead>
                        <TableHead className="whitespace-nowrap">Desconto</TableHead>
                        <TableHead className="whitespace-nowrap">Preço Final</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Biodigestor */}
                      <TableRow className="bg-blue-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-blue-600" />
                            Biodigestor
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{resultado.biodigestor.tipoRecomendado}</p>
                            <p className="text-xs text-gray-500">{formatarNumero(resultado.biodigestor.volumeComMargem)} m³ - {resultado.biodigestor.modeloSelecionado.dimensoes}</p>
                          </div>
                        </TableCell>
                        <TableCell>{qtdBiodigestores}</TableCell>
                        <TableCell>{formatarMoeda(resultado.biodigestor.modeloSelecionado.preco)}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="5"
                            step="0.5"
                            value={descontoBiodigestor}
                            onChange={(e) => handleDescontoBiodigestor(e.target.value)}
                            onBlur={(e) => handleDescontoBiodigestor(e.target.value)}
                            className="w-16 h-8 text-center"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </TableCell>
                        <TableCell className="font-semibold text-green-700">
                          {formatarMoeda(resultado.biodigestor.modeloSelecionado.preco * parseInt(qtdBiodigestores || '0') * (1 - (parseFloat(descontoBiodigestor || '0') / 100)))}
                        </TableCell>
                      </TableRow>
                      
                      {/* Geradores */}
                      {resultado.geradores.map((g, idx) => (
                        <TableRow 
                          key={g.gerador.id}
                          className={`cursor-pointer transition-colors ${
                            geradorSelecionadoIndex === idx 
                              ? 'bg-green-50 border-l-4' 
                              : 'hover:bg-gray-50'
                          }`}
                          style={{ borderLeftColor: geradorSelecionadoIndex === idx ? CORES.AZUL_PRINCIPAL : undefined }}
                          onClick={() => handleSelecionarGerador(idx)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-yellow-600" />
                              Gerador
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{g.gerador.modelo}</p>
                              <p className="text-xs text-gray-500">{formatarInteiro(g.gerador.potencia_kw)} kW | {g.gerador.consumo_nm3h} Nm³/h | {formatarNumero(g.horasReaisPorGerador, 1)}h/dia</p>
                            </div>
                          </TableCell>
                          <TableCell>{qtdGeradores}</TableCell>
                          <TableCell>{formatarMoeda(g.precoGeradorUnitario)}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="5"
                              step="0.5"
                              value={descontoGerador}
                              onChange={(e) => handleDescontoGerador(e.target.value)}
                              onBlur={(e) => handleDescontoGerador(e.target.value)}
                              className="w-16 h-8 text-center"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-xs text-gray-500">%</span>
                          </TableCell>
                          <TableCell className="font-semibold text-green-700">
                            {formatarMoeda(g.precoGeradorUnitario * parseInt(qtdGeradores || '0') * (1 - (parseFloat(descontoGerador || '0') / 100)))}
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {/* Sistema de Tratamento */}
                      <TableRow className="bg-purple-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-purple-600" />
                            Tratamento de Gás
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">Sistema Completo</p>
                            <p className="text-xs text-gray-500">
                              Secador + Filtro Carvão + Biodessulfurização
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{qtdTratamentos}</TableCell>
                        <TableCell>{formatarMoeda(resultado.geradores[geradorSelecionadoIndex]?.precoTratamentoTotalUnitario || 0)}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="5"
                            step="0.5"
                            value={descontoTratamento}
                            onChange={(e) => handleDescontoTratamento(e.target.value)}
                            onBlur={(e) => handleDescontoTratamento(e.target.value)}
                            className="w-16 h-8 text-center"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </TableCell>
                        <TableCell className="font-semibold text-green-700">
                          {formatarMoeda((resultado.geradores[geradorSelecionadoIndex]?.precoTratamentoTotalUnitario || 0) * parseInt(qtdTratamentos || '0') * (1 - (parseFloat(descontoTratamento || '0') / 100)))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * Clique em um gerador para selecioná-lo. Desconto máximo de 5% por produto.
                </p>
              </CardContent>
            </Card>

            {/* Card 4 - Viabilidade Econômica Prévia */}
            {geradorComQuantidades && (
              <Card>
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5" style={{ color: CORES.AZUL_PRINCIPAL }} />
                    Viabilidade Econômica Prévia
                    <Badge variant="outline" className="ml-2">
                      {geradorComQuantidades.gerador.modelo}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  
                  {/* Campos de Quantidade Customizáveis */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3">Quantidades Customizáveis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="qtdBiodigestores">Quantidade de Biodigestores</Label>
                        <Input
                          id="qtdBiodigestores"
                          type="number"
                          min="0"
                          value={qtdBiodigestores}
                          onChange={(e) => setQtdBiodigestores(e.target.value)}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500">
                          Unitário: {formatarMoeda(geradorComQuantidades.precoBiodigestorUnitario)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="qtdGeradores">Quantidade de Geradores</Label>
                        <Input
                          id="qtdGeradores"
                          type="number"
                          min="0"
                          value={qtdGeradores}
                          onChange={(e) => setQtdGeradores(e.target.value)}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500">
                          Unitário: {formatarMoeda(geradorComQuantidades.precoGeradorUnitario)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="qtdTratamentos">Quantidade de Sistemas de Tratamento</Label>
                        <Input
                          id="qtdTratamentos"
                          type="number"
                          min="0"
                          value={qtdTratamentos}
                          onChange={(e) => setQtdTratamentos(e.target.value)}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500">
                          Unitário: {formatarMoeda(geradorComQuantidades.precoTratamentoTotalUnitario)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contratoManutencao">Contrato de Manutenção</Label>
                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            variant={comContratoManutencao ? "default" : "outline"}
                            size="sm"
                            onClick={() => setComContratoManutencao(true)}
                            className={comContratoManutencao ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            Sim
                          </Button>
                          <Button
                            type="button"
                            variant={!comContratoManutencao ? "default" : "outline"}
                            size="sm"
                            onClick={() => setComContratoManutencao(false)}
                            className={!comContratoManutencao ? "bg-red-600 hover:bg-red-700" : ""}
                          >
                            Não
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          {comContratoManutencao ? "Com custos de manutenção" : "Sem custos de manutenção"}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      * Quantidade 0 remove o item do cálculo. Mínimo 1 item deve ser selecionado.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Bloco: CAPEX + Financiamento */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-700 flex items-center gap-2 border-b pb-2">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                        Investimento e Financiamento
                      </h4>
                      
                      {/* CAPEX */}
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-gray-600 mb-2">Equipamentos e Infraestrutura</p>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Biodigestor (×{qtdBiodigestores})</span>
                          <span className="font-medium">{formatarMoeda(geradorComQuantidades.precoBiodigestorTotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Gerador (×{qtdGeradores})</span>
                          <span className="font-medium">{formatarMoeda(geradorComQuantidades.precoGeradorTotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Sistema de tratamento (×{qtdTratamentos})</span>
                          <span className="font-medium">{formatarMoeda(geradorComQuantidades.precoTratamentoTotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Infraestrutura (civil, elétrica)</span>
                          <span className="font-medium">{formatarMoeda(geradorComQuantidades.capexInfraestrutura)}</span>
                        </div>
                        
                        <div className="bg-gray-100 rounded-lg p-2 mt-2">
                          <div className="flex justify-between">
                            <span className="font-semibold text-gray-700">CAPEX Total</span>
                            <span className="font-bold text-lg">{formatarMoeda(geradorComQuantidades.capexTotal)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Financiamento */}
                      {resultadoFinanciamento && (
                        <div className="space-y-2 text-sm border-t pt-3 mt-3">
                          <p className="font-medium text-blue-700 mb-2">Financiamento</p>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Valor principal</span>
                            <span className="font-medium">{formatarMoeda(resultadoFinanciamento.valorPrincipal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Prazo: {resultadoFinanciamento.prazoAnos} anos (carência: {resultadoFinanciamento.carenciaAnos} ano(s))</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Taxa efetiva</span>
                            <span className="font-medium">{formatarNumero(resultadoFinanciamento.taxaJurosAnual, 2)}% a.a.</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Total de juros</span>
                            <span className="font-medium text-red-600">+ {formatarMoeda(resultadoFinanciamento.totalJuros)}</span>
                          </div>
                          
                          <div className="bg-blue-50 rounded-lg p-3 mt-2" style={{ borderColor: '#2563eb', borderWidth: 2 }}>
                            <div className="flex justify-between">
                              <span className="font-semibold text-blue-700">VALOR TOTAL FINANCIADO</span>
                              <span className="font-bold text-xl text-blue-700">{formatarMoeda(resultadoFinanciamento.valorTotalPago)}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-gray-50 rounded p-2 text-center">
                              <p className="text-xs text-gray-500">Parcela carência/{resultadoFinanciamento.frequenciaParcela === 'mensal' ? 'mês' : resultadoFinanciamento.frequenciaParcela === 'trimestral' ? 'trimestre' : resultadoFinanciamento.frequenciaParcela === 'semestral' ? 'semestre' : 'ano'}</p>
                              <p className="font-semibold">{formatarMoeda(resultadoFinanciamento.valorParcelaCarencia)}</p>
                            </div>
                            <div className="bg-gray-50 rounded p-2 text-center">
                              <p className="text-xs text-gray-500">Parcela amortização/{resultadoFinanciamento.frequenciaParcela === 'mensal' ? 'mês' : resultadoFinanciamento.frequenciaParcela === 'trimestral' ? 'trimestre' : resultadoFinanciamento.frequenciaParcela === 'semestral' ? 'semestre' : 'ano'}</p>
                              <p className="font-semibold">{formatarMoeda(resultadoFinanciamento.valorParcelaAmortizacao)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bloco: Custos de Manutenção Calculados */}
                    {resultadoManutencao && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2 border-b pb-2">
                          <Factory className="w-5 h-5 text-green-500" />
                          Custos com Manutenção Calculados
                        </h4>
                        
                        <div className="space-y-2 text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gray-50 rounded p-2">
                              <p className="text-xs text-gray-500">Custo Fixo/Mês</p>
                              <p className="font-semibold">{formatarMoeda(resultadoManutencao.custoFixoMensal)}</p>
                            </div>
                            <div className="bg-gray-50 rounded p-2">
                              <p className="text-xs text-gray-500">Custo Variável/Mês</p>
                              <p className="font-semibold">{formatarMoeda(resultadoManutencao.custoVariavelMensal)}</p>
                            </div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                            <div className="flex justify-between">
                              <span className="font-semibold text-green-700">Custo Total/Mês</span>
                              <span className="font-bold text-lg text-green-700">{formatarMoeda(resultadoManutencao.custoTotalMensal)}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            * Distância: {resultadoManutencao.distanciaKm}km → {resultadoManutencao.qtdDiarias} diária(s) + {resultadoManutencao.qtdAlimentacao} alimentação(ões)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Seção: Fluxo de Caixa Anual em 10 Anos */}
                  {resultadoFinanciamento && fluxoCaixa10Anos && (
                    <div className="mt-6 border-t pt-6">
                      <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Fluxo de Caixa Anual em 10 Anos
                        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                          Tarifa: R$ {fluxoCaixa10Anos.taxaTarifa.toFixed(2)}/kWh
                        </Badge>
                      </h4>
                      
                      {/* Tabela de Fluxo de Caixa */}
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-100">
                              <TableHead className="text-center font-semibold">Ano</TableHead>
                              <TableHead className="text-center font-semibold text-green-700">Ganhos (R$)</TableHead>
                              <TableHead className="text-center font-semibold text-red-700">Gastos (R$)</TableHead>
                              <TableHead className="text-center font-semibold">Resultado (R$)</TableHead>
                              <TableHead className="text-center font-semibold">Acumulado (R$)</TableHead>
                              <TableHead className="text-center font-semibold">Fase</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {fluxoCaixa10Anos.anos.map((item) => (
                              <TableRow 
                                key={item.ano}
                                className={`
                                  ${item.fase === 'carencia' ? 'bg-yellow-50' : ''}
                                  ${item.fase === 'amortizacao' ? 'bg-orange-50' : ''}
                                  ${item.fase === 'pos_financiamento' ? 'bg-green-50' : ''}
                                `}
                              >
                                <TableCell className="text-center font-medium">{item.ano}</TableCell>
                                <TableCell className="text-center text-green-600 font-medium">
                                  + {formatarMoeda(item.receitaTotal)}
                                </TableCell>
                                <TableCell className="text-center text-red-600 font-medium">
                                  - {formatarMoeda(item.despesaTotal)}
                                </TableCell>
                                <TableCell className={`text-center font-bold ${item.resultadoAno >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                  {item.resultadoAno >= 0 ? '+' : ''}{formatarMoeda(item.resultadoAno)}
                                </TableCell>
                                <TableCell className={`text-center font-bold ${item.acumulado >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                  {formatarMoeda(item.acumulado)}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge 
                                    variant="outline"
                                    className={`
                                      ${item.fase === 'carencia' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : ''}
                                      ${item.fase === 'amortizacao' ? 'bg-orange-100 text-orange-800 border-orange-300' : ''}
                                      ${item.fase === 'pos_financiamento' ? 'bg-green-100 text-green-800 border-green-300' : ''}
                                    `}
                                  >
                                    {item.fase === 'carencia' && 'Carência'}
                                    {item.fase === 'amortizacao' && 'Amortização'}
                                    {item.fase === 'pos_financiamento' && 'Pós-Financ.'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                            {/* Linha de Totais */}
                            <TableRow className="bg-gray-200 font-bold">
                              <TableCell className="text-center">TOTAL</TableCell>
                              <TableCell className="text-center text-green-700">
                                + {formatarMoeda(fluxoCaixa10Anos.totalReceitas)}
                              </TableCell>
                              <TableCell className="text-center text-red-700">
                                - {formatarMoeda(fluxoCaixa10Anos.totalDespesas)}
                              </TableCell>
                              <TableCell className={`text-center ${fluxoCaixa10Anos.resultadoFinal >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {fluxoCaixa10Anos.resultadoFinal >= 0 ? '+' : ''}{formatarMoeda(fluxoCaixa10Anos.resultadoFinal)}
                              </TableCell>
                              <TableCell className={`text-center ${fluxoCaixa10Anos.resultadoFinal >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {formatarMoeda(fluxoCaixa10Anos.resultadoFinal)}
                              </TableCell>
                              <TableCell className="text-center">-</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                      
                      {/* Legenda */}
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-semibold text-gray-700 mb-2">Detalhamento:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-green-700 font-medium">Ganhos por ano:</p>
                            <ul className="text-gray-600 ml-4 list-disc">
                              <li>Receita venda de energia: {formatarMoeda(fluxoCaixa10Anos.anos[0]?.receitaVendaEnergia || 0)}</li>
                              <li>Economia com energia: {formatarMoeda(fluxoCaixa10Anos.anos[0]?.economiaEnergia || 0)}</li>
                            </ul>
                          </div>
                          <div>
                            <p className="text-red-700 font-medium">Gastos por ano:</p>
                            <ul className="text-gray-600 ml-4 list-disc">
                              <li>Parcela financiamento: variável conforme fase</li>
                              <li>Manutenção: {formatarMoeda(fluxoCaixa10Anos.anos[0]?.custoManutencao || 0)}</li>
                              <li>Entrada (sinal): {formatarMoeda(resultadoFinanciamento.valorEntrada)} (ano 0)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-4">
                        * Financiamento: {financiamento.prazoAnos} anos ({financiamento.carenciaAnos} carência + {financiamento.prazoAnos - financiamento.carenciaAnos} amortização).
                        {comContratoManutencao && resultadoManutencao && (
                          <> | Custo manutenção/mês: {formatarMoeda(resultadoManutencao.custoTotalMensal)}</>
                        )}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p style={{ color: CORES.AZUL_PRINCIPAL }} className="font-semibold">© {new Date().getFullYear()} ENERMAC - Todos os direitos reservados</p>
          <p className="mt-1">Gerador de Pré-propostas para Geradores de Energia com Biogás</p>
          <p className="mt-1 text-xs">
            Margem biodigestor: {(MARGEM_SEGURANCA_BIODIGESTOR * 100).toFixed(0)}% | 
            Equipamentos: {(PERCENTUAL_EQUIPAMENTOS_CAPEX * 100).toFixed(0)}% CAPEX
          </p>
        </div>
      </footer>
    </div>
  );
}
