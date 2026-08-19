import { useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { sendMessage, getConversations, getConversation, deleteConversation } from '../../api/ia'
import type { AiMessage, AiConversation } from '../../api/types'
import logo from '../../assets/logo.png'
import dogCatIllustration from '../../assets/dog-cat-illustration.png'

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

const TIPS = [
  { icon: 'mdi:eye-outline', label: 'Observa el comportamiento de tus mascotas diariamente' },
  { icon: 'mdi:heart-outline', label: 'Una buena alimentación es clave para su salud' },
  { icon: 'mdi:water-outline', label: 'Agua limpia y fresca siempre disponible' },
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

function PetIATablet() {
  const { user, token } = useAuth()
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  const [messages, setMessages] = useState<LocalMessage[]>([])
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const [attachedImage, setAttachedImage] = useState<{ base64: string; mime: string; preview: string } | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const [historyOpen, setHistoryOpen] = useState(false)
  const [conversations, setConversations] = useState<AiConversation[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [manuallyStarted, setManuallyStarted] = useState(false)

  const firstName = user?.name_user?.split(' ')[0] ?? ''
  const hasStarted = messages.length > 0 || manuallyStarted

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (manuallyStarted) inputRef.current?.focus()
  }, [manuallyStarted])

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
    setManuallyStarted(false)
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

  const navItemClass = (path: string) =>
    `flex flex-col items-center gap-[3px] no-underline text-[11px] font-semibold px-4 py-2 rounded-[14px] transition-colors hover:bg-[#eaf0ea] hover:text-petpulse-primary-dark ${
      isActive(path) ? 'bg-[#eaf0ea] text-petpulse-primary-dark' : 'text-petpulse-text-secondary'
    }`

  return (
    <div className="min-h-screen bg-petpulse-bg font-inter text-petpulse-text box-border pb-28 *:box-border">
      <div className="w-full max-w-[900px] mx-auto px-5 pt-8 flex flex-col gap-5">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="w-[84px] h-auto shrink-0" />
            <div>
              <p className="font-poppins font-bold text-xl text-petpulse-primary m-0 tracking-[0.02em]">PETPULSE</p>
              <p className="text-[11px] text-petpulse-text-secondary m-0 leading-[1.3] max-w-[180px]">
                Salud y bienestar para tus mascotas.
              </p>
            </div>
          </div>

          <div className="flex-1 min-w-[160px] text-center">
            <h1 className="font-poppins font-bold text-xl text-petpulse-primary m-0 inline-flex items-center gap-1.5">
              PetIA
              <Icon icon="mdi:paw" width={18} height={18} className="text-petpulse-primary" />
            </h1>
            <p className="text-[13px] text-petpulse-text-secondary mt-0.5 mb-0">
              Tu asistente inteligente para el cuidado de tus mascotas
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openHistory}
              className="w-10 h-10 rounded-full border border-petpulse-border bg-petpulse-card text-petpulse-text flex items-center justify-center cursor-pointer transition-colors hover:bg-[#eaf0ea] hover:border-petpulse-primary"
              aria-label="Historial de conversaciones"
            >
              <Icon icon="mdi:history" width={20} height={20} />
            </button>
          </div>
        </header>

        {!hasStarted ? (
          /* ── Pantalla de bienvenida ── */
          <div className="flex flex-col gap-4">
            {/* Card principal: de lado a lado */}
            <div className="w-full bg-petpulse-card border border-petpulse-border rounded-[20px] shadow-[0_20px_44px_-28px_rgba(47,62,50,0.18)] px-6 py-8 flex flex-col items-center relative overflow-hidden">
              <img
                src={dogCatIllustration}
                alt=""
                className="hidden md:block absolute right-6 top-6 w-[140px] h-auto object-contain opacity-90"
              />

              <div
                className="w-[112px] h-[112px] rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(122, 154, 123, 0.15) 0%, rgba(122, 154, 123, 0.08) 100%)',
                }}
              >
                <Icon icon="mdi:paw" width={52} height={52} color="#7A9A7B" />
              </div>

              <p className="font-inter font-medium text-base text-petpulse-text mt-5">
                ¡Hola{firstName ? `, ${firstName}` : ''}! 👋
              </p>
              <h2 className="font-poppins font-bold text-2xl text-petpulse-text mt-1">Soy PetIA.</h2>
              <p className="font-inter text-[13px] text-petpulse-text-secondary text-center mt-2 leading-5 max-w-[420px]">
                Tu asistente inteligente para el cuidado y bienestar de tus mascotas.
              </p>

              <div className="w-full max-w-[520px] flex flex-col gap-3 mt-7">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => handleSend(s.prompt)}
                    className="w-full bg-petpulse-bg border border-petpulse-border rounded-2xl p-4 flex items-center gap-3 text-left transition-colors hover:bg-[#eaf0ea] active:scale-[0.99]"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#eaf0ea] flex items-center justify-center flex-shrink-0">
                      <Icon icon={s.icon} width={20} height={20} color="#7A9A7B" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-poppins font-bold text-sm text-petpulse-text m-0">{s.title}</p>
                      <p className="font-inter text-xs text-petpulse-text-secondary mt-0.5 mb-0">{s.desc}</p>
                    </div>
                    <Icon icon="mdi:chevron-right" width={18} height={18} color="#D8D3CD" />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setManuallyStarted(true)}
                className="relative w-full max-w-[520px] flex items-center justify-center bg-petpulse-primary text-white font-inter font-bold text-sm rounded-full py-3 mt-6 border-0 cursor-pointer transition-colors hover:bg-petpulse-primary-dark active:scale-[0.99]"
              >
                Hacer una pregunta
                <Icon icon="mdi:star-four-points" width={18} height={18} className="absolute right-6" />
              </button>
            </div>

            {/* Tira de Consejos, mismo estilo que en Agregar mascota */}
            <div className="bg-petpulse-card border border-petpulse-border rounded-[20px] px-6 py-4 flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 shrink-0">
                <Icon icon="mdi:lightbulb-outline" width={20} height={20} className="text-petpulse-primary" />
                <span className="font-poppins font-bold text-sm text-petpulse-text">Consejos rápidos</span>
              </div>

              {TIPS.map((tip) => (
                <div key={tip.label} className="flex items-center gap-2">
                  <span className="w-9 h-9 rounded-full bg-[#eaf0ea] text-petpulse-primary flex items-center justify-center shrink-0">
                    <Icon icon={tip.icon} width={18} height={18} />
                  </span>
                  <span className="text-xs text-petpulse-text-secondary leading-tight max-w-[150px]">{tip.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── Pantalla de chat activo ── */
          <div className="bg-petpulse-card border border-petpulse-border rounded-[20px] shadow-[0_20px_44px_-28px_rgba(47,62,50,0.18)] flex flex-col h-[calc(100vh-220px)] min-h-[420px]">
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pt-5">
              <p className="font-inter font-medium text-sm text-petpulse-text-secondary text-center mb-4">Hoy</p>

              <div className="flex flex-col gap-4 max-w-[720px] mx-auto">
                {messages.map((m, i) => (
                  <div key={i} className={`flex items-end gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {m.role === 'assistant' && (
                      <span className="w-8 h-8 rounded-full bg-[#eaf0ea] text-petpulse-primary flex items-center justify-center shrink-0 mb-4">
                        <Icon icon="mdi:paw" width={16} height={16} />
                      </span>
                    )}
                    <div className={`flex flex-col max-w-[75%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                      {m.role === 'assistant' && (
                        <p className="font-poppins font-bold text-xs text-petpulse-primary mb-1">PetIA</p>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2.5 ${
                          m.role === 'user'
                            ? 'bg-petpulse-primary text-white rounded-br-sm'
                            : 'bg-petpulse-bg text-petpulse-text rounded-bl-sm'
                        }`}
                      >
                        {m.image_url && (
                          <img src={m.image_url} alt="adjunta" className="rounded-lg mb-2 max-h-48 object-cover" />
                        )}
                        {m.content && <p className="font-inter text-sm whitespace-pre-line">{m.content}</p>}
                      </div>
                      <p className="font-inter text-[11px] text-petpulse-text-secondary mt-1">{formatTime(m.created_at)}</p>
                    </div>
                  </div>
                ))}

                {sending && (
                  <div className="flex items-end gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#eaf0ea] text-petpulse-primary flex items-center justify-center shrink-0">
                      <Icon icon="mdi:paw" width={16} height={16} className="animate-[thinking-pulse_1s_ease-in-out_infinite]" />
                    </span>
                    <div className="bg-petpulse-bg rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
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

              <p className="font-inter font-light text-xs text-petpulse-text-secondary text-center mt-6 mb-4">
                ⓘ Esta información es informativa y no reemplaza una consulta veterinaria.
              </p>
            </div>

            {/* Preview de imagen adjunta */}
            {attachedImage && (
              <div className="px-6 pb-2 flex items-center gap-2 max-w-[720px] mx-auto w-full">
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

            {/* Input */}
            <div className="px-6 pb-5 pt-2 max-w-[720px] mx-auto w-full">
              <div className="min-h-[50px] max-h-32 bg-petpulse-bg border border-petpulse-border rounded-3xl flex items-end px-4 py-2.5 gap-2">
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
                  ref={inputRef}
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
                  className="flex-1 min-w-0 max-h-24 resize-none font-inter text-sm text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none bg-transparent leading-5 py-1.5"
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
                  className="w-9 h-9 rounded-full bg-petpulse-primary flex items-center justify-center flex-shrink-0 disabled:opacity-50 hover:bg-petpulse-primary-dark active:scale-95 transition-transform mb-0.5"
                >
                  <Icon icon="mdi:send" width={16} height={16} color="white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Barra de un nuevo chat cuando ya hay conversacion activa */}
        {hasStarted && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleNewChat}
              className="inline-flex items-center gap-2 text-petpulse-primary font-inter font-semibold text-sm bg-transparent border-0 cursor-pointer hover:text-petpulse-primary-dark"
            >
              <Icon icon="mdi:plus-circle-outline" width={18} height={18} />
              Nueva conversación
            </button>
          </div>
        )}
      </div>

      {/* Nav inferior, igual al resto de pantallas Tablet */}
      <nav className="fixed bottom-4 left-0 right-0 flex justify-center px-5 z-10" aria-label="Navegación principal">
        <div className="w-full max-w-[620px] bg-petpulse-card border border-petpulse-border rounded-[20px] shadow-[0_16px_32px_-18px_rgba(47,62,50,0.3)] flex items-center justify-around px-3 py-2">
          <Link to="/dashboard" className={navItemClass('/dashboard')}>
            <Icon icon="mdi:home-outline" width={22} height={22} />
            <span>Inicio</span>
          </Link>
          <Link to="/calendar" className={navItemClass('/calendar')}>
            <Icon icon="mdi:calendar-month-outline" width={22} height={22} />
            <span>Calendario</span>
          </Link>
          <Link to="/pet-ia" className={navItemClass('/pet-ia')}>
            <Icon icon="mdi:paw-outline" width={22} height={22} />
            <span>PetIA</span>
          </Link>
          <Link to="/profile" className={navItemClass('/profile')}>
            <Icon icon="mdi:account-outline" width={22} height={22} />
            <span>Perfil</span>
          </Link>
        </div>
      </nav>

      {/* Modal de historial de conversaciones */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <div className="w-full max-w-[440px] max-h-[75vh] bg-petpulse-bg rounded-[20px] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-petpulse-border">
              <h2 className="font-poppins font-bold text-lg text-petpulse-text">Historial</h2>
              <button type="button" onClick={() => setHistoryOpen(false)} aria-label="Cerrar historial">
                <Icon icon="mdi:close" width={22} height={22} color="#2F3E32" />
              </button>
            </div>

            <div className="px-5 py-3">
              <button
                type="button"
                onClick={handleNewChat}
                className="w-full h-10 bg-petpulse-primary text-white font-poppins font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-petpulse-primary-dark active:scale-[0.98] transition-transform"
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

              {!loadingHistory &&
                conversations.map((c) => (
                  <button
                    key={c.id_conversation}
                    type="button"
                    onClick={() => handleSelectConversation(c.id_conversation)}
                    className={`w-full text-left bg-petpulse-card border rounded-xl p-3.5 flex items-center gap-3 mb-2.5 transition-colors hover:bg-[#eaf0ea] active:scale-[0.98] ${
                      c.id_conversation === conversationId ? 'border-petpulse-primary' : 'border-petpulse-border'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#eaf0ea] flex items-center justify-center flex-shrink-0">
                      <Icon icon="mdi:paw" width={18} height={18} color="#7A9A7B" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-poppins font-bold text-sm text-petpulse-text truncate">{c.title}</p>
                      <p className="font-inter text-xs text-petpulse-text-secondary">{formatDate(c.updated_at)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteConversation(e, c.id_conversation)}
                      aria-label="Eliminar conversación"
                      className="flex-shrink-0 text-petpulse-text-secondary hover:text-petpulse-accent active:scale-90 transition-transform"
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

export default PetIATablet