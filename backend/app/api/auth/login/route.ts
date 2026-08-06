import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { signToken } from '@/lib/jwt'

export const runtime = 'nodejs'

interface UserRow {
  ID_USER: number
  NAME_USER: string
  EMAIL: string
  PASSWORD_HASH: string
  ROLE_ACCOUNT: string
}

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

  let rows: UserRow[]
  try {
    rows = await query<UserRow>(
      `SELECT id_user, name_user, email, password_hash, role_account
       FROM USERS WHERE email = :email`,
      { email: email.trim().toLowerCase() }
    )
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }

  const user = rows[0]
  if (!user) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
  }

  const match = await bcrypt.compare(password, user.PASSWORD_HASH)
  if (!match) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
  }

  const token = signToken({
    id_user: user.ID_USER,
    role_account: user.ROLE_ACCOUNT,
  })

  return NextResponse.json({
    token,
    user: {
      id_user: user.ID_USER,
      name_user: user.NAME_USER,
      email: user.EMAIL,
      role_account: user.ROLE_ACCOUNT,
    },
  })
}
