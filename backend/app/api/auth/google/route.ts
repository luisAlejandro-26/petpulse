import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getClient } from '@/lib/db'
import { signToken } from '@/lib/jwt'

export const runtime = 'nodejs'

interface GoogleUserInfo {
  email?: string
  email_verified?: boolean
  name?: string
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { access_token } = body
  if (typeof access_token !== 'string' || !access_token) {
    return NextResponse.json({ error: 'Falta el access_token de Google' }, { status: 400 })
  }

  let email: string
  let name: string

  try {
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    if (!googleRes.ok) {
      return NextResponse.json({ error: 'Token de Google inválido' }, { status: 401 })
    }

    const payload = (await googleRes.json()) as GoogleUserInfo

    if (!payload.email || !payload.email_verified) {
      return NextResponse.json({ error: 'No se pudo verificar la cuenta de Google' }, { status: 401 })
    }

    email = payload.email.trim().toLowerCase()
    name = payload.name?.trim() || email.split('@')[0]
  } catch (error) {
    console.error('Error verificando token de Google:', error)
    return NextResponse.json({ error: 'Token de Google inválido' }, { status: 401 })
  }

  try {
    const client = getClient()

    const { data: existingUser } = await client
      .from('users')
      .select('id_user, name_user, email, role_account')
      .eq('email', email)
      .single()

    if (existingUser) {
      const token = signToken({
        id_user: existingUser.id_user,
        role_account: existingUser.role_account,
      })

      return NextResponse.json({
        token,
        isNewUser: false,
        user: {
          id_user: existingUser.id_user,
          name_user: existingUser.name_user,
          email: existingUser.email,
          role_account: existingUser.role_account,
        },
      })
    }

    // Usuario nuevo via Google: no hay password ni gender/birth_date,
    // se genera un hash aleatorio para password_hash (nunca se usara para login normal).
    const randomPassword = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const password_hash = await bcrypt.hash(randomPassword, 10)

    const { data: newUser, error } = await client
      .from('users')
      .insert({
        name_user: name,
        email,
        password_hash,
        gender: null,
        birth_date: null,
      })
      .select('id_user, name_user, email, role_account')
      .single()

    if (error) throw new Error(error.message)

    const token = signToken({
      id_user: newUser.id_user,
      role_account: newUser.role_account,
    })

    return NextResponse.json(
      {
        token,
        isNewUser: true,
        user: {
          id_user: newUser.id_user,
          name_user: newUser.name_user,
          email: newUser.email,
          role_account: newUser.role_account,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error en google auth:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}