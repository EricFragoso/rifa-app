import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // TODO: Pegar o ID do vendedor da sessão
    const vendedorId = 1 // Temporário, será substituído pelo ID do vendedor logado

    const [vendedor, vendas, vendasPorDia] = await Promise.all([
      // Dados do vendedor
      prisma.usuario.findUnique({
        where: {
          id: vendedorId,
          tipo: 'VENDEDOR'
        },
        select: {
          id: true,
          nome: true,
          email: true,
          slug: true
        }
      }),

      // Todas as vendas do vendedor
      prisma.bilhete.findMany({
        where: {
          vendedorId,
          status: 'PAGO'
        },
        include: {
          comprador: {
            select: {
              nome: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }),

      // Vendas agrupadas por dia
      prisma.bilhete.groupBy({
        by: ['createdAt'],
        where: {
          vendedorId,
          status: 'PAGO',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        _count: true,
        _sum: {
          valor: true
        }
      })
    ])

    if (!vendedor) {
      return NextResponse.json({ 
        error: 'Vendedor não encontrado' 
      }, { 
        status: 404 
      })
    }

    // Calcular estatísticas
    const totalVendas = vendas.reduce((acc, venda) => acc + venda.valor, 0)
    const totalComissoes = totalVendas * 0.1 // 10% de comissão

    // Formatar vendas por dia
    const vendasFormatadas = vendasPorDia.map(dia => ({
      data: dia.createdAt.toLocaleDateString(),
      quantidade: dia._count,
      valor: dia._sum.valor || 0
    }))

    return NextResponse.json({
      vendedor,
      stats: {
        totalVendas,
        totalComissoes,
        bilhetesVendidos: vendas.length,
        vendasPorDia: vendasFormatadas
      },
      ultimasVendas: vendas
    })

  } catch (error) {
    console.error('Erro ao buscar dados do vendedor:', error)
    return NextResponse.json({ 
      error: 'Erro ao buscar dados' 
    }, { 
      status: 500 
    })
  }
}