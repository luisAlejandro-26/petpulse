import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/db'
import { hashResetCode } from '@/lib/reset-code'

export const runtime = 'nodejs'

const CODE_REGEX = /^\d{6}$/

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { email, code } = body
  if (typeof email !== 'string' || typeof code !== 'string') {
    return NextResponse.json(
      { error: 'Email y código son obligatorios' },
      { status: 400 }
    )
  }
  if (!CODE_REGEX.test(code)) {
    return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
  }

  try {
    const client = getClient()

    // Buscar usuario
    const { data: user } = await client
      .from('users')
      .select('id_user')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (!user) {
      return NextResponse.json(
        { error: 'Código inválido o expirado' },
        { status: 400 }
      )
    }

    // Verificar sesión/código válido
    const now = new Date().toISOString()
    const { data: session } = await client
      .from('sessions')
      .select('id_session')
      .eq('id_user', user.id_user)
      .eq('session_token', hashResetCode(code))
      .gt('expires', now)
      .single()

    if (!session) {
      return NextResponse.json(
        { error: 'Código inválido o expirado' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Código válido',
    })
  } catch (error) {
    console.error('Error en /auth/verify-code:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
