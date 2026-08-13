import { GoogleGenAI } from '@google/genai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-3.6-flash'

type GeminiGlobal = typeof globalThis & { __petpulseGemini?: GoogleGenAI }

function getGeminiClient(): GoogleGenAI {
  if (!GEMINI_API_KEY) {
    throw new GeminiError(
      'Falta configurar GEMINI_API_KEY en backend/.env para usar el chat de IA',
      500
    )
  }
  const cache = globalThis as GeminiGlobal
  if (!cache.__petpulseGemini) {
    cache.__petpulseGemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY })
  }
  return cache.__petpulseGemini
}

export type ChatRole = 'user' | 'assistant'

export interface ChatMessageInput {
  role: ChatRole
  content: string | null
  imageBase64?: string | null
  imageMimeType?: string | null
}

const SYSTEM_INSTRUCTION =
  'Eres el asistente de PetPulse, una app de cuidado y salud de mascotas. ' +
  'Ayudas a los dueños con preguntas sobre el cuidado, comportamiento, alimentacion ' +
  'y bienestar general de sus mascotas. Si te envian una foto, puedes ayudar a ' +
  'identificar la raza o especie y dar recomendaciones basicas de cuidado. ' +
  'Se claro, cercano y breve. No reemplazas a un veterinario: si detectas un posible ' +
  'problema de salud serio, recomienda acudir a un veterinario.'

export class GeminiError extends Error {
  status: number

  constructor(message: string, status = 502) {
    super(message)
    this.status = status
  }
}

/**
 * Manda el historial completo de una conversacion a Gemini y devuelve la
 * respuesta en texto. El ultimo elemento de `messages` es el mensaje nuevo.
 */
export async function askGemini(messages: ChatMessageInput[]): Promise<string> {
  const ai = getGeminiClient()

  const contents = messages.map((message) => {
    const parts: Record<string, unknown>[] = []

    if (message.content) {
      parts.push({ text: message.content })
    }

    if (message.imageBase64 && message.imageMimeType) {
      parts.push({
        inlineData: {
          mimeType: message.imageMimeType,
          data: message.imageBase64,
        },
      })
    }

    return {
      role: message.role === 'assistant' ? 'model' : 'user',
      parts,
    }
  })

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    })

    const text = response.text
    if (!text) {
      throw new GeminiError('Gemini no devolvio una respuesta valida')
    }
    return text
  } catch (error) {
    if (error instanceof GeminiError) throw error

    const message = error instanceof Error ? error.message : String(error)

    if (message.includes('429') || message.toLowerCase().includes('quota')) {
      throw new GeminiError(
        'Se alcanzo el limite de uso de la IA por ahora. Intenta de nuevo en unos minutos.',
        429
      )
    }

    if (message.toLowerCase().includes('timeout')) {
      throw new GeminiError('La IA tardo demasiado en responder. Intenta de nuevo.', 504)
    }

    console.error('Error llamando a Gemini:', error)
    throw new GeminiError('No se pudo obtener respuesta de la IA', 502)
  }
}