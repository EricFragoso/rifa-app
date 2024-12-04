"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save } from "lucide-react"

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState({
    valorBilhete: "10",
    percentualComissao: "10",
    tituloSite: "Rifa Online",
    pixKey: "",
    pixKeyType: "cpf" // cnpj, email, telefone
  })
  const [status, setStatus] = useState("")

  const handleSave = async () => {
    try {
      const res = await fetch('/api/configuracoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })

      const data = await res.json()
      if (data.error) {
        setStatus(data.error)
      } else {
        setStatus('Configurações salvas com sucesso!')
      }
    } catch (error) {
      setStatus('Erro ao salvar configurações')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valorBilhete">Valor do Bilhete (R$)</Label>
              <Input
                id="valorBilhete"
                type="number"
                value={config.valorBilhete}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  valorBilhete: e.target.value
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentualComissao">Comissão Vendedor (%)</Label>
              <Input
                id="percentualComissao"
                type="number"
                value={config.percentualComissao}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  percentualComissao: e.target.value
                }))}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="tituloSite">Título do Site</Label>
              <Input
                id="tituloSite"
                value={config.tituloSite}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  tituloSite: e.target.value
                }))}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input
                id="pixKey"
                value={config.pixKey}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  pixKey: e.target.value
                }))}
              />
            </div>
          </div>

          <Button 
            className="mt-6"
            onClick={handleSave}
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar Configurações
          </Button>
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