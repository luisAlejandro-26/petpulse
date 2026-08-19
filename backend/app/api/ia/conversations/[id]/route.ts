import { NextResponse } from 'next/server'
import { requireAuth, AuthedRequest, jsonError } from '@/lib/errors'
import { getClient } from '@/lib/db'

export const runtime = 'nodejs'

interface RouteParams {
  params: { id: string }
}

// GET /api/ia/conversations/:id
// Devuelve una conversacion y todos sus mensajes, verificando que sea
// del usuario autenticado.
export const GET = requireAuth(async (req: AuthedRequest, { params }: RouteParams) => {
  const id_user = req.user!.id_user
  const id_conversation = Number(params.id)

  if (!Number.isInteger(id_conversation)) {
    return jsonError('id de conversación inválido', 400)
  }

  const client = getClient()

  try {
    const { data: conversation, error: convError } = await client
      .from('ai_conversations')
      .select('id_conversation, id_pet, title, created_at, updated_at')
      .eq('id_conversation', id_conversation)
      .eq('id_user', id_user)
      .single()

    if (convError || !conversation) {
      return jsonError('Conversación no encontrada', 404)
    }

    const { data: messages, error: msgError } = await client
      .from('ai_messages')
      .select('id_message, role, content, image_url, created_at')
      .eq('id_conversation', id_conversation)
      .order('created_at', { ascending: true })

    if (msgError) throw new Error(msgError.message)

    return NextResponse.json({
      conversation,
      messages: messages ?? [],
    })
  } catch (error) {
    console.error('Error en GET /api/ia/conversations/:id:', error)
    return jsonError('Error interno del servidor', 500)
  }
})

export const DELETE = requireAuth(async (req: AuthedRequest, { params }: RouteParams) => {
  const id_user = req.user!.id_user
  const id_conversation = Number(params.id)

  if (!Number.isInteger(id_conversation)) {
    return jsonError('id de conversación inválido', 400)
  }

  const client = getClient()

  try {
    const { data: existing, error: findError } = await client
      .from('ai_conversations')
      .select('id_conversation')
      .eq('id_conversation', id_conversation)
      .eq('id_user', id_user)
      .single()

    if (findError || !existing) {
      return jsonError('Conversación no encontrada', 404)
    }

    await client.from('ai_messages').delete().eq('id_conversation', id_conversation)
    await client.from('ai_conversations').delete().eq('id_conversation', id_conversation)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error en DELETE /api/ia/conversations/:id:', error)
    return jsonError('Error interno del servidor', 500)
  }
})