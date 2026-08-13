import { getClient } from './db'

const BUCKET = 'chat-images'

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

/**
 * Sube una imagen en base64 al bucket 'chat-images' y devuelve su URL publica.
 */
export async function uploadChatImage(
  id_user: number,
  id_conversation: number,
  base64: string,
  mimeType: string
): Promise<string> {
  const extension = MIME_TO_EXT[mimeType]
  if (!extension) {
    throw new UploadError('Tipo de imagen no soportado (usa jpg, png o webp)', 400)
  }

  const buffer = Buffer.from(base64, 'base64')
  const path = `${id_user}/${id_conversation}/${Date.now()}.${extension}`

  const client = getClient()

  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: false })

  if (uploadError) {
    throw new UploadError(`No se pudo subir la imagen: ${uploadError.message}`, 502)
  }

  const { data } = client.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}