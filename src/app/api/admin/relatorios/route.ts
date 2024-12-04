import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tipoRelatorio = searchParams.get('tipoRelatorio')
    const dataInicio = new Date(searchParams.get('dataInicio') || '')
    const dataFim = new Date(searchParams.get('dataFim') || '')
    const status = searchParams.get('status')
    
    let dados = []

    switch (tipoRelatorio) {
      case 'vendas':
        dados = await prisma.bilhete.findMany({
          where: {
            createdAt: {
              gte: dataInicio,
              lte: dataFim
            },
            ...(status && { status })
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
            createdAt: 'desc'
          }
        })

        dados = dados.map(venda => ({
          data: venda.createdAt,
          numero: venda.numero,
          valor: venda.valor,
          status: venda.status,
          comprador: venda.comprador?.nome,
          vendedor: venda.vendedor?.nome || 'Venda Direta'
        }))
        break

      case 'comissoes':
        const vendedores = await prisma.usuario.findMany({
          where: {
            tipo: 'VENDEDOR',
            ativo: true
          },
          include: {
            vendasRealizadas: {
              where: {
                createdAt: {
                  gte: dataInicio,
                  lte: dataFim
                },
                status: 'PAGO'
              }
            },
            configuracaoComissao: {
              where: {
                ativo: true
              },
              orderBy: {
                dataInicio: 'desc'
              },
              take: 1
            }
          }
        })

        dados = vendedores.map(vendedor => {
          const totalVendas = vendedor.vendasRealizadas.reduce(
            (acc, venda) => acc + venda.valor, 
            0
          )
          const percentualComissao = 
            vendedor.configuracaoComissao[0]?.percentual || 10
          const valorComissao = totalVendas * (percentualComissao / 100)

          return {
            vendedor: vendedor.nome,
            totalVendas,
            percentualComissao,
            valorComissao,
            quantidadeVendas: vendedor.vendasRealizadas.length
          }
        })
        break

      case 'vendedores':
        dados = await prisma.usuario.findMany({
          where: {
            tipo: 'VENDEDOR',
            ativo: true
          },
          include: {
            _count: {
              select: {
                vendasRealizadas: true
              }
            }
          }
        })

        dados = dados.map(vendedor => ({
          nome: vendedor.nome,
          email: vendedor.email,
          telefone: vendedor.telefone,
          totalVendas: vendedor._count.vendasRealizadas,
          status: vendedor.ativo ? 'Ativo' : 'Inativo'
        }))
        break

      case 'bilhetes':
        dados = await prisma.bilhete.findMany({
          where: {
            createdAt: {
              gte: dataInicio,
              lte: dataFim
            },
            ...(status && { status })
          },
          orderBy: {
            numero: 'asc'
          }
        })

        dados = dados.map(bilhete => ({
          numero: bilhete.numero,
          status: bilhete.status,
          valor: bilhete.valor,
          dataCompra: bilhete.createdAt
        }))
        break
    }

    return NextResponse.json({ dados })
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json({ 
      error: 'Erro ao gerar relatório' 
    }, { 
      status: 500 
    })
  }
}