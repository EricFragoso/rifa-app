import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('GET /api/vendedores - Buscando vendedores...')
    
    const vendedores = await prisma.usuario.findMany({
      where: {
        tipo: 'VENDEDOR'
      },
      include: {
        _count: {
          select: { 
            vendasRealizadas: true 
          }
        }
      },
      orderBy: {
        nome: 'asc'
      }
    })

    console.log('Vendedores encontrados:', vendedores)

    return NextResponse.json({ 
      success: true, 
      vendedores 
    })
  } catch (error) {
    console.error('Erro ao buscar vendedores:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Falha ao buscar vendedores',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { 
      status: 500 
    })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.nome || !body.email || !body.telefone || !body.slug) {
      return NextResponse.json(
        { success: false, error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    const vendedor = await prisma.usuario.create({
      data: {
        nome: body.nome,
        email: body.email,
        telefone: body.telefone,
        slug: body.slug,
        tipo: 'VENDEDOR',
        ativo: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      vendedor 
    })

  } catch (error) {
    console.error('Erro ao criar vendedor:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao criar vendedor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}