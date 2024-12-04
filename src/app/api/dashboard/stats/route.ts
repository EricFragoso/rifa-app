import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [
      totalVendedores,
      vendas,
      proximoSorteio,
      vendasPorDia,
      topVendedores
    ] = await Promise.all([
      // Total de vendedores ativos
      prisma.usuario.count({
        where: {
          tipo: 'VENDEDOR',
          ativo: true
        }
      }),

      // Vendas totais
      prisma.bilhete.findMany({
        where: {
          status: 'PAGO'
        },
        select: {
          valor: true
        }
      }),

      // Próximo sorteio
      prisma.sorteio.findFirst({
        where: {
          status: 'AGENDADO',
          data: {
            gte: new Date()
          }
        },
        include: {
          _count: {
            select: {
              bilhetes: true
            }
          }
        },
        orderBy: {
          data: 'asc'
        }
      }),

      // Vendas por dia (últimos 7 dias)
      prisma.bilhete.groupBy({
        by: ['createdAt'],
        where: {
          status: 'PAGO',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        _count: true,
        _sum: {
          valor: true
        }
      }),

      // Top vendedores
      prisma.usuario.findMany({
        where: {
          tipo: 'VENDEDOR',
          ativo: true
        },
        include: {
          vendasRealizadas: {
            where: {
              status: 'PAGO'
            },
            select: {
              valor: true
            }
          }
        },
        orderBy: {
          vendasRealizadas: {
            _count: 'desc'
          }
        },
        take: 5
      })
    ])

    // Calcular estatísticas
    const valorTotal = vendas.reduce((acc, venda) => acc + venda.valor, 0)
    const bilhetesVendidos = vendas.length

    // Formatar vendas por dia
    const vendasFormatadas = vendasPorDia.map(dia => ({
      data: dia.createdAt.toLocaleDateString(),
      quantidade: dia._count,
      valor: dia._sum.valor || 0
    }))

    // Formatar top vendedores
    const vendedoresFormatados = topVendedores.map(vendedor => ({
      nome: vendedor.nome,
      vendas: vendedor.vendasRealizadas.length,
      comissao: vendedor.vendasRealizadas.reduce((acc, venda) => acc + (venda.valor * 0.1), 0) // 10% de comissão
    }))

    return NextResponse.json({
      totalVendedores,
      totalVendas: bilhetesVendidos,
      valorTotal,
      bilhetesVendidos,
      proximoSorteio: proximoSorteio ? {
        data: proximoSorteio.data,
        bilhetes: proximoSorteio._count.bilhetes
      } : null,
      vendasPorDia: vendasFormatadas,
      topVendedores: vendedoresFormatados
    })

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json({ 
      error: 'Erro ao buscar estatísticas' 
    }, { 
      status: 500 
    })
  }
}