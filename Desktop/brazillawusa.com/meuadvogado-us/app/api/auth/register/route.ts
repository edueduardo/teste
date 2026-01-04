import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schema de validação
const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string(),
  role: z.enum(["CLIENT", "LAWYER"]).default("CLIENT"),
  phone: z.string().optional(),
  // Campos específicos para advogados
  oab: z.string().optional(),
  oabState: z.string().optional(),
  specialty: z.array(z.string()).optional(),
  biography: z.string().optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
  officeAddress: z.string().optional(),
  officePhone: z.string().optional(),
  consultationFee: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === "LAWYER") {
    return data.oab && data.oabState && data.specialty && data.specialty.length > 0
  }
  return true
}, {
  message: "Campos obrigatórios para advogado",
  path: ["oab"],
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validar dados
    const validatedData = registerSchema.parse(body)
    
    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      )
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    // Criar usuário em transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar usuário base
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          role: validatedData.role,
          phone: validatedData.phone,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        }
      })
      
      // Criar perfil específico
      if (validatedData.role === "LAWYER") {
        await tx.lawyerProfile.create({
          data: {
            userId: user.id,
            oab: validatedData.oab!,
            oabState: validatedData.oabState!,
            specialty: validatedData.specialty!,
            biography: validatedData.biography,
            education: validatedData.education,
            experience: validatedData.experience,
            officeAddress: validatedData.officeAddress,
            officePhone: validatedData.officePhone,
            consultationFee: validatedData.consultationFee 
              ? parseFloat(validatedData.consultationFee.replace(',', '.')) 
              : null,
          }
        })
      } else {
        await tx.clientProfile.create({
          data: {
            userId: user.id,
          }
        })
      }
      
      return user
    })
    
    return NextResponse.json({
      success: true,
      user: result,
      message: "Cadastro realizado com sucesso!"
    })
    
  } catch (error) {
    console.error("Erro no cadastro:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Erro ao realizar cadastro" },
      { status: 500 }
    )
  }
}
