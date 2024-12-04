import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Sistema de Rifas</h1>
          <div className="space-y-2">
            <div>
              <Link href="/comprar">
                <Button size="lg">Comprar Bilhetes</Button>
              </Link>
            </div>
            <div>
              <Link href="/admin">
                <Button variant="outline" size="lg">Área Administrativa</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}