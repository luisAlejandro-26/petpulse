import { NextResponse } from 'next/server'
import { requireAdmin, AuthedRequest, jsonError } from '@/lib/errors'
import { getClient } from '@/lib/db'

export const runtime = 'nodejs'

interface Params {
  params: { id: string }
}

// DELETE /api/users/[id] - Eliminar un usuario (solo ADMIN)
export const DELETE = requireAdmin(async (req: AuthedRequest, { params }: Params) => {
  const id_user = params.id

  if (req.user!.id_user === Number(id_user)) {
    return jsonError('No puedes eliminar tu propia cuenta', 400)
  }

  try {
    const client = getClient()

    const { error } = await client
      .from('users')
      .delete()
      .eq('id_user', id_user)

    if (error) throw new Error(error.message)

    return NextResponse.json({ message: 'Usuario eliminado correctamente' })
  } catch (error) {
    console.error('Error en DELETE /api/users/[id]:', error)
    return jsonError('Error interno del servidor', 500)
  }
})

// PUT /api/users/[id] - Cambiar el rol de un usuario (solo ADMIN)
export const PUT = requireAdmin(async (req: AuthedRequest, { params }: Params) => {
  const id_user = params.id

  if (req.user!.id_user === Number(id_user)) {
    return jsonError('No puedes cambiar tu propio rol', 400)
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return jsonError('Body inválido', 400)
  }

  const { role_account } = body

  if (role_account !== 'USER' && role_account !== 'ADMIN') {
    return jsonError('role_account debe ser USER o ADMIN', 400)
  }

  try {
    const client = getClient()

    const { data: user, error } = await client
      .from('users')
      .update({ role_account })
      .eq('id_user', id_user)
      .select('id_user, name_user, email, gender, birth_date, role_account, profile_image_url')
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error en PUT /api/users/[id]:', error)
    return jsonError('Error interno del servidor', 500)
  }
})