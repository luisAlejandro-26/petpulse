import { useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import { useAuth } from '../../context/AuthContext'
import { sendMessage, getConversations, getConversation, deleteConversation } from '../../api/ia'
import type { AiMessage, AiConversation } from '../../api/types'
import SideMenu from '../../components/SideMenu'
import BottomNav from '../../components/BottomNav'

const SUGGESTIONS = [ // tarjetas de sugerencia en la pantalla de bienvenida; al tocarlas envían el prompt directo
  {
    icon: 'mdi:dog-side',
    title: 'Identificar razas',
    desc: 'Descubre la raza de perro o gato con una foto.',
    prompt: 'Ayúdame a identificar la raza de mi mascota',
  },
  {
    icon: 'mdi:food-drumstick-outline',
    title: 'Alimentación y cuidados',
    desc: 'Recomendaciones personalizadas según su raza y edad.',
    prompt: '¿Qué alimentación recomiendas para mi mascota?',
  },
  {
    icon: 'mdi:stethoscope',
    title: 'Síntomas y primeros auxilios',
    desc: 'Información básica para identificar síntomas comunes.',
    prompt: 'Mi mascota tiene un síntoma que me preocupa',
  },
]

interface LocalMessage extends AiMessage {
  pending?: boolean
}

// Convierte un archivo de imagen a base64 puro (sin el prefijo data:...) para enviarlo al backend
function fileToBase64(file: File): Promise<{ base64: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const [prefix, data] = result.split(',')
      const mime = prefix.match(/data:(.*);base64/)?.[1] ?? file.type
      resolve({ base64: data, mime })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Pantalla de chat con PetIA (Gemini): bienvenida con sugerencias, chat con texto/imagen, e historial de conversaciones
function PetIAMobile() {
  const { user, token } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [messages, setMessages] = useState<LocalMessage[]>([]) // mensajes de la conversación activa (vacío = pantalla de bienvenida)
  const [conversationId, setConversationId] = useState<number | null>(null) // null = conversación nueva, aún no creada en el backend
  const [input, setInput] = useState('')
  const [attachedImage, setAttachedImage] = useState<{ base64: string; mime: string; preview: string } | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null) // referencia al contenedor de mensajes, para auto-scroll al fondo

  const [historyOpen, setHistoryOpen] = useState(false)
  const [conversations, setConversations] = useState<AiConversation[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const firstName = user?.name_user?.split(' ')[0] ?? ''
  const hasStarted = messages.length > 0 // decide si se muestra la bienvenida o el chat activo

  // Auto-scroll al último mensaje cada vez que llega uno nuevo
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // Abre el panel de historial y carga la lista de conversaciones del usuario
  async function openHistory() {
    if (!token) return
    setHistoryOpen(true)
    setLoadingHistory(true)
    try {
      const list = await getConversations(token)
      setConversations(list)
    } catch {
      setConversations([])
    } finally {
      setLoadingHistory(false)
    }
  }

  // Carga el historial completo de una conversación anterior y la deja como activa
  async function handleSelectConversation(id: number) {
    if (!token) return
    setLoadingHistory(true)
    try {
      const res = await getConversation(id, token)
      setConversationId(res.conversation.id_conversation)
      setMessages(res.messages)
      setHistoryOpen(false)
    } catch {
      setError('No se pudo cargar la conversación')
    } finally {
      setLoadingHistory(false)
    }
  }

  // Elimina una conversación del historial; si era la que estaba activa, resetea a chat nuevo
  async function handleDeleteConversation(e: React.MouseEvent, id: number) {
  e.stopPropagation() // evita que el click también dispare handleSelectConversation (el botón está dentro de la card)
  if (!token) return
  try {
    await deleteConversation(id, token)
    setConversations((prev) => prev.filter((c) => c.id_conversation !== id))
    if (id === conversationId) {
      handleNewChat()
    }
  } catch {
    setError('No se pudo eliminar la conversación')
  }
}

  // Limpia el chat activo y vuelve a la pantalla de bienvenida (nueva conversación)
  function handleNewChat() {
    setConversationId(null)
    setMessages([])
    setHistoryOpen(false)
  }

  async function handlePickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const { base64, mime } = await fileToBase64(file)
    setAttachedImage({ base64, mime, preview: URL.createObjectURL(file) })
    e.target.value = ''
  }

  // Envía el mensaje (texto y/o imagen) a Gemini: agrega el mensaje del usuario de inmediato (optimista) y espera la respuesta
  async function handleSend(overrideText?: string) {
    const text = (overrideText ?? input).trim()
    if (!text && !attachedImage) return
    if (!token || sending) return

    setError('')
    const now = new Date().toISOString()

    const optimisticUserMsg: LocalMessage = {
      role: 'user',
      content: text || null,
      image_url: attachedImage?.preview ?? null,
      created_at: now,
    }

    setMessages((prev) => [...prev, optimisticUserMsg])
    setInput('')
    const imageToSend = attachedImage
    setAttachedImage(null)
    setSending(true)

    try {
      const res = await sendMessage(
        {
          message: text || undefined,
          image_base64: imageToSend?.base64,
          image_mime_type: imageToSend?.mime,
          id_conversation: conversationId ?? undefined,
        },
        token
      )
      setConversationId(res.id_conversation)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply,
          image_url: null,
          created_at: new Date().toISOString(),
        },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="h-screen w-full bg-petpulse-bg flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[402px] h-screen flex flex-col overflow-hidden">

        {/* ── Header: menú + título + historial ── */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-petpulse-primary/30">
          <button type="button" aria-label="Abrir menú" onClick={() => setMenuOpen(true)}>
            <Icon icon="akar-icons:three-line-horizontal" width={22} height={22} color="#2F3E32" />
          </button>
          <h1 className="font-inter font-medium text-2xl text-petpulse-primary">PetIA</h1>
          <button type="button" aria-label="Historial de conversaciones" onClick={openHistory}>
            <Icon icon="mdi:history" width={22} height={22} color="#2F3E32" />
          </button>
        </div>

        {!hasStarted ? (
          /* ── Pantalla de bienvenida: saludo + tarjetas de sugerencia ── */
          <div className="flex-1 overflow-y-auto pb-24 px-5">
            <div className="flex flex-col items-center mt-8">
              <div
                className="w-[120px] h-[120px] rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(122, 154, 123, 0.15) 0%, rgba(122, 154, 123, 0.08) 100%)',
                  border: '2px solid rgba(122, 154, 123, 0.2)',
                }}
              >
                <Icon icon="mdi:paw" width={56} height={56} color="#7A9A7B" />
              </div>

              <p className="font-inter font-medium text-[15.4px] text-petpulse-text mt-6">
                ¡Hola{firstName ? `, ${firstName}` : ''}! 👋
              </p>
              <h2 className="font-inter font-bold text-2xl text-petpulse-text mt-1">Soy PetIA.</h2>
              <p className="font-inter text-[13px] text-petpulse-text-secondary text-center mt-2 leading-5 px-4">
                Tu asistente inteligente para el cuidado de tu mascota.
              </p>
            </div>

            <p className="font-inter font-semibold text-base text-petpulse-text mt-8 mb-3">
              ¿En qué puedo ayudarte?
            </p>

            <div className="flex flex-col gap-3">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => handleSend(s.prompt)}
                  className="w-full bg-white border border-petpulse-border rounded-xl p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
                >
                  <div className="w-10 h-10 rounded-full bg-petpulse-primary/15 flex items-center justify-center flex-shrink-0">
                    <Icon icon={s.icon} width={20} height={20} color="#7A9A7B" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-encode-semi font-bold text-sm text-petpulse-text">{s.title}</p>
                    <p className="font-inter text-xs text-petpulse-text-secondary mt-0.5">{s.desc}</p>
                  </div>
                  <Icon icon="mdi:chevron-right" width={18} height={18} color="#D8D3CD" />
                </button>
              ))}
            </div>

            </div>
        ) : (
          /* ── Pantalla de chat activo: burbujas de mensaje + indicador de "escribiendo" ── */
          <div ref={scrollRef} className="flex-1 overflow-y-auto pb-4 px-5">
            <p className="font-inter font-medium text-lg text-petpulse-text-secondary text-center mt-4 mb-4">
              Hoy
            </p>

            <div className="flex flex-col gap-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {m.role === 'assistant' && (
                    <p className="font-encode-semi font-bold text-xs text-petpulse-primary mb-1">PetIA</p>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-2.5 ${
                      m.role === 'user'
                        ? 'bg-petpulse-primary/15 text-petpulse-text rounded-br-sm'
                        : 'bg-white border border-petpulse-border text-petpulse-text rounded-bl-sm'
                    }`}
                  >
                    {m.image_url && (
                      <img src={m.image_url} alt="adjunta" className="rounded-lg mb-2 max-h-48 object-cover" />
                    )}
                    {m.content && (
                      <p className="font-inter text-sm whitespace-pre-line">{m.content}</p>
                    )}
                  </div>
                  <p className="font-inter text-[11px] text-petpulse-text-secondary mt-1">
                    {formatTime(m.created_at)}
                  </p>
                </div>
              ))}

              {/* Indicador de "pensando": patita pulsando + puntitos rebotando mientras se espera la respuesta de Gemini */}
              {sending && (
                <div className="flex flex-col items-start">
                  <p className="font-encode-semi font-bold text-xs text-petpulse-primary mb-1">PetIA</p>
                  <div className="bg-white border border-petpulse-border rounded-xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                    <Icon
                      icon="mdi:paw"
                      width={18}
                      height={18}
                      color="#7A9A7B"
                      className="animate-[thinking-pulse_1s_ease-in-out_infinite]"
                    />
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-petpulse-primary/40 animate-[dot-bounce_1.4s_ease-in-out_infinite]" style={{ animationDelay: '0s' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-petpulse-primary/40 animate-[dot-bounce_1.4s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-petpulse-primary/40 animate-[dot-bounce_1.4s_ease-in-out_infinite]" style={{ animationDelay: '0.4s' }} />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p role="alert" className="text-petpulse-accent text-xs text-center mt-3">
                {error}
              </p>
            )}

            <p className="font-inter font-extralight text-xs text-black/70 text-center mt-6 px-4">
              ⓘ Esta información es informativa y no reemplaza una consulta veterinaria.
            </p>
          </div>
        )}

        {/* Preview de imagen adjunta, antes de enviarla */}
        {attachedImage && (
          <div className="px-5 pb-2 flex items-center gap-2">
            <img src={attachedImage.preview} alt="preview" className="w-14 h-14 rounded-lg object-cover" />
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="text-petpulse-text-secondary"
              aria-label="Quitar imagen"
            >
              <Icon icon="mdi:close-circle" width={20} height={20} />
            </button>
          </div>
        )}

        {/* ── Input: adjuntar imagen + textarea auto-resize (Enter envía, Shift+Enter hace salto de línea) + enviar ── */}
        <div className="px-3.5 pb-24">
          <div className="min-h-[47px] max-h-32 bg-white border border-petpulse-text-secondary rounded-3xl flex items-end px-3 py-2 gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePickImage}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Adjuntar imagen"
              className="flex-shrink-0 mb-1"
            >
              <Icon icon="mdi:paperclip" width={20} height={20} color="#7A7A7A" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Escribe tu mensaje..."
              rows={1}
              className="flex-1 min-w-0 max-h-24 resize-none font-inter text-sm text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none bg-transparent leading-5 py-1"
              style={{ height: 'auto' }}
              onInput={(e) => {
                // crece la altura del textarea con el contenido, hasta un máximo de 96px (luego hace scroll interno)
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = `${Math.min(el.scrollHeight, 96)}px`
              }}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={sending || (!input.trim() && !attachedImage)}
              aria-label="Enviar"
              className="w-8 h-8 rounded-full bg-petpulse-primary flex items-center justify-center flex-shrink-0 disabled:opacity-50 active:scale-95 transition-transform mb-0.5"
            >
              <Icon icon="mdi:send" width={16} height={16} color="white" />
            </button>
          </div>
        </div>

        <BottomNav />
        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

        {/* ── Panel de historial: lista de conversaciones, nueva conversación, eliminar ── */}
        {historyOpen && (
          <div className="absolute inset-0 z-50 flex flex-col bg-black/40">
            <div className="mt-auto bg-petpulse-bg rounded-t-3xl max-h-[80%] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-petpulse-border">
                <h2 className="font-encode-semi font-bold text-lg text-petpulse-text">Historial</h2>
                <button type="button" onClick={() => setHistoryOpen(false)} aria-label="Cerrar historial">
                  <Icon icon="mdi:close" width={22} height={22} color="#2F3E32" />
                </button>
              </div>

              <div className="px-5 py-3">
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="w-full h-10 bg-petpulse-primary text-white font-encode-semi font-bold text-sm rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  <Icon icon="mdi:plus" width={18} height={18} color="white" />
                  Nueva conversación
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-6">
                {loadingHistory && (
                  <p className="text-center text-petpulse-text-secondary text-sm font-inter mt-4">Cargando...</p>
                )}

                {!loadingHistory && conversations.length === 0 && (
                  <p className="text-center text-petpulse-text-secondary text-sm font-inter mt-4">
                    Aún no tienes conversaciones
                  </p>
                )}

                {!loadingHistory && conversations.map((c) => (
                  <button
                    key={c.id_conversation}
                    type="button"
                    onClick={() => handleSelectConversation(c.id_conversation)}
                    className={`w-full text-left bg-white border rounded-xl p-3.5 flex items-center gap-3 mb-2.5 active:scale-[0.98] transition-transform ${
                      c.id_conversation === conversationId ? 'border-petpulse-primary' : 'border-petpulse-border'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-petpulse-primary/15 flex items-center justify-center flex-shrink-0">
                      <Icon icon="mdi:paw" width={18} height={18} color="#7A9A7B" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-encode-semi font-bold text-sm text-petpulse-text truncate">{c.title}</p>
                      <p className="font-inter text-xs text-petpulse-text-secondary">{formatDate(c.updated_at)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteConversation(e, c.id_conversation)}
                      aria-label="Eliminar conversación"
                      className="flex-shrink-0 text-petpulse-text-secondary active:scale-90 transition-transform"
                    >
                      <Icon icon="mdi:trash-can-outline" width={18} height={18} />
                    </button>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes thinking-pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.25); opacity: 1; }
        }
        @keyframes dot-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default PetIAMobile