"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  Trophy, 
  DollarSign, 
  Ticket,
  Loader2 
} from "lucide-react"

interface DashboardMetrics {
  totalVendedores: number
  totalBilhetes: number
  totalArrecadado: number
  totalSorteios: number
  ultimasVendas: Array<{
    id: string
    numero: string
    comprador: {
      nome: string
      email: string
    }
    vendedor: {
      nome: string
    } | null
    updatedAt: string
  }>
  rankingVendedores: Array<{
    id: string
    nome: string
    _count: {
      vendasRealizadas: number
    }
  }>
  proximoSorteio: {
    id: string
    data: string
  } | null
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setMetrics(data)
      }
    } catch (error) {
      setError("Erro ao carregar métricas")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Vendedores
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalVendedores}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bilhetes Vendidos
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalBilhetes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Arrecadado
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.totalArrecadado)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sorteios Realizados
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSorteios}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Últimas Vendas */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.ultimasVendas.map((venda) => (
                <div key={venda.id} className="flex justify-between items-start border-b pb-4">
                  <div>
                    <p className="font-medium">{venda.comprador.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      Número: {venda.numero}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {venda.comprador.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {formatDate(venda.updatedAt)}
                    </p>
                    <p className="text-sm font-medium">
                      {venda.vendedor?.nome || 'Venda Direta'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ranking de Vendedores */}
        <Card>
          <CardHeader>
            <CardTitle>Top Vendedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.rankingVendedores.map((vendedor, index) => (
                <div key={vendedor.id} className="flex justify-between items-center border-b pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 font-bold">
                      {index + 1}º
                    </span>
                    <p className="font-medium">{vendedor.nome}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {vendedor._count.vendasRealizadas} {vendedor._count.vendasRealizadas === 1 ? 'venda' : 'vendas'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {metrics.proximoSorteio && (
        <Card>
          <CardHeader>
            <CardTitle>Próximo Sorteio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">
              Data: {formatDate(metrics.proximoSorteio.data)}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}