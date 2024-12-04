"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Copy } from "lucide-react"
import { QRCodeSVG } from 'qrcode.react'
import Image from "next/image"

interface Vendedor {
  id: string
  nome: string
  email: string
  telefone: string
  slug: string
  ativo: boolean
  _count: {
    vendasRealizadas: number
  }
}

export default function VendedoresPage() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    slug: ''
  })
  const [status, setStatus] = useState('')

  useEffect(() => {
    carregarVendedores()
  }, [])

  const carregarVendedores = async () => {
    try {
      console.log('Iniciando carregamento de vendedores...')
      setLoading(true)
      
      const res = await fetch('/api/vendedores')
      console.log('Response status:', res.status)
      console.log('Response ok:', res.ok)
      
      const data = await res.json()
      console.log('Dados recebidos:', data)
      
      if (data.success && data.vendedores) {
        console.log('Atualizando estado com vendedores:', data.vendedores)
        setVendedores(data.vendedores)
      } else {
        console.error('Erro nos dados:', data.error)
        setStatus(data.error || 'Erro ao carregar vendedores')
      }
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error)
      setStatus('Erro ao carregar vendedores')
    } finally {
      setLoading(false)
    }
  }

  const formatarSlug = (valor: string) => {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/vendedores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.error) {
        setStatus(data.error)
      } else {
        setStatus('Vendedor cadastrado com sucesso!')
        setFormData({ nome: '', email: '', telefone: '', slug: '' })
        carregarVendedores()
      }
    } catch (error) {
      setStatus('Erro ao cadastrar vendedor')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const handleCopyUrl = (slug: string) => {
    const url = `${window.location.origin}/comprar/${slug}`
    navigator.clipboard.writeText(url)
    setStatus('URL copiada!')
  }

  const getVendedorUrl = (slug: string) => {
    return `${window.location.origin}/comprar/${slug}`
  }

  const getQRCodeUrl = (url: string) => {
    return `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(url)}`
  }

  console.log('Renderizando vendedores:', vendedores)

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Cadastrar Novo Vendedor</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    nome: e.target.value,
                    slug: formatarSlug(e.target.value)
                  }))}
                  placeholder="Nome do vendedor"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    email: e.target.value 
                  }))}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    telefone: e.target.value 
                  }))}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Personalizada</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    slug: formatarSlug(e.target.value) 
                  }))}
                  placeholder="url-do-vendedor"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Cadastrar Vendedor
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Vendedores Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {vendedores.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Nenhum vendedor cadastrado ainda.
            </p>
          ) : (
            <div className="grid gap-4">
              {vendedores.map((vendedor) => (
                <Card key={vendedor.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-semibold">{vendedor.nome}</h3>
                        <p className="text-sm text-muted-foreground">{vendedor.email}</p>
                        <p className="text-sm text-muted-foreground">{vendedor.telefone}</p>
                        <p className="text-sm font-medium mt-2">
                          Vendas realizadas: {vendedor._count.vendasRealizadas}
                        </p>
                      </div>

                      <div className="flex flex-col items-center gap-4">
                          <div className="p-2 bg-white rounded-lg border">
                              <QRCodeSVG
                                  value={getVendedorUrl(vendedor.slug)}
                                  size={150}
                                  level="H"
                              />
                          </div>
                          <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyUrl(vendedor.slug)}
                          >
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar URL
                          </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {status && (
        <Alert className="mt-4">
          <AlertDescription>{status}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}