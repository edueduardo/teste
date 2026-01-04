import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // TODO: Implementar webhook real do Stripe
    const body = await request.text()
    
    console.log("Webhook recebido:", body)
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Erro no webhook:", error)
    return NextResponse.json(
      { error: "Erro ao processar webhook" },
      { status: 500 }
    )
  }
}