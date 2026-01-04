import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    if (session.user.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    // Buscar perfil do cliente
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            phone: true,
          }
        }
      }
    })

    if (!clientProfile) {
      return NextResponse.json(
        { error: "Perfil de cliente não encontrado" },
        { status: 404 }
      )
    }

    // Buscar casos do cliente
    const cases = await prisma.case.findMany({
      where: { clientId: session.user.id },
      include: {
        lawyer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Buscar consultas do cliente
    const consultations = await prisma.consultation.findMany({
      where: { clientId: session.user.id },
      include: {
        lawyer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    })

    // Contar estatísticas
    const totalCases = await prisma.case.count({
      where: { clientId: session.user.id }
    })

    const activeCases = await prisma.case.count({
      where: {
        clientId: session.user.id,
        status: "OPEN"
      }
    })

    const completedCases = await prisma.case.count({
      where: {
        clientId: session.user.id,
        status: "CLOSED"
      }
    })

    const totalSpent = await prisma.payment.aggregate({
      where: {
        userId: session.user.id
      },
      _sum: {
        amount: true
      }
    })

    return NextResponse.json({
      success: true,
      profile: clientProfile,
      cases,
      consultations,
      stats: {
        totalCases,
        activeCases,
        completedCases,
        totalSpent: totalSpent._sum.amount || 0,
      }
    })

  } catch (error) {
    console.error("Erro ao buscar dashboard cliente:", error)
    return NextResponse.json(
      { error: "Erro ao buscar dashboard" },
      { status: 500 }
    )
  }
}
