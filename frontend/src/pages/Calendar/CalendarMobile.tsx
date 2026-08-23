import { useEffect, useMemo, useState } from 'react'
import SideMenu from '../../components/SideMenu'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuth } from '../../context/AuthContext'
import { getEvents, updateEvent, deleteEvent } from '../../api/events'
import type { HealthEvent } from '../../api/types'
import BottomNav from '../../components/BottomNav'

interface BusinessInfo {
  name: string
  phone: string
  address: string
  schedule: string
  embedUrl: string
}

const BUSINESS_MAP: Record<string, BusinessInfo> = {
  'El Oasis de Luna': {
    name: 'El Oasis de Luna',
    phone: '+58 4247783153',
    address: 'Carr. 2 con Calle 4, Táriba, Táchira',
    schedule: 'Lunes a Sábados: 9:00 AM - 7:00 PM',
    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3474.0987295060313!2d-72.22672599011233!3d7.816019906764296!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e666da7cbf4b72f%3A0xffc805b3b8eef04e!2sEl%20Oasis%20De%20Luna!5e1!3m2!1ses!2sve!4v1787438273018!5m2!1ses!2sve',
  },
  'Animales Felices': {
    name: 'Animales Felices',
    phone: '+58 2763440556',
    address: 'Av. España, San Cristóbal, Táchira',
    schedule: 'Lunes a Sábado: 8:00 AM - 5:00 PM',
    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10351.556826120492!2d-72.2315739907444!3d7.77629167392164!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e666c90321d8bc5%3A0x8171b022543c1d6b!2sTienda%20de%20Mascotas%20Animales%20Felices!5e1!3m2!1ses!2sve!4v1787439915011!5m2!1ses!2sve',
  },
  'Centro Veterinario La Ermita': {
    name: 'Centro Veterinario La Ermita',
    phone: '+58 2765163457',
    address: 'Carr. 4 entre Calle 10 y Calle 11, San Cristóbal, Táchira',
    schedule: 'Lunes a Sábado: 8:30 AM - 4:00 PM',
    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3474.4796551732547!2d-72.23642839011269!3d7.770119007391877!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e666ca011644021%3A0x657b69ab0a150c7c!2sCentro%20veterinario%20la%20Ermita!5e1!3m2!1ses!2sve!4v1787440049586!5m2!1ses!2sve',
  },
  'Patas y Huellas': {
    name: 'Patas y Huellas',
    phone: '+58 4147261197',
    address: 'Av. Oriental, San Cristóbal, Táchira',
    schedule: 'Lunes a Viernes: 1:00 AM - 5:00 AM - 8:00 AM - 12:00 PM',
    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1062.9093671182873!2d-72.2222155074474!3d7.756140049703016!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e666d08e247829b%3A0x8d97bff8ddbd2b81!2sPatas%20y%20huellas%20C.A.!5e1!3m2!1ses!2sve!4v1787440648657!5m2!1ses!2sve',
  },
}


const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const EVENT_ICON_NAME: Record<string, string> = { // ícono según el tipo de evento, usado en la lista de "Próximos Recordatorios"
  VACUNA: 'game-icons:medicines',
  CONTROL: 'hugeicons:doctor-01',
  DESPARACITACION: 'material-symbols:emergency',
  CIRUGIA: 'material-symbols:emergency',
  OTHER: 'mdi:content-cut',
}

// Círculo de ícono de un evento: verde si ya se aplicó (COMPLETED), coral si sigue pendiente
function EventIcon({ type, status }: { type: string; status: string }) {
  const bg = status === 'COMPLETED' ? '#7A9A7B' : '#E07A5F'
  const iconName = EVENT_ICON_NAME[type] ?? 'mdi:paw'

  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: bg }}
    >
      <Icon icon={iconName} width={20} height={20} color="white" />
    </div>
  )
}

const STATUS_LABEL: Record<string, { text: string; className: string }> = { // texto y color de la etiqueta de estado de cada evento
  COMPLETED: { text: 'Aplicado', className: 'bg-petpulse-primary/15 text-petpulse-primary-dark' },
  SCHEDULED: { text: 'Pendiente', className: 'bg-petpulse-accent/15 text-petpulse-accent' },
  CANCELLED: { text: 'Cancelado', className: 'bg-petpulse-text-secondary/15 text-petpulse-text-secondary' },
}

// Pantalla de Calendario: grid mensual con puntos de color por evento + lista de próximos recordatorios (crear/completar/eliminar)
function CalendarMobile() {
  const { token } = useAuth()
  
  

  const [events, setEvents] = useState<HealthEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date()) // mes que se está mostrando en el grid
  const [deletingId, setDeletingId] = useState<number | null>(null) // id del evento en animación de salida (mientras se borra)
  const [confirmId, setConfirmId] = useState<number | null>(null) // id del evento pendiente de confirmar eliminación (null = modal cerrado)
  const [selectedEvent, setSelectedEvent] = useState<HealthEvent | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // Trae TODOS los eventos del usuario (todas sus mascotas) apenas se tiene el token
  useEffect(() => {
    if (!token) return
    getEvents(token)
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [token])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const today = new Date()

  // Mapa día → estado del evento, para pintar el puntito de color debajo de cada día del mes actual
  const eventDaysInMonth = useMemo(() => {
    const map = new Map<number, string>()
    events.forEach((ev) => {
      const d = new Date(ev.event_date)
      if (d.getFullYear() === year && d.getMonth() === month) {
        map.set(d.getDate(), ev.status)
      }
    })
    return map
  }, [events, year, month])

  // Genera las celdas del grid del mes (null = celda vacía de relleno antes del día 1 o después del último día)
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const startOffset = (firstDay.getDay() + 6) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells: (number | null)[] = []
    for (let i = 0; i < startOffset; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [year, month])

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }
  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // Alterna el estado de un evento entre Pendiente y Aplicado (botón de estado en la lista)
  async function handleToggleStatus(ev: HealthEvent) {
    if (!token) return
    const newStatus = ev.status === 'COMPLETED' ? 'SCHEDULED' : 'COMPLETED'
    try {
      const updated = await updateEvent(ev.id_event, { status: newStatus }, token)
      setEvents((prev) => prev.map((e) => (e.id_event === ev.id_event ? updated : e)))
    } catch {
      // silencioso por ahora
    }
  }

  // Elimina el evento confirmado en el modal, esperando primero la animación de salida (fade + colapso)
  async function confirmDelete() {
    if (!token || confirmId === null) return
    const id = confirmId
    setConfirmId(null)
    setDeletingId(id)

    // Espera a que termine la animación de salida antes de quitarlo de la lista
    setTimeout(async () => {
      try {
        await deleteEvent(id, token)
        setEvents((prev) => prev.filter((e) => e.id_event !== id))
      } catch {
        // silencioso por ahora
      } finally {
        setDeletingId(null)
      }
    }, 280)
  }

  // Los 5 próximos eventos pendientes o futuros, ordenados por fecha más cercana - se muestran en "Próximos Recordatorios"
  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return events
      .filter((ev) => ev.status === 'SCHEDULED' || new Date(ev.event_date) >= now)
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
      .slice(0, 5)
  }, [events])

  const eventToDelete = events.find((e) => e.id_event === confirmId)

  return (
    <div className="h-screen w-full bg-petpulse-bg flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[402px] h-screen flex flex-col overflow-hidden">

        <div className="flex-1 overflow-y-auto pb-24">
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 pt-6">
            <button type="button" aria-label="Abrir menú" onClick={() => setMenuOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F3E32" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              </svg>
            </button>
            <h1 className="font-inter font-bold text-base text-petpulse-primary-dark">Calendario</h1>
            <div className="w-6" />
          </div>

          {/* ── Navegación de mes ── */}
          <div className="flex items-center justify-between px-10 mt-6">
            <button type="button" onClick={prevMonth} aria-label="Mes anterior">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2F3E32" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="font-inter font-bold text-base text-petpulse-text">
              {MONTH_NAMES[month]} {year}
            </span>
            <button type="button" onClick={nextMonth} aria-label="Mes siguiente">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2F3E32" strokeWidth="2">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 px-10 mt-5 text-center">
            {WEEKDAYS.map((d, i) => (
              <span key={i} className="font-inter text-xs font-semibold text-petpulse-text-secondary">{d}</span>
            ))}
          </div>

          {/* ── Cuadrícula del calendario: día actual resaltado + puntito de color si tiene evento ── */}
          <div className="grid grid-cols-7 px-10 mt-2 gap-y-2 text-center">
            {calendarGrid.map((day, i) => {
              if (day === null) return <div key={i} />

              const isToday =
                day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              const hasEvent = eventDaysInMonth.has(day)

              return (
                <div key={i} className="flex flex-col items-center">
                  <span
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-inter ${
                      isToday
                        ? 'bg-petpulse-primary text-white font-bold'
                        : 'text-petpulse-text'
                    }`}
                  >
                    {day}
                  </span>
                  {hasEvent && !isToday && (
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-0.5"
                      style={{
                        backgroundColor: eventDaysInMonth.get(day) === 'COMPLETED' ? '#7A9A7B' : '#E07A5F',
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* ── Próximos Recordatorios: toggle de estado + eliminar con confirmación ── */}
          <p className="font-inter font-bold text-sm text-petpulse-text px-5 mt-8 mb-3">
            Próximos Recordatorios
          </p>

          <div className="px-5 flex flex-col gap-3">
            {loading && (
              <p className="text-center text-petpulse-text-secondary text-sm font-inter">Cargando...</p>
            )}

            {!loading && upcomingEvents.length === 0 && (
              <p className="text-center text-petpulse-text-secondary text-sm font-inter px-4">
                No tienes recordatorios próximos
              </p>
            )}

            {!loading && upcomingEvents.map((ev) => {
              const statusInfo = STATUS_LABEL[ev.status]
              const eventDate = new Date(ev.event_date)
              const dateLabel = eventDate.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
              const isDeleting = deletingId === ev.id_event // controla la animación de colapso antes de quitarlo del array

              return (
                <div
                  key={ev.id_event}
                  onClick={() => setSelectedEvent(ev)}
                  className={`w-full bg-white border border-petpulse-border rounded-xl flex items-center px-4 gap-3 transition-all duration-[280ms] ease-in overflow-hidden cursor-pointer active:bg-petpulse-bg/50 ${
                    isDeleting
                      ? 'opacity-0 scale-95 max-h-0 !p-0 !border-0 !gap-0'
                      : 'opacity-100 scale-100 max-h-24 py-0 h-[70px]'
                  }`}
                >
                  <EventIcon type={ev.event_type} status={ev.status} />
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-encode-semi font-bold text-sm text-petpulse-text truncate">
                      {ev.title} {ev.pet?.name_pet ? `- ${ev.pet.name_pet}` : ''}
                    </p>
                    <p className="font-encode-condensed text-xs text-petpulse-text-secondary">{dateLabel}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleToggleStatus(ev) }}
                      disabled={ev.status === 'CANCELLED'}
                      className={`text-[11px] font-inter font-semibold px-2 py-1 rounded-full whitespace-nowrap active:scale-95 transition-transform ${statusInfo.className}`}
                    >
                      {statusInfo.text}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setConfirmId(ev.id_event) }}
                      aria-label="Eliminar recordatorio"
                      className="text-petpulse-text-secondary active:scale-90 transition-transform"
                    >
                      <Icon icon="mdi:trash-can-outline" width={18} height={18} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Botón agregar recordatorio: abre el flujo Categoría → Negocio → Formulario */}
          <div className="px-5 mt-6">
            <Link
              to="/events/category"
              className="w-full h-10 bg-petpulse-primary hover:bg-petpulse-primary-dark active:scale-[0.98] text-white font-encode-semi font-bold text-sm rounded-lg flex items-center justify-center transition-all"
            >
              + Agregar recordatorio
            </Link>
          </div>
        </div>

        {/* NavBar inferior */}
        <BottomNav />

        {/* ── Modal de confirmación de eliminación ── */}
        {confirmId !== null && eventToDelete && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div
              className="absolute inset-0 bg-black/40 animate-[fadeIn_0.2s_ease-out]"
              onClick={() => setConfirmId(null)}
            />
            <div className="relative w-full max-w-[402px] bg-white rounded-t-3xl px-6 pt-6 pb-8 animate-[slideUp_0.25s_ease-out]">
              <div className="w-10 h-1 bg-petpulse-border rounded-full mx-auto mb-5" />

              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-petpulse-accent/15 flex items-center justify-center mb-4">
                  <Icon icon="mdi:trash-can-outline" width={26} height={26} color="#E07A5F" />
                </div>
                <h3 className="font-encode-expanded font-bold text-lg text-petpulse-text">
                  ¿Eliminar recordatorio?
                </h3>
                <p className="font-inter text-sm text-petpulse-text-secondary mt-1.5 px-4">
                  {eventToDelete.title} {eventToDelete.pet?.name_pet ? `- ${eventToDelete.pet.name_pet}` : ''} se eliminará permanentemente.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setConfirmId(null)}
                  className="flex-1 h-11 border border-petpulse-border rounded-xl font-encode-semi font-semibold text-sm text-petpulse-text active:scale-[0.97] transition-transform"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 h-11 bg-petpulse-accent rounded-xl font-encode-semi font-semibold text-sm text-white active:scale-[0.97] transition-transform"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

        {/* Panel detalle del recordatorio (bottom sheet) */}
        {selectedEvent && (() => {
          const biz = BUSINESS_MAP[selectedEvent.event_place]
          return (
            <div className="fixed inset-0 z-50 flex items-end justify-center">
              <div
                className="absolute inset-0 bg-black/40 animate-[fadeIn_0.2s_ease-out]"
                onClick={() => setSelectedEvent(null)}
              />
              <div className="relative w-full max-w-[402px] bg-white rounded-t-3xl px-6 pt-6 pb-8 animate-[slideUp_0.25s_ease-out] max-h-[85vh] overflow-y-auto">
                <div className="w-10 h-1 bg-petpulse-border rounded-full mx-auto mb-5" />

                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-encode-expanded font-bold text-base text-petpulse-text m-0">Detalle del recordatorio</h3>
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="w-7 h-7 rounded-full border border-petpulse-border bg-petpulse-bg flex items-center justify-center text-petpulse-text-secondary"
                  >
                    <Icon icon="mdi:close" width={16} height={16} />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Icon icon="mdi:paw" width={18} height={18} className="text-petpulse-primary shrink-0" />
                    <span className="font-bold text-sm text-petpulse-text">{selectedEvent.title}{selectedEvent.pet?.name_pet ? ` — ${selectedEvent.pet.name_pet}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Icon icon="mdi:calendar" width={18} height={18} className="text-petpulse-primary shrink-0" />
                    <span className="text-sm text-petpulse-text">{new Date(selectedEvent.event_date).toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Icon icon="mdi:map-marker" width={18} height={18} className="text-petpulse-accent shrink-0" />
                    <span className="text-sm text-petpulse-text">{selectedEvent.event_place}</span>
                  </div>
                </div>

                {biz && (
                  <>
                    <div className="border-t border-petpulse-border mt-4 pt-4" />
                    <p className="font-inter font-bold text-[11px] text-petpulse-primary tracking-[0.5px] uppercase m-0 mb-3">Información del negocio</p>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <Icon icon="mdi:store" width={18} height={18} className="text-petpulse-primary shrink-0" />
                        <span className="font-semibold text-sm text-petpulse-text">{biz.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Icon icon="mdi:phone" width={18} height={18} className="text-petpulse-primary shrink-0" />
                        <a
                          href={`tel:${biz.phone.replace(/\s/g, '')}`}
                          className="text-sm text-petpulse-primary underline decoration-petpulse-primary/30"
                        >
                          {biz.phone}
                        </a>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon icon="mdi:map-marker" width={18} height={18} className="text-petpulse-accent shrink-0 mt-0.5" />
                        <span className="text-sm text-petpulse-text">{biz.address}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon icon="mdi:clock-outline" width={18} height={18} className="text-petpulse-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-petpulse-text whitespace-pre-line">{biz.schedule}</span>
                      </div>
                    </div>
                    <div className="h-[180px] rounded-xl border border-petpulse-border overflow-hidden mt-4">
                      <iframe
                        src={biz.embedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        title={`Mapa de ${biz.name}`}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        })()}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default CalendarMobile