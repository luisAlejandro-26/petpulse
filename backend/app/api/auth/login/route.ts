import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getClient } from '@/lib/db'
import { signToken } from '@/lib/jwt'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { email, password } = body
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return NextResponse.json(
      { error: 'Email y contraseña son obligatorios' },
      { status: 400 }
    )
  }

  try {
    const client = getClient()

    // Buscar usuario por email
    const { data: user, error } = await client
      .from('users')
      .select('id_user, name_user, email, password_hash, role_account, gender, birth_date, profile_image_url')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    // Verificar contraseña
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    // Generar token
    const token = signToken({
      id_user: user.id_user,
      role_account: user.role_account,
    })

    return NextResponse.json({
      token,
      user: {
        id_user: user.id_user,
        name_user: user.name_user,
        email: user.email,
        role_account: user.role_account,
        gender: user.gender,
        birth_date: user.birth_date,
        profile_image_url: user.profile_image_url,
      },
    })
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
