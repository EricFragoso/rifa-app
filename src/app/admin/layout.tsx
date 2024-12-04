"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Trophy,
  Settings,
  LogOut,
} from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth")
    setIsAuthenticated(auth === process.env.NEXT_PUBLIC_ADMIN_PASSWORD)
  }, [])

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/vendedores", label: "Vendedores", icon: Users },
    { path: "/admin/sorteios", label: "Sorteios", icon: Trophy },
    { path: "/admin/configuracoes", label: "Configurações", icon: Settings },
  ]

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    router.push("/admin")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r p-4">
        <div className="space-y-6">
          <h2 className="text-xl font-bold px-4">Painel Admin</h2>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.path}
                  variant={pathname === item.path ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => router.push(item.path)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
          <div className="absolute bottom-4 left-4 right-4">
            <Button
              variant="outline"
              className="w-full justify-start text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>
      <main className="ml-64 p-8">{children}</main>
    </div>
  )
}