import { prisma } from '@/lib/prisma'
import { getPaymentStatus } from '@/lib/mercadopago'
import { NextResponse } from 'next/server'

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
          data: { status: 'PAGO' }
        }),
        prisma.bilhete.update({
          where: { id: pagamento.bilheteId },
          data: { status: 'PAGO' }
        })
      ])
    } else if (['cancelled', 'refunded', 'charged_back'].includes(status)) {
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