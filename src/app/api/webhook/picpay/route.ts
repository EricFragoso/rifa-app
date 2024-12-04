import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { consultarStatus } from '@/lib/picpay'

export async function POST(req: Request) {
  try {
    // Verificar token do seller
    const headersList = headers()
    const sellerToken = headersList.get('x-seller-token')
    
    if (sellerToken !== process.env.PICPAY_SELLER_TOKEN) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { referenceId } = await req.json()

    // Consultar status atual no PicPay
    const status = await consultarStatus(referenceId)

    // Atualizar status no banco
    const pagamento = await prisma.pagamento.findFirst({
      where: { pixCode: referenceId }
    })

    if (pagamento) {
      if (status === 'paid' || status === 'completed') {
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
      } else if (status === 'refunded' || status === 'chargeback') {
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
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}