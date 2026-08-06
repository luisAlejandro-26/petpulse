import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { generateResetCode, hashResetCode } from '@/lib/reset-code'
import { sendPasswordResetCode } from '@/lib/mailer'

export const runtime = 'nodejs'

interface UserRow {
  ID_USER: number
  EMAIL: string
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { email } = body
  if (typeof email !== 'string' || !email) {
    return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
  }

  try {
    const users = await query<UserRow>(
      'SELECT id_user, email FROM USERS WHERE email = :email',
      { email: email.trim().toLowerCase() }
    )
    const user = users[0]
    if (user) {
      const code = generateResetCode()
      await query('DELETE FROM SESSIONS WHERE id_user = :id_user', {
        id_user: user.ID_USER,
      })
      await query(
        `INSERT INTO SESSIONS (session_token, id_user, expires)
         VALUES (:token, :id_user, SYSTIMESTAMP + INTERVAL '15' MINUTE)`,
        { token: hashResetCode(code), id_user: user.ID_USER }
      )
      await sendPasswordResetCode(user.EMAIL, code)
    }
  } catch (error) {
    console.error('Error en /auth/forgot-password:', error)
  }

  return NextResponse.json({
    message: 'Si el email existe, recibirás un código de recuperación',
  })
}
