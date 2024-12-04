import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SucessoPage() {
  return (
    <main className="container mx-auto p-4">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-green-600">
            Pagamento Confirmado!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p>
            Seu pagamento foi processado com sucesso.
            Você receberá um e-mail com seus números da sorte.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/meus-bilhetes">
              <Button>Ver Meus Bilhetes</Button>
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