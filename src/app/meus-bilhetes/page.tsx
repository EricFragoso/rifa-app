"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface Bilhete {
  id: string
  numero: string
  status: string
  createdAt: string
  valor: number
}

export default function MeusBilhetesPage() {
  const [email, setEmail] = useState("")
  const [bilhetes, setBilhetes] = useState<Bilhete[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")

  const buscarBilhetes = async () => {
    try {
      setLoading(true)
      setErro("")
      
      const res = await fetch(`/api/bilhetes?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      
      if (data.error) {
        setErro(data.error)
        setBilhetes([])
      } else {
        setBilhetes(data.bilhetes)
      }
    } catch (error) {
      setErro("Erro ao buscar bilhetes")
      setBilhetes([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Meus Bilhetes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
              />
            </div>
            <Button 
              className="mt-8" 
              onClick={buscarBilhetes}
              disabled={loading || !email}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                'Buscar'
              )}
            </Button>
          </div>

          {erro && (
            <Alert variant="destructive">
              <AlertDescription>{erro}</AlertDescription>
            </Alert>
          )}

          {bilhetes.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bilhetes.map((bilhete) => (
                  <Card key={bilhete.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xl font-bold">{bilhete.numero}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bilhete.status === 'PAGO' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {bilhete.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Comprado em: {new Date(bilhete.createdAt).toLocaleDateString()}</p>
                        <p>Valor: R$ {bilhete.valor.toFixed(2)}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {bilhetes.length === 0 && email && !loading && !erro && (
            <Alert>
              <AlertDescription>
                Nenhum bilhete encontrado para este e-mail.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </main>
  )
}