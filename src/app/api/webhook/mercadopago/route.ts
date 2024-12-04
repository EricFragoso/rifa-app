import { prisma } from '@/lib/prisma'
import { verificarStatusPagamento } from '@/lib/mercadopago'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { action, data } = await req.json()

    // Apenas processar notificações de pagamento
    if (action !== 'payment.updated' && action !== 'payment.created') {
      return NextResponse.json({ message: 'Evento ignorado' })
    }

    const status = await verificarStatusPagamento(data.id)

    const pagamento = await prisma.pagamento.findFirst({
      where: { pixCode: data.id.toString() }
    })

    if (!pagamento) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
    }

    // Atualizar status baseado na resposta do Mercado Pago
    if (status === 'approved' && pagamento.status !== 'PAGO') {
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
    } else if (['cancelled', 'refunded'].includes(status)) {
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