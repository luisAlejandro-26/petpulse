import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
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

  const { email, code, new_password } = body
  if (
    typeof email !== 'string' ||
    typeof code !== 'string' ||
    typeof new_password !== 'string'
  ) {
    return NextResponse.json(
      { error: 'Email, código y nueva contraseña son obligatorios' },
      { status: 400 }
    )
  }
  if (!CODE_REGEX.test(code)) {
    return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
  }
  if (new_password.length < 6) {
    return NextResponse.json(
      { error: 'La contraseña debe tener al menos 6 caracteres' },
      { status: 400 }
    )
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

    // Actualizar contraseña
    const password_hash = await bcrypt.hash(new_password, 10)
    await client
      .from('users')
      .update({ password_hash })
      .eq('id_user', user.id_user)

    // Eliminar sesión usada
    await client
      .from('sessions')
      .delete()
      .eq('id_session', session.id_session)

    return NextResponse.json({
      message: 'Contraseña actualizada correctamente',
    })
  } catch (error) {
    console.error('Error en /auth/reset-password:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
