"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Copy } from "lucide-react"
import Image from "next/image"

interface ComprarFormProps {
  vendedorSlug?: string
}

interface Vendedor {
  id: string
  nome: string
}

interface PagamentoResponse {
  id: string
  qrCode: string
  qrCodeBase64: string
  valor: number
}

export default function ComprarForm({ vendedorSlug }: ComprarFormProps) {
  const [quantidade, setQuantidade] = useState(1)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")
  const [vendedor, setVendedor] = useState<Vendedor | null>(null)
  const [pagamento, setPagamento] = useState<PagamentoResponse | null>(null)
  const [bilhetes, setBilhetes] = useState<string[]>([])
  
  const valorBilhete = 10

  useEffect(() => {
    if (vendedorSlug) {
      carregarVendedor()
    }
  }, [vendedorSlug])

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (pagamento?.id) {
      intervalId = setInterval(verificarPagamento, 5000) // Verifica a cada 5 segundos
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [pagamento?.id])

  const verificarPagamento = async () => {
    if (!pagamento?.id) return

    try {
      const res = await fetch(`/api/pagamentos?id=${pagamento.id}`)
      const data = await res.json()

      if (data.status === 'approved') {
        setStatus("Pagamento confirmado! Seus bilhetes foram reservados.")
        clearInterval()
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error)
    }
  }

  const carregarVendedor = async () => {
    try {
      const res = await fetch(`/api/vendedores/${vendedorSlug}`)
      const data = await res.json()
      if (data.vendedor) {
        setVendedor(data.vendedor)
      } else {
        setStatus("Vendedor não encontrado")
      }
    } catch (error) {
      setStatus("Erro ao carregar informações do vendedor")
    }
  }

  const formatarTelefone = (valor: string) => {
    const numero = valor.replace(/\D/g, '')
    return numero
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2')
      .slice(0, 15)
  }

  const copiarQRCode = async () => {
    if (pagamento?.qrCode) {
      await navigator.clipboard.writeText(pagamento.qrCode)
      setStatus("Código PIX copiado!")
    }
  }

  const handleComprar = async () => {
    try {
      setLoading(true)
      setStatus("Processando sua compra...")

      console.log("Dados sendo enviados:", {
        quantidade,
        nome,
        email,
        telefone,
        vendedorId: vendedor?.id
      })

      // Primeiro gerar os bilhetes
      const resBilhetes = await fetch('/api/bilhetes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantidade,
          nome,
          email,
          telefone,
          vendedorId: vendedor?.id
        })
      })

      const bilhetesData = await resBilhetes.json()
      console.log("Resposta bilhetes:", bilhetesData)

      if (bilhetesData.error) {
        setStatus(`Erro: ${bilhetesData.error}`)
        return
      }

      setBilhetes(bilhetesData.bilhetes.map((b: any) => b.numero))

      // Gerar pagamento
      const resPagamento = await fetch('/api/pagamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bilheteIds: bilhetesData.bilhetes.map((b: any) => b.id),
          comprador: {
            nome,
            email,
            telefone
          }
        })
      })

      const pagamentoData = await resPagamento.json()
      console.log("Resposta pagamento:", pagamentoData)

      if (pagamentoData.error) {
        setStatus(`Erro: ${pagamentoData.error}`)
      } else {
        setPagamento(pagamentoData)
        setStatus("QR Code gerado! Faça o pagamento para confirmar seus bilhetes.")
      }
    } catch (error) {
      console.error('Erro detalhado:', error)
      setStatus("Erro ao processar sua compra. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto p-4">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Comprar Bilhetes</CardTitle>
          {vendedor && (
            <p className="text-center text-muted-foreground">
              Vendedor: {vendedor.nome}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!pagamento ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite seu nome"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">WhatsApp</Label>
                <Input
                  id="telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>

              <div className="space-y-2">
                <Label>Quantidade de Bilhetes</Label>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={quantidade}
                    onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-center"
                  />
                  <Button 
                    variant="outline"
                    onClick={() => setQuantidade(quantidade + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <Card className="bg-slate-50">
                <CardContent className="pt-6">
                  <div className="flex justify-between">
                    <span>Valor por bilhete:</span>
                    <span>R$ {valorBilhete.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold mt-2">
                    <span>Total:</span>
                    <span>R$ {(valorBilhete * quantidade).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Button 
                className="w-full" 
                size="lg"
                onClick={handleComprar}
                disabled={loading || !nome || !email || !telefone}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Comprar Bilhetes'
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="font-medium">Seus números da sorte:</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {bilhetes.map((numero) => (
                    <span key={numero} className="px-3 py-1 bg-slate-100 rounded-full">
                      {numero}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4 text-center">
                <p className="font-medium">Escaneie o QR Code para pagar:</p>
                <div className="flex justify-center">
                  <Image
                    src={`data:image/png;base64,${pagamento.qrCodeBase64}`}
                    alt="QR Code PIX"
                    width={200}
                    height={200}
                    className="border rounded-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Ou copie o código PIX:</p>
                  <div className="relative">
                    <Input
                      value={pagamento.qrCode}
                      readOnly
                      className="pr-10"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-0 top-0"
                      onClick={copiarQRCode}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status && (
            <Alert>
              <AlertDescription>{status}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </main>
  )
}