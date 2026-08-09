import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/db'
import { generateResetCode, hashResetCode } from '@/lib/reset-code'
import { sendPasswordResetCode } from '@/lib/mailer'

export const runtime = 'nodejs'

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
    const client = getClient()

    // Buscar usuario
    const { data: user } = await client
      .from('users')
      .select('id_user, email')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (user) {
      const code = generateResetCode()

      // Eliminar sesiones anteriores
      await client
        .from('sessions')
        .delete()
        .eq('id_user', user.id_user)

      // Crear nueva sesión con código de reset
      const expires = new Date()
      expires.setMinutes(expires.getMinutes() + 15)

      await client
        .from('sessions')
        .insert({
          session_token: hashResetCode(code),
          id_user: user.id_user,
          expires: expires.toISOString(),
        })

      await sendPasswordResetCode(user.email, code)
    }
  } catch (error) {
    console.error('Error en /auth/forgot-password:', error)
  }

  return NextResponse.json({
    message: 'Si el email existe, recibirás un código de recuperación',
  })
}
