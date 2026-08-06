import { NextResponse } from 'next/server'
import { requireAuth, AuthedRequest, jsonError } from '@/lib/errors'
import { query } from '@/lib/db'

export const runtime = 'nodejs'

interface UserRow {
  ID_USER: number
  NAME_USER: string
  EMAIL: string
  GENDER: string
  BIRTH_DATE: Date
  ROLE_ACCOUNT: string
  PROFILE_IMAGE_URL: string | null
}

export const GET = requireAuth(async (req: AuthedRequest) => {
  const id_user = req.user!.id_user
  let rows: UserRow[]
  try {
    rows = await query<UserRow>(
      `SELECT id_user, name_user, email, gender, birth_date, role_account, profile_image_url
       FROM USERS WHERE id_user = :id_user`,
      { id_user }
    )
  } catch (error) {
    console.error('Error en /auth/me:', error)
    return jsonError('Error interno del servidor', 500)
  }

  if (!rows[0]) {
    return jsonError('Usuario no encontrado', 404)
  }

  return NextResponse.json({ user: rows[0] })
})
