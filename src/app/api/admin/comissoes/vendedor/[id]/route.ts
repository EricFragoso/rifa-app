import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const vendedorId = parseInt(params.id)
    const { percentual } = await request.json()

    // Desativar configuração anterior
    await prisma.configuracaoComissao.updateMany({
      where: {
        vendedorId,
        ativo: true,
        dataFim: null
      },
      data: {
        ativo: false,
        dataFim: new Date()
      }
    })

    // Criar nova configuração
    const novaConfig = await prisma.configuracaoComissao.create({
      data: {
        percentual,
        vendedorId,
        ativo: true
      }
    })

    return NextResponse.json({ success: true, configuracao: novaConfig })
  } catch (error) {
    console.error('Erro ao atualizar comissão do vendedor:', error)
    return NextResponse.json({ 
      error: 'Erro ao atualizar comissão do vendedor' 
    }, { 
      status: 500 
    })
  }
}