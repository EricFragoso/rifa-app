import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { percentual } = await req.json()

    // Desativar configuração anterior
    await prisma.configuracaoComissao.updateMany({
      where: {
        vendedorId: null,
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
        ativo: true
      }
    })

    return NextResponse.json({ success: true, configuracao: novaConfig })
  } catch (error) {
    console.error('Erro ao atualizar comissão padrão:', error)
    return NextResponse.json({ 
      error: 'Erro ao atualizar comissão padrão' 
    }, { 
      status: 500 
    })
  }
}