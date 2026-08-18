import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthedRequest, jsonError } from '@/lib/errors'
import { getClient } from '@/lib/db'

export const runtime = 'nodejs'

interface Params {
  params: { id: string }
}

// GET /api/pets/[id] - Ver una mascota específica
export const GET = requireAuth(async (req: AuthedRequest, { params }: Params) => {
  const id_user = req.user!.id_user
  const id_pet = params.id

  try {
    const client = getClient()

    const { data: pet, error } = await client
      .from('pet')
      .select('*')
      .eq('id_pet', id_pet)
      .eq('id_user', id_user)
      .single()

    if (error || !pet) {
      return jsonError('Mascota no encontrada', 404)
    }

    return NextResponse.json({ pet })
  } catch (error) {
    console.error('Error en GET /api/pets/[id]:', error)
    return jsonError('Error interno del servidor', 500)
  }
})

// PUT /api/pets/[id] - Editar mascota
export const PUT = requireAuth(async (req: AuthedRequest, { params }: Params) => {
  const id_user = req.user!.id_user
  const id_pet = params.id

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return jsonError('Body inválido', 400)
  }

  const { name_pet, species, breed, birth_date, diseases, notes, pet_image_url, gender, weight, color } = body

  const updates: Record<string, unknown> = {}
  if (name_pet !== undefined) updates.name_pet = name_pet
  if (species !== undefined) {
    const validSpecies = ['PERRO', 'GATO', 'CONEJO', 'PAJARO', 'OTHER']
    if (!validSpecies.includes(species as string)) {
      return jsonError('Especie inválida', 400)
    }
    updates.species = species
  }
  if (breed !== undefined) updates.breed = breed
  if (birth_date !== undefined) updates.birth_date = birth_date
  if (diseases !== undefined) updates.diseases = diseases
  if (notes !== undefined) updates.notes = notes
  if (pet_image_url !== undefined) updates.pet_image_url = pet_image_url
  if (gender !== undefined) updates.gender = gender
  if (weight !== undefined) updates.weight = weight
  if (color !== undefined) updates.color = color

  if (Object.keys(updates).length === 0) {
    return jsonError('No hay campos para actualizar', 400)
  }

  try {
    const client = getClient()

    const { data: pet, error } = await client
      .from('pet')
      .update(updates)
      .eq('id_pet', id_pet)
      .eq('id_user', id_user)
      .select()
      .single()

    if (error || !pet) {
      return jsonError('Mascota no encontrada', 404)
    }

    return NextResponse.json({ pet })
  } catch (error) {
    console.error('Error en PUT /api/pets/[id]:', error)
    return jsonError('Error interno del servidor', 500)
  }
})

// DELETE /api/pets/[id] - Eliminar mascota
export const DELETE = requireAuth(async (req: AuthedRequest, { params }: Params) => {
  const id_user = req.user!.id_user
  const id_pet = params.id

  try {
    const client = getClient()

    const { error } = await client
      .from('pet')
      .delete()
      .eq('id_pet', id_pet)
      .eq('id_user', id_user)

    if (error) throw new Error(error.message)

    return NextResponse.json({ message: 'Mascota eliminada correctamente' })
  } catch (error) {
    console.error('Error en DELETE /api/pets/[id]:', error)
    return jsonError('Error interno del servidor', 500)
  }
})