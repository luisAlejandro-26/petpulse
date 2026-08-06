import { NextRequest, NextResponse } from 'next/server'
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

export const PUT = requireAuth(async (req: AuthedRequest) => {
  const id_user = req.user!.id_user

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return jsonError('Body inválido', 400)
  }

  const { name_user, gender, birth_date, profile_image_url } = body

  const fields: string[] = []
  const binds: Record<string, string | number> = { id_user }

  if (name_user !== undefined) {
    fields.push('name_user = :name_user')
    binds.name_user = name_user as string
  }
  if (gender !== undefined) {
    fields.push('gender = :gender')
    binds.gender = gender as string
  }
  if (birth_date !== undefined) {
    fields.push("birth_date = TO_DATE(:birth_date, 'YYYY-MM-DD')")
    binds.birth_date = birth_date as string
  }
  if (profile_image_url !== undefined) {
    fields.push('profile_image_url = :profile_image_url')
    binds.profile_image_url = profile_image_url as string
  }

  if (fields.length === 0) {
    return jsonError('No hay campos para actualizar', 400)
  }

  let rows: UserRow[]
  try {
    await query(
      `UPDATE USERS SET ${fields.join(', ')} WHERE id_user = :id_user`,
      binds
    )
    rows = await query<UserRow>(
      `SELECT id_user, name_user, email, gender, birth_date, role_account, profile_image_url
       FROM USERS WHERE id_user = :id_user`,
      { id_user }
    )
  } catch (error) {
    console.error('Error en /auth/profile:', error)
    return jsonError('Error interno del servidor', 500)
  }

  return NextResponse.json({ user: rows[0] })
})
