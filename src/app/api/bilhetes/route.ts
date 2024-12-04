import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Função auxiliar para gerar número único
async function gerarNumeroUnico(): Promise<string> {
  while (true) {
    const numeros = String(Math.floor(1000 + Math.random() * 9000))
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const letra = letras[Math.floor(Math.random() * letras.length)]
    const numero = `${numeros}${letra}`

    // Verifica se o número já existe
    const existente = await prisma.bilhete.findFirst({
      where: { numero }
    })

    if (!existente) {
      return numero
    }
  }
}

export async function POST(req: Request) {
  try {
    const { quantidade, nome, email, telefone, vendedorId } = await req.json()

    // Validações
    if (!quantidade || !nome || !email || !telefone) {
      return NextResponse.json({
        error: 'Todos os campos são obrigatórios'
      }, { status: 400 })
    }

    // Criar ou encontrar o comprador
    const comprador = await prisma.usuario.upsert({
      where: { email },
      update: { 
        nome,
        telefone
      },
      create: {
        nome,
        email,
        telefone,
        tipo: 'COMPRADOR'
      }
    })

    // Gerar bilhetes
    const bilhetes = []
    for (let i = 0; i < quantidade; i++) {
      const numero = await gerarNumeroUnico()
      const bilhete = await prisma.bilhete.create({
        data: {
          numero,
          status: 'RESERVADO',
          valor: 10.00, // Valor fixo por bilhete
          compradorId: comprador.id,
          vendedorId: vendedorId || null
        }
      })
      bilhetes.push(bilhete)
    }

    return NextResponse.json({ bilhetes })
  } catch (error) {
    console.error('Erro ao criar bilhetes:', error)
    return NextResponse.json({
      error: 'Erro ao gerar bilhetes'
    }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    const status = searchParams.get('status')

    const where: any = {}

    if (email) {
      where.comprador = {
        email
      }
    }

    if (status) {
      where.status = status
    }

    const bilhetes = await prisma.bilhete.findMany({
      where,
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

    return NextResponse.json({ bilhetes })
  } catch (error) {
    console.error('Erro ao buscar bilhetes:', error)
    return NextResponse.json({
      error: 'Erro ao buscar bilhetes'
    }, { status: 500 })
  }
}