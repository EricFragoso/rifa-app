import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});

export const mercadopago = { client, Payment, Preference };

export async function createPaymentPreference(data: any) {
  const preference = new mercadopago.Preference(mercadopago.client);
  return preference.create(data);
}

declare module 'mercadopago' {
  export class MercadoPagoConfig {
    constructor(options: { accessToken: string });
  }

  export class Payment {
    constructor(client: MercadoPagoConfig);
    create(data: any): Promise<any>;
  }

  export class Preference {
    constructor(client: MercadoPagoConfig);
    create(data: any): Promise<any>;
  }
}