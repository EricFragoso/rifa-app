import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function FalhaPage() {
  return (
    <main className="container mx-auto p-4">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-red-600">
            Pagamento não Concluído
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p>
            Houve um problema ao processar seu pagamento.
            Por favor, tente novamente.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/comprar">
              <Button>Tentar Novamente</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Voltar ao Início</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}