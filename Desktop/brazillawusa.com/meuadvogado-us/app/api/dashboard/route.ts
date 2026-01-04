import { NextResponse } from "next/server"

export async function GET() {
  try {
    // TODO: Implementar busca real de dados do dashboard
    const data = {
      user: {
        name: "Usuário Teste",
        role: "CLIENT"
      },
      stats: {
        consultations: 0,
        cases: 0,
        messages: 0
      }
    }
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao carregar dashboard" },
      { status: 500 }
    )
  }
}