import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [
      totalVendedores,
      totalBilhetes,
      totalSorteios,
      ultimasVendas,
      rankingVendedores,
      proximoSorteio,
      totalArrecadado
    ] = await Promise.all([
      // Total de vendedores ativos
      prisma.usuario.count({
        where: {
          tipo: 'VENDEDOR',
          ativo: true
        }
      }),

      // Total de bilhetes vendidos
      prisma.bilhete.count({
        where: {
          status: 'PAGO'
        }
      }),

      // Total de sorteios realizados
      prisma.sorteio.count({
        where: {
          status: 'REALIZADO'
        }
      }),

      // Últimas vendas
      prisma.bilhete.findMany({
        where: {
          status: 'PAGO'
        },
        include: {
          comprador: {
            select: {
              nome: true,
              email: true
            }
          },
          vendedor: {
            select: {
              nome: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: 5
      }),

      // Ranking de vendedores
      prisma.usuario.findMany({
        where: {
          tipo: 'VENDEDOR',
          ativo: true
        },
        select: {
          id: true,
          nome: true,
          _count: {
            select: {
              vendasRealizadas: {
                where: {
                  status: 'PAGO'
                }
              }
            }
          }
        },
        orderBy: {
          vendasRealizadas: {
            _count: 'desc'
          }
        },
        take: 5
      }),

      // Próximo sorteio
      prisma.sorteio.findFirst({
        where: {
          status: 'AGENDADO',
          data: {
            gte: new Date()
          }
        },
        orderBy: {
          data: 'asc'
        }
      }),

      // Total arrecadado
      prisma.pagamento.aggregate({
        where: {
          status: 'PAGO'
        },
        _sum: {
          valor: true
        }
      })
    ])

    return NextResponse.json({
      totalVendedores,
      totalBilhetes,
      totalSorteios,
      totalArrecadado: totalArrecadado._sum.valor || 0,
      ultimasVendas,
      rankingVendedores,
      proximoSorteio
    })

  } catch (error) {
    console.error('Erro ao buscar métricas:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar métricas' },
      { status: 500 }
    )
  }
}