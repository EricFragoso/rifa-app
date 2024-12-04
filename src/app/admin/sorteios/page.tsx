"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Calendar } from "lucide-react"
import Link from "next/link" // Mudamos para Link do Next.js

interface Sorteio {
  id: number
  data: string
  status: string
  numeroSorteado: string | null
  _count: {
    bilhetes: number
  }
}

export default function SorteiosPage() {
  const [sorteios, setSorteios] = useState<Sorteio[]>([])
  const [loading, setLoading] = useState(true)
  const [dataSorteio, setDataSorteio] = useState("")
  const [status, setStatus] = useState("")

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
      setStatus('Erro ao carregar sorteios')
    } finally {
      setLoading(false)
    }
  }

  const agendarSorteio = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/sorteios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: dataSorteio })
      })

      const data = await res.json()
      if (data.error) {
        setStatus(data.error)
      } else {
        setStatus('Sorteio agendado com sucesso!')
        setDataSorteio('')
        carregarSorteios()
      }
    } catch (error) {
      setStatus('Erro ao agendar sorteio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agendar Novo Sorteio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataSorteio">Data do Sorteio</Label>
                <Input
                  id="dataSorteio"
                  type="datetime-local"
                  value={dataSorteio}
                  onChange={(e) => setDataSorteio(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={agendarSorteio} 
                  disabled={!dataSorteio || loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Calendar className="mr-2 h-4 w-4" />
                  )}
                  Agendar Sorteio
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sorteios Agendados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : sorteios.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Nenhum sorteio agendado
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
                          Status: {sorteio.status}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Bilhetes vendidos: {sorteio._count.bilhetes}
                        </p>
                      </div>
                      {sorteio.status === 'AGENDADO' && (
                        <Link href={`/admin/sorteios/${sorteio.id}`}>
                          <Button>
                            Realizar Sorteio
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

      {status && (
        <Alert>
          <AlertDescription>{status}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}