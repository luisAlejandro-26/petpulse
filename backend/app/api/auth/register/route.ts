import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getClient } from '@/lib/db'

export const runtime = 'nodejs'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { name_user, email, password, gender, birth_date } = body

  if (!name_user || !email || !password || !gender || !birth_date) {
    return NextResponse.json(
      {
        error: 'Todos los campos son obligatorios: name_user, email, password, gender, birth_date',
      },
      { status: 400 }
    )
  }

  if (
    typeof name_user !== 'string' ||
    typeof gender !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    return NextResponse.json({ error: 'Formato de datos inválido' }, { status: 400 })
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: 'La contraseña debe tener al menos 6 caracteres' },
      { status: 400 }
    )
  }

  const normalizedEmail = email.trim().toLowerCase()

  try {
    const client = getClient()

    // Verificar si el email ya existe
    const { data: existing } = await client
      .from('users')
      .select('email')
      .eq('email', normalizedEmail)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      )
    }

    // Hashear contraseña
    const password_hash = await bcrypt.hash(password as string, 10)

    // Insertar usuario
    const { data: user, error } = await client
      .from('users')
      .insert({
        name_user: (name_user as string).trim(),
        email: normalizedEmail,
        password_hash,
        gender: (gender as string).trim(),
        birth_date: birth_date as string,
      })
      .select('id_user, name_user, email, role_account')
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json(
      {
        id_user: user.id_user,
        name_user: user.name_user,
        email: user.email,
        role_account: user.role_account,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error en register:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
