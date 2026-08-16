import { NextResponse } from 'next/server'
import { requireAuth, AuthedRequest, jsonError } from '@/lib/errors'
import { getClient } from '@/lib/db'

export const runtime = 'nodejs'

export const PUT = requireAuth(async (req: AuthedRequest, { params }: { params: { id: string } }) => {
  const id_user = req.user!.id_user
  try {
    const body = await req.json()
    const { status } = body

    const client = getClient()
    const { data: event, error } = await client
      .from('health_event')
      .update({ status })
      .eq('id_event', params.id)
      .eq('id_user', id_user)
      .select('*, pet:id_pet(name_pet)')
      .single()

    if (error) throw error
    if (!event) return jsonError('Evento no encontrado', 404)

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error en PUT /api/events/[id]:', error)
    return jsonError('Error al actualizar evento', 500)
  }
})

export const DELETE = requireAuth(async (req: AuthedRequest, { params }: { params: { id: string } }) => {
  const id_user = req.user!.id_user
  try {
    const client = getClient()
    const { error } = await client
      .from('health_event')
      .delete()
      .eq('id_event', params.id)
      .eq('id_user', id_user)

    if (error) throw error

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error en DELETE /api/events/[id]:', error)
    return jsonError('Error al eliminar evento', 500)
  }
})