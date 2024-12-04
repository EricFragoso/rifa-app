"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import router from "next/router"

interface SorteioData {
  id: number
  data: string
  status: string
  numeroSorteado: string | null
  _count: {
    bilhetes: number
  }
}

export default function SorteioAdminPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [sorteio, setSorteio] = useState<SorteioData | null>(null)
  const [numerosSorteados, setNumerosSorteados] = useState<string[]>(['_', '_', '_', '_', '_'])
  const [posicaoAtual, setPosicaoAtual] = useState(0)
  const [sorteando, setSorteando] = useState(false)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState("")

  useEffect(() => {
    carregarSorteio()
  }, [])

  const carregarSorteio = async () => {
    try {
      const res = await fetch(`/api/sorteios/${params.id}`)
      const data = await res.json()
      
      if (data.sorteio) {
        setSorteio(data.sorteio)
        if (data.sorteio.numeroSorteado) {
          setNumerosSorteados(data.sorteio.numeroSorteado.split(''))
        }
      }
    } catch (error) {
      setStatus('Erro ao carregar sorteio')
    } finally {
      setLoading(false)
    }
  }

  const iniciarSorteio = async () => {
    if (!sorteio || sorteando) return

    setSorteando(true)
    setNumerosSorteados(['_', '_', '_', '_', '_'])
    setPosicaoAtual(0)
    sortearPosicao(0)
  }

  const sortearPosicao = (posicao: number) => {
    const caracteres = posicao === 4 ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '0123456789'
    let contador = 0
    
    const intervalo = setInterval(() => {
      const char = caracteres[Math.floor(Math.random() * caracteres.length)]
      setNumerosSorteados(prev => {
        const novo = [...prev]
        novo[posicao] = char
        return novo
      })
      
      contador++
      if (contador > 20) {
        clearInterval(intervalo)
        if (posicao < 4) {
          setPosicaoAtual(posicao + 1)
          setTimeout(() => sortearPosicao(posicao + 1), 500)
        } else {
          finalizarSorteio()
        }
      }
    }, 100)
  }

  const finalizarSorteio = async () => {
    try {
      const numeroSorteado = numerosSorteados.join('')
      
      const res = await fetch(`/api/sorteios/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numeroSorteado })
      })

      const data = await res.json()
      if (data.error) {
        setStatus(data.error)
      } else {
        setStatus('Sorteio realizado com sucesso!')
        setSorteio(prev => prev ? { ...prev, status: 'REALIZADO', numeroSorteado } : null)
      }
    } catch (error) {
      setStatus('Erro ao finalizar sorteio')
    } finally {
      setSorteando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Realizar Sorteio</CardTitle>
          <p className="text-muted-foreground">
            Data: {new Date(sorteio.data).toLocaleString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center gap-2">
            {numerosSorteados.map((numero, index) => (
              <div
                key={index}
                className={`
                  w-16 h-16 flex items-center justify-center
                  text-2xl font-bold border-2 rounded-lg
                  ${index === posicaoAtual && sorteando 
                    ? 'bg-yellow-100 border-yellow-400 animate-pulse' 
                    : sorteio.status === 'REALIZADO'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-slate-50 border-slate-200'
                  }
                `}
              >
                {numero}
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={iniciarSorteio}
              disabled={sorteando || sorteio.status === 'REALIZADO'}
              size="lg"
            >
              {sorteando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sorteando...
                </>
              ) : (
                'Iniciar Sorteio'
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push('/admin/sorteios')}
            >
              Voltar
            </Button>
          </div>

          {status && (
            <Alert>
              <AlertDescription>{status}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}