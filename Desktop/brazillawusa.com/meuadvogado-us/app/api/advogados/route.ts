import { NextResponse } from "next/server"

export async function GET() {
  try {
    // TODO: Implementar busca real de advogados no banco
    const lawyers = [
      { id: "1", name: "Advogado Teste", specialty: "Direito Civil" }
    ]
    
    return NextResponse.json(lawyers)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar advogados" },
      { status: 500 }
    )
  }
}