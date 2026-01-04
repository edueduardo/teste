import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const sendNotificationSchema = z.object({
  userId: z.string(),
  title: z.string().min(1).max(255),
  content: z.string().min(1).max(1000),
  type: z.enum(["INFO", "SUCCESS", "WARNING", "ERROR"]),
  link: z.string().optional(),
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
    const validatedData = sendNotificationSchema.parse(body)

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Criar notificação
    const notification = await prisma.notification.create({
      data: {
        userId: validatedData.userId,
        title: validatedData.title,
        content: validatedData.content,
        type: validatedData.type,
        link: validatedData.link,
        read: false,
      }
    })

    return NextResponse.json({
      success: true,
      notification
    })

  } catch (error) {
    console.error("Erro ao enviar notificação:", error)
    return NextResponse.json(
      { error: "Erro ao enviar notificação" },
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
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        ...(unreadOnly && { read: false })
      },
      orderBy: { createdAt: "desc" },
      take: 20
    })

    return NextResponse.json({
      success: true,
      notifications
    })

  } catch (error) {
    console.error("Erro ao buscar notificações:", error)
    return NextResponse.json(
      { error: "Erro ao buscar notificações" },
      { status: 500 }
    )
  }
}
