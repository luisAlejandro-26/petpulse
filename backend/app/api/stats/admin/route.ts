import { NextResponse } from 'next/server'
import { requireAdmin, AuthedRequest, jsonError } from '@/lib/errors'
import { getClient } from '@/lib/db'

export const runtime = 'nodejs'

// GET /api/stats/admin - Estadísticas para el dashboard del ADMIN
export const GET = requireAdmin(async (_req: AuthedRequest) => {
  try {
    const client = getClient()

    // Total de usuarios registrados
    const { count: total_users } = await client
      .from('users')
      .select('id_user', { count: 'exact', head: true })

    // Total de consultas (eventos de salud registrados)
    const { count: total_consultations } = await client
      .from('health_event')
      .select('id_event', { count: 'exact', head: true })

    // Storage utilizado en GB (estimación a partir del bucket 'chat-images')
    let storageBytes = 0
    try {
      const { data: files } = await client.storage
        .from('chat-images')
        .list('', { limit: 1000 })
      files?.forEach((file) => {
        storageBytes += (file.metadata?.size as number | undefined) ?? 0
      })
    } catch (error) {
      console.error('No se pudo calcular el storage:', error)
    }

    const storage_used_gb = Number((storageBytes / 1024 ** 3).toFixed(2))

    return NextResponse.json({
      total_users: total_users ?? 0,
      total_consultations: total_consultations ?? 0,
      storage_used_gb,
    })
  } catch (error) {
    console.error('Error en GET /api/stats/admin:', error)
    return jsonError('Error interno del servidor', 500)
  }
})
