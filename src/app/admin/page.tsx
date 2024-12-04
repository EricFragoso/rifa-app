"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  Trophy,
  DollarSign,
  Ticket,
  TrendingUp,
  Calendar
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface DashboardStats {
  totalVendedores: number
  totalVendas: number
  valorTotal: number
  bilhetesVendidos: number
  proximoSorteio: {
    data: string
    bilhetes: number
  } | null
  vendasPorDia: Array<{
    data: string
    quantidade: number
    valor: number
  }>
  topVendedores: Array<{
    nome: string
    vendas: number
    comissao: number
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarEstatisticas()
  }, [])

  const carregarEstatisticas = async () => {
    try {
      const res = await fetch('/api/dashboard/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(stats.valorTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalVendas} vendas realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bilhetes Vendidos</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bilhetesVendidos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendedores Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVendedores}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Sorteio</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.proximoSorteio ? (
              <>
                <div className="text-lg font-bold">
                  {new Date(stats.proximoSorteio.data).toLocaleDateString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.proximoSorteio.bilhetes} bilhetes vendidos
                </p>
              </>
            ) : (
              <p className="text-sm">Nenhum sorteio agendado</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.vendasPorDia}>
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
            <CardTitle>Top Vendedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topVendedores.map((vendedor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{vendedor.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {vendedor.vendas} vendas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(vendedor.comissao)}
                    </p>
                    <p className="text-sm text-muted-foreground">comissão</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}