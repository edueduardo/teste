"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Mail, Lock, Phone, Briefcase, MapPin, GraduationCap, DollarSign, Eye, EyeOff, Check, ChevronLeft, ChevronRight } from "lucide-react"

// Schema passo 1 - Dados básicos
const basicInfoSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
})

// Schema passo 2 - Tipo de usuário
const userTypeSchema = z.object({
  role: z.enum(["CLIENT", "LAWYER"], {
    required_error: "Selecione um tipo de conta"
  })
})

// Schema passo 3 - Perfil de advogado
const lawyerProfileSchema = z.object({
  oab: z.string().min(1, "OAB é obrigatória"),
  oabState: z.string().min(2, "Estado da OAB é obrigatório"),
  specialty: z.array(z.string()).min(1, "Selecione pelo menos uma especialidade"),
  biography: z.string().optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
  officeAddress: z.string().optional(),
  officePhone: z.string().optional(),
  consultationFee: z.string().optional(),
})

type BasicInfoData = z.infer<typeof basicInfoSchema>
type UserTypeData = z.infer<typeof userTypeSchema>
type LawyerProfileData = z.infer<typeof lawyerProfileSchema>

const specialties = [
  "Direito Civil",
  "Direito Criminal", 
  "Direito Trabalhista",
  "Direito Tributário",
  "Direito Empresarial",
  "Direito de Família",
  "Direito Imobiliário",
  "Direito Ambiental",
  "Direito Digital",
  "Direito Médico",
]

const states = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", 
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", 
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
]

export default function CadastroPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Dados de cada passo
  const [basicInfo, setBasicInfo] = useState<BasicInfoData | null>(null)
  const [userType, setUserType] = useState<UserTypeData | null>(null)
  const [lawyerProfile, setLawyerProfile] = useState<LawyerProfileData | null>(null)

  // Formulários
  const basicForm = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema)
  })
  
  const userTypeForm = useForm<UserTypeData>({
    resolver: zodResolver(userTypeSchema)
  })
  
  const lawyerForm = useForm<LawyerProfileData>({
    resolver: zodResolver(lawyerProfileSchema)
  })

  const handleNextStep = async (step: number) => {
    setError(null)
    
    if (step === 1) {
      const isValid = await basicForm.trigger()
      if (isValid) {
        const data = basicForm.getValues()
        setBasicInfo(data)
        setCurrentStep(2)
      }
    } else if (step === 2) {
      const isValid = await userTypeForm.trigger()
      if (isValid) {
        const data = userTypeForm.getValues()
        setUserType(data)
        if (data.role === "CLIENT") {
          // Se for cliente, vai direto para o envio
          handleSubmit()
        } else {
          setCurrentStep(3)
        }
      }
    } else if (step === 3) {
      const isValid = await lawyerForm.trigger()
      if (isValid) {
        const data = lawyerForm.getValues()
        setLawyerProfile(data)
        handleSubmit()
      }
    }
  }

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    if (!basicInfo || !userType) {
      setError("Dados incompletos")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const payload = {
        ...basicInfo,
        ...userType,
        ...(userType.role === "LAWYER" && lawyerProfile)
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        router.push("/login?message=cadastro-sucesso")
      } else {
        setError(data.error || "Erro ao realizar cadastro")
      }
    } catch (error) {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSpecialty = (specialty: string) => {
    const current = lawyerForm.getValues("specialty") || []
    if (current.includes(specialty)) {
      lawyerForm.setValue("specialty", current.filter(s => s !== specialty))
    } else {
      lawyerForm.setValue("specialty", [...current, specialty])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-200 text-gray-600"
                  }
                `}>
                  {currentStep > step ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div className={`
                    w-full h-1 mx-2
                    ${currentStep > step ? "bg-blue-600" : "bg-gray-200"}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Dados básicos</span>
            <span>Tipo de conta</span>
            <span>Perfil profissional</span>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {currentStep === 1 && "Criar sua conta"}
              {currentStep === 2 && "Tipo de conta"}
              {currentStep === 3 && "Perfil profissional"}
            </CardTitle>
            <CardDescription className="text-center">
              {currentStep === 1 && "Preencha seus dados básicos"}
              {currentStep === 2 && "Você é cliente ou advogado?"}
              {currentStep === 3 && "Complete seu perfil profissional"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Passo 1: Dados básicos */}
            {currentStep === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); handleNextStep(1) }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      placeholder="Seu nome completo"
                      className="pl-10"
                      {...basicForm.register("name")}
                    />
                  </div>
                  {basicForm.formState.errors.name && (
                    <p className="text-sm text-red-600">{basicForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      {...basicForm.register("email")}
                    />
                  </div>
                  {basicForm.formState.errors.email && (
                    <p className="text-sm text-red-600">{basicForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      {...basicForm.register("password")}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {basicForm.formState.errors.password && (
                    <p className="text-sm text-red-600">{basicForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      {...basicForm.register("confirmPassword")}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {basicForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600">{basicForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone (opcional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      placeholder="(11) 99999-9999"
                      className="pl-10"
                      {...basicForm.register("phone")}
                    />
                  </div>
                </div>
              </form>
            )}

            {/* Passo 2: Tipo de conta */}
            {currentStep === 2 && (
              <form onSubmit={(e) => { e.preventDefault(); handleNextStep(2) }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => userTypeForm.setValue("role", "CLIENT")}
                    className={`
                      p-6 border-2 rounded-lg text-center transition-all
                      ${userTypeForm.watch("role") === "CLIENT"
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <User className="w-12 h-12 mx-auto mb-2" />
                    <h3 className="font-semibold text-lg">Cliente</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Preciso de ajuda jurídica
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => userTypeForm.setValue("role", "LAWYER")}
                    className={`
                      p-6 border-2 rounded-lg text-center transition-all
                      ${userTypeForm.watch("role") === "LAWYER"
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <Briefcase className="w-12 h-12 mx-auto mb-2" />
                    <h3 className="font-semibold text-lg">Advogado</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Sou profissional da área
                    </p>
                  </button>
                </div>
                {userTypeForm.formState.errors.role && (
                  <p className="text-sm text-red-600 text-center">{userTypeForm.formState.errors.role.message}</p>
                )}
              </form>
            )}

            {/* Passo 3: Perfil de advogado */}
            {currentStep === 3 && (
              <form onSubmit={(e) => { e.preventDefault(); handleNextStep(3) }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="oab">Número OAB</Label>
                    <Input
                      id="oab"
                      placeholder="12345"
                      {...lawyerForm.register("oab")}
                    />
                    {lawyerForm.formState.errors.oab && (
                      <p className="text-sm text-red-600">{lawyerForm.formState.errors.oab.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="oabState">UF OAB</Label>
                    <select
                      id="oabState"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      {...lawyerForm.register("oabState")}
                    >
                      <option value="">Selecione</option>
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    {lawyerForm.formState.errors.oabState && (
                      <p className="text-sm text-red-600">{lawyerForm.formState.errors.oabState.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Especialidades</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {specialties.map(specialty => {
                      const selected = lawyerForm.watch("specialty")?.includes(specialty)
                      return (
                        <button
                          key={specialty}
                          type="button"
                          onClick={() => toggleSpecialty(specialty)}
                          className={`
                            p-2 text-sm border rounded-md transition-all
                            ${selected 
                              ? "border-blue-600 bg-blue-50 text-blue-600" 
                              : "border-gray-200 hover:border-gray-300"
                            }
                          `}
                        >
                          {specialty}
                        </button>
                      )
                    })}
                  </div>
                  {lawyerForm.formState.errors.specialty && (
                    <p className="text-sm text-red-600">{lawyerForm.formState.errors.specialty.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="biography">Biografia (opcional)</Label>
                  <textarea
                    id="biography"
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Fale sobre sua experiência..."
                    {...lawyerForm.register("biography")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Formação (opcional)</Label>
                  <Input
                    id="education"
                    placeholder="Faculdade de Direito - Universidade"
                    {...lawyerForm.register("education")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experiência (opcional)</Label>
                  <Input
                    id="experience"
                    placeholder="Anos de experiência ou áreas de atuação"
                    {...lawyerForm.register("experience")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="officeAddress">Endereço do escritório (opcional)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="officeAddress"
                      placeholder="Rua, número - bairro, cidade"
                      className="pl-10"
                      {...lawyerForm.register("officeAddress")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="officePhone">Telefone do escritório (opcional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="officePhone"
                      placeholder="(11) 9999-9999"
                      className="pl-10"
                      {...lawyerForm.register("officePhone")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultationFee">Valor da consulta (opcional)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="consultationFee"
                      placeholder="150,00"
                      className="pl-10"
                      {...lawyerForm.register("consultationFee")}
                    />
                  </div>
                </div>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <Button
              onClick={() => handleNextStep(currentStep)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  {currentStep === 3 ? "Concluir cadastro" : "Próximo"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Faça login
          </Link>
        </div>
      </div>
    </div>
  )
}