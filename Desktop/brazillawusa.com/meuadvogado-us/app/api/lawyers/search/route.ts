import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const searchSchema = z.object({
  specialty: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  maxPrice: z.number().min(0).optional(),
  state: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const params = {
      specialty: searchParams.get("specialty") || undefined,
      minRating: searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : undefined,
      maxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined,
      state: searchParams.get("state") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10,
    }

    const validatedParams = searchSchema.parse(params)

    // Construir filtro dinâmico
    const where: any = {
      user: {
        role: "LAWYER"
      }
    }

    if (validatedParams.specialty) {
      where.specialty = {
        has: validatedParams.specialty
      }
    }

    if (validatedParams.minRating) {
      where.rating = {
        gte: validatedParams.minRating
      }
    }

    if (validatedParams.maxPrice) {
      where.consultationFee = {
        lte: validatedParams.maxPrice.toString()
      }
    }

    if (validatedParams.state) {
      where.oabState = validatedParams.state
    }

    // Calcular skip para paginação
    const skip = (validatedParams.page - 1) * validatedParams.limit

    // Buscar advogados
    const [lawyers, total] = await Promise.all([
      prisma.lawyerProfile.findMany({
        where,
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
        },
        orderBy: { rating: "desc" },
        skip,
        take: validatedParams.limit
      }),
      prisma.lawyerProfile.count({ where })
    ])

    return NextResponse.json({
      success: true,
      lawyers,
      total,
      page: validatedParams.page,
      limit: validatedParams.limit,
      totalPages: Math.ceil(total / validatedParams.limit)
    })

  } catch (error) {
    console.error("Erro ao buscar advogados:", error)
    return NextResponse.json(
      { error: "Erro ao buscar advogados" },
      { status: 500 }
    )
  }
}
