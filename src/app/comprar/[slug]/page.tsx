"use client"

import { useParams } from 'next/navigation'
import ComprarForm from '@/components/ComprarForm' // Vamos criar este componente

export default function ComprarVendedorPage() {
  const params = useParams()
  const vendedorSlug = params.slug as string

  return <ComprarForm vendedorSlug={vendedorSlug} />
}