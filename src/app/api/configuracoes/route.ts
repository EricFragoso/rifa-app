import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Primeiro, vamos criar uma interface para as configurações
interface Configuracao {
  chave: string
  valor: string
}

export async function GET() {
  try {
    const configuracoes = await prisma.configuracao.findMany()
    
    // Converter array de configurações para objeto
    const configObj = configuracoes.reduce((acc, curr) => ({
      ...acc,
      [curr.chave]: curr.valor
    }), {})

    return NextResponse.json({ 
      success: true, 
      configuracoes: configObj 
    })
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao buscar configurações' 
    }, { 
      status: 500 
    })
  }
}

export async function POST(req: Request) {
  try {
    const configs = await req.json()

    // Array para armazenar as operações de upsert
    const operacoes = Object.entries(configs).map(([chave, valor]) => 
      prisma.configuracao.upsert({
        where: { chave },
        update: { valor: String(valor) },
        create: { chave, valor: String(valor) }
      })
    )

    // Executar todas as operações em uma transação
    await prisma.$transaction(operacoes)

    return NextResponse.json({ 
      success: true, 
      message: 'Configurações atualizadas com sucesso' 
    })
  } catch (error) {
    console.error('Erro ao salvar configurações:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao salvar configurações' 
    }, { 
      status: 500 
    })
  }
}