import { api } from './client'

interface UploadResponse {
  url: string
}

/**
 * Convierte un File a base64 puro (sin el prefijo "data:image/...;base64,").
 */
export function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1] ?? ''
      resolve({ base64, mimeType: file.type })
    }
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
    reader.readAsDataURL(file)
  })
}

export async function uploadPetImage(file: File, token: string): Promise<string> {
  const { base64, mimeType } = await fileToBase64(file)
  const res = await api.post<UploadResponse>(
    '/api/upload/pet-image',
    { image_base64: base64, image_mime_type: mimeType },
    token,
  )
  return res.url
}

export async function uploadProfileImage(file: File, token: string): Promise<string> {
  const { base64, mimeType } = await fileToBase64(file)
  const res = await api.post<UploadResponse>(
    '/api/upload/profile-image',
    { image_base64: base64, image_mime_type: mimeType },
    token,
  )
  return res.url
}