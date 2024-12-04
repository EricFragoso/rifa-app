"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useParams } from 'next/navigation'

interface Sorteio {
  id: number
  data: string
  status: string
  numeroSorteado: string | null
  _count: {
    bilhetes: number
  }
}

export default function SorteioVisualizacaoPage() {
  const params = useParams()
  const [sorteio, setSorteio] = useState<Sorteio | null>(null)
  const [numerosSorteados, setNumerosSorteados] = useState<string[]>(['_', '_', '_', '_', '_'])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (params.id) {
      carregarSorteio()
      const interval = setInterval(carregarSorteio, 2000)
      return () => clearInterval(interval)
    }
  }, [params.id])

  const carregarSorteio = async () => {
    try {
      if (!params.id) return

      const res = await fetch(`/api/sorteios/${params.id}`)
      const data = await res.json()
      
      if (data.sorteio) {
        setSorteio(data.sorteio)
        if (data.sorteio.numeroSorteado) {
          setNumerosSorteados(data.sorteio.numeroSorteado.split(''))
        }
      }
    } catch (error) {
      setError('Erro ao carregar sorteio')
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

  if (error) {
    return (
      <Alert>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!sorteio) {
    return (
      <Alert>
        <AlertDescription>Sorteio não encontrado</AlertDescription>
      </Alert>
    )
  }

  return (
    <main className="container mx-auto p-4">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Sorteio</CardTitle>
          <div className="text-center text-muted-foreground">
            <p>Data: {new Date(sorteio.data).toLocaleString()}</p>
            <p className="mt-1">Total de bilhetes: {sorteio._count.bilhetes}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center gap-2">
            {numerosSorteados.map((numero, index) => (
              <div
                key={index}
                className={`
                  w-16 h-16 flex items-center justify-center
                  text-2xl font-bold border-2 rounded-lg
                  ${sorteio.status === 'REALIZADO'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-slate-50 border-slate-200 animate-pulse'
                  }
                `}
              >
                {numero}
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-lg font-medium">
              Status: {
                sorteio.status === 'AGENDADO' ? 'Aguardando início' :
                sorteio.status === 'REALIZADO' ? 'Sorteio finalizado' :
                'Sorteio em andamento'
              }
            </p>
            {sorteio.status === 'REALIZADO' && sorteio.numeroSorteado && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-lg font-bold">Número Sorteado:</p>
                <p className="text-3xl font-bold text-green-600">
                  {sorteio.numeroSorteado}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}