import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
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
    const users = await query<{ ID_USER: number }>(
      'SELECT id_user FROM USERS WHERE email = :email',
      { email: email.trim().toLowerCase() }
    )
    const user = users[0]
    if (!user) {
      return NextResponse.json(
        { error: 'Código inválido o expirado' },
        { status: 400 }
      )
    }

    const sessions = await query<{ ID_SESSION: number }>(
      `SELECT id_session FROM SESSIONS
       WHERE id_user = :id_user AND session_token = :token AND expires > SYSTIMESTAMP`,
      { id_user: user.ID_USER, token: hashResetCode(code) }
    )
    const session = sessions[0]
    if (!session) {
      return NextResponse.json(
        { error: 'Código inválido o expirado' },
        { status: 400 }
      )
    }

    const password_hash = await bcrypt.hash(new_password, 10)
    await query(
      'UPDATE USERS SET password_hash = :password_hash WHERE id_user = :id_user',
      { password_hash, id_user: user.ID_USER }
    )
    await query('DELETE FROM SESSIONS WHERE id_session = :id_session', {
      id_session: session.ID_SESSION,
    })

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
