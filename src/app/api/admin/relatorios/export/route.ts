import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tipoRelatorio = searchParams.get('tipoRelatorio')
    
    // Buscar dados usando a mesma lógica da rota anterior
    // ... (mesmo código do switch case)

    // Criar workbook do Excel
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(dados)
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório')

    // Converter para buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Retornar como arquivo
    return new Response(buf, {
      headers: {
        'Content-Disposition': `attachment; filename=relatorio-${tipoRelatorio}-${new Date().toISOString().split('T')[0]}.xlsx`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    })
  } catch (error) {
    console.error('Erro ao exportar relatório:', error)
    return NextResponse.json({ 
      error: 'Erro ao exportar relatório' 
    }, { 
      status: 500 
    })
  }
}