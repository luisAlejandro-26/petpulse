import { NextResponse } from 'next/server'
import { requireAuth, AuthedRequest, jsonError } from '@/lib/errors'
import { getClient } from '@/lib/db'

export const runtime = 'nodejs'

export const GET = requireAuth(async (req: AuthedRequest) => {
  const id_user = req.user!.id_user

  try {
    const client = getClient()

    const { data: user, error } = await client
      .from('users')
      .select('id_user, name_user, email, gender, birth_date, role_account, profile_image_url')
      .eq('id_user', id_user)
      .single()

    if (error || !user) {
      return jsonError('Usuario no encontrado', 404)
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error en /auth/me:', error)
    return jsonError('Error interno del servidor', 500)
  }
})
