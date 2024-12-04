"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  ShoppingCart, 
  Trophy, 
  Ticket, 
  Settings 
} from "lucide-react"

export function MainNav() {
  const pathname = usePathname()
  
  const links = [
    { href: "/", label: "Início", icon: Home },
    { href: "/comprar", label: "Comprar", icon: ShoppingCart },
    { href: "/sorteio", label: "Sorteio", icon: Trophy },
    { href: "/meus-bilhetes", label: "Meus Bilhetes", icon: Ticket },
    { href: "/admin", label: "Painel Admin", icon: Settings },
  ]

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
              >
                <Button
                  variant={pathname === href ? "default" : "ghost"}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}