import { NextRequest, NextResponse } from 'next/server'
import { AuthUser, verifyToken } from './jwt'

// Rutas públicas (sin token):
//   GET  /api/health
//   POST /api/auth/register
//   POST /api/auth/login
// Rutas protegidas (requireAuth):
//   GET  /api/auth/me
//   PUT  /api/auth/profile
//   POST /api/auth/logout
//   *    /api/pets, /api/events
// Rutas de administrador (requireAdmin):
//   *    /api/admin/* (gestión de usuarios, roles, etc.)

export type AuthedRequest = NextRequest & { user?: AuthUser }

export function jsonError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

export function requireAuth(
  handler: (
    req: AuthedRequest
  ) => NextResponse | Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return async (req) => {
    const header = req.headers.get('authorization') ?? ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    const user = token ? verifyToken(token) : null
    if (!user) {
      return jsonError('No autorizado', 401)
    }
    ;(req as AuthedRequest).user = user
    return handler(req as AuthedRequest)
  }
}

export function requireAdmin(
  handler: (
    req: AuthedRequest
  ) => NextResponse | Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return async (req) => {
    const header = req.headers.get('authorization') ?? ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    const user = token ? verifyToken(token) : null
    if (!user) {
      return jsonError('No autorizado', 401)
    }
    if (user.role_account !== 'ADMIN') {
      return jsonError('Prohibido: se requiere rol ADMIN', 403)
    }
    ;(req as AuthedRequest).user = user
    return handler(req as AuthedRequest)
  }
}
