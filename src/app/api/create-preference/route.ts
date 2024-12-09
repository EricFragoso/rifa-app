import { NextResponse } from 'next/server';
import { mercadopago } from '@/lib/mercadopago';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payment = new mercadopago.Payment(mercadopago.client);
    
    const preference = await payment.create({
      items: [
        {
          title: body.title,
          unit_price: body.price,
          quantity: 1,
        }
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_URL}/success`,
        failure: `${process.env.NEXT_PUBLIC_URL}/failure`,
        pending: `${process.env.NEXT_PUBLIC_URL}/pending`,
      },
      auto_return: "approved",
    });

    return NextResponse.json(preference);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating preference' }, { status: 500 });
  }
}