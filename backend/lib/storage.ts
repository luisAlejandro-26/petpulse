import { getClient } from './db'

const CHAT_BUCKET = 'chat-images'
const PET_BUCKET = 'pet-images'
const PROFILE_BUCKET = 'profile-images'

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
}

export class UploadError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

async function uploadImage(bucket: string, path: string, base64: string, mimeType: string): Promise<string> {
  const extension = MIME_TO_EXT[mimeType]
  if (!extension) {
    throw new UploadError('Tipo de imagen no soportado (usa jpg, png o webp)', 400)
  }

  const buffer = Buffer.from(base64, 'base64')
  const fullPath = `${path}.${extension}`

  const client = getClient()

  const { error: uploadError } = await client.storage
    .from(bucket)
    .upload(fullPath, buffer, { contentType: mimeType, upsert: false })

  if (uploadError) {
    throw new UploadError(`No se pudo subir la imagen: ${uploadError.message}`, 502)
  }

  const { data } = client.storage.from(bucket).getPublicUrl(fullPath)
  return data.publicUrl
}

/**
 * Sube una imagen en base64 al bucket 'chat-images' y devuelve su URL publica.
 */
export async function uploadChatImage(
  id_user: number,
  id_conversation: number,
  base64: string,
  mimeType: string
): Promise<string> {
  return uploadImage(CHAT_BUCKET, `${id_user}/${id_conversation}/${Date.now()}`, base64, mimeType)
}

/**
 * Sube la foto de una mascota al bucket 'pet-images' y devuelve su URL publica.
 */
export async function uploadPetImage(id_user: number, base64: string, mimeType: string): Promise<string> {
  return uploadImage(PET_BUCKET, `${id_user}/${Date.now()}`, base64, mimeType)
}

/**
 * Sube la foto de perfil de un usuario al bucket 'profile-images' y devuelve su URL publica.
 */
export async function uploadProfileImage(id_user: number, base64: string, mimeType: string): Promise<string> {
  return uploadImage(PROFILE_BUCKET, `${id_user}/${Date.now()}`, base64, mimeType)
}