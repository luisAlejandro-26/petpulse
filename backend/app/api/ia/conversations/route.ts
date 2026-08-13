import { NextResponse } from 'next/server'
import { requireAuth, AuthedRequest, jsonError } from '@/lib/errors'
import { getClient } from '@/lib/db'

export const runtime = 'nodejs'

// GET /api/ia/conversations
// Lista todas las conversaciones de IA del usuario autenticado,
// mas recientes primero.
export const GET = requireAuth(async (req: AuthedRequest) => {
  const id_user = req.user!.id_user
  const client = getClient()

  try {
    const { data, error } = await client
      .from('ai_conversations')
      .select('id_conversation, id_pet, title, created_at, updated_at')
      .eq('id_user', id_user)
      .order('updated_at', { ascending: false })

    if (error) throw new Error(error.message)

    return NextResponse.json({ conversations: data ?? [] })
  } catch (error) {
    console.error('Error en GET /api/ia/conversations:', error)
    return jsonError('Error interno del servidor', 500)
  }
})