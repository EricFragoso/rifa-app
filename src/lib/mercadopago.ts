import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});

interface PaymentData {
  valor: number;
  referencia: string;
  comprador: {
    nome: string;
    email: string;
  };
  descricao: string;
}

export async function criarPagamentoPix({ valor, referencia, comprador, descricao }: PaymentData) {
  try {
    const payment = await new Payment(client).create({
      body: {
        transaction_amount: valor,
        description: descricao,
        payment_method_id: "pix",
        payer: {
          email: comprador.email,
          first_name: comprador.nome.split(' ')[0],
          last_name: comprador.nome.split(' ').slice(1).join(' ') || comprador.nome
        },
        external_reference: referencia
      }
    });

    if (!payment.point_of_interaction?.transaction_data?.qr_code) {
      throw new Error('QR Code não gerado');
    }

    return {
      id: payment.id,
      qrCode: payment.point_of_interaction.transaction_data.qr_code,
      qrCodeBase64: payment.point_of_interaction.transaction_data.qr_code_base64
    };
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    throw new Error('Erro ao gerar pagamento PIX');
  }
}

export async function verificarStatusPagamento(pagamentoId: string) {
  try {
    const payment = await new Payment(client).get({ id: pagamentoId });
    return payment.status;
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    throw new Error('Erro ao verificar status do pagamento');
  }
}