#!/usr/bin/env python3
"""
Script para gerar PDF de Pré-proposta Comercial Enermac
Layout profissional A4 - Uma página
"""

import sys
import json
import os
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, 
    Image, HRFlowable, KeepTogether, PageBreak
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# Registrar fontes
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Microsoft YaHei', '/usr/share/fonts/truetype/chinese/msyh.ttf'))
pdfmetrics.registerFont(TTFont('Times', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
pdfmetrics.registerFont(TTFont('Calibri', '/usr/share/fonts/truetype/english/calibri-regular.ttf'))

# Registrar familias para negrito
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Times', normal='Times', bold='Times')
registerFontFamily('Calibri', normal='Calibri', bold='Calibri')

# ===== CORES ENERMAC =====
AZUL_PRINCIPAL = colors.HexColor('#1976D2')
AZUL_ESCURO = colors.HexColor('#1565C0')
AZUL_CLARO = colors.HexColor('#42A5F5')

LARANJA_PRINCIPAL = colors.HexColor('#FF6D00')
LARANJA_ESCURO = colors.HexColor('#E65100')
LARANJA_CLARO = colors.HexColor('#FF9800')
LARANJA_BACKGROUND = colors.HexColor('#FFF3E0')

VERDE_SUCESSO = colors.HexColor('#2E7D32')
VERDE_BACKGROUND = colors.HexColor('#E8F5E9')

BRANCO = colors.white
CINZA_TEXTO = colors.HexColor('#424242')
CINZA_CLARO = colors.HexColor('#F5F5F5')
CINZA_BORDA = colors.HexColor('#E0E0E0')
CINZA_MEDIO = colors.HexColor('#757575')

def formatar_moeda(valor):
    """Formata valor como moeda brasileira"""
    if valor is None or valor == 0:
        return "R$ 0,00"
    return f"R$ {valor:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')

def formatar_numero(valor, decimais=0):
    """Formata número com separador de milhares brasileiro"""
    if valor is None or valor == 0:
        return "0"
    if decimais == 0:
        return f"{int(valor):,}".replace(',', '.')
    else:
        return f"{valor:,.{decimais}f}".replace(',', 'X').replace('.', ',').replace('X', '.')

def criar_pdf_proposta(dados, output_path):
    """Cria o PDF da proposta com design profissional Enermac"""
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=1.5*cm,
        leftMargin=1.5*cm,
        topMargin=0.8*cm,
        bottomMargin=0.6*cm
    )
    
    story = []
    styles = getSampleStyleSheet()
    
    # ===== ESTILOS PERSONALIZADOS =====
    
    # Título principal
    titulo_style = ParagraphStyle(
        'TituloStyle',
        parent=styles['Normal'],
        fontName='Calibri',
        fontSize=14,
        textColor=AZUL_PRINCIPAL,
        alignment=TA_LEFT,
        spaceAfter=2,
        leading=16
    )
    
    # Tagline
    tagline_style = ParagraphStyle(
        'TaglineStyle',
        parent=styles['Normal'],
        fontName='Calibri',
        fontSize=8,
        textColor=CINZA_MEDIO,
        alignment=TA_LEFT,
        spaceAfter=3,
        leading=10
    )
    
    # Cabeçalho de seção
    secao_style = ParagraphStyle(
        'SecaoStyle',
        parent=styles['Normal'],
        fontName='Calibri',
        fontSize=9,
        textColor=AZUL_PRINCIPAL,
        spaceBefore=5,
        spaceAfter=2,
        leading=11
    )
    
    # Texto normal
    texto_style = ParagraphStyle(
        'TextoStyle',
        parent=styles['Normal'],
        fontName='Calibri',
        fontSize=8,
        textColor=CINZA_TEXTO,
        alignment=TA_LEFT,
        leading=10
    )
    
    # Texto pequeno
    texto_pequeno_style = ParagraphStyle(
        'TextoPequenoStyle',
        parent=styles['Normal'],
        fontName='Calibri',
        fontSize=7,
        textColor=CINZA_TEXTO,
        alignment=TA_LEFT,
        leading=9
    )
    
    # Valor grande
    valor_grande_style = ParagraphStyle(
        'ValorGrandeStyle',
        parent=styles['Normal'],
        fontName='Calibri',
        fontSize=14,
        textColor=AZUL_PRINCIPAL,
        alignment=TA_CENTER,
        leading=16
    )
    
    # Rodapé
    rodape_style = ParagraphStyle(
        'RodapeStyle',
        parent=styles['Normal'],
        fontName='Calibri',
        fontSize=6,
        textColor=CINZA_MEDIO,
        alignment=TA_CENTER,
        leading=8
    )
    
    # Label card
    label_card_style = ParagraphStyle(
        'LabelCardStyle',
        parent=styles['Normal'],
        fontName='Calibri',
        fontSize=6,
        textColor=CINZA_MEDIO,
        alignment=TA_LEFT,
        leading=8
    )
    
    # Valor card
    valor_card_style = ParagraphStyle(
        'ValorCardStyle',
        parent=styles['Normal'],
        fontName='Calibri',
        fontSize=8,
        textColor=CINZA_TEXTO,
        alignment=TA_LEFT,
        leading=10
    )
    
    # Texto introdutório
    intro_style = ParagraphStyle(
        'IntroStyle',
        parent=styles['Normal'],
        fontName='Calibri',
        fontSize=7,
        textColor=CINZA_TEXTO,
        alignment=TA_JUSTIFY,
        leading=9
    )

    # ===== CABEÇALHO PRINCIPAL COM LOGO =====
    logo_path = '/home/z/my-project/upload/Design sem nome (1).png'
    
    # Coluna esquerda - Texto (sem o nome ENERMAC pois já está no logo)
    col_esquerda = [
        Paragraph("<b>PRÉ-PROPOSTA COMERCIAL</b>", titulo_style),
        Paragraph("Energia Renovável  •  Soluções em Biogás", tagline_style),
    ]
    
    # Tabela com texto à esquerda
    texto_table = Table([[item] for item in col_esquerda], colWidths=[12*cm])
    texto_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 3),
    ]))
    
    # Coluna direita - Logo (proporção original 432x117 = ~3.7:1)
    try:
        logo_img = Image(logo_path, width=5*cm, height=1.35*cm)
        logo_img.hAlign = 'RIGHT'
        logo_cell = logo_img
    except:
        logo_cell = Paragraph("", texto_pequeno_style)
    
    # Header completo - texto à esquerda, logo à direita (sem fundo, sem borda)
    header_data = [[texto_table, logo_cell]]
    header_table = Table(header_data, colWidths=[12.5*cm, 5.5*cm])
    header_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 3),
        ('RIGHTPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 3))
    
    # Data de emissão
    data_emissao = dados.get('dataEmissao', datetime.now().strftime('%d/%m/%Y'))
    data_style = ParagraphStyle('DataStyle', parent=texto_style, alignment=TA_RIGHT, fontSize=7, textColor=CINZA_MEDIO)
    story.append(Paragraph(f"{data_emissao}", data_style))
    story.append(Spacer(1, 4))
    
    # ===== DADOS DO INTERESSADO - CARDS =====
    cliente = dados.get('cliente', {})
    
    # Cards lado a lado
    card_cliente = [
        [Paragraph('INTERESSADO', label_card_style), 
         Paragraph('PROPRIEDADE', label_card_style), 
         Paragraph('LOCALIZAÇÃO', label_card_style)],
        [Paragraph(f"<b>{cliente.get('nomePessoa', '-') or '-'}</b>", valor_card_style), 
         Paragraph(f"<b>{cliente.get('nomePropriedade', '-') or '-'}</b>", valor_card_style), 
         Paragraph(f"<b>{cliente.get('cidade', '-')}/{cliente.get('estadoSigla', '-')}</b>", valor_card_style)],
    ]
    
    tabela_cliente = Table(card_cliente, colWidths=[6*cm, 6*cm, 6*cm])
    tabela_cliente.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CINZA_CLARO),
        ('BOX', (0, 0), (-1, -1), 0.5, CINZA_BORDA),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, 0), 3),
        ('BOTTOMPADDING', (0, 1), (-1, 1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (0, 0), (-1, 0), 0.5, CINZA_BORDA),
    ]))
    story.append(tabela_cliente)
    story.append(Spacer(1, 5))
    
    # ===== TEXTO INTRODUTÓRIO =====
    intro_texto = "Com base nas informações da sua propriedade, elaboramos esta proposta que mostra o real potencial de transformar os resíduos da sua produção em energia limpa e renda extra."
    story.append(Paragraph(intro_texto, intro_style))
    story.append(Spacer(1, 5))
    
    # ===== FONTE GERADORA =====
    fonte = dados.get('fonteGeradora', {})
    gasto = dados.get('gastoMensalEnergia', 0)
    geracao = dados.get('geracao', {})
    
    story.append(Paragraph("<b>FONTE GERADORA</b>", secao_style))
    story.append(HRFlowable(width="100%", thickness=1, color=AZUL_PRINCIPAL, spaceBefore=0, spaceAfter=2))
    
    dados_fonte = [
        [Paragraph('<b>Tipo de Substrato:</b>', texto_pequeno_style), Paragraph(fonte.get('nome', '-'), texto_pequeno_style)],
        [Paragraph('<b>Quantidade:</b>', texto_pequeno_style), Paragraph(f"{formatar_numero(fonte.get('quantidade', 0))} {fonte.get('unidade', '')}", texto_pequeno_style)],
        [Paragraph('<b>Gasto Atual com Energia:</b>', texto_pequeno_style), Paragraph(formatar_moeda(gasto) + "/mês" if gasto else "Não informado", texto_pequeno_style)],
    ]
    
    tabela_fonte = Table(dados_fonte, colWidths=[4.5*cm, 13.5*cm])
    tabela_fonte.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Calibri'),
        ('FONTSIZE', (0, 0), (-1, -1), 7),
        ('TEXTCOLOR', (0, 0), (-1, -1), CINZA_TEXTO),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 1),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
    ]))
    story.append(tabela_fonte)
    story.append(Spacer(1, 5))
    
    # ===== QUANTO SUA PROPRIEDADE PODE TE RENDER A MAIS =====
    kwh_mes = geracao.get('kwhMes', 0)
    
    # Obter cenários de tarifa
    cenarios = dados.get('cenarios', {})
    tarifa_pessimista = cenarios.get('pessimista', 0.35)
    tarifa_realista = cenarios.get('realista', 0.45)
    tarifa_otimista = cenarios.get('otimista', 0.60)
    
    # Obter resultados médios mensais líquidos dos cenários
    cenarios_resultado_medio = dados.get('cenariosResultadoMedio', {})
    resultado_medio_pessimista = cenarios_resultado_medio.get('pessimista', 0)
    resultado_medio_realista = cenarios_resultado_medio.get('realista', 0)
    resultado_medio_otimista = cenarios_resultado_medio.get('otimista', 0)
    
    story.append(Paragraph("<b>QUANTO SUA PROPRIEDADE PODE TE RENDER A MAIS</b>", secao_style))
    story.append(HRFlowable(width="100%", thickness=1, color=AZUL_PRINCIPAL, spaceBefore=0, spaceAfter=2))
    
    # Card Energia Gerada
    card_energia_content = [
        [Paragraph('<b>ENERGIA GERADA</b>', ParagraphStyle('CardTitle', parent=texto_pequeno_style, alignment=TA_CENTER, textColor=AZUL_PRINCIPAL, fontSize=7))],
        [Paragraph(f"<b>{formatar_numero(kwh_mes)}</b>", valor_grande_style)],
        [Paragraph('kWh/mês', ParagraphStyle('CardUnit', parent=texto_pequeno_style, alignment=TA_CENTER, textColor=CINZA_MEDIO, fontSize=6))],
    ]
    
    tabela_energia = Table(card_energia_content, colWidths=[4.5*cm])
    tabela_energia.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#E3F2FD')),
        ('BOX', (0, 0), (-1, -1), 1, AZUL_CLARO),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, 0), 3),
        ('BOTTOMPADDING', (0, -1), (-1, -1), 3),
    ]))
    
    # Tabela com os 3 cenários - mostrando resultado líquido médio mensal
    cenarios_header_style = ParagraphStyle('CenariosHeader', parent=texto_pequeno_style, alignment=TA_CENTER, textColor=BRANCO, fontSize=7)
    cenarios_valor_style = ParagraphStyle('CenariosValor', parent=texto_pequeno_style, alignment=TA_CENTER, fontSize=6)
    
    cenarios_data = [
        [
            Paragraph('<b>Pessimista</b>', cenarios_header_style),
            Paragraph('<b>Realista</b>', cenarios_header_style),
            Paragraph('<b>Otimista</b>', cenarios_header_style),
        ],
        [
            Paragraph(f"<b>{formatar_moeda(resultado_medio_pessimista)}</b>", ParagraphStyle('CenariosValor', parent=texto_pequeno_style, alignment=TA_CENTER, fontSize=11, textColor=LARANJA_ESCURO)),
            Paragraph(f"<b>{formatar_moeda(resultado_medio_realista)}</b>", ParagraphStyle('CenariosValor', parent=texto_pequeno_style, alignment=TA_CENTER, fontSize=11, textColor=AZUL_PRINCIPAL)),
            Paragraph(f"<b>{formatar_moeda(resultado_medio_otimista)}</b>", ParagraphStyle('CenariosValor', parent=texto_pequeno_style, alignment=TA_CENTER, fontSize=11, textColor=VERDE_SUCESSO)),
        ],
        [
            Paragraph('média mensal líquida', cenarios_valor_style),
            Paragraph('média mensal líquida', cenarios_valor_style),
            Paragraph('média mensal líquida', cenarios_valor_style),
        ],
    ]
    
    tabela_cenarios = Table(cenarios_data, colWidths=[4.2*cm, 4.2*cm, 4.2*cm])
    tabela_cenarios.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), colors.HexColor('#E65100')),
        ('BACKGROUND', (1, 0), (1, 0), AZUL_PRINCIPAL),
        ('BACKGROUND', (2, 0), (2, 0), VERDE_SUCESSO),
        ('BACKGROUND', (0, 1), (-1, -1), LARANJA_BACKGROUND),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, 0), 3),
        ('BOTTOMPADDING', (0, -1), (-1, -1), 3),
        ('BOX', (0, 0), (-1, -1), 1, LARANJA_CLARO),
        ('LINEBEFORE', (1, 0), (1, -1), 0.5, CINZA_BORDA),
        ('LINEBEFORE', (2, 0), (2, -1), 0.5, CINZA_BORDA),
    ]))

    # Container com os dois cards
    cards_container = Table([[tabela_energia, tabela_cenarios]], colWidths=[5*cm, 13*cm])
    cards_container.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 2),
        ('RIGHTPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(cards_container)
    story.append(Spacer(1, 5))
    
    # ===== ALÉM DISSO, VOCÊ TAMBÉM GANHA: =====
    story.append(Paragraph("<b>O QUE VOCÊ GANHA COM ESSA TRANSFORMAÇÃO:</b>", secao_style))
    story.append(HRFlowable(width="100%", thickness=1, color=AZUL_PRINCIPAL, spaceBefore=0, spaceAfter=2))
    
    beneficios_style = ParagraphStyle('Beneficios', parent=texto_style, fontSize=7, leading=9)
    beneficios_titulo_style = ParagraphStyle('BeneficiosTitulo', parent=texto_style, fontSize=7, leading=9, textColor=AZUL_PRINCIPAL)
    
    beneficios = [
        ("Independência energética:", "Sua propriedade deixa de depender da rede elétrica. Sem prejuízos com quedas de energia ou custos com geradores a diesel."),
        ("Proteção ambiental:", "Trata os resíduos corretamente, evita multas e fiscalizações, contribuindo para um planeta mais limpo."),
        ("Capacidade produtiva:", "Com menos carga orgânica por m², você pode aumentar a produção sem precisar comprar mais terra."),
        ("Economia real:", "Acaba o gasto com conta de luz e o custo com geradores de emergência. Dinheiro que fica no seu bolso."),
        ("Biofertilizante:", "O que sobra do processo vira um fertilizante natural de alta qualidade para sua lavoura ou pastagem."),
        ("Renda extra:", "A energia que você não usa pode ser vendida. Uma fonte de renda que vem do que antes era descarte."),
    ]
    
    beneficios_data = []
    for titulo, descricao in beneficios:
        beneficios_data.append([
            Paragraph(f"<b>{titulo}</b>", beneficios_titulo_style),
            Paragraph(descricao, beneficios_style)
        ])
    
    tabela_beneficios = Table(beneficios_data, colWidths=[3*cm, 15*cm])
    tabela_beneficios.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), VERDE_BACKGROUND),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#A5D6A7')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (0, 0), (-1, -2), 0.5, colors.HexColor('#A5D6A7')),
    ]))
    story.append(tabela_beneficios)
    story.append(Spacer(1, 5))
    
    # ===== INVESTIMENTO E CONDIÇÕES DE PAGAMENTO =====
    story.append(Paragraph("<b>INVESTIMENTO E CONDIÇÕES DE PAGAMENTO</b>", secao_style))
    story.append(HRFlowable(width="100%", thickness=1, color=AZUL_PRINCIPAL, spaceBefore=0, spaceAfter=2))
    
    # Obter dados dos produtos
    produtos = dados.get('produtos', {})
    capex_total = produtos.get('capexTotal', 0)
    valor_sinal = produtos.get('valorSinal', 0)
    
    pagamento_linhas = []
    pagamento_linhas.append(Paragraph(f"<b>Valor de investimento:</b> {formatar_moeda(capex_total)}", texto_style))
    pagamento_linhas.append(Paragraph(f"<b>Sinal:</b> {formatar_moeda(valor_sinal)}", texto_style))
    pagamento_linhas.append(Paragraph("<b>O que contempla o sinal:</b> Estudo técnico da área, dimensionamento e estruturação formal do projeto.", texto_style))
    pagamento_linhas.append(Paragraph("<b>Restante:</b> À vista, via financiamento ou parcelado direto com a Enermac durante o prazo de obra.", texto_style))
    
    pagamento_box = Table(
        [[item] for item in pagamento_linhas],
        colWidths=[18*cm]
    )
    pagamento_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CINZA_CLARO),
        ('BOX', (0, 0), (-1, -1), 0.5, CINZA_BORDA),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(pagamento_box)
    story.append(Spacer(1, 5))
    
    # ===== GARANTIA DE CONTATO =====
    story.append(Paragraph("<b>CONEXÃO DIRETA COM COMPRADORES DE ENERGIA</b>", secao_style))
    story.append(HRFlowable(width="100%", thickness=1, color=LARANJA_PRINCIPAL, spaceBefore=0, spaceAfter=2))
    
    contato_texto = "Garantimos o contato com empresas interessadas em comprar sua energia. Você negocia diretamente, sem intermediários, e fecha o melhor negócio para sua propriedade."
    
    contato_box = Table(
        [[Paragraph(contato_texto, texto_style)]],
        colWidths=[18*cm]
    )
    contato_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LARANJA_BACKGROUND),
        ('BOX', (0, 0), (-1, -1), 1, LARANJA_CLARO),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(contato_box)
    story.append(Spacer(1, 5))
    
    # ===== NOTAS =====
    notas_style = ParagraphStyle('Notas', parent=texto_pequeno_style, textColor=CINZA_MEDIO, fontSize=7, leading=9)
    
    notas = [
        "• Os valores apresentados são estimativas. Um técnico visitará sua propriedade para confirmar os dados e ajustar o projeto.",
        "• Esta proposta é válida por 30 dias a partir da data de emissão.",
        "• Entre em contato conosco para tirar dúvidas e dar os próximos passos.",
    ]
    
    for nota in notas:
        story.append(Paragraph(nota, notas_style))
    
    story.append(Spacer(1, 5))
    
    # ===== LINHA DE ASSINATURA =====
    story.append(HRFlowable(width="100%", thickness=0.5, color=CINZA_BORDA, spaceBefore=0, spaceAfter=4))
    
    assinatura_style = ParagraphStyle('Assinatura', parent=texto_pequeno_style, alignment=TA_CENTER, textColor=AZUL_PRINCIPAL, fontSize=8)
    
    assinatura_data = [
        ['_' * 35, '_' * 35],
        ['', ''],
        [Paragraph('<b>ENERMAC</b>', assinatura_style), Paragraph('<b>INTERESSADO</b>', assinatura_style)],
    ]
    
    tabela_assinatura = Table(assinatura_data, colWidths=[9*cm, 9*cm])
    tabela_assinatura.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 1),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
    ]))
    story.append(tabela_assinatura)
    story.append(Spacer(1, 3))
    
    # ===== RODAPÉ =====
    story.append(Paragraph(
        "<b>Enermac</b>  •  Energia Renovável  •  Soluções em Biogás  •  Válido por 30 dias",
        rodape_style
    ))
    
    # Gerar o PDF
    doc.build(story)
    print(f"PDF gerado com sucesso: {output_path}")

def main():
    if len(sys.argv) < 3:
        print("Uso: python gerar_proposta_enermac.py <dados_json_ou_arquivo> <output_path>")
        sys.exit(1)
    
    dados_arg = sys.argv[1]
    output_path = sys.argv[2]
    
    try:
        # Se o argumento começar com @, ler de arquivo
        if dados_arg.startswith('@'):
            json_path = dados_arg[1:]  # Remove o @
            with open(json_path, 'r', encoding='utf-8') as f:
                dados = json.load(f)
        else:
            dados = json.loads(dados_arg)
        
        criar_pdf_proposta(dados, output_path)
    except Exception as e:
        print(f"Erro ao gerar PDF: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
