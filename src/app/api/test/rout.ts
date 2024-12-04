import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Rota de teste para verificar a conexão com o banco
export async function GET() {
  try {
    const count = await prisma.usuario.count()
    return NextResponse.json({ 
      message: "Conexão com banco de dados OK", 
      usuariosCadastrados: count 
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro na conexão com banco de dados" }, { status: 500 })
  }
}