import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'

export const runtime = 'nodejs'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface UserRow {
  ID_USER: number
  NAME_USER: string
  EMAIL: string
  ROLE_ACCOUNT: string
}

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
        error:
          'Todos los campos son obligatorios: name_user, email, password, gender, birth_date',
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
    const existing = await query<{ EMAIL: string }>(
      'SELECT email FROM USERS WHERE email = :email',
      { email: normalizedEmail }
    )
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      )
    }

    const password_hash = await bcrypt.hash(password, 10)

    await query(
      `INSERT INTO USERS (name_user, email, password_hash, gender, birth_date)
       VALUES (:name_user, :email, :password_hash, :gender, TO_DATE(:birth_date, 'YYYY-MM-DD'))`,
      {
        name_user: name_user.trim(),
        email: normalizedEmail,
        password_hash,
        gender: gender.trim(),
        birth_date: birth_date,
      }
    )

    const rows = await query<UserRow>(
      `SELECT id_user, name_user, email, role_account
       FROM USERS WHERE email = :email`,
      { email: normalizedEmail }
    )
    const user = rows[0]

    return NextResponse.json(
      {
        id_user: user.ID_USER,
        name_user: user.NAME_USER,
        email: user.EMAIL,
        role_account: user.ROLE_ACCOUNT,
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
