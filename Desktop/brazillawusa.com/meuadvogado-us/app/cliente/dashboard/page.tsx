"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, FileText, DollarSign, User } from "lucide-react"

interface ClientDashboardData {
  profile: any
  cases: any[]
  consultations: any[]
  stats: {
    totalCases: number
    activeCases: number
    completedCases: number
    totalSpent: number
  }
}

export default function ClientDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<ClientDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated" && session?.user?.role === "CLIENT") {
      fetchDashboardData()
    }
  }, [status, session, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/client/dashboard")
      
      if (!response.ok) {
        throw new Error("Erro ao buscar dados do dashboard")
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Alert>
            <AlertDescription>Nenhum dado disponível</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meus Casos</h1>
          <p className="text-gray-600 mt-2">Bem-vindo, {data.profile.user.name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Casos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{data.stats.totalCases}</div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Casos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{data.stats.activeCases}</div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Casos Finalizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{data.stats.completedCases}</div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Gasto Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">R$ {(data.stats.totalSpent / 100).toFixed(2)}</div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cases List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Meus Casos</CardTitle>
              <CardDescription>Todos os casos abertos</CardDescription>
            </CardHeader>
            <CardContent>
              {data.cases.length === 0 ? (
                <p className="text-gray-500">Nenhum caso aberto</p>
              ) : (
                <div className="space-y-4">
                  {data.cases.map((caseItem) => (
                    <div key={caseItem.id} className="border-b pb-4 last:border-b-0">
                      <p className="font-medium">{caseItem.title}</p>
                      <p className="text-sm text-gray-600">{caseItem.lawyer.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {caseItem.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(caseItem.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consultations */}
          <Card>
            <CardHeader>
              <CardTitle>Consultas Agendadas</CardTitle>
              <CardDescription>Próximas consultas</CardDescription>
            </CardHeader>
            <CardContent>
              {data.consultations.length === 0 ? (
                <p className="text-gray-500">Nenhuma consulta agendada</p>
              ) : (
                <div className="space-y-4">
                  {data.consultations.map((consultation) => (
                    <div key={consultation.id} className="border-b pb-4 last:border-b-0">
                      <p className="font-medium">{consultation.lawyer.name}</p>
                      <p className="text-sm text-gray-600">{consultation.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(consultation.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
