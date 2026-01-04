"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  Scale, 
  MessageSquare, 
  FileText, 
  Shield, 
  TrendingUp,
  Clock,
  Star,
  CheckCircle
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    lawyers: 150,
    clients: 2500,
    cases: 5000,
    satisfaction: 98
  })

  useEffect(() => {
    if (status === "authenticated") {
      if (session.user.role === "LAWYER") {
        router.push("/dashboard/advogado")
      } else {
        router.push("/dashboard/cliente")
      }
    }
  }, [status, session, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === "authenticated") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Scale className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Meu Advogado</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link href="/cadastro">
                <Button>Cadastrar</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-800">
            🚀 Plataforma #1 no Brasil
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Conecte-se com os Melhores
            <span className="text-blue-600"> Advogados</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A plataforma jurídica mais completa do mercado. Consultas online, 
            gestão de casos, documentos digitais e muito mais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro?role=CLIENT">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Sou Cliente
              </Button>
            </Link>
            <Link href="/cadastro?role=LAWYER">
              <Button size="lg" variant="outline">
                Sou Advogado
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Users, label: "Advogados", value: stats.lawyers, suffix: "+" },
              { icon: Shield, label: "Clientes", value: stats.clients, suffix: "+" },
              { icon: FileText, label: "Casos Resolvidos", value: stats.cases, suffix: "+" },
              { icon: Star, label: "Satisfação", value: stats.satisfaction, suffix: "%" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900">
                  {stat.value.toLocaleString()}{stat.suffix}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Recursos que Transformam a Justiça
            </h2>
            <p className="text-xl text-gray-600">
              Tecnologia de ponta para uma experiência jurídica superior
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageSquare,
                title: "Consultas Online",
                description: "Conecte-se com advogados especializados via vídeo, áudio ou chat.",
                features: ["Vídeo chamadas", "Chat em tempo real", "Agendamento fácil"]
              },
              {
                icon: FileText,
                title: "Gestão de Casos",
                description: "Acompanhe seus processos jurídicos em tempo real.",
                features: ["Dashboard completo", "Notificações", "Histórico detalhado"]
              },
              {
                icon: Shield,
                title: "Documentos Digitais",
                description: "Crie, assine e gerencie documentos com validade legal.",
                features: ["Assinatura digital", "Armazenamento seguro", "Compartilhamento"]
              },
              {
                icon: TrendingUp,
                title: "IA Jurídica",
                description: "Análise inteligente de casos e previsões.",
                features: ["Análise de documentos", "Previsões", "Otimização"]
              },
              {
                icon: Clock,
                title: "Agendamento Inteligente",
                description: "Encontre o horário perfeito para suas consultas.",
                features: ["Calendário integrado", "Lembretes", "Confirmação automática"]
              },
              {
                icon: CheckCircle,
                title: "Pagamentos Seguros",
                description: "Sistema de pagamentos integrado e transparente.",
                features: ["Stripe integration", "Parcelamento", "Recibo digital"]
              }
            ].map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Histórias de Sucesso
            </h2>
            <p className="text-xl text-gray-600">
              Veja o que nossos clientes dizem
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "João Silva",
                role: "Empresário",
                content: "Encontrei o advogado perfeito para meu caso em minutos. Plataforma incrível!",
                rating: 5
              },
              {
                name: "Maria Santos",
                role: "Advogada",
                content: "Aumentei minha clientela em 40% depois que me cadastrei na plataforma.",
                rating: 5
              },
              {
                name: "Pedro Costa",
                role: "Cliente",
                content: "A consulta online foi muito prática e o atendimento foi excelente.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <Avatar className="mx-auto mb-2">
                    <AvatarImage src={`/avatars/${index + 1}.jpg`} />
                    <AvatarFallback>
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4">
            Pronto para Revolucionar sua Vida Jurídica?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a milhares de clientes e advogados que já transformaram 
            a forma como lidam com questões jurídicas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro?role=CLIENT">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Começar Gratuitamente
              </Button>
            </Link>
            <Link href="/para-advogados">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Para Advogados
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Scale className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">Meu Advogado</span>
              </div>
              <p className="text-gray-400">
                A plataforma jurídica mais completa do Brasil.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Para Clientes</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/como-funciona" className="hover:text-white">Como Funciona</Link></li>
                <li><Link href="/buscar-advogados" className="hover:text-white">Buscar Advogados</Link></li>
                <li><Link href="/precos" className="hover:text-white">Preços</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Para Advogados</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/para-advogados" className="hover:text-white">Cadastre-se</Link></li>
                <li><Link href="/beneficios" className="hover:text-white">Benefícios</Link></li>
                <li><Link href="/tarifas" className="hover:text-white">Tarifas</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/sobre-nos" className="hover:text-white">Sobre Nós</Link></li>
                <li><Link href="/contato" className="hover:text-white">Contato</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Meu Advogado. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}