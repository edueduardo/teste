import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createServiceSchema = z.object({
  title: z.string().min(5).max(255),
  description: z.string().min(10).max(2000),
  price: z.number().min(100),
  duration: z.number().min(15).max(480),
  category: z.string().min(1),
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

    if (session.user.role !== "LAWYER") {
      return NextResponse.json(
        { error: "Apenas advogados podem criar serviços" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createServiceSchema.parse(body)

    // Criar serviço
    const service = await prisma.service.create({
      data: {
        lawyerId: session.user.id,
        title: validatedData.title,
        description: validatedData.description,
        price: validatedData.price,
        duration: validatedData.duration,
        category: validatedData.category,
      }
    })

    return NextResponse.json({
      success: true,
      service
    })

  } catch (error) {
    console.error("Erro ao criar serviço:", error)
    return NextResponse.json(
      { error: "Erro ao criar serviço" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lawyerId = searchParams.get("lawyerId")
    const category = searchParams.get("category")

    const where: any = {}

    if (lawyerId) {
      where.lawyerId = lawyerId
    }

    if (category) {
      where.category = category
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        lawyer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        },
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Calcular rating médio
    const servicesWithRating = services.map(service => ({
      ...service,
      averageRating: service.reviews.length > 0
        ? service.reviews.reduce((sum, r) => sum + r.rating, 0) / service.reviews.length
        : 0,
      reviewCount: service.reviews.length
    }))

    return NextResponse.json({
      success: true,
      services: servicesWithRating
    })

  } catch (error) {
    console.error("Erro ao buscar serviços:", error)
    return NextResponse.json(
      { error: "Erro ao buscar serviços" },
      { status: 500 }
    )
  }
}
