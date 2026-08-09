import { NextResponse } from 'next/server'
import { requireAuth, AuthedRequest, jsonError } from '@/lib/errors'
import { getClient } from '@/lib/db'

export const runtime = 'nodejs'

export const PUT = requireAuth(async (req: AuthedRequest) => {
  const id_user = req.user!.id_user

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return jsonError('Body inválido', 400)
  }

  const { name_user, gender, birth_date, profile_image_url } = body

  const updates: Record<string, unknown> = {}

  if (name_user !== undefined) updates.name_user = name_user
  if (gender !== undefined) updates.gender = gender
  if (birth_date !== undefined) updates.birth_date = birth_date
  if (profile_image_url !== undefined) updates.profile_image_url = profile_image_url

  if (Object.keys(updates).length === 0) {
    return jsonError('No hay campos para actualizar', 400)
  }

  try {
    const client = getClient()

    const { data: user, error } = await client
      .from('users')
      .update(updates)
      .eq('id_user', id_user)
      .select('id_user, name_user, email, gender, birth_date, role_account, profile_image_url')
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error en /auth/profile:', error)
    return jsonError('Error interno del servidor', 500)
  }
})
