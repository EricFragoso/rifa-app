import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const vendedor = await prisma.usuario.findFirst({
      where: {
        slug: params.slug,
        tipo: 'VENDEDOR',
        ativo: true
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        slug: true,
        _count: {
          select: {
            vendasRealizadas: {
              where: {
                status: 'PAGO'
              }
            }
          }
        }
      }
    })

    if (!vendedor) {
      return NextResponse.json({ 
        error: 'Vendedor não encontrado' 
      }, { status: 404 })
    }

    return NextResponse.json({ vendedor })
  } catch (error) {
    console.error('Erro ao buscar vendedor:', error)
    return NextResponse.json({ 
      error: 'Erro ao buscar vendedor' 
    }, { status: 500 })
  }
}