"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DollarSign, 
  Ticket, 
  QrCode,
  Link as LinkIcon,
  Copy,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface VendedorStats {
  vendedor: {
    id: number
    nome: string
    email: string
    slug: string
  }
  stats: {
    totalVendas: number
    totalComissoes: number
    bilhetesVendidos: number
    vendasPorDia: Array<{
      data: string
      quantidade: number
      valor: number
    }>
  }
  ultimasVendas: Array<{
    id: number
    numero: string
    valor: number
    status: string
    createdAt: string
    comprador: {
      nome: string
    }
  }>
}

export default function VendedorDashboard() {
  const [stats, setStats] = useState<VendedorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const res = await fetch('/api/vendedor/dashboard')
      const data = await res.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setStats(data)
      }
    } catch (error) {
      setError("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  const copiarLink = async () => {
    if (!stats) return
    const url = `${window.location.origin}/comprar/${stats.vendedor.slug}`
    await navigator.clipboard.writeText(url)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <Alert>
        <AlertDescription>{error || "Erro ao carregar dados"}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard do Vendedor</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copiarLink}>
            <LinkIcon className="h-4 w-4 mr-2" />
            Copiar Link
          </Button>
          <Button variant="outline">
            <QrCode className="h-4 w-4 mr-2" />
            Ver QR Code
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(stats.stats.totalVendas)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(stats.stats.totalComissoes)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bilhetes Vendidos</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stats.bilhetesVendidos}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendas dos Últimos 7 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.stats.vendasPorDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimas Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Comprador</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.ultimasVendas.map((venda) => (
                <TableRow key={venda.id}>
                  <TableCell>
                    {new Date(venda.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{venda.numero}</TableCell>
                  <TableCell>{venda.comprador.nome}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(venda.valor)}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      venda.status === 'PAGO' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {venda.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}