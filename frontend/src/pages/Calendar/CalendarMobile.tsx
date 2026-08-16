import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuth } from '../../context/AuthContext'
import { getEvents, updateEvent, deleteEvent } from '../../api/events'
import type { HealthEvent } from '../../api/types'
import iconCalendar from '../../assets/icon-calendar.png'
import iconPaw from '../../assets/icon-paw.png'
import iconUser from '../../assets/icon-user.png'

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const EVENT_ICON_NAME: Record<string, string> = {
  VACUNA: 'game-icons:medicines',
  CONTROL: 'hugeicons:doctor-01',
  DESPARACITACION: 'material-symbols:emergency',
  CIRUGIA: 'material-symbols:emergency',
  OTHER: 'mdi:content-cut',
}

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

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  COMPLETED: { text: 'Aplicado', className: 'bg-petpulse-primary/15 text-petpulse-primary-dark' },
  SCHEDULED: { text: 'Pendiente', className: 'bg-petpulse-accent/15 text-petpulse-accent' },
  CANCELLED: { text: 'Cancelado', className: 'bg-petpulse-text-secondary/15 text-petpulse-text-secondary' },
}

function CalendarMobile() {
  const { token } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isActive = (path: string) => location.pathname === path

  const [events, setEvents] = useState<HealthEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)

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

  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return events
      .filter((ev) => ev.status === 'SCHEDULED' || new Date(ev.event_date) >= now)
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
      .slice(0, 5)
  }, [events])

  const eventToDelete = events.find((e) => e.id_event === confirmId)

  return (
    <div className="min-h-screen w-full bg-petpulse-bg flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[402px] min-h-screen flex flex-col">

        <div className="flex-1 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6">
            <button type="button" aria-label="Abrir menú">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F3E32" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              </svg>
            </button>
            <h1 className="font-inter font-bold text-base text-petpulse-primary-dark">Calendario</h1>
            <button type="button" aria-label="Notificaciones" className="relative">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F3E32" strokeWidth="2">
                <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-petpulse-accent rounded-full border border-petpulse-bg" />
            </button>
          </div>

          {/* Navegación de mes */}
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

          {/* Cuadrícula del calendario */}
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

          {/* Próximos Recordatorios */}
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
              const isDeleting = deletingId === ev.id_event

              return (
                <div
                  key={ev.id_event}
                  className={`w-full bg-white border border-petpulse-border rounded-xl flex items-center px-4 gap-3 transition-all duration-[280ms] ease-in overflow-hidden ${
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
                      onClick={() => handleToggleStatus(ev)}
                      disabled={ev.status === 'CANCELLED'}
                      className={`text-[11px] font-inter font-semibold px-2 py-1 rounded-full whitespace-nowrap active:scale-95 transition-transform ${statusInfo.className}`}
                    >
                      {statusInfo.text}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(ev.id_event)}
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

          {/* Botón agregar recordatorio */}
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
        <nav className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[338px] h-[60px] bg-white/10 border border-petpulse-border rounded-2xl backdrop-blur-sm flex items-center justify-around">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
              isActive('/dashboard') ? 'bg-petpulse-primary/15' : ''
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isActive('/dashboard') ? '#6B8C6C' : '#7A9A7B'} strokeWidth="2">
              <path d="M3 11l9-8 9 8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={`font-inter text-[12px] ${isActive('/dashboard') ? 'text-petpulse-primary-dark font-semibold' : 'text-petpulse-text'}`}>
              Inicio
            </span>
          </Link>

          <div className="w-px h-[60%] bg-petpulse-border" />

          <Link
            to="/calendar"
            className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
              isActive('/calendar') ? 'bg-petpulse-primary/15' : ''
            }`}
          >
            <img src={iconCalendar} alt="" className="w-6 h-6" aria-hidden="true" />
            <span className={`font-inter text-[12px] ${isActive('/calendar') ? 'text-petpulse-primary-dark font-semibold' : 'text-petpulse-text'}`}>
              Calendario
            </span>
          </Link>

          <div className="w-px h-[60%] bg-petpulse-border" />

          <Link
            to="/pet-ia"
            className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
              isActive('/pet-ia') ? 'bg-petpulse-primary/15' : ''
            }`}
          >
            <img src={iconPaw} alt="" className="w-6 h-6" aria-hidden="true" />
            <span className={`font-inter text-[12px] ${isActive('/pet-ia') ? 'text-petpulse-primary-dark font-semibold' : 'text-petpulse-text'}`}>
              PetIA
            </span>
          </Link>

          <div className="w-px h-[60%] bg-petpulse-border" />

          <Link
            to="/profile"
            className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
              isActive('/profile') ? 'bg-petpulse-primary/15' : ''
            }`}
          >
            <img src={iconUser} alt="" className="w-6 h-6" aria-hidden="true" />
            <span className={`font-inter text-[12px] ${isActive('/profile') ? 'text-petpulse-primary-dark font-semibold' : 'text-petpulse-text'}`}>
              Perfil
            </span>
          </Link>
        </nav>

        {/* Modal de confirmación de eliminación */}
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