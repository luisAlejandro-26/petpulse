import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import SideMenu from '../../components/SideMenu'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import BottomNav from '../../components/BottomNav'
import { getPets } from '../../api/pets'
import { getEvents } from '../../api/events'
import type { Pet, HealthEvent } from '../../api/types'
import { ACTIVITY_META, STATUS_LABEL, formatDate } from '../../components/dashboard/dashboardUtils'
import HealthToast from '../../components/dashboard/HealthToast' // aviso emergente arriba de la pantalla cuando hay alertas de salud próximas
import logo from '../../assets/logo.png'

const HEALTH_EVENT_TYPES = new Set(['VACUNA', 'CONTROL', 'DESPARACITACION', 'CIRUGIA']) // tipos de evento que cuentan para el contador de "alertas de salud" (OTHER queda fuera)

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
    return `${months} meses`
  }
  return `${years} ${years === 1 ? 'año' : 'años'}`
}

// Pantalla principal: lista de mascotas del usuario + campana de notificaciones (alertas de salud y actividad reciente)
function HomeMobile() {
  const { user, token } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
 const [notifOpen, setNotifOpen] = useState(false) // abre/cierra el panel deslizable de notificaciones
  const [toastVisible, setToastVisible] = useState(false) // controla el aviso emergente (toast) de alertas de salud
  const navigate = useNavigate()

  const [pets, setPets] = useState<Pet[]>([])
  const [events, setEvents] = useState<HealthEvent[]>([]) // TODOS los eventos del usuario (todas sus mascotas), se usan para las notificaciones
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Carga mascotas y eventos en paralelo apenas se tiene el token
  useEffect(() => {
    if (!token) return

    Promise.all([getPets(token), getEvents(token)])
      .then(([petsData, eventsData]) => {
        setPets(petsData)
        setEvents(eventsData)
      })
      .catch(() => setError('No se pudieron cargar las mascotas'))
      .finally(() => setLoading(false))
  }, [token])

  // Cuenta eventos de salud (no cancelados) que vencen o están próximos (dentro de 3 días) - incluye tanto la fecha del evento como next_due_date si existe
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

  // Muestra el toast automáticamente en cuanto se cargan los eventos, si hay alertas de salud
  useEffect(() => {
    if (!loading && alertaSalud > 0) {
      setToastVisible(true)
    }
  }, [loading, alertaSalud])

  

  // Últimos 10 eventos completados o pendientes, más recientes primero - se muestran en el panel de notificaciones
  const actividadReciente = useMemo(() => {
    return events
      .filter((e) => e.status === 'COMPLETED' || e.status === 'SCHEDULED')
      .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
      .slice(0, 10)
  }, [events])

  return (
    <div className="h-screen w-full bg-petpulse-bg flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[402px] h-screen flex flex-col overflow-hidden">

        <div className="flex-1 overflow-y-auto pb-24">
          {/* ── Header: menú hamburguesa + campana de notificaciones ── */}
          <div className="flex items-center justify-between px-6 pt-6">
            <button type="button" aria-label="Abrir menú" onClick={() => setMenuOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F3E32" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              </svg>
            </button>
            <button type="button" aria-label="Notificaciones" className="relative" onClick={() => setNotifOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F3E32" strokeWidth="2">
                <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {/* Puntito rojo: solo se muestra si hay alertas de salud activas */}
              {alertaSalud > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-petpulse-accent rounded-full border border-petpulse-bg" />
              )}
            </button>
          </div>

          {/* Logo */}
          <div className="flex flex-col items-center mt-2">
            <img src={logo} alt="Logo PetPulse" className="w-24 h-auto" />
          </div>

          {/* Bienvenida */}
          <h1 className="font-encode-expanded font-bold text-xl text-petpulse-primary text-center mt-3 flex items-center justify-center gap-1.5">
            Bienvenido\a {user?.name_user ?? 'Nombre'}
            <span aria-hidden="true">🐾</span>
          </h1>
          <p className="font-inter font-semibold text-sm text-petpulse-text-secondary text-center mt-1 px-16 leading-tight">
            Aquí tienes la información de tus mascotas
          </p>

          {/* ── Lista de mascotas: cada card lleva a la ficha (PetProfile), el lápiz va directo a editar ── */}
          <div className="px-[27px] mt-10 flex flex-col gap-6">
            {loading && (
              <p className="text-center text-petpulse-text-secondary text-sm font-inter">Cargando mascotas...</p>
            )}

            {!loading && error && (
              <p className="text-center text-petpulse-accent text-sm font-inter">{error}</p>
            )}

            {!loading && !error && pets.length === 0 && (
              <p className="text-center text-petpulse-text-secondary text-sm font-inter px-6">
                Aún no tienes mascotas registradas. ¡Agrega la primera!
              </p>
            )}

            {!loading && !error && pets.map((pet) => (
              <Link
                key={pet.id_pet}
                to={`/pets/${pet.id_pet}`}
                className="relative w-full h-[86px] bg-white border border-petpulse-border rounded-xl shadow-md flex items-center px-4 active:scale-[0.98] transition-transform"
              >
                {/* Avatar circular */}
                <div className="w-12 h-12 rounded-full bg-petpulse-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {pet.pet_image_url ? (
                    <img src={pet.pet_image_url} alt={pet.name_pet} className="w-full h-full object-cover" />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#7A9A7B">
                      <ellipse cx="12" cy="15" rx="6" ry="5" />
                      <ellipse cx="6" cy="8" rx="2.2" ry="3" />
                      <ellipse cx="12" cy="5" rx="2.2" ry="3" />
                      <ellipse cx="18" cy="8" rx="2.2" ry="3" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="ml-3">
                  <p className="font-encode-semi font-bold text-sm text-petpulse-text">{pet.name_pet}</p>
                  <p className="font-encode-condensed text-xs text-petpulse-text-secondary leading-tight">
                    {pet.breed || pet.species}
                  </p>
                  <p className="font-encode-condensed text-xs text-petpulse-text-secondary leading-tight">
                    {calculateAge(pet.birth_date)}
                  </p>
                </div>

                {/* Botón editar: preventDefault para no disparar la navegación del Link padre */}
                <button
                  type="button"
                  aria-label={`Editar ${pet.name_pet}`}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(`/pets/${pet.id_pet}/edit`)
                  }}
                  className="absolute top-3 right-3 text-petpulse-accent"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" strokeLinecap="round" />
                    <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </Link>
            ))}
          </div>

          {/* Botón agregar mascota */}
          <div className="flex justify-center mt-8">
            <Link
              to="/pets/new"
              className="h-11 px-6 border border-petpulse-primary rounded-full flex items-center gap-2 text-petpulse-primary font-encode-semi font-semibold text-sm active:scale-[0.98] transition-transform"
            >
              Agregar mascotas
              <span aria-hidden="true">🐾</span>
            </Link>
          </div>
        </div>

        {/* NavBar inferior */}
        <BottomNav />
      </div>

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ── Panel de notificaciones: se desliza desde abajo (mismo patrón que el historial de PetIA) ── */}
      {notifOpen && (
        <div className="absolute inset-0 z-50 flex flex-col bg-black/40">
          <div className="mt-auto bg-petpulse-bg rounded-t-3xl max-h-[80%] flex flex-col overflow-hidden mx-auto w-full max-w-[402px]">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-petpulse-border">
              <h2 className="font-encode-semi font-bold text-lg text-petpulse-text">Notificaciones</h2>
              <button type="button" onClick={() => setNotifOpen(false)} aria-label="Cerrar notificaciones">
                <Icon icon="mdi:close" width={22} height={22} color="#2F3E32" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* Card de resumen: número de alertas de salud activas */}
              <div className="bg-white border border-petpulse-border rounded-2xl p-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-petpulse-accent/15 flex items-center justify-center flex-shrink-0">
                    <Icon icon="mdi:heart-pulse" width={20} height={20} color="#E07A5F" />
                  </div>
                  <div>
                    <p className="font-inter font-bold text-2xl text-petpulse-text leading-none">{alertaSalud}</p>
                    <p className="font-inter text-sm text-petpulse-text-secondary">Alertas de salud activas</p>
                  </div>
                </div>
                <p className="font-inter text-xs text-petpulse-text-secondary mt-3 leading-relaxed">
                  Revisa el estado de tus mascotas y agenda una cita si lo consideras necesario.
                </p>
              </div>

              <p className="font-inter font-bold text-sm text-petpulse-text uppercase tracking-wide mb-3">
                Actividad reciente
              </p>

              {loading && (
                <p className="text-center text-petpulse-text-secondary text-sm font-inter py-6">Cargando...</p>
              )}

              {!loading && actividadReciente.length === 0 && (
                <p className="text-center text-petpulse-text-secondary text-sm font-inter py-6">
                  Aún no hay actividad registrada.
                </p>
              )}

              {/* Lista de actividad reciente: ícono y color según el tipo de evento (ACTIVITY_META), etiqueta de estado (STATUS_LABEL) */}
              {!loading && actividadReciente.length > 0 && (
                <div className="flex flex-col gap-2 mb-4">
                  {actividadReciente.map((ev) => {
                    const meta = ACTIVITY_META[ev.event_type] ?? ACTIVITY_META.OTHER
                    const statusInfo = STATUS_LABEL[ev.status] ?? STATUS_LABEL.SCHEDULED
                    const isAccent = meta.tone === 'accent'
                    return (
                      <div
                        key={ev.id_event}
                        className="flex items-center gap-3 bg-white border border-petpulse-border rounded-xl px-3.5 py-3"
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isAccent ? 'bg-petpulse-accent/10' : 'bg-petpulse-primary/15'
                          }`}
                        >
                          <Icon icon={meta.icon} width={18} height={18} color={isAccent ? '#E07A5F' : '#6B8C6C'} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-encode-semi font-bold text-sm text-petpulse-text truncate">
                            {meta.label} {ev.pet?.name_pet ? `· ${ev.pet.name_pet}` : ''}
                          </p>
                          <p className="font-inter text-xs text-petpulse-text-secondary mt-0.5">
                            {formatDate(ev.event_date)}
                          </p>
                        </div>
                        <span className={`text-[11px] font-inter font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusInfo.className}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Cierra el panel y navega al Calendario para ver el historial completo */}
              {!loading && actividadReciente.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(false)
                    navigate('/calendar')
                  }}
                  className="w-full py-3 rounded-full border border-petpulse-border text-sm font-encode-semi font-semibold text-petpulse-primary-dark flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
                >
                  Ver todas las actividades
                  <Icon icon="mdi:chevron-right" width={16} height={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <HealthToast
        visible={toastVisible}
        alertaSalud={alertaSalud}
        onDismiss={() => setToastVisible(false)}
        onViewDetails={() => {
          setToastVisible(false)
          setNotifOpen(true)
        }}
      />
    </div>
  )
}

export default HomeMobile