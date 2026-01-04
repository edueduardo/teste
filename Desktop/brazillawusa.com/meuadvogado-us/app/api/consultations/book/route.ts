import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const bookConsultationSchema = z.object({
  lawyerId: z.string(),
  title: z.string().min(5),
  description: z.string().optional(),
  scheduledAt: z.string().datetime(),
  duration: z.number().min(15).max(480), // 15 min to 8 hours
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
    const validatedData = bookConsultationSchema.parse(body)

    // Verificar se advogado existe
    const lawyer = await prisma.user.findUnique({
      where: { id: validatedData.lawyerId },
      include: { lawyerProfile: true }
    })

    if (!lawyer || lawyer.role !== "LAWYER") {
      return NextResponse.json(
        { error: "Advogado não encontrado" },
        { status: 404 }
      )
    }

    // Verificar conflito de horário
    const conflictingConsultation = await prisma.consultation.findFirst({
      where: {
        lawyerId: validatedData.lawyerId,
        scheduledAt: {
          gte: new Date(validatedData.scheduledAt),
          lt: new Date(
            new Date(validatedData.scheduledAt).getTime() + validatedData.duration * 60000
          )
        },
        status: { in: ["SCHEDULED", "CONFIRMED"] }
      }
    })

    if (conflictingConsultation) {
      return NextResponse.json(
        { error: "Horário não disponível" },
        { status: 400 }
      )
    }

    // Criar consulta
    const consultation = await prisma.consultation.create({
      data: {
        clientId: session.user.id,
        lawyerId: validatedData.lawyerId,
        title: validatedData.title,
        description: validatedData.description,
        scheduledAt: new Date(validatedData.scheduledAt),
        duration: validatedData.duration,
        status: "SCHEDULED",
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        lawyer: { select: { id: true, name: true, email: true } }
      }
    })

    return NextResponse.json({
      success: true,
      consultation
    })

  } catch (error) {
    console.error("Erro ao agendar consulta:", error)
    return NextResponse.json(
      { error: "Erro ao agendar consulta" },
      { status: 500 }
    )
  }
}
