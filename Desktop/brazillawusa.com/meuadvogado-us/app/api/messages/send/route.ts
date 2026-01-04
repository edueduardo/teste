import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const sendMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1).max(5000),
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
    const validatedData = sendMessageSchema.parse(body)

    // Verificar se conversa existe e usuário tem acesso
    const conversation = await prisma.conversation.findUnique({
      where: { id: validatedData.conversationId },
      include: { participants: true }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversa não encontrada" },
        { status: 404 }
      )
    }

    const hasAccess = conversation.participants.some(p => p.userId === session.user.id)
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    // Criar mensagem
    const message = await prisma.message.create({
      data: {
        conversationId: validatedData.conversationId,
        senderId: session.user.id,
        content: validatedData.content,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } }
      }
    })

    // Atualizar lastMessageAt da conversa
    await prisma.conversation.update({
      where: { id: validatedData.conversationId },
      data: { lastMessageAt: new Date() }
    })

    return NextResponse.json({
      success: true,
      message
    })

  } catch (error) {
    console.error("Erro ao enviar mensagem:", error)
    return NextResponse.json(
      { error: "Erro ao enviar mensagem" },
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
    const conversationId = searchParams.get("conversationId")

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId é obrigatório" },
        { status: 400 }
      )
    }

    // Verificar acesso
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversa não encontrada" },
        { status: 404 }
      )
    }

    const hasAccess = conversation.participants.some(p => p.userId === session.user.id)
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    // Buscar mensagens
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { createdAt: "asc" },
      take: 50
    })

    return NextResponse.json({
      success: true,
      messages
    })

  } catch (error) {
    console.error("Erro ao buscar mensagens:", error)
    return NextResponse.json(
      { error: "Erro ao buscar mensagens" },
      { status: 500 }
    )
  }
}
