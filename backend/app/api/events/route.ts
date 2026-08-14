import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthedRequest, jsonError } from '@/lib/errors'
import { getClient } from '@/lib/db'

export const runtime = 'nodejs'

// GET /api/events - Listar eventos de salud del usuario (de todas sus mascotas)
export const GET = requireAuth(async (req: AuthedRequest) => {
  const id_user = req.user!.id_user

  try {
    const client = getClient()

    // Primero obtenemos las mascotas del usuario
    const { data: pets, error: petsError } = await client
      .from('pet')
      .select('id_pet')
      .eq('id_user', id_user)

    if (petsError) throw new Error(petsError.message)

    const petIds = (pets ?? []).map((p) => p.id_pet)

    if (petIds.length === 0) {
      return NextResponse.json({ events: [] })
    }

    // Luego obtenemos los eventos de esas mascotas, con el nombre de la mascota incluido
    const { data: events, error } = await client
      .from('health_event')
      .select('*, pet:id_pet(name_pet)')
      .in('id_pet', petIds)
      .order('event_date', { ascending: true })

    if (error) throw new Error(error.message)

    return NextResponse.json({ events: events ?? [] })
  } catch (error) {
    console.error('Error en GET /api/events:', error)
    return jsonError('Error interno del servidor', 500)
  }
})

// POST /api/events - Crear nuevo evento de salud
export const POST = requireAuth(async (req: AuthedRequest) => {
  const id_user = req.user!.id_user

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return jsonError('Body inválido', 400)
  }

  const { id_pet, event_type, title, event_date, event_place, next_due_date, status } = body

  if (!id_pet || !event_type || !title || !event_date || !event_place) {
    return jsonError('id_pet, event_type, title, event_date y event_place son obligatorios', 400)
  }

  const validTypes = ['VACUNA', 'CONTROL', 'DESPARACITACION', 'CIRUGIA', 'OTHER']
  if (!validTypes.includes(event_type as string)) {
    return jsonError('event_type inválido', 400)
  }

  try {
    const client = getClient()

    // Verificar que la mascota pertenezca al usuario autenticado
    const { data: pet } = await client
      .from('pet')
      .select('id_pet')
      .eq('id_pet', id_pet)
      .eq('id_user', id_user)
      .single()

    if (!pet) {
      return jsonError('Mascota no encontrada', 404)
    }

    const { data: event, error } = await client
      .from('health_event')
      .insert({
        id_pet,
        event_type,
        title,
        event_date,
        event_place,
        next_due_date: next_due_date ?? null,
        status: status ?? 'SCHEDULED',
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/events:', error)
    return jsonError('Error interno del servidor', 500)
  }
})