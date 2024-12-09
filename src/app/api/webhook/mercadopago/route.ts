import { prisma } from '@/lib/prisma'
import { getPaymentStatus } from '@/lib/mercadopago'
import { NextResponse } from 'next/server'
import { PagamentoStatus, BilheteStatus } from '@prisma/client'

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const id = searchParams.get('data.id')

    // Processar apenas notificações de pagamento
    if (type !== 'payment') {
      return NextResponse.json({ success: true })
    }

    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 })
    }

    // Verificar status do pagamento
    const status = await getPaymentStatus(id)

    // Se o status não foi encontrado, retornar erro
    if (!status) {
      return NextResponse.json({ error: 'Status não encontrado' }, { status: 404 })
    }

    // Encontrar pagamento no banco de dados
    const pagamento = await prisma.pagamento.findFirst({
      where: { pixCode: id.toString() }
    })

    if (!pagamento) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
    }

    // Atualizar status do pagamento e bilhetes
    if (status === 'approved') {
      await prisma.$transaction([
        prisma.pagamento.update({
          where: { id: pagamento.id },
          data: { status: 'PAGO' as PagamentoStatus }
        }),
        prisma.bilhete.update({
          where: { id: pagamento.bilheteId },
          data: { status: 'PAGO' as BilheteStatus }
        })
      ])
    } else if (['cancelled', 'refunded', 'charged_back'].includes(status as string)) {
      await prisma.$transaction([
        prisma.pagamento.update({
          where: { id: pagamento.id },
          data: { status: 'CANCELADO' }
        }),
        prisma.bilhete.update({
          where: { id: pagamento.bilheteId },
          data: { status: 'DISPONIVEL' }
        })
      ])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}