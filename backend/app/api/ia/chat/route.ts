import { NextResponse } from 'next/server'
import { requireAuth, AuthedRequest, jsonError } from '@/lib/errors'
import { getClient } from '@/lib/db'
import { askGemini, GeminiError, ChatMessageInput } from '@/lib/gemini'
import { uploadChatImage, UploadError } from '@/lib/storage'

export const runtime = 'nodejs'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5MB en base64 crudo (aproximado)

export const POST = requireAuth(async (req: AuthedRequest) => {
  const id_user = req.user!.id_user

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return jsonError('Body inválido', 400)
  }

  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const image_base64 = typeof body.image_base64 === 'string' ? body.image_base64 : null
  const image_mime_type = typeof body.image_mime_type === 'string' ? body.image_mime_type : null
  const id_conversation =
    typeof body.id_conversation === 'number' ? body.id_conversation : null
  const id_pet = typeof body.id_pet === 'number' ? body.id_pet : null

  if (!message && !image_base64) {
    return jsonError('Envía un mensaje o una imagen', 400)
  }

  if (image_base64 && image_base64.length > MAX_IMAGE_BYTES) {
    return jsonError('La imagen es demasiado grande', 400)
  }

  if (image_base64 && !image_mime_type) {
    return jsonError('Falta image_mime_type para la imagen enviada', 400)
  }

  const client = getClient()

  try {
    // 1. Resolver o crear la conversación, verificando que sea del usuario.
    let conversationId = id_conversation

    if (conversationId) {
      const { data: existing, error } = await client
        .from('ai_conversations')
        .select('id_conversation')
        .eq('id_conversation', conversationId)
        .eq('id_user', id_user)
        .single()

      if (error || !existing) {
        return jsonError('Conversación no encontrada', 404)
      }
    } else {
      const { data: created, error } = await client
        .from('ai_conversations')
        .insert({
          id_user,
          id_pet,
          title: message ? message.slice(0, 60) : 'Consulta con foto',
        })
        .select('id_conversation')
        .single()

      if (error || !created) {
        throw new Error(error?.message ?? 'No se pudo crear la conversación')
      }
      conversationId = created.id_conversation
    }

    if (conversationId === null) {
      throw new Error('No se pudo resolver el id de la conversación')
    }
    const resolvedConversationId: number = conversationId

    // 2. Si viene imagen, subirla a Storage para tener una URL permanente.
    let uploadedImageUrl: string | null = null
    if (image_base64 && image_mime_type) {
      uploadedImageUrl = await uploadChatImage(
        id_user,
        resolvedConversationId,
        image_base64,
        image_mime_type
      )
    }

    // 3. Guardar el mensaje del usuario.
    const { error: insertUserMsgError } = await client.from('ai_messages').insert({
      id_conversation: resolvedConversationId,
      role: 'user',
      content: message || null,
      image_url: uploadedImageUrl,
    })
    if (insertUserMsgError) throw new Error(insertUserMsgError.message)

    // 4. Traer el historial completo de la conversación.
    const { data: history, error: historyError } = await client
      .from('ai_messages')
      .select('role, content')
      .eq('id_conversation', resolvedConversationId)
      .order('created_at', { ascending: true })

    if (historyError) throw new Error(historyError.message)

    const chatHistory: ChatMessageInput[] = (history ?? []).map((row) => ({
      role: row.role === 'assistant' ? 'assistant' : 'user',
      content: row.content,
    }))

    // Adjunta la imagen (si vino) solo al último mensaje del usuario que acabamos
    // de guardar, para no reenviarla en cada turno del historial.
    if (image_base64 && image_mime_type && chatHistory.length > 0) {
      const last = chatHistory[chatHistory.length - 1]
      last.imageBase64 = image_base64
      last.imageMimeType = image_mime_type
    }

    // 5. Preguntarle a Gemini con el historial completo.
    const replyText = await askGemini(chatHistory)

    // 6. Guardar la respuesta de la IA.
    const { error: insertAiMsgError } = await client.from('ai_messages').insert({
      id_conversation: resolvedConversationId,
      role: 'assistant',
      content: replyText,
      image_url: null,
    })
    if (insertAiMsgError) throw new Error(insertAiMsgError.message)

    await client
      .from('ai_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id_conversation', resolvedConversationId)

    return NextResponse.json({
      id_conversation: resolvedConversationId,
      reply: replyText,
      image_url: uploadedImageUrl,
    })
  } catch (error) {
    if (error instanceof UploadError) {
      return jsonError(error.message, error.status)
    }
    if (error instanceof GeminiError) {
      return jsonError(error.message, error.status)
    }
    console.error('Error en /api/ia/chat:', error)
    return jsonError('Error interno del servidor', 500)
  }
})