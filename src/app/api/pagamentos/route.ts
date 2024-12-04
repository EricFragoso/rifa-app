import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { criarPagamentoPix, verificarStatusPagamento } from '@/lib/mercadopago'

export async function POST(req: Request) {
  try {
    const { bilheteIds, comprador } = await req.json()

    const bilhetes = await prisma.bilhete.findMany({
      where: {
        id: { in: bilheteIds },
        status: 'RESERVADO'
      }
    })

    if (bilhetes.length === 0) {
      return NextResponse.json({
        error: 'Bilhetes não encontrados ou não disponíveis'
      }, { status: 400 })
    }

    const valorTotal = bilhetes.reduce((acc, bilhete) => acc + bilhete.valor, 0)
    const referencia = `RIFA-${Date.now()}`

    // Criar pagamento no Mercado Pago
    const pagamentoPix = await criarPagamentoPix({
      valor: valorTotal,
      referencia,
      comprador: {
        nome: comprador.nome,
        email: comprador.email
      },
      descricao: `${bilhetes.length} bilhete(s) - Rifa Online`
    })

    // Registrar pagamento no banco
    const pagamento = await prisma.pagamento.create({
      data: {
        valor: valorTotal,
        status: 'PENDENTE',
        pixCode: pagamentoPix.id.toString(),
        pixUrl: pagamentoPix.qrCode,
        bilheteId: bilhetes[0].id
      }
    })

    return NextResponse.json({
      id: pagamentoPix.id,
      qrCode: pagamentoPix.qrCode,
      qrCodeBase64: pagamentoPix.qrCodeBase64
    })

  } catch (error) {
    console.error('Erro ao processar pagamento:', error)
    return NextResponse.json({
      error: 'Erro ao processar pagamento'
    }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        error: 'ID do pagamento é obrigatório'
      }, { status: 400 })
    }

    const status = await verificarStatusPagamento(id)
    
    if (status === 'approved') {
      const pagamento = await prisma.pagamento.findFirst({
        where: { pixCode: id }
      })

      if (pagamento) {
        await prisma.$transaction([
          prisma.pagamento.update({
            where: { id: pagamento.id },
            data: { status: 'PAGO' }
          }),
          prisma.bilhete.update({
            where: { id: pagamento.bilheteId },
            data: { status: 'PAGO' }
          })
        ])
      }
    }

    return NextResponse.json({ status })
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error)
    return NextResponse.json({
      error: 'Erro ao verificar pagamento'
    }, { status: 500 })
  }
}