import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const sorteios = await prisma.sorteio.findMany({
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
    })

    return NextResponse.json({ 
      success: true, 
      sorteios 
    })
  } catch (error) {
    console.error('Erro ao buscar sorteios:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao buscar sorteios' 
    }, { 
      status: 500 
    })
  }
}

export async function POST(req: Request) {
  try {
    const { data } = await req.json()

    // Validar data
    if (!data) {
      return NextResponse.json({ 
        success: false, 
        error: 'Data é obrigatória' 
      }, { 
        status: 400 
      })
    }

    const sorteio = await prisma.sorteio.create({
      data: {
        data: new Date(data),
        status: 'AGENDADO'
      }
    })

    return NextResponse.json({ 
      success: true, 
      sorteio 
    })
  } catch (error) {
    console.error('Erro ao criar sorteio:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao criar sorteio' 
    }, { 
      status: 500 
    })
  }
}