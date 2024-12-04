import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { createPaymentPreference } from '@/lib/mercadopago'

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
    const referenceId = `RIFA-${Date.now()}`

    const pagamentoPix = await createPaymentPreference({
      items: [{
        id: referenceId,
        title: `${bilhetes.length} bilhete(s) de rifa`,
        quantity: 1,
        unit_price: valorTotal
      }],
      payer: {
        email: comprador.email,
        first_name: comprador.nome.split(' ')[0],
        last_name: comprador.nome.split(' ').slice(1).join(' ') || comprador.nome
      },
      external_reference: referenceId
    })

    if (!pagamentoPix || !pagamentoPix.id || !pagamentoPix.qrCode) {
      throw new Error('Erro ao gerar pagamento PIX')
    }

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
      payment_id: pagamentoPix.id,
      init_point: pagamentoPix.qrCode,
      qr_code: pagamentoPix.qrCode,
      qr_code_base64: pagamentoPix.qrCodeBase64
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
    const paymentId = searchParams.get('payment_id')

    if (!paymentId) {
      return NextResponse.json({
        error: 'ID do pagamento é obrigatório'
      }, { status: 400 })
    }

    const pagamento = await prisma.pagamento.findFirst({
      where: { pixCode: paymentId }
    })

    if (!pagamento) {
      return NextResponse.json({
        error: 'Pagamento não encontrado'
      }, { status: 404 })
    }

    return NextResponse.json({ status: pagamento.status })
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error)
    return NextResponse.json({
      error: 'Erro ao verificar pagamento'
    }, { status: 500 })
  }
}