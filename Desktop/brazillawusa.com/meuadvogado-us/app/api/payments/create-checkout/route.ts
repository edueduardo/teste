import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

const createCheckoutSchema = z.object({
  consultationId: z.string(),
  amount: z.number().min(100), // Valor em centavos
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createCheckoutSchema.parse(body)

    // Verificar se consulta existe
    const consultation = await prisma.consultation.findUnique({
      where: { id: validatedData.consultationId },
      include: {
        client: true,
        lawyer: true
      }
    })

    if (!consultation) {
      return NextResponse.json(
        { error: "Consulta não encontrada" },
        { status: 404 }
      )
    }

    if (consultation.clientId !== session.user.id) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    // Criar sessão Stripe
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Consulta com ${consultation.lawyer.name}`,
              description: consultation.title,
            },
            unit_amount: validatedData.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=success&consultationId=${consultation.id}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=cancelled`,
      metadata: {
        consultationId: consultation.id,
        clientId: consultation.clientId,
        lawyerId: consultation.lawyerId,
      },
    })

    // Criar registro de pagamento
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        consultationId: consultation.id,
        amount: validatedData.amount,
        currency: "BRL",
        status: "PENDING",
        stripeSessionId: stripeSession.id,
      }
    })

    return NextResponse.json({
      success: true,
      sessionUrl: stripeSession.url,
      payment
    })

  } catch (error) {
    console.error("Erro ao criar checkout:", error)
    return NextResponse.json(
      { error: "Erro ao criar checkout" },
      { status: 500 }
    )
  }
}
