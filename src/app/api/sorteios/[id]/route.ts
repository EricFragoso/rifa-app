import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = await Promise.resolve(params.id)
  
  try {
    const sorteio = await prisma.sorteio.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        _count: {
          select: {
            bilhetes: true
          }
        }
      }
    })

    if (!sorteio) {
      return NextResponse.json({ 
        error: 'Sorteio não encontrado' 
      }, { 
        status: 404 
      })
    }

    return NextResponse.json({ sorteio })
  } catch (error) {
    console.error('Erro ao buscar sorteio:', error)
    return NextResponse.json({ 
      error: 'Erro ao buscar sorteio' 
    }, { 
      status: 500 
    })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = await Promise.resolve(params.id)
  
  try {
    const { numeroSorteado } = await request.json()

    const sorteio = await prisma.sorteio.update({
      where: {
        id: parseInt(id)
      },
      data: {
        numeroSorteado,
        status: 'REALIZADO'
      }
    })

    return NextResponse.json({ sorteio })
  } catch (error) {
    console.error('Erro ao atualizar sorteio:', error)
    return NextResponse.json({ 
      error: 'Erro ao atualizar sorteio' 
    }, { 
      status: 500 
    })
  }
}