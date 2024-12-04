import axios from 'axios'

const picpayApi = axios.create({
  baseURL: 'https://appws.picpay.com/ecommerce/public',
  headers: {
    'Content-Type': 'application/json'
  }
})

interface PicPayPaymentRequest {
  referenceId: string
  callbackUrl: string
  returnUrl: string
  value: number
  expiresAt: string
  buyer: {
    firstName: string
    lastName: string
    document: string // CPF
  }
  additionalInfo?: string[]
}

interface PicPayResponse {
  referenceId: string
  paymentUrl: string
  qrcode: {
    content: string
    base64: string
  }
  expiresAt: string
}

export async function criarPagamento(data: PicPayPaymentRequest) {
  try {
    const response = await picpayApi.post('/payments', data, {
      headers: {
        'x-picpay-token': process.env.PICPAY_TOKEN
      }
    })

    return response.data
  } catch (error) {
    console.error('Erro ao criar pagamento PicPay:', error)
    throw new Error('Erro ao gerar pagamento')
  }
}

export async function consultarStatus(referenceId: string) {
  try {
    const response = await picpayApi.get(`/payments/${referenceId}/status`, {
      headers: {
        'x-picpay-token': process.env.PICPAY_TOKEN
      }
    })
    return response.data.status
  } catch (error) {
    console.error('Erro ao consultar status:', error)
    throw new Error('Erro ao verificar status do pagamento')
  }
}

export async function cancelarPagamento(referenceId: string, value?: number) {
  try {
    const response = await picpayApi.post(`/payments/${referenceId}/refunds`, 
      value ? { value } : undefined,
      {
        headers: {
          'x-picpay-token': process.env.PICPAY_TOKEN
        }
      }
    )
    return response.data
  } catch (error) {
    console.error('Erro ao cancelar pagamento:', error)
    throw new Error('Erro ao cancelar pagamento')
  }
}

export const statusMap = {
  created: 'CRIADO',
  expired: 'EXPIRADO',
  analysis: 'EM_ANALISE',
  paid: 'PAGO',
  completed: 'COMPLETADO',
  refunded: 'DEVOLVIDO',
  chargeback: 'CHARGEBACK'
}