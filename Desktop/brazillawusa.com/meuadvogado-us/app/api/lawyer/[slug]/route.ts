import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug

    // Buscar advogado por slug (usando email ou ID como slug)
    const lawyerProfile = await prisma.lawyerProfile.findFirst({
      where: {
        OR: [
          { user: { email: slug } },
          { userId: slug }
        ]
      },
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
        { error: "Advogado não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(lawyerProfile)

  } catch (error) {
    console.error("Erro ao buscar perfil do advogado:", error)
    return NextResponse.json(
      { error: "Erro ao buscar perfil" },
      { status: 500 }
    )
  }
}
