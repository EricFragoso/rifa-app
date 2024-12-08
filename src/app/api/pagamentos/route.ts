import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { createPaymentPreference } from '@/lib/mercadopago'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { rifaId, numeroEscolhido, userId } = body

    // Verificar se o número já foi escolhido
    const numeroExistente = await prisma.numero.findFirst({
      where: {
        rifaId,
        numero: numeroEscolhido,
      },
    })

    if (numeroExistente) {
      return NextResponse.json({ error: 'Número já escolhido' }, { status: 400 })
    }

    // Buscar informações da rifa
    const rifa = await prisma.rifa.findUnique({
      where: { id: rifaId },
    })

    if (!rifa) {
      return NextResponse.json({ error: 'Rifa não encontrada' }, { status: 404 })
    }

    // Criar preferência de pagamento no MercadoPago
    const preference = await createPaymentPreference({
      items: [
        {
          title: `Número ${numeroEscolhido} da Rifa ${rifa.titulo}`,
          unit_price: rifa.valorNumero,
          quantity: 1,
        },
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_URL}/success`,
        failure: `${process.env.NEXT_PUBLIC_URL}/failure`,
        pending: `${process.env.NEXT_PUBLIC_URL}/pending`,
      },
      auto_return: "approved",
    })

    // Criar o número na base de dados
    const novoNumero = await prisma.numero.create({
      data: {
        numero: numeroEscolhido,
        rifaId,
        userId,
        status: 'RESERVADO',
        preferenciaId: preference.id,
      },
    })

    return NextResponse.json({ 
      numero: novoNumero, 
      preferenciaId: preference.id,
      initPoint: preference.init_point 
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao processar pagamento' }, { status: 500 })
  }
}