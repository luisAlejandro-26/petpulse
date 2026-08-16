import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthedRequest, jsonError } from '@/lib/errors'
import { getClient } from '@/lib/db'

export const runtime = 'nodejs'

interface Params {
  params: { id: string }
}

// PUT /api/events/[id] - Editar evento (ej: marcar como completado)
export const PUT = requireAuth(async (req: AuthedRequest, { params }: Params) => {
  const id_user = req.user!.id_user
  const id_event = params.id

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return jsonError('Body inválido', 400)
  }

  const { title, event_date, event_place, next_due_date, status, event_type } = body

  const updates: Record<string, unknown> = {}
  if (title !== undefined) updates.title = title
  if (event_date !== undefined) updates.event_date = event_date
  if (event_place !== undefined) updates.event_place = event_place
  if (next_due_date !== undefined) updates.next_due_date = next_due_date
  if (event_type !== undefined) updates.event_type = event_type
  if (status !== undefined) {
    const validStatus = ['COMPLETED', 'SCHEDULED', 'CANCELLED']
    if (!validStatus.includes(status as string)) {
      return jsonError('status inválido', 400)
    }
    updates.status = status
  }

  if (Object.keys(updates).length === 0) {
    return jsonError('No hay campos para actualizar', 400)
  }

  try {
    const client = getClient()

    // Verificar que el evento pertenezca a una mascota del usuario
    const { data: existing } = await client
      .from('health_event')
      .select('id_event, id_pet, pet:id_pet(id_user)')
      .eq('id_event', id_event)
      .single()

    if (!existing || (existing.pet as unknown as { id_user: number }).id_user !== id_user) {
      return jsonError('Evento no encontrado', 404)
    }

    const { data: event, error } = await client
      .from('health_event')
      .update(updates)
      .eq('id_event', id_event)
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error en PUT /api/events/[id]:', error)
    return jsonError('Error interno del servidor', 500)
  }
})

// DELETE /api/events/[id] - Eliminar evento
export const DELETE = requireAuth(async (req: AuthedRequest, { params }: Params) => {
  const id_user = req.user!.id_user
  const id_event = params.id

  try {
    const client = getClient()

    const { data: existing } = await client
      .from('health_event')
      .select('id_event, pet:id_pet(id_user)')
      .eq('id_event', id_event)
      .single()

    if (!existing || (existing.pet as unknown as { id_user: number }).id_user !== id_user) {
      return jsonError('Evento no encontrado', 404)
    }

    const { error } = await client
      .from('health_event')
      .delete()
      .eq('id_event', id_event)

    if (error) throw new Error(error.message)

    return NextResponse.json({ message: 'Evento eliminado correctamente' })
  } catch (error) {
    console.error('Error en DELETE /api/events/[id]:', error)
    return jsonError('Error interno del servidor', 500)
  }
})