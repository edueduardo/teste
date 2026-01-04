"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Star, MapPin, Phone, Mail, Briefcase } from "lucide-react"

interface LawyerProfile {
  id: string
  userId: string
  oab: string
  oabState: string
  specialty: string[]
  biography: string
  education: string
  experience: string
  officeAddress: string
  officePhone: string
  consultationFee: string
  rating: number
  totalReviews: number
  user: {
    id: string
    name: string
    email: string
    avatar: string
    phone: string
  }
}

export default function LawyerProfilePage() {
  const params = useParams()
  const slug = params.slug as string
  const [profile, setProfile] = useState<LawyerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLawyerProfile()
  }, [slug])

  const fetchLawyerProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/lawyer/${slug}`)
      
      if (!response.ok) {
        throw new Error("Advogado não encontrado")
      }

      const result = await response.json()
      setProfile(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Alert>
            <AlertDescription>Perfil não encontrado</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {profile.user.avatar && (
                <img
                  src={profile.user.avatar}
                  alt={profile.user.name}
                  className="w-32 h-32 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{profile.user.name}</h1>
                <p className="text-gray-600 mt-1">OAB {profile.oab}/{profile.oabState}</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(profile.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {profile.rating.toFixed(1)} ({profile.totalReviews} avaliações)
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{profile.user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{profile.user.email}</span>
                  </div>
                  {profile.officeAddress && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.officeAddress}</span>
                    </div>
                  )}
                </div>

                <Button className="mt-4">Agendar Consulta</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specialties */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Especialidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.specialty.map((spec) => (
                <span
                  key={spec}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {spec}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Biography */}
        {profile.biography && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Sobre</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{profile.biography}</p>
            </CardContent>
          </Card>
        )}

        {/* Education */}
        {profile.education && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Formação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{profile.education}</p>
            </CardContent>
          </Card>
        )}

        {/* Experience */}
        {profile.experience && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Experiência</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{profile.experience}</p>
            </CardContent>
          </Card>
        )}

        {/* Consultation Fee */}
        {profile.consultationFee && (
          <Card>
            <CardHeader>
              <CardTitle>Valor da Consulta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">R$ {profile.consultationFee}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
