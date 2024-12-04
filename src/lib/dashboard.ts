import { prisma } from './prisma'

export async function getDashboardMetrics() {
  try {
    const [
      totalVendedores,
      totalBilhetes,
      totalArrecadado,
      totalSorteios
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
      
      // Total arrecadado
      prisma.pagamento.aggregate({
        where: {
          status: 'PAGO'
        },
        _sum: {
          valor: true
        }
      }),
      
      // Total de sorteios realizados
      prisma.sorteio.count({
        where: {
          status: 'REALIZADO'
        }
      })
    ])

    // Últimas vendas
    const ultimasVendas = await prisma.bilhete.findMany({
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
    })

    // Ranking de vendedores
    const rankingVendedores = await prisma.usuario.findMany({
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
    })

    // Próximo sorteio
    const proximoSorteio = await prisma.sorteio.findFirst({
      where: {
        status: 'AGENDADO'
      },
      orderBy: {
        data: 'asc'
      }
    })

    return {
      totalVendedores,
      totalBilhetes,
      totalArrecadado: totalArrecadado._sum.valor || 0,
      totalSorteios,
      ultimasVendas,
      rankingVendedores,
      proximoSorteio
    }
  } catch (error) {
    console.error('Erro ao buscar métricas:', error)
    throw new Error('Erro ao carregar dashboard')
  }
}