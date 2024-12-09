declare module 'mercadopago' {
    export class MercadoPagoConfig {
      constructor(options: { accessToken: string });
    }
  
    export class Payment {
      constructor(client: MercadoPagoConfig);
      create(data: any): Promise<any>;
      // Adicione outros métodos conforme necessário
    }
  }