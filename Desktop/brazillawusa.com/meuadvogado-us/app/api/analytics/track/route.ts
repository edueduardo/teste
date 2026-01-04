import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const trackEventSchema = z.object({
  eventName: z.string().min(1).max(255),
  eventType: z.enum(["PAGE_VIEW", "CONSULTATION_BOOKED", "PAYMENT_COMPLETED", "MESSAGE_SENT", "PROFILE_VIEWED"]),
  metadata: z.record(z.any()).optional(),
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
    const validatedData = trackEventSchema.parse(body)

    // Criar evento
    const event = await prisma.event.create({
      data: {
        userId: session.user.id,
        eventName: validatedData.eventName,
        eventType: validatedData.eventType,
        metadata: validatedData.metadata || {},
      }
    })

    return NextResponse.json({
      success: true,
      event
    })

  } catch (error) {
    console.error("Erro ao rastrear evento:", error)
    return NextResponse.json(
      { error: "Erro ao rastrear evento" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const eventType = searchParams.get("eventType")
    const days = parseInt(searchParams.get("days") || "7")

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const where: any = {
      userId: session.user.id,
      createdAt: {
        gte: startDate
      }
    }

    if (eventType) {
      where.eventType = eventType
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100
    })

    // Calcular estatísticas
    const stats = {
      totalEvents: events.length,
      eventsByType: events.reduce((acc: any, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1
        return acc
      }, {}),
      eventsPerDay: events.reduce((acc: any, event) => {
        const date = event.createdAt.toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {})
    }

    return NextResponse.json({
      success: true,
      events,
      stats
    })

  } catch (error) {
    console.error("Erro ao buscar analytics:", error)
    return NextResponse.json(
      { error: "Erro ao buscar analytics" },
      { status: 500 }
    )
  }
}
