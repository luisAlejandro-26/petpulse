import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuth } from '../../context/AuthContext'
import { getEvents, updateEvent, deleteEvent } from '../../api/events'
import type { HealthEvent } from '../../api/types'
import logo from '../../assets/logo.png'
import petsIllustration from '../../assets/pets-illustration.png'

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
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

const ACTIVITY_META: Record<string, { label: string; icon: string; tone: 'primary' | 'accent' }> = {
  VACUNA: { label: 'Vacuna aplicada', icon: 'mdi:needle', tone: 'primary' },
  CONTROL: { label: 'Consulta realizada', icon: 'mdi:file-document-outline', tone: 'primary' },
  DESPARACITACION: { label: 'Medicamento registrado', icon: 'mdi:pill', tone: 'primary' },
  CIRUGIA: { label: 'Cirugía realizada', icon: 'mdi:medical-bag', tone: 'primary' },
  OTHER: { label: 'Recordatorio', icon: 'mdi:alert-circle-outline', tone: 'accent' },
}

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  COMPLETED: { text: 'Aplicado', className: 'bg-petpulse-primary/15 text-petpulse-primary-dark' },
  SCHEDULED: { text: 'Pendiente', className: 'bg-petpulse-accent/15 text-petpulse-accent' },
  CANCELLED: { text: 'Cancelado', className: 'bg-petpulse-text-secondary/15 text-petpulse-text-secondary' },
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '00/00/00'
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function CalendarTablet() {
  const { token } = useAuth()
  const location = useLocation()
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
    const startOffset = firstDay.getDay()
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

  const actividadReciente = useMemo(() => {
    return events
      .filter((e) => e.status === 'COMPLETED')
      .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
      .slice(0, 4)
  }, [events])

  const eventToDelete = events.find((e) => e.id_event === confirmId)

  const navItemClass = (path: string) =>
    `flex flex-col items-center gap-[3px] no-underline text-[11px] font-semibold px-4 py-2 rounded-[14px] transition-colors hover:bg-[#eaf0ea] hover:text-petpulse-primary-dark ${
      isActive(path) ? 'bg-[#eaf0ea] text-petpulse-primary-dark' : 'text-petpulse-text-secondary'
    }`

  return (
    <div className="min-h-screen bg-petpulse-bg font-inter text-petpulse-text box-border pb-28">
      <div className="w-full max-w-[900px] mx-auto px-5 pt-8 flex flex-col gap-5">
        <header className="flex items-start justify-between gap-4 flex-wrap max-[560px]:justify-center max-[560px]:text-center">
          <div className="flex items-center gap-2 max-[560px]:justify-center">
            <img src={logo} alt="" className="w-[84px] h-auto shrink-0" />
            <div>
              <p className="font-poppins font-bold text-xl text-petpulse-primary m-0 tracking-[0.02em]">PETPULSE</p>
              <p className="text-[11px] text-petpulse-text-secondary m-0 leading-[1.3] max-w-[160px]">
                Salud y bienestar para tus mascotas.
              </p>
            </div>
          </div>

          <div className="flex-1 min-w-[220px] text-center">
            <h1 className="font-poppins font-bold text-xl text-petpulse-primary m-0 flex items-center justify-center gap-1.5">
              Calendario <Icon icon="mdi:paw" width={18} height={18} className="text-petpulse-primary" />
            </h1>
            <p className="text-[13px] text-petpulse-text-secondary mt-0.5 mb-0">
              Gestiona citas, vacunas y recordatorios importantes
            </p>
          </div>

          <button
            type="button"
            className="w-10 h-10 rounded-full border border-petpulse-border bg-petpulse-card text-petpulse-text flex items-center justify-center cursor-pointer shrink-0 transition-colors hover:bg-[#eaf0ea] hover:border-petpulse-primary"
            aria-label="Notificaciones"
          >
            <Icon icon="mdi:bell-outline" width={22} height={22} />
          </button>
        </header>

        <div className="grid grid-cols-[1.3fr_1fr] gap-4 items-start max-[760px]:grid-cols-1">
          <div className="bg-petpulse-card border border-petpulse-border rounded-[20px] p-5">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Mes anterior"
                className="w-8 h-8 rounded-full flex items-center justify-center text-petpulse-text bg-transparent border-0 cursor-pointer hover:bg-[#eaf0ea]"
              >
                <Icon icon="mdi:chevron-left" width={20} height={20} />
              </button>
              <span className="font-poppins font-bold text-base text-petpulse-text">
                {MONTH_NAMES[month]} {year}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Mes siguiente"
                className="w-8 h-8 rounded-full flex items-center justify-center text-petpulse-text bg-transparent border-0 cursor-pointer hover:bg-[#eaf0ea]"
              >
                <Icon icon="mdi:chevron-right" width={20} height={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 text-center mb-2">
              {WEEKDAYS.map((d) => (
                <span key={d} className="text-xs font-semibold text-petpulse-text-secondary">
                  {d}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-2 text-center">
              {calendarGrid.map((day, i) => {
                if (day === null) return <div key={i} />
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                const hasEvent = eventDaysInMonth.has(day)

                return (
                  <div key={i} className="flex flex-col items-center">
                    <span
                      className={`w-9 h-9 flex items-center justify-center rounded-full text-sm ${
                        isToday ? 'bg-petpulse-primary text-white font-bold' : 'text-petpulse-text'
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

            <div className="flex items-center gap-5 mt-5 pt-4 border-t border-petpulse-border flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-petpulse-text-secondary">
                <span className="w-2 h-2 rounded-full bg-petpulse-primary" /> Completadas
              </span>
              <span className="flex items-center gap-1.5 text-xs text-petpulse-text-secondary">
                <span className="w-2 h-2 rounded-full bg-petpulse-accent" /> Pendientes
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-petpulse-card border border-petpulse-border rounded-[20px] p-4">
              <h2 className="font-poppins font-bold text-base text-petpulse-text mb-3">Actividad reciente</h2>

              {loading && <p className="text-[13px] text-petpulse-text-secondary">Cargando...</p>}
              {!loading && actividadReciente.length === 0 && (
                <p className="text-[13px] text-petpulse-text-secondary">Aún no hay actividad registrada.</p>
              )}

              <ul className="list-none m-0 p-0 flex flex-col gap-3">
                {!loading &&
                  actividadReciente.map((event) => {
                    const meta = ACTIVITY_META[event.event_type] ?? ACTIVITY_META.OTHER
                    return (
                      <li key={event.id_event} className="flex items-start gap-3">
                        <span
                          className={`w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 ${
                            meta.tone === 'accent' ? 'bg-[#fbe9e5] text-petpulse-accent' : 'bg-[#eaf0ea] text-petpulse-primary'
                          }`}
                        >
                          <Icon icon={meta.icon} width={18} height={18} />
                        </span>
                        <span>
                          <p className="font-semibold text-[13px] m-0 leading-[1.3]">{meta.label}</p>
                          <p className="text-[11px] text-petpulse-text-secondary mt-px mb-0">
                            {event.pet?.name_pet ?? 'Mascota'} {formatDate(event.event_date)}
                          </p>
                        </span>
                      </li>
                    )
                  })}
              </ul>
            </div>

            <div className="bg-petpulse-card border border-petpulse-border rounded-[20px] p-4">
              <h2 className="font-poppins font-bold text-base text-petpulse-text mb-3">Próximos recordatorios</h2>

              {loading && <p className="text-[13px] text-petpulse-text-secondary">Cargando...</p>}
              {!loading && upcomingEvents.length === 0 && (
                <p className="text-[13px] text-petpulse-text-secondary">No tienes recordatorios próximos.</p>
              )}

              <div className="flex flex-col gap-2.5">
                {!loading &&
                  upcomingEvents.map((ev) => {
                    const statusInfo = STATUS_LABEL[ev.status]
                    const isDeleting = deletingId === ev.id_event
                    return (
                      <div
                        key={ev.id_event}
                        className={`flex items-center gap-3 bg-petpulse-bg border border-petpulse-border rounded-xl px-3 py-2.5 transition-all duration-[280ms] ease-in overflow-hidden ${
                          isDeleting ? 'opacity-0 scale-95 max-h-0 !p-0 !border-0' : 'opacity-100 scale-100 max-h-24'
                        }`}
                      >
                        <span
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: ev.status === 'COMPLETED' ? '#7A9A7B' : '#E07A5F' }}
                        >
                          <Icon icon={EVENT_ICON_NAME[ev.event_type] ?? 'mdi:paw'} width={17} height={17} color="white" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[13px] text-petpulse-text truncate m-0">
                            {ev.title} {ev.pet?.name_pet ? `- ${ev.pet.name_pet}` : ''}
                          </p>
                          <p className="text-[11px] text-petpulse-text-secondary m-0">{formatDate(ev.event_date)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(ev)}
                          disabled={ev.status === 'CANCELLED'}
                          className={`text-[11px] font-semibold px-2 py-1 rounded-full whitespace-nowrap cursor-pointer border-0 shrink-0 transition-transform active:scale-95 ${statusInfo.className}`}
                        >
                          {statusInfo.text}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmId(ev.id_event)}
                          aria-label="Eliminar recordatorio"
                          className="text-petpulse-text-secondary bg-transparent border-0 cursor-pointer shrink-0 transition-transform active:scale-90 hover:text-petpulse-accent"
                        >
                          <Icon icon="mdi:trash-can-outline" width={17} height={17} />
                        </button>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-5 bg-gradient-to-r from-[#dce7dc] to-[#eaf0ea] rounded-[20px] px-6 py-5 overflow-hidden min-h-[96px] max-[560px]:flex-wrap max-[560px]:justify-center max-[560px]:text-center">
          <img src={petsIllustration} alt="" className="h-[88px] w-auto shrink-0 object-contain" />
          <div className="flex-1 min-w-[140px]">
            <p className="font-poppins font-bold text-[15px] text-petpulse-text m-0">Tu compromiso es su bienestar</p>
            <p className="text-xs text-petpulse-text-secondary mt-0.5 mb-0 max-w-[320px]">
              Mantén al día sus cuidados para una vida más saludable
            </p>
          </div>
          <Link
            to="/events/category"
            className="shrink-0 bg-petpulse-primary-dark text-white rounded-full px-6 py-3 font-bold text-sm no-underline whitespace-nowrap transition-colors hover:bg-[#5c7c5d] active:scale-[0.98] max-[560px]:w-full max-[560px]:text-center"
          >
            Agregar recordatorio
          </Link>
        </div>
      </div>

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

      {confirmId !== null && eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmId(null)} />
          <div className="relative w-full max-w-[400px] bg-petpulse-card rounded-[20px] px-6 py-7">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#fbe9e5] flex items-center justify-center mb-4">
                <Icon icon="mdi:trash-can-outline" width={26} height={26} className="text-petpulse-accent" />
              </div>
              <h3 className="font-poppins font-bold text-lg text-petpulse-text m-0">¿Eliminar recordatorio?</h3>
              <p className="text-sm text-petpulse-text-secondary mt-1.5 mb-0 px-2">
                {eventToDelete.title} {eventToDelete.pet?.name_pet ? `- ${eventToDelete.pet.name_pet}` : ''} se
                eliminará permanentemente.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setConfirmId(null)}
                className="flex-1 py-2.5 border border-petpulse-border rounded-full font-semibold text-sm text-petpulse-text bg-transparent cursor-pointer transition-transform active:scale-[0.97]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-petpulse-accent rounded-full font-semibold text-sm text-white border-0 cursor-pointer transition-transform active:scale-[0.97]"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarTablet