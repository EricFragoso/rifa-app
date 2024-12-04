import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const vendedores = await prisma.usuario.findMany({
      where: {
        tipo: 'VENDEDOR',
        ativo: true
      },
      include: {
        configuracaoComissao: {
          where: {
            ativo: true,
            dataFim: null
          },
          orderBy: {
            dataInicio: 'desc'
          },
          take: 1
        },
        vendasRealizadas: {
          where: {
            status: 'PAGO'
          },
          select: {
            valor: true
          }
        }
      }
    })

    // Buscar comissão padrão
    const configPadrao = await prisma.configuracaoComissao.findFirst({
      where: {
        vendedorId: null,
        ativo: true,
        dataFim: null
      }
    })

    const vendedoresFormatados = vendedores.map(vendedor => {
      const comissaoAtual = vendedor.configuracaoComissao[0]?.percentual || configPadrao?.percentual || 10
      const totalVendas = vendedor.vendasRealizadas.reduce((acc, venda) => acc + venda.valor, 0)
      const totalComissoes = totalVendas * (comissaoAtual / 100)

      return {
        id: vendedor.id,
        nome: vendedor.nome,
        email: vendedor.email,
        comissaoAtual,
        totalVendas,
        totalComissoes
      }
    })

    return NextResponse.json({
      vendedores: vendedoresFormatados,
      comissaoPadrao: configPadrao?.percentual || 10
    })
  } catch (error) {
    console.error('Erro ao buscar comissões:', error)
    return NextResponse.json({ 
      error: 'Erro ao buscar comissões' 
    }, { 
      status: 500 
    })
  }
}