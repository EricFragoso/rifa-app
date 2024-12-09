import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
});

interface PaymentPreference {
  id: string;
  qrCode: string;
  qrCodeBase64?: string;
  init_point: string;
}

interface PaymentItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
}

interface PaymentPayer {
  email: string;
  first_name: string;
  last_name: string;
}

interface PaymentPreferenceRequest {
  items: PaymentItem[];
  payer: PaymentPayer;
  external_reference: string;
}

export async function createPaymentPreference(data: PaymentPreferenceRequest): Promise<PaymentPreference> {
  try {
    const preference = new Preference(client);
    const result = await preference.create({
      items: data.items,
      payer: {
        ...data.payer
      },
      payment_methods: {
        default_payment_method_id: "pix",
        excluded_payment_methods: [],
        excluded_payment_types: ["credit_card", "debit_card", "ticket"]
      },
      external_reference: data.external_reference,
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/mercadopago`,
      auto_return: "approved",
      expires: true,
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutos
    });

    // Extrair dados do PIX da resposta
    const pixData = result.point_of_interaction?.transaction_data;

    if (!pixData) {
      throw new Error('Dados do PIX não encontrados');
    }

    return {
      id: result.id,
      qrCode: pixData.qr_code,
      qrCodeBase64: pixData.qr_code_base64,
      init_point: result.init_point
    };
  } catch (error) {
    console.error('Erro ao criar preferência de pagamento:', error);
    throw new Error('Erro ao gerar pagamento PIX');
  }
}

export async function getPaymentStatus(paymentId: string) {
  try {
    const payment = new Payment(client);
    const result = await payment.get({ id: paymentId });
    return result.status;
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    throw new Error('Erro ao verificar status do pagamento');
  }
}

export async function createPayment(paymentData: {
  transaction_amount: number;
  description: string;
  payment_method_id: string;
  payer: {
    email: string;
    first_name: string;
    last_name: string;
  }
}) {
  try {
    const payment = new Payment(client);
    const result = await payment.create(paymentData);
    return result;
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    throw new Error('Erro ao criar pagamento');
  }
}