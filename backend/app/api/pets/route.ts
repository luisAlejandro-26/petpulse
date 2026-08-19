import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthedRequest, jsonError } from '@/lib/errors'
import { getClient } from '@/lib/db'

export const runtime = 'nodejs'

// GET /api/pets - Listar mascotas del usuario autenticado
export const GET = requireAuth(async (req: AuthedRequest) => {
  const id_user = req.user!.id_user

  try {
    const client = getClient()

    const { data: pets, error } = await client
      .from('pet')
      .select('*')
      .eq('id_user', id_user)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return NextResponse.json({ pets: pets ?? [] })
  } catch (error) {
    console.error('Error en GET /api/pets:', error)
    return jsonError('Error interno del servidor', 500)
  }
})

// POST /api/pets - Crear nueva mascota
export const POST = requireAuth(async (req: AuthedRequest) => {
  const id_user = req.user!.id_user

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return jsonError('Body inválido', 400)
  }

  const { name_pet, species, breed, birth_date, diseases, notes, pet_image_url, gender, weight, color } = body

  if (!name_pet || !species || !birth_date) {
    return jsonError('Los campos name_pet, species y birth_date son obligatorios', 400)
  }

  const validSpecies = ['PERRO', 'GATO', 'CONEJO', 'PAJARO', 'OTHER']
  if (!validSpecies.includes(species as string)) {
    return jsonError('Especie inválida. Debe ser: PERRO, GATO, CONEJO, PAJARO u OTHER', 400)
  }

  try {
    const client = getClient()

    const { data: pet, error } = await client
      .from('pet')
      .insert({
        id_user,
        name_pet,
        species,
        breed: breed ?? null,
        birth_date,
        diseases: diseases ?? null,
        notes: notes ?? null,
        pet_image_url: pet_image_url ?? null,
        gender: gender ?? null,
        weight: weight ?? null,
        color: color ?? null,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ pet }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/pets:', error)
    return jsonError('Error interno del servidor', 500)
  }
})