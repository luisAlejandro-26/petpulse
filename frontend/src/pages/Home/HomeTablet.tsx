import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getPets } from '../../api/pets'
import { getEvents } from '../../api/events'
import type { HealthEvent, Pet } from '../../api/types'
import logo from '../../assets/logo.png'
import petsIllustration from '../../assets/pets-illustration.png'

function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    years--
  }
  if (years < 1) {
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    return `${months} ${months === 1 ? 'mes' : 'meses'}`
  }
  return `${years} ${years === 1 ? 'año' : 'años'}`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '00/00/00'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${dd}/${mm}/${yy}`
}

const ACTIVITY_META: Record<string, { label: string; icon: string; tone: 'primary' | 'accent' }> = {
  VACUNA: { label: 'Vacuna aplicada', icon: 'mdi:needle', tone: 'primary' },
  CONTROL: { label: 'Consulta realizada', icon: 'mdi:file-document-outline', tone: 'primary' },
  DESPARACITACION: { label: 'Medicamento registrado', icon: 'mdi:pill', tone: 'primary' },
  CIRUGIA: { label: 'Cirugía realizada', icon: 'mdi:medical-bag', tone: 'primary' },
  OTHER: { label: 'Recordatorio', icon: 'mdi:alert-circle-outline', tone: 'accent' },
}

function HomeTablet() {
  const { user, token } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isActive = (path: string) => location.pathname === path

  const [pets, setPets] = useState<Pet[]>([])
  const [events, setEvents] = useState<HealthEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)

  useEffect(() => {
    if (!token) return

    Promise.all([getPets(token), getEvents(token)])
      .then(([petsData, eventsData]) => {
        setPets(petsData)
        setEvents(eventsData)
      })
      .catch(() => setError('No se pudo cargar la información'))
      .finally(() => setLoading(false))
  }, [token])

  const proximasCitas = useMemo(
    () => events.filter((e) => e.status === 'SCHEDULED').length,
    [events],
  )

  const recordatorios = useMemo(
    () =>
      events.filter((e) => e.next_due_date && new Date(e.next_due_date).getTime() >= Date.now()).length,
    [events],
  )

  const HEALTH_EVENT_TYPES = new Set(['VACUNA', 'CONTROL', 'DESPARACITACION', 'CIRUGIA'])

  const alertaSalud = useMemo(() => {
    const now = new Date()
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000
    return events.filter((e) => {
      if (e.status === 'CANCELLED') return false
      if (!HEALTH_EVENT_TYPES.has(e.event_type)) return false
      const eventTime = new Date(e.event_date).getTime()
      if (eventTime <= now.getTime() + threeDaysMs) return true
      if (e.next_due_date) {
        const dueTime = new Date(e.next_due_date).getTime()
        if (dueTime <= now.getTime() + threeDaysMs) return true
      }
      return false
    }).length
  }, [events])

  const actividadReciente = useMemo(() => {
    return events
      .filter((e) => e.status === 'COMPLETED')
      .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
      .slice(0, 4)
  }, [events])

  useEffect(() => {
    if (!loading && alertaSalud > 0) {
      setToastVisible(true)
    }
  }, [loading, alertaSalud])

  const navItemClass = (path: string) =>
    `flex flex-col items-center gap-[3px] no-underline text-[11px] font-semibold px-4 py-2 rounded-[14px] transition-colors hover:bg-[#eaf0ea] hover:text-petpulse-primary-dark ${
      isActive(path) ? 'bg-[#eaf0ea] text-petpulse-primary-dark' : 'text-petpulse-text-secondary'
    }`

  return (
    <div className="min-h-screen bg-petpulse-bg font-inter text-petpulse-text box-border pb-28 *:box-border">
      <div className="w-full max-w-[1100px] mx-auto px-6 pt-8 flex flex-col gap-5">
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
            <h1 className="font-poppins font-bold text-xl text-petpulse-primary m-0">
              Bienvenido\a {user?.name_user ?? 'Nombre'}
              <Icon icon="mdi:paw" width={18} height={18} className="inline-block align-[-3px] ml-1.5 text-petpulse-primary" />
            </h1>
            <p className="text-[13px] text-petpulse-text-secondary mt-0.5 mb-0">
              Aquí tienes la información de tus mascotas
            </p>
          </div>

          <button
            type="button"
            onClick={() => setNotifOpen(true)}
            className="relative w-10 h-10 rounded-full border border-petpulse-border bg-petpulse-card text-petpulse-text flex items-center justify-center cursor-pointer shrink-0 transition-colors hover:bg-[#eaf0ea] hover:border-petpulse-primary"
            aria-label="Notificaciones"
          >
            <Icon icon="mdi:bell-outline" width={22} height={22} />
            {(alertaSalud > 0 || actividadReciente.length > 0) && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-petpulse-accent rounded-full border border-petpulse-card" />
            )}
          </button>
        </header>

        <div className="grid grid-cols-3 gap-4 max-[560px]:grid-cols-[repeat(auto-fit,minmax(140px,1fr))]">
          <Link
            to="/calendar"
            className="flex flex-col bg-petpulse-card rounded-[20px] border border-petpulse-border p-5 no-underline text-petpulse-text transition-shadow hover:shadow-[0_12px_28px_-18px_rgba(47,62,50,0.35)] active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0 bg-[#eaf0ea] text-petpulse-primary">
                <Icon icon="mdi:calendar-month-outline" width={26} height={26} />
              </span>
              <span className="font-bold text-[15px] leading-[1.2]">Próximas citas</span>
            </div>
            <p className="font-poppins font-extrabold text-[34px] leading-none mb-1 text-petpulse-text">
              {loading ? '—' : proximasCitas}
            </p>
            <p className="text-xs text-petpulse-text-secondary mb-3">Citas programadas</p>
            <span className="mt-auto inline-flex items-center gap-1 text-[13px] font-semibold text-petpulse-primary">
              ver calendario <Icon icon="mdi:arrow-right" width={16} height={16} />
            </span>
          </Link>

          <Link
            to="/calendar"
            className="flex flex-col bg-petpulse-card rounded-[20px] border border-petpulse-border p-5 no-underline text-petpulse-text transition-shadow hover:shadow-[0_12px_28px_-18px_rgba(47,62,50,0.35)] active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0 bg-[#eaf0ea] text-petpulse-primary">
                <Icon icon="mdi:bell-ring-outline" width={26} height={26} />
              </span>
              <span className="font-bold text-[15px] leading-[1.2]">Recordatorios</span>
            </div>
            <p className="font-poppins font-extrabold text-[34px] leading-none mb-1 text-petpulse-text">
              {loading ? '—' : recordatorios}
            </p>
            <p className="text-xs text-petpulse-text-secondary mb-3">Pendientes</p>
            <span className="mt-auto inline-flex items-center gap-1 text-[13px] font-semibold text-petpulse-primary">
              ver recordatorios <Icon icon="mdi:arrow-right" width={16} height={16} />
            </span>
          </Link>

          <Link
            to="/calendar"
            className="flex flex-col bg-petpulse-card rounded-[20px] border border-petpulse-border p-5 no-underline text-petpulse-text transition-shadow hover:shadow-[0_12px_28px_-18px_rgba(47,62,50,0.35)] active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0 bg-[#fbe9e5] text-petpulse-accent">
                <Icon icon="mdi:heart-pulse" width={26} height={26} />
              </span>
              <span className="font-bold text-[15px] leading-[1.2]">Alerta de salud</span>
            </div>
            <p className="font-poppins font-extrabold text-[34px] leading-none mb-1 text-petpulse-text">
              {loading ? '—' : alertaSalud}
            </p>
            <p className="text-xs text-petpulse-text-secondary mb-3">Requiere atención</p>
            <span className="mt-auto inline-flex items-center gap-1 text-[13px] font-semibold text-petpulse-accent">
              ver detalles <Icon icon="mdi:arrow-right" width={16} height={16} />
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-[1.6fr_1fr] gap-4 items-start max-[700px]:grid-cols-1">
          <section aria-labelledby="mis-mascotas-heading" className="flex flex-col">
            <h2
              id="mis-mascotas-heading"
              className="font-poppins font-bold text-base text-petpulse-text mb-3 flex items-center gap-1"
            >
              Mis mascotas <Icon icon="mdi:paw" width={16} height={16} className="text-petpulse-primary" />
            </h2>

            {loading && <p className="text-[13px] text-petpulse-text-secondary mb-3">Cargando mascotas...</p>}
            {!loading && error && <p className="text-[13px] text-petpulse-accent mb-3">{error}</p>}
            {!loading && !error && pets.length === 0 && (
              <p className="text-[13px] text-petpulse-text-secondary mb-3">
                Aún no tienes mascotas registradas. ¡Agrega la primera!
              </p>
            )}

            <div className="flex flex-col gap-3">
              {!loading &&
                !error &&
                pets.map((pet) => (
                  <Link
                    key={pet.id_pet}
                    to={`/pets/${pet.id_pet}`}
                    className="relative flex items-center gap-3 bg-petpulse-card border border-petpulse-border rounded-2xl shadow-[0_10px_24px_-20px_rgba(47,62,50,0.4)] px-4 py-3 no-underline text-petpulse-text transition-colors hover:bg-[#eaf0ea]"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#eaf0ea] text-petpulse-primary flex items-center justify-center shrink-0 overflow-hidden">
                      {pet.pet_image_url ? (
                        <img src={pet.pet_image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Icon icon="mdi:paw" width={22} height={22} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm m-0">{pet.name_pet}</p>
                      <p className="text-xs text-petpulse-text-secondary mt-px mb-0 leading-[1.3]">
                        {pet.breed || pet.species}
                      </p>
                      <p className="text-xs text-petpulse-text-secondary mt-px mb-0 leading-[1.3]">
                        {calculateAge(pet.birth_date)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        navigate(`/pets/${pet.id_pet}/edit`)
                      }}
                      className="absolute top-2 right-2 text-petpulse-accent flex items-center justify-center p-1 bg-transparent border-0 cursor-pointer"
                      aria-label={`Editar ${pet.name_pet}`}
                    >
                      <Icon icon="mdi:pencil-outline" width={18} height={18} />
                    </button>
                  </Link>
                ))}
            </div>

            <Link
              to="/pets/new"
              className="self-start mt-4 inline-flex items-center gap-2 border-[1.5px] border-petpulse-primary text-petpulse-primary bg-transparent rounded-full px-5 py-2.5 font-inter font-bold text-[13px] no-underline transition-colors hover:bg-[#eaf0ea]"
            >
              Agregar mascotas <Icon icon="mdi:paw" width={16} height={16} />
            </Link>
          </section>

          <section
            aria-labelledby="actividad-heading"
            className="bg-petpulse-card border border-petpulse-border rounded-[20px] p-4 flex flex-col"
          >
            <h2 id="actividad-heading" className="font-poppins font-bold text-base text-petpulse-text mb-3">
              Actividad reciente
            </h2>

            {loading && <p className="text-[13px] text-petpulse-text-secondary mb-3">Cargando actividad...</p>}
            {!loading && !error && actividadReciente.length === 0 && (
              <p className="text-[13px] text-petpulse-text-secondary mb-3">Aún no hay actividad registrada.</p>
            )}

            <ul className="list-none m-0 mb-4 p-0 flex flex-col gap-3">
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

            <Link
              to="/calendar"
              className="mt-auto text-center border border-petpulse-border rounded-full py-2.5 text-[13px] font-semibold text-petpulse-text no-underline bg-petpulse-bg transition-colors hover:bg-[#eaf0ea] hover:border-petpulse-primary"
            >
              Ver todas las actividades
            </Link>
          </section>
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
            Agendar cita
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

      {notifOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <div className="w-full max-w-[440px] max-h-[80vh] bg-petpulse-bg rounded-[20px] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-petpulse-border">
              <h2 className="font-poppins font-bold text-lg text-petpulse-text m-0">Notificaciones</h2>
              <button type="button" onClick={() => setNotifOpen(false)} aria-label="Cerrar notificaciones">
                <Icon icon="mdi:close" width={22} height={22} color="#2F3E32" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
              <div className="rounded-2xl bg-petpulse-card border border-petpulse-border p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#fbe9e5] flex items-center justify-center flex-shrink-0">
                    <Icon icon="mdi:heart-pulse" width={20} height={20} className="text-petpulse-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold leading-none text-petpulse-text m-0">{alertaSalud}</p>
                    <p className="text-sm text-petpulse-text-secondary m-0">Alertas de salud activas</p>
                  </div>
                </div>
                <p className="text-xs text-petpulse-text-secondary mt-3 leading-relaxed">
                  Revisa el estado de tus mascotas y agenda una cita si lo consideras necesario.
                </p>
              </div>

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
                  <ul className="flex flex-col gap-2 list-none p-0 m-0">
                    {actividadReciente.map((ev) => {
                      const meta = ACTIVITY_META[ev.event_type] ?? ACTIVITY_META.OTHER
                      const isAccent = meta.tone === 'accent'
                      return (
                        <li
                          key={ev.id_event}
                          className="flex items-center gap-3 bg-petpulse-card border border-petpulse-border rounded-xl px-3.5 py-3"
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
                            <p className="text-sm font-semibold text-petpulse-text truncate m-0">
                              {meta.label} {ev.pet?.name_pet ? `· ${ev.pet.name_pet}` : ''}
                            </p>
                            <p className="text-xs text-petpulse-text-secondary mt-0.5 mb-0">
                              {formatDate(ev.event_date)}
                            </p>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}

                {!loading && actividadReciente.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setNotifOpen(false)
                      navigate('/calendar')
                    }}
                    className="w-full mt-5 py-3 rounded-full border border-petpulse-border text-sm font-semibold text-petpulse-primary-dark flex items-center justify-center gap-1.5 hover:bg-petpulse-primary/10 transition-colors"
                  >
                    Ver todas las actividades
                    <Icon icon="mdi:chevron-right" width={16} height={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {toastVisible && (
        <div className="fixed top-6 right-6 z-50 w-full max-w-[340px] animate-[toast-in_0.25s_ease-out]">
          <div className="bg-petpulse-card border border-petpulse-accent/30 rounded-2xl shadow-[0_16px_32px_-14px_rgba(47,62,50,0.35)] p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fbe9e5] flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:heart-pulse" width={20} height={20} className="text-petpulse-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-poppins font-bold text-sm text-petpulse-text m-0">
                {alertaSalud} {alertaSalud === 1 ? 'alerta de salud próxima' : 'alertas de salud próximas'}
              </p>
              <p className="text-xs text-petpulse-text-secondary mt-1 mb-0">
                Tienes {alertaSalud === 1 ? 'un evento' : 'eventos'} de salud en los próximos 3 días.
              </p>
              <button
                type="button"
                onClick={() => {
                  setToastVisible(false)
                  setNotifOpen(true)
                }}
                className="text-xs font-semibold text-petpulse-primary-dark mt-2 hover:underline"
              >
                Ver detalles
              </button>
            </div>
            <button
              type="button"
              onClick={() => setToastVisible(false)}
              aria-label="Cerrar aviso"
              className="text-petpulse-text-secondary flex-shrink-0 hover:text-petpulse-text"
            >
              <Icon icon="mdi:close" width={18} height={18} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default HomeTablet