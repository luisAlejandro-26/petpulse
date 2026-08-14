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
