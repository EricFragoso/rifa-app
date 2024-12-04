"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Download, FileSpreadsheet, Loader2 } from "lucide-react"

interface RelatorioFiltros {
  dataInicio: string
  dataFim: string
  tipoRelatorio: string
  vendedorId?: string
  status?: string
}

export default function RelatoriosPage() {
  const [filtros, setFiltros] = useState<RelatorioFiltros>({
    dataInicio: new Date(new Date().setDate(1)).toISOString().split('T')[0], // Primeiro dia do mês
    dataFim: new Date().toISOString().split('T')[0], // Hoje
    tipoRelatorio: 'vendas'
  })
  const [dados, setDados] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")

  const gerarRelatorio = async () => {
    try {
      setLoading(true)
      setStatus("")
      
      const queryParams = new URLSearchParams({
        ...filtros,
        dataInicio: new Date(filtros.dataInicio).toISOString(),
        dataFim: new Date(filtros.dataFim).toISOString()
      })

      const res = await fetch(`/api/admin/relatorios?${queryParams}`)
      const data = await res.json()

      if (data.error) {
        setStatus(data.error)
      } else {
        setDados(data.dados)
      }
    } catch (error) {
      setStatus("Erro ao gerar relatório")
    } finally {
      setLoading(false)
    }
  }

  const exportarExcel = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        ...filtros,
        dataInicio: new Date(filtros.dataInicio).toISOString(),
        dataFim: new Date(filtros.dataFim).toISOString(),
        formato: 'excel'
      })

      const res = await fetch(`/api/admin/relatorios/export?${queryParams}`)
      const blob = await res.blob()
      
      // Criar link para download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${filtros.tipoRelatorio}-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setStatus("Erro ao exportar relatório")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Relatório</Label>
              <Select
                value={filtros.tipoRelatorio}
                onValueChange={(value) => setFiltros(prev => ({ ...prev, tipoRelatorio: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendas">Vendas</SelectItem>
                  <SelectItem value="comissoes">Comissões</SelectItem>
                  <SelectItem value="vendedores">Vendedores</SelectItem>
                  <SelectItem value="bilhetes">Bilhetes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filtros.status}
                onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAGO">Pago</SelectItem>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={gerarRelatorio} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                'Gerar Relatório'
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={exportarExcel} 
              disabled={loading || dados.length === 0}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {dados.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(dados[0]).map((key) => (
                    <TableHead key={key}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados.map((item, index) => (
                  <TableRow key={index}>
                    {Object.values(item).map((value: any, i) => (
                      <TableCell key={i}>
                        {typeof value === 'number' 
                          ? new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(value)
                          : value instanceof Date
                          ? new Date(value).toLocaleDateString()
                          : value
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {status && (
        <Alert>
          <AlertDescription>{status}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}