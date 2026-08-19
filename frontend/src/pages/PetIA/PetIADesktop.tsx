import { useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import { useAuth } from '../../context/AuthContext'
import { sendMessage, getConversations, getConversation, deleteConversation } from '../../api/ia'
import type { AiMessage, AiConversation } from '../../api/types'
import Sidebar from '../../components/dashboard/Sidebar'


const SUGGESTIONS = [
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

function PetIADesktop() {
  const { user, token } = useAuth()
  const [messages, setMessages] = useState<LocalMessage[]>([])
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const [attachedImage, setAttachedImage] = useState<{ base64: string; mime: string; preview: string } | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [historyOpen, setHistoryOpen] = useState(false)
  const [conversations, setConversations] = useState<AiConversation[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)


  const firstName = user?.name_user?.split(' ')[0] ?? ''
  const hasStarted = messages.length > 0

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

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

  async function handleDeleteConversation(e: React.MouseEvent, id: number) {
    e.stopPropagation()
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
    <div className="min-h-screen w-full bg-petpulse-bg flex">
      {/* sidebar */}
      <Sidebar />

      {/* layout principal */}
      <main className="flex-1 min-w-0 flex flex-col h-screen">
        {/* header chat */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-petpulse-border">
          <h1 className="text-2xl font-bold text-petpulse-primary">PetIA</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewChat}
              className="px-4 py-2 rounded-full border border-petpulse-border text-sm font-semibold text-petpulse-primary-dark hover:bg-petpulse-bg transition-colors flex items-center gap-1.5"
            >
              <Icon icon="mdi:plus" width={16} height={16} />
              Nueva conversación
            </button>
            <button
              type="button"
              onClick={openHistory}
              aria-label="Historial de conversaciones"
              className="w-10 h-10 rounded-full bg-petpulse-bg flex items-center justify-center text-petpulse-text hover:text-petpulse-primary-dark transition-colors"
            >
              <Icon icon="mdi:history" width={20} height={20} />
            </button>
          </div>
        </div>

        {/* body chat */}
        {!hasStarted ? (
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col items-center mb-8">
                <div
                  className="w-[100px] h-[100px] rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(122, 154, 123, 0.15) 0%, rgba(122, 154, 123, 0.08) 100%)',
                    border: '2px solid rgba(122, 154, 123, 0.2)',
                  }}
                >
                  <Icon icon="mdi:paw" width={48} height={48} color="#7A9A7B" />
                </div>
                <p className="font-medium text-[15px] text-petpulse-text mt-5">
                  ¡Hola{firstName ? `, ${firstName}` : ''}! 👋
                </p>
                <h2 className="font-bold text-2xl text-petpulse-text mt-1">Soy PetIA.</h2>
                <p className="text-[13px] text-petpulse-text-secondary text-center mt-2 leading-5">
                  Tu asistente inteligente para el cuidado de tu mascota.
                </p>
              </div>

              {/* sugerencias rápidas */}
              <p className="font-semibold text-base text-petpulse-text mb-3">
                ¿En qué puedo ayudarte?
              </p>

              <div className="flex flex-col gap-3">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => handleSend(s.prompt)}
                    className="w-full bg-white border border-petpulse-border rounded-xl p-4 flex items-center gap-3 text-left hover:shadow-md transition-shadow"
                  >
                    <div className="w-10 h-10 rounded-full bg-petpulse-primary/15 flex items-center justify-center flex-shrink-0">
                      <Icon icon={s.icon} width={20} height={20} color="#7A9A7B" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-petpulse-text">{s.title}</p>
                      <p className="text-xs text-petpulse-text-secondary mt-0.5">{s.desc}</p>
                    </div>
                    <Icon icon="mdi:chevron-right" width={18} height={18} color="#D8D3CD" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6">
            {/* mensajes chat */}
            <div className="max-w-2xl mx-auto">
              <p className="font-medium text-lg text-petpulse-text-secondary text-center mt-2 mb-4">
                Hoy
              </p>

              {/* lista mensajes */}
              <div className="flex flex-col gap-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {m.role === 'assistant' && (
                      <p className="font-semibold text-xs text-petpulse-primary mb-1">PetIA</p>
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
                        <p className="text-sm whitespace-pre-line">{m.content}</p>
                      )}
                    </div>
                    <p className="text-[11px] text-petpulse-text-secondary mt-1">
                      {formatTime(m.created_at)}
                    </p>
                  </div>
                ))}

                {/* typing indicator */}
                {sending && (
                  <div className="flex flex-col items-start">
                    <p className="font-semibold text-xs text-petpulse-primary mb-1">PetIA</p>
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

              <p className="font-extralight text-xs text-black/70 text-center mt-6 px-4">
                ⓘ Esta información es informativa y no reemplaza una consulta veterinaria.
              </p>
            </div>
          </div>
        )}

        {/* preview imagen adjunta */}
        {attachedImage && (
          <div className="px-8 pb-2 flex items-center gap-2">
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

        {/* input area */}
        <div className="px-8 pb-6">
          <div className="max-w-2xl mx-auto min-h-[47px] max-h-32 bg-white border border-petpulse-text-secondary rounded-3xl flex items-end px-3 py-2 gap-2">
            {/* upload imagen */}
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
              className="flex-1 min-w-0 max-h-24 resize-none text-sm text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none bg-transparent leading-5 py-1"
              style={{ height: 'auto' }}
              onInput={(e) => {
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
              className="w-8 h-8 rounded-full bg-petpulse-primary flex items-center justify-center flex-shrink-0 disabled:opacity-50 hover:bg-petpulse-primary-dark transition-colors mb-0.5"
            >
              <Icon icon="mdi:send" width={16} height={16} color="white" />
            </button>
          </div>
        </div>
      </main>

      {/* right panel */}
      <aside className="w-[320px] shrink-0 bg-white border-l border-petpulse-border h-screen sticky top-0 flex flex-col overflow-y-auto">
        {/* Campana */}


        {/* Ilustración principal */}
        <div className="flex justify-center px-6 py-6">
          <img
            src="/assets/imagen-centro-ia.svg"
            alt="Mascotas"
            className="w-48 h-auto object-contain"
          />
        </div>

        {/* consejos rapidos */}
        <div className="mx-6 mb-6 bg-[#EAF0EB] rounded-3xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#6B8C6C] flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:lightbulb-outline" width={20} height={20} className="text-[#6B8C6C]" />
            </div>
            <p className="font-bold text-[#6B8C6C] text-base">Consejos rápidos</p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full border border-[#6B8C6C] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon icon="mdi:paw" width={16} height={16} className="text-[#6B8C6C]" />
            </div>
            <p className="text-sm font-medium text-petpulse-text leading-snug">
              Observa el comportamiento de tus mascotas diariamente.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full border border-[#6B8C6C] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon icon="mdi:heart-outline" width={16} height={16} className="text-[#6B8C6C]" />
            </div>
            <p className="text-sm font-medium text-petpulse-text leading-snug">
              Una buena alimentación es clave para su salud.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full border border-[#6B8C6C] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon icon="mdi:water-outline" width={16} height={16} className="text-[#6B8C6C]" />
            </div>
            <p className="text-sm font-medium text-petpulse-text leading-snug">
              Agua limpia y fresca siempre disponible.
            </p>
          </div>

          <img
            src="/assets/banner-agg-pet.svg"
            alt=""
            className="w-full h-auto object-cover rounded-2xl mt-2"
          />
        </div>
      </aside>

      {/* historial conversaciones */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setHistoryOpen(false)}
          />
          <div className="relative bg-petpulse-bg rounded-2xl w-full max-w-md max-h-[80%] flex flex-col overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-petpulse-border">
              <h2 className="font-bold text-lg text-petpulse-text">Historial</h2>
              <button type="button" onClick={() => setHistoryOpen(false)} aria-label="Cerrar historial">
                <Icon icon="mdi:close" width={22} height={22} color="#2F3E32" />
              </button>
            </div>

            <div className="px-5 py-3">
              <button
                type="button"
                onClick={handleNewChat}
                className="w-full h-10 bg-petpulse-primary text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-petpulse-primary-dark transition-colors"
              >
                <Icon icon="mdi:plus" width={18} height={18} color="white" />
                Nueva conversación
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-6">
              {loadingHistory && (
                <p className="text-center text-petpulse-text-secondary text-sm mt-4">Cargando...</p>
              )}

              {!loadingHistory && conversations.length === 0 && (
                <p className="text-center text-petpulse-text-secondary text-sm mt-4">
                  Aún no tienes conversaciones
                </p>
              )}

              {!loadingHistory && conversations.map((c) => (
                <button
                  key={c.id_conversation}
                  type="button"
                  onClick={() => handleSelectConversation(c.id_conversation)}
                  className={`w-full text-left bg-white border rounded-xl p-3.5 flex items-center gap-3 mb-2.5 hover:shadow-md transition-shadow ${
                    c.id_conversation === conversationId ? 'border-petpulse-primary' : 'border-petpulse-border'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-petpulse-primary/15 flex items-center justify-center flex-shrink-0">
                    <Icon icon="mdi:paw" width={18} height={18} color="#7A9A7B" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-petpulse-text truncate">{c.title}</p>
                    <p className="text-xs text-petpulse-text-secondary">{formatDate(c.updated_at)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteConversation(e, c.id_conversation)}
                    aria-label="Eliminar conversación"
                    className="flex-shrink-0 text-petpulse-text-secondary hover:text-petpulse-accent transition-colors"
                  >
                    <Icon icon="mdi:trash-can-outline" width={18} height={18} />
                  </button>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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

export default PetIADesktop
