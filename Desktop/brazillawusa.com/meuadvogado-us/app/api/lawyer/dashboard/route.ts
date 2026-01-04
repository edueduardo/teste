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

    if (session.user.role !== "LAWYER") {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    // Buscar perfil do advogado
    const lawyerProfile = await prisma.lawyerProfile.findUnique({
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

    if (!lawyerProfile) {
      return NextResponse.json(
        { error: "Perfil de advogado não encontrado" },
        { status: 404 }
      )
    }

    // Buscar consultas do advogado
    const consultations = await prisma.consultation.findMany({
      where: { lawyerId: session.user.id },
      include: {
        client: {
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

    // Buscar casos do advogado
    const cases = await prisma.case.findMany({
      where: { lawyerId: session.user.id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    })

    // Contar estatísticas
    const totalConsultations = await prisma.consultation.count({
      where: { lawyerId: session.user.id }
    })

    const totalCases = await prisma.case.count({
      where: { lawyerId: session.user.id }
    })

    const completedCases = await prisma.case.count({
      where: {
        lawyerId: session.user.id,
        status: "CLOSED"
      }
    })

    const totalPayments = await prisma.payment.aggregate({
      where: {
        user: {
          consultationsAsLawyer: {
            some: {
              lawyerId: session.user.id
            }
          }
        }
      },
      _sum: {
        amount: true
      }
    })

    return NextResponse.json({
      success: true,
      profile: lawyerProfile,
      consultations,
      cases,
      stats: {
        totalConsultations,
        totalCases,
        completedCases,
        totalRevenue: totalPayments._sum.amount || 0,
        rating: lawyerProfile.rating,
        totalReviews: lawyerProfile.totalReviews,
      }
    })

  } catch (error) {
    console.error("Erro ao buscar dashboard:", error)
    return NextResponse.json(
      { error: "Erro ao buscar dashboard" },
      { status: 500 }
    )
  }
}
