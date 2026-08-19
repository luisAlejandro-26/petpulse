import { NextResponse } from 'next/server'
import { requireAuth, AuthedRequest, jsonError } from '@/lib/errors'
import { getClient } from '@/lib/db'

export const runtime = 'nodejs'

export const GET = requireAuth(async (req: AuthedRequest) => {
  const id_user = req.user!.id_user
  try {
    const client = getClient()
    const { data: events, error } = await client
      .from('health_event')
      .select('*, pet:id_pet(name_pet)')
      .eq('id_user', id_user)
      .order('event_date', { ascending: false })

    if (error) throw error

    return NextResponse.json({ events: events || [] })
  } catch (error) {
    console.error('Error en GET /api/events:', error)
    return jsonError('Error al obtener eventos', 500)
  }
})

export const POST = requireAuth(async (req: AuthedRequest) => {
  const id_user = req.user!.id_user
  try {
    const body = await req.json()
    const { id_pet, event_type, title, event_date, event_place, status } = body

    if (!id_pet || !event_type || !title || !event_date) {
      return jsonError('Faltan campos requeridos', 400)
    }

    const client = getClient()
    const { data: event, error } = await client
      .from('health_event')
      .insert({
        id_pet,
        id_user,
        event_type,
        title,
        event_date,
        event_place: event_place || 'Sin especificar',
        status: status || 'SCHEDULED',
      })
      .select('*, pet:id_pet(name_pet)')
      .single()

    if (error) throw error

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/events:', error)
    return jsonError('Error al crear evento', 500)
  }
})