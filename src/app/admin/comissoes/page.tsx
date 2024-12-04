"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2 } from "lucide-react"

interface ComissaoVendedor {
  id: number
  nome: string
  email: string
  comissaoAtual: number
  totalVendas: number
  totalComissoes: number
}

export default function ComissoesPage() {
  const [vendedores, setVendedores] = useState<ComissaoVendedor[]>([])
  const [comissaoPadrao, setComissaoPadrao] = useState(10)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState("")

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const res = await fetch('/api/admin/comissoes')
      const data = await res.json()
      if (data.error) {
        setStatus(data.error)
      } else {
        setVendedores(data.vendedores)
        setComissaoPadrao(data.comissaoPadrao)
      }
    } catch (error) {
      setStatus('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const atualizarComissaoPadrao = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/comissoes/padrao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ percentual: comissaoPadrao })
      })

      const data = await res.json()
      if (data.error) {
        setStatus(data.error)
      } else {
        setStatus('Comissão padrão atualizada com sucesso!')
        carregarDados()
      }
    } catch (error) {
      setStatus('Erro ao atualizar comissão padrão')
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Comissões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="comissaoPadrao">Comissão Padrão (%)</Label>
              <div className="flex gap-2">
                <Input
                  id="comissaoPadrao"
                  type="number"
                  min="0"
                  max="100"
                  value={comissaoPadrao}
                  onChange={(e) => setComissaoPadrao(Number(e.target.value))}
                />
                <Button onClick={atualizarComissaoPadrao}>
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comissões por Vendedor</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Total Vendas</TableHead>
                <TableHead className="text-right">Total Comissões</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendedores.map((vendedor) => (
                <TableRow key={vendedor.id}>
                  <TableCell>{vendedor.nome}</TableCell>
                  <TableCell>{vendedor.email}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(vendedor.totalVendas)}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(vendedor.totalComissoes)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {status && (
        <Alert>
          <AlertDescription>{status}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}