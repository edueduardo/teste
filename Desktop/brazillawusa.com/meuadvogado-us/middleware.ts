import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Rotas públicas que não precisam de autenticação
const publicRoutes = [
  "/",
  "/login",
  "/cadastro",
  "/api/auth",
  "/api/stripe/webhook", // Webhook precisa ser público
  "/_next",
  "/favicon.ico",
  "/images"
]

// Rotas que redirecionam para dashboard se já estiver autenticado
const authRoutes = ["/login", "/cadastro"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )

  // Se for rota pública, permitir acesso
  if (isPublicRoute) {
    // Mas se for rota de auth e usuário já estiver logado, redirecionar para dashboard
    if (authRoutes.includes(pathname)) {
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
      })
      
      if (token) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }
    
    return NextResponse.next()
  }

  // Para rotas privadas, verificar autenticação
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  // Se não tiver token, redirecionar para login
  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Se tiver token, permitir acesso
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}