import { NextResponse } from 'next/server'
import { requireAuth, AuthedRequest, jsonError } from '@/lib/errors'
import { uploadPetImage, UploadError } from '@/lib/storage'

export const runtime = 'nodejs'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5MB en base64 crudo (aproximado)

// POST /api/upload/pet-image - Subir foto de una mascota, devuelve la URL publica
export const POST = requireAuth(async (req: AuthedRequest) => {
  const id_user = req.user!.id_user

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return jsonError('Body inválido', 400)
  }

  const image_base64 = typeof body.image_base64 === 'string' ? body.image_base64 : null
  const image_mime_type = typeof body.image_mime_type === 'string' ? body.image_mime_type : null

  if (!image_base64 || !image_mime_type) {
    return jsonError('Faltan image_base64 o image_mime_type', 400)
  }

  if (image_base64.length > MAX_IMAGE_BYTES) {
    return jsonError('La imagen es demasiado grande', 400)
  }

  try {
    const url = await uploadPetImage(id_user, image_base64, image_mime_type)
    return NextResponse.json({ url })
  } catch (error) {
    if (error instanceof UploadError) {
      return jsonError(error.message, error.status)
    }
    console.error('Error en /api/upload/pet-image:', error)
    return jsonError('Error interno del servidor', 500)
  }
})