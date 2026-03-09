import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  console.log('[API] Iniciando geração de proposta PDF...');
  
  try {
    const dados = await request.json();
    console.log('[API] Dados recebidos:', JSON.stringify(dados, null, 2));
    
    // Criar diretorio de downloads se nao existir
    const downloadDir = path.join(process.cwd(), 'download');
    await fs.mkdir(downloadDir, { recursive: true });
    console.log('[API] Diretório de download:', downloadDir);
    
    // Gerar nome unico para o arquivo
    const timestamp = Date.now();
    const pdfFilename = `proposta-enermac-${timestamp}.pdf`;
    const pdfPath = path.join(downloadDir, pdfFilename);
    
    // Salvar dados em arquivo temporario
    const jsonTempPath = path.join(downloadDir, `temp-${timestamp}.json`);
    await fs.writeFile(jsonTempPath, JSON.stringify(dados), 'utf-8');
    console.log('[API] JSON temporário salvo em:', jsonTempPath);
    
    // Caminho do script Python
    const scriptPath = path.join(process.cwd(), 'scripts', 'gerar_proposta_enermac.py');
    console.log('[API] Script Python:', scriptPath);
    
    // Verificar se o script existe
    try {
      await fs.access(scriptPath);
      console.log('[API] Script Python encontrado');
    } catch {
      console.error('[API] Script Python NÃO encontrado:', scriptPath);
      return NextResponse.json(
        { error: 'Script Python não encontrado', path: scriptPath },
        { status: 500 }
      );
    }
    
    // Executar o script Python
    // Usar o Python do ambiente virtual se disponível, senão usar o do sistema
    const pythonPath = process.env.PYTHON_PATH || '/home/z/.venv/bin/python3';
    console.log('[API] Executando script Python...');
    const command = `${pythonPath} "${scriptPath}" "@${jsonTempPath}" "${pdfPath}"`;
    console.log('[API] Comando:', command);
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: 30000,
        maxBuffer: 1024 * 1024 * 10
      });
      
      console.log('[API] stdout:', stdout);
      if (stderr) {
        console.log('[API] stderr:', stderr);
      }
    } catch (execError: unknown) {
      console.error('[API] Erro ao executar script:', execError);
      // Remover arquivo temporario
      await fs.unlink(jsonTempPath).catch(() => {});
      return NextResponse.json(
        { error: 'Erro ao executar script Python', details: String(execError) },
        { status: 500 }
      );
    }
    
    // Remover arquivo temporario
    await fs.unlink(jsonTempPath).catch(() => {});
    
    // Verificar se o arquivo foi criado
    try {
      await fs.access(pdfPath);
      console.log('[API] Arquivo PDF criado com sucesso');
    } catch {
      console.error('[API] Arquivo PDF NÃO foi criado:', pdfPath);
      return NextResponse.json(
        { error: 'PDF não foi gerado', path: pdfPath },
        { status: 500 }
      );
    }
    
    // Ler o arquivo PDF gerado
    const pdfBuffer = await fs.readFile(pdfPath);
    console.log('[API] PDF lido, tamanho:', pdfBuffer.length, 'bytes');
    
    // Remover o arquivo temporario apos leitura
    await fs.unlink(pdfPath).catch(() => {});
    
    // Retornar o PDF como resposta
    console.log('[API] Retornando PDF...');
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${pdfFilename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
    
  } catch (error: unknown) {
    console.error('[API] Erro geral:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Erro interno ao gerar PDF', details: errorMessage },
      { status: 500 }
    );
  }
}
