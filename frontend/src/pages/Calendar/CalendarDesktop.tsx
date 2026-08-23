import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getEvents, updateEvent } from '../../api/events'
import { getPets } from '../../api/pets'
import type { HealthEvent, Pet } from '../../api/types'
import Sidebar from '../../components/dashboard/Sidebar'
import { WEEKDAYS, MONTH_NAMES, ACTIVITY_META, STATUS_LABEL, EVENT_ICONS, formatDate, calculateAge } from '../../components/dashboard/dashboardUtils'
import petsIllustration from '../../assets/pets-illustration.png'
import { Icon } from '@iconify/react'

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


function CalendarDesktop() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState<HealthEvent[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<HealthEvent | null>(null)


  useEffect(() => {
    if (!token) return
    let cancelled = false
    setLoading(true)
    Promise.all([
      getEvents(token).catch(() => [] as HealthEvent[]),
      getPets(token).catch(() => [] as Pet[]),
    ])
      .then(([eventsData, petsData]) => {
        if (cancelled) return
        setEvents(eventsData)
        setPets(petsData)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [token])

  async function handleToggleStatus(ev: HealthEvent) {
    if (!token) return
    const newStatus = ev.status === 'COMPLETED' ? 'SCHEDULED' : 'COMPLETED'
    try {
      const updated = await updateEvent(ev.id_event, { status: newStatus }, token)
      setEvents((prev) => prev.map((e) => (e.id_event === ev.id_event ? updated : e)))
    } catch {
      // silencioso
    }
  }

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

  const upcomingEvents = useMemo(() => {
    return events
      .filter((ev) => ev.status === 'SCHEDULED')
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
  }, [events])

  const actividadReciente = useMemo(() => {
    return events
      .filter((e) => e.status === 'COMPLETED' || e.status === 'SCHEDULED')
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'SCHEDULED' ? -1 : 1
        return new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      })
      .slice(0, 10)
  }, [events])

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)) }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)) }

  return (
    <div className="min-h-screen w-full bg-petpulse-bg flex">
      {/* sidebar */}
      <Sidebar />

      {/* ── Centro ── */}
      <main className="flex-1 min-w-0 px-8 lg:px-10 py-8 flex flex-col gap-8">
        <header>
          <h1 className="text-3xl font-bold text-petpulse-text">Calendario</h1>
          <p className="text-petpulse-text-secondary mt-1.5">
            Visualiza y gestiona las citas y recordatorios de tus mascotas.
          </p>
        </header>

        {/* Calendario */}
        <div className="bg-white rounded-2xl border border-petpulse-border p-6 max-h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
          {/* Calendario grid - fixed */}
          <div className="shrink-0">
            <h2 className="font-bold text-lg text-petpulse-text mb-5 flex items-center gap-2">
              <Icon icon="mdi:calendar-month-outline" width={22} height={22} className="text-petpulse-primary" />
              Calendario
            </h2>

            {/* navegación meses */}
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={prevMonth} aria-label="Mes anterior" className="p-1.5 rounded-lg hover:bg-petpulse-bg transition-colors">
                <Icon icon="mdi:chevron-left" width={20} height={20} className="text-petpulse-text" />
              </button>
              <span className="font-bold text-base text-petpulse-text">
                {MONTH_NAMES[month]} {year}
              </span>
              <button type="button" onClick={nextMonth} aria-label="Mes siguiente" className="p-1.5 rounded-lg hover:bg-petpulse-bg transition-colors">
                <Icon icon="mdi:chevron-right" width={20} height={20} className="text-petpulse-text" />
              </button>
            </div>

            <div className="grid grid-cols-7 text-center mb-2">
              {WEEKDAYS.map((d, i) => (
                <span key={i} className="text-xs font-semibold text-petpulse-text-secondary">{d}</span>
              ))}
            </div>

            {/* dots de eventos */}
            <div className="grid grid-cols-7 gap-y-1 text-center">
              {calendarGrid.map((day, i) => {
                if (day === null) return <div key={i} />
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                const hasEvent = eventDaysInMonth.has(day)
                return (
                  <div key={i} className="flex flex-col items-center">
                    <span
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                        isToday ? 'bg-petpulse-primary text-white font-bold' : 'text-petpulse-text'
                      }`}
                    >
                      {day}
                    </span>
                    {hasEvent && !isToday && (
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-0.5"
                        style={{ backgroundColor: eventDaysInMonth.get(day) === 'COMPLETED' ? '#7A9A7B' : '#E07A5F' }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Próximos Recordatorios - scrollable */}
          <div className="mt-6 flex-1 min-h-0 overflow-y-auto pr-1">
            <p className="font-bold text-sm text-petpulse-text mb-3">Próximos Recordatorios</p>
            {loading && (
              <p className="text-center text-petpulse-text-secondary text-sm">Cargando...</p>
            )}
            {!loading && upcomingEvents.length === 0 && (
              <p className="text-center text-petpulse-text-secondary text-sm">No tienes recordatorios próximos</p>
            )}
            <div className="flex flex-col gap-2.5">
              {!loading && upcomingEvents.map((ev) => {
                const statusInfo = STATUS_LABEL[ev.status]
                const eventDate = new Date(ev.event_date)
                const dateLabel = eventDate.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
                const iconBg = ev.status === 'COMPLETED' ? '#7A9A7B' : '#E07A5F'
                const iconName = EVENT_ICONS[ev.event_type] ?? 'mdi:paw'
                return (
                  <div
                    key={ev.id_event}
                    onClick={() => setSelectedEvent(ev)}
                    className="bg-petpulse-bg border border-petpulse-border rounded-xl flex items-center px-3.5 gap-3 h-[56px] cursor-pointer hover:border-petpulse-primary/40 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconBg }}>
                      <Icon icon={iconName} width={18} height={18} color="white" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-semibold text-[13px] text-petpulse-text truncate">
                        {ev.title} {ev.pet?.name_pet ? `- ${ev.pet.name_pet}` : ''}
                      </p>
                      <p className="text-[11px] text-petpulse-text-secondary">{dateLabel}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleToggleStatus(ev) }}
                      disabled={ev.status === 'CANCELLED'}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap transition-colors ${statusInfo.className}`}
                    >
                      {statusInfo.text}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Panel detalle del negocio */}
        {selectedEvent && (() => {
          const biz = BUSINESS_MAP[selectedEvent.event_place]
          return (
            <div className="bg-white rounded-2xl border border-petpulse-border p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-petpulse-primary tracking-[0.5px] uppercase">Detalle del recordatorio</p>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="w-7 h-7 rounded-full border border-petpulse-border bg-petpulse-bg flex items-center justify-center text-petpulse-text-secondary hover:text-petpulse-primary hover:border-petpulse-primary transition-colors"
                >
                  <Icon icon="mdi:close" width={16} height={16} />
                </button>
              </div>

              {/* Info del evento */}
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

              {/* Info del negocio (si existe match) */}
              {biz && (
                <>
                  <div className="border-t border-petpulse-border" />
                  <p className="text-[11px] font-bold text-petpulse-primary tracking-[0.5px] uppercase">Información del negocio</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Icon icon="mdi:store" width={18} height={18} className="text-petpulse-primary shrink-0" />
                      <span className="font-semibold text-sm text-petpulse-text">{biz.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Icon icon="mdi:phone" width={18} height={18} className="text-petpulse-primary shrink-0" />
                      <a
                        href={`tel:${biz.phone.replace(/\s/g, '')}`}
                        className="text-sm text-petpulse-primary underline decoration-petpulse-primary/30 hover:decoration-petpulse-primary transition-colors"
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

                  {/* Mapa */}
                  <div className="h-[180px] rounded-xl border border-petpulse-border overflow-hidden">
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
          )
        })()}

        {/* banner consejo */}
        <section className="relative flex items-center gap-5 bg-gradient-to-r from-[#dce7dc] to-[#eaf0ea] rounded-[20px] px-6 py-5 overflow-hidden min-h-[96px]">
          <img src={petsIllustration} alt="" className="h-[88px] w-auto shrink-0 object-contain" />
          <div className="flex-1 min-w-[140px]">
            <p className="font-bold text-[15px] text-petpulse-text m-0">Tu compromiso es su bienestar</p>
            <p className="text-xs text-petpulse-text-secondary mt-0.5 mb-0 max-w-[320px]">
              Mantén al día sus cuidados para una vida más saludable
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/events/category')}
            className="shrink-0 bg-petpulse-primary-dark text-white rounded-full px-6 py-3 font-bold text-sm no-underline whitespace-nowrap transition-colors hover:bg-[#5c7c5d] active:scale-[0.98]"
          >
            Agregar recordatorio
          </button>
        </section>
      </main>

      {/* ── Panel derecho ── */}
      <aside className="w-[320px] shrink-0 bg-white border-l border-petpulse-border h-screen sticky top-0 flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-6 border-b border-petpulse-border">
          <h2 className="text-lg font-bold text-petpulse-text">Notificaciones</h2>

        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {/* actividad reciente */}
          <div>
            <h3 className="text-sm font-bold text-petpulse-text uppercase tracking-wide mb-4">
              Actividad reciente
            </h3>

            {loading && (
              <div className="flex items-center justify-center gap-2 py-6 text-petpulse-text-secondary">
                <Icon icon="svg-spinners:dots-2" width={20} height={20} />
                Cargando...
              </div>
            )}

            {!loading && actividadReciente.length === 0 && (
              <p className="text-sm text-petpulse-text-secondary py-4 text-center">
                Aún no hay actividad registrada.
              </p>
            )}

            {!loading && actividadReciente.length > 0 && (
              <ul className="flex flex-col gap-2">
                {actividadReciente.map((ev) => {
                  const meta = ACTIVITY_META[ev.event_type] ?? ACTIVITY_META.OTHER
                  const statusInfo = STATUS_LABEL[ev.status] ?? STATUS_LABEL.SCHEDULED
                  const isAccent = meta.tone === 'accent'
                  return (
                    <li
                      key={ev.id_event}
                      className="flex items-center gap-3 bg-petpulse-bg border border-petpulse-border rounded-xl px-3.5 py-3"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isAccent
                            ? 'bg-petpulse-accent/10 text-petpulse-accent'
                            : 'bg-petpulse-primary/15 text-petpulse-primary-dark'
                        }`}
                      >
                        <Icon icon={meta.icon} width={18} height={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-petpulse-text truncate">
                          {meta.label} {ev.pet?.name_pet ? `· ${ev.pet.name_pet}` : ''}
                        </p>
                        <p className="text-xs text-petpulse-text-secondary mt-0.5">
                          {formatDate(ev.event_date)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleToggleStatus(ev)}
                        disabled={ev.status === 'CANCELLED'}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${statusInfo.className}`}
                      >
                        {statusInfo.text}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-petpulse-border" />

          {/* mis mascotas */}
          <div>
            <h3 className="text-sm font-bold text-petpulse-text uppercase tracking-wide mb-4 flex items-center gap-1.5">
              Mis mascotas
              <Icon icon="mdi:paw" width={14} height={14} className="text-petpulse-accent" />
            </h3>

            {loading && (
              <div className="flex items-center justify-center gap-2 py-6 text-petpulse-text-secondary">
                <Icon icon="svg-spinners:dots-2" width={20} height={20} />
                Cargando...
              </div>
            )}

            {!loading && pets.length === 0 && (
              <p className="text-sm text-petpulse-text-secondary py-4 text-center">
                Aún no tienes mascotas registradas.
              </p>
            )}

            {!loading && pets.length > 0 && (
            <div className="flex flex-col gap-2.5">
                {pets.map((pet) => (
                  <div
                    key={pet.id_pet}
                    className="relative flex items-center gap-3 bg-petpulse-bg border border-petpulse-border rounded-xl px-3.5 py-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-petpulse-primary/15 flex items-center justify-center flex-shrink-0 overflow-hidden text-petpulse-primary-dark">
                      {pet.pet_image_url ? (
                        <img src={pet.pet_image_url} alt={pet.name_pet} className="w-full h-full object-cover" />
                      ) : (
                        <Icon icon="mdi:paw" width={20} height={20} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-petpulse-text truncate">{pet.name_pet}</p>
                      <p className="text-xs text-petpulse-text-secondary truncate">
                        {pet.breed || pet.species} · {calculateAge(pet.birth_date)}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Editar ${pet.name_pet}`}
                      onClick={() => navigate(`/pets/${pet.id_pet}/edit`)}
                      className="text-petpulse-accent flex-shrink-0 p-1"
                    >
                      <Icon icon="mynaui:pencil" width={16} height={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

    </div>
  )
}

export default CalendarDesktop
