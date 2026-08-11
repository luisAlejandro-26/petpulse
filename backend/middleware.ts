import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': FRONTEND_URL,
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function middleware(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    const res = new NextResponse(null, { status: 204 })
    for (const [name, value] of Object.entries(CORS_HEADERS)) {
      res.headers.set(name, value)
    }
    return res
  }

  const res = NextResponse.next()
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(name, value)
  }
  for (const [name, value] of Object.entries(CORS_HEADERS)) {
    res.headers.set(name, value)
  }
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
