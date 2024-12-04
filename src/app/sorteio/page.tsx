"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Sorteio {
  id: number
  data: string
  status: string
  numeroSorteado: string | null
  _count: {
    bilhetes: number
  }
}

export default function SorteiosPublicPage() {
  const [sorteios, setSorteios] = useState<Sorteio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    carregarSorteios()
  }, [])

  const carregarSorteios = async () => {
    try {
      const res = await fetch('/api/sorteios')
      const data = await res.json()
      if (data.sorteios) {
        setSorteios(data.sorteios)
      }
    } catch (error) {
      setError('Erro ao carregar sorteios')
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

  return (
    <main className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Sorteios</CardTitle>
        </CardHeader>
        <CardContent>
          {sorteios.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Nenhum sorteio agendado no momento.
            </p>
          ) : (
            <div className="space-y-4">
              {sorteios.map((sorteio) => (
                <Card key={sorteio.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">
                          Data: {new Date(sorteio.data).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Status: {
                            sorteio.status === 'AGENDADO' ? 'Aguardando' :
                            sorteio.status === 'REALIZADO' ? 'Finalizado' : 'Em andamento'
                          }
                        </p>
                        {sorteio.numeroSorteado && (
                          <p className="text-lg font-bold mt-2">
                            Número Sorteado: {sorteio.numeroSorteado}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          Total de bilhetes: {sorteio._count.bilhetes}
                        </p>
                      </div>
                      {sorteio.status !== 'REALIZADO' && (
                        <Link href={`/sorteio/${sorteio.id}`}>
                          <Button variant="outline">
                            {sorteio.status === 'AGENDADO' ? 'Acompanhar' : 'Ver Sorteio'}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}