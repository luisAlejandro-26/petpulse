import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuth } from '../../context/AuthContext'
import { getPet } from '../../api/pets'
import { getEvents, deleteEvent } from '../../api/events'
import type { HealthEvent, EventType } from '../../api/types'
import logo from '../../assets/logo.png'
import dogCatIllustration from '../../assets/dog-cat-illustration.png'

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

const GENDER_LABEL: Record<string, string> = {
  MACHO: 'Macho',
  HEMBRA: 'Hembra',
}

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  COMPLETED: { text: 'Aplicado', className: 'bg-petpulse-primary/15 text-petpulse-primary-dark' },
  SCHEDULED: { text: 'Pendiente', className: 'bg-petpulse-accent/15 text-petpulse-accent' },
  CANCELLED: { text: 'Cancelado', className: 'bg-petpulse-text-secondary/15 text-petpulse-text-secondary' },
}

interface EventCardProps {
  title: string
  icon: string
  events: HealthEvent[]
  emptyText: string
  onAdd: () => void
  onDelete: (id: number) => void
}

function EventCard({ title, icon, events, emptyText, onAdd, onDelete }: EventCardProps) {
  return (
    <div className="bg-petpulse-card border border-petpulse-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-poppins font-bold text-sm text-petpulse-primary-dark">{title}</p>
        <button
          type="button"
          onClick={onAdd}
          aria-label={`Agregar ${title}`}
          className="w-7 h-7 rounded-full bg-[#eaf0ea] flex items-center justify-center hover:bg-[#dfe9df] transition-colors"
        >
          <Icon icon="mdi:plus" width={16} height={16} color="#7A9A7B" />
        </button>
      </div>

      {events.length === 0 ? (
        <p className="font-inter text-xs text-petpulse-text-secondary">{emptyText}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {events.map((ev) => {
            const statusInfo = STATUS_LABEL[ev.status]
            const dateLabel = new Date(ev.event_date).toLocaleDateString('es-VE', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
            return (
              <div
                key={ev.id_event}
                className="bg-petpulse-bg border border-petpulse-border rounded-xl flex items-center px-3 py-2.5 gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-petpulse-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon icon={icon} width={18} height={18} color="#7A9A7B" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-poppins font-bold text-xs text-petpulse-text truncate">{ev.title}</p>
                  <p className="font-inter text-[11px] text-petpulse-text-secondary">{dateLabel}</p>
                  {ev.next_due_date && (
                    <p className="font-inter text-[10px] text-petpulse-text-secondary">
                      Próxima dosis: {new Date(ev.next_due_date).toLocaleDateString('es-VE')}
                    </p>
                  )}
                </div>
                <span className={`text-[11px] font-inter font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusInfo.className}`}>
                  {statusInfo.text}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(ev.id_event)}
                  aria-label="Eliminar"
                  className="text-petpulse-text-secondary flex-shrink-0 hover:text-petpulse-accent transition-colors"
                >
                  <Icon icon="mdi:trash-can-outline" width={16} height={16} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PetProfileTablet() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()

  const [pet, setPet] = useState<import('../../api/types').Pet | null>(null)
  const [events, setEvents] = useState<HealthEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmId, setConfirmId] = useState<number | null>(null)

  useEffect(() => {
    if (!id || !token) return
    Promise.all([getPet(Number(id), token), getEvents(token)])
      .then(([petData, eventsData]) => {
        setPet(petData)
        setEvents(eventsData.filter((ev) => ev.id_pet === Number(id)))
      })
      .catch(() => setError('No se pudo cargar la información de la mascota'))
      .finally(() => setLoading(false))
  }, [id, token])

  const upcomingEvents = useMemo(
    () =>
      events
        .filter((ev) => ev.status === 'SCHEDULED')
        .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()),
    [events]
  )

  function eventsByType(type: EventType) {
    return events
      .filter((ev) => ev.event_type === type)
      .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
  }

  const vacunas = eventsByType('VACUNA')
  const desparasitaciones = eventsByType('DESPARACITACION')

  function goToAddEvent() {
    navigate(`/events/category?pet=${id}`)
  }

  async function confirmDelete() {
    if (!token || confirmId === null) return
    try {
      await deleteEvent(confirmId, token)
      setEvents((prev) => prev.filter((e) => e.id_event !== confirmId))
    } catch {
      // silencioso
    } finally {
      setConfirmId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-petpulse-bg flex items-center justify-center">
        <p className="font-inter text-petpulse-text-secondary">Cargando...</p>
      </div>
    )
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen w-full bg-petpulse-bg flex items-center justify-center px-8">
        <p className="font-inter text-petpulse-accent text-sm text-center">{error || 'Mascota no encontrada'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-petpulse-bg font-inter text-petpulse-text box-border pb-28 *:box-border">
      <div className="w-full max-w-[1100px] mx-auto px-6 pt-8 flex flex-col gap-5">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Volver"
              className="w-10 h-10 rounded-full border border-petpulse-border bg-petpulse-card text-petpulse-text flex items-center justify-center cursor-pointer transition-colors hover:bg-[#eaf0ea]"
            >
              <Icon icon="mdi:arrow-left" width={20} height={20} />
            </button>
            <img src={logo} alt="" className="w-[84px] h-auto shrink-0" />
            <div>
              <p className="font-poppins font-bold text-xl text-petpulse-primary m-0 tracking-[0.02em]">PETPULSE</p>
              <p className="text-[11px] text-petpulse-text-secondary m-0 leading-[1.3] max-w-[180px]">
                Salud y bienestar para tus mascotas.
              </p>
            </div>
          </div>

          <div className="flex-1 min-w-[220px] text-center">
            <h1 className="font-poppins font-bold text-xl text-petpulse-primary m-0 inline-flex items-center gap-1.5">
              Información de la mascota
              <Icon icon="mdi:paw" width={18} height={18} className="text-petpulse-primary" />
            </h1>
          </div>
        </header>

        {/* Card principal */}
        <div className="bg-petpulse-card border border-petpulse-border rounded-[20px] shadow-[0_20px_44px_-28px_rgba(47,62,50,0.18)] px-6 py-6 relative overflow-hidden">
          <img
            src={dogCatIllustration}
            alt=""
            className="hidden md:block absolute right-6 top-6 w-[110px] h-auto object-contain opacity-90"
          />

          <div className="flex items-center gap-5">
            <div className="w-[110px] h-[105px] rounded-full bg-petpulse-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
              {pet.pet_image_url ? (
                <img src={pet.pet_image_url} alt={pet.name_pet} className="w-full h-full object-cover" />
              ) : (
                <Icon icon="mdi:paw" width={44} height={44} color="white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-poppins font-bold text-xl text-petpulse-text m-0">{pet.name_pet}</p>
                <button
                  type="button"
                  onClick={() => navigate(`/pets/${pet.id_pet}/edit`)}
                  aria-label="Editar mascota"
                  className="text-petpulse-accent"
                >
                  <Icon icon="mynaui:pencil" width={18} height={18} />
                </button>
              </div>
              <p className="font-inter text-sm text-petpulse-text mt-0.5">{pet.breed || pet.species}</p>
              {pet.gender && (
                <p className="font-inter text-xs text-petpulse-text-secondary flex items-center gap-1 mt-0.5">
                  {GENDER_LABEL[pet.gender] ?? pet.gender}
                  <Icon icon="ri:men-line" width={14} height={14} />
                </p>
              )}
            </div>
          </div>

          {/* Peso / Edad / Color */}
          <div className="bg-petpulse-bg border border-petpulse-border rounded-xl flex mt-5 divide-x divide-petpulse-border max-w-[420px]">
            <div className="flex-1 flex flex-col items-center gap-1 py-3">
              <Icon icon="mdi:weight-kilogram" width={18} height={18} color="#7A9A7B" />
              <p className="font-inter text-xs text-petpulse-text">{pet.weight ? `${pet.weight} Kg` : '—'}</p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1 py-3">
              <Icon icon="mdi:calendar-month-outline" width={18} height={18} color="#7A9A7B" />
              <p className="font-inter text-xs text-petpulse-text">{calculateAge(pet.birth_date)}</p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1 py-3">
              <Icon icon="mdi:palette-outline" width={18} height={18} color="#7A9A7B" />
              <p className="font-inter text-xs text-petpulse-text">{pet.color || '—'}</p>
            </div>
          </div>
        </div>

        {/* Grid de tarjetas de eventos, dos columnas para aprovechar el ancho */}
        <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
          <EventCard
            title="Próximos recordatorios"
            icon="mdi:bell-outline"
            events={upcomingEvents}
            emptyText="No tiene recordatorios pendientes"
            onAdd={goToAddEvent}
            onDelete={setConfirmId}
          />

          <EventCard
            title="Desparasitación"
            icon="material-symbols:emergency"
            events={desparasitaciones}
            emptyText="Sin registros de desparasitación"
            onAdd={goToAddEvent}
            onDelete={setConfirmId}
          />

          <EventCard
            title="Vacunas"
            icon="game-icons:medicines"
            events={vacunas}
            emptyText="Sin vacunas registradas"
            onAdd={goToAddEvent}
            onDelete={setConfirmId}
          />

          {/* Enfermedades */}
          <div className="bg-petpulse-card border border-petpulse-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon icon="mdi:heart-outline" width={18} height={18} color="#6B8C6C" />
              <p className="font-poppins font-bold text-sm text-petpulse-primary-dark">Enfermedades</p>
            </div>
            {pet.diseases ? (
              <p className="font-inter text-xs text-petpulse-text">{pet.diseases}</p>
            ) : (
              <p className="font-inter text-xs text-petpulse-primary-dark">
                {pet.name_pet} está sana, no tiene enfermedades registradas 🐾
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Nav inferior, igual al resto de pantallas Tablet */}
      <nav className="fixed bottom-4 left-0 right-0 flex justify-center px-5 z-10" aria-label="Navegación principal">
        <div className="w-full max-w-[620px] bg-petpulse-card border border-petpulse-border rounded-[20px] shadow-[0_16px_32px_-18px_rgba(47,62,50,0.3)] flex items-center justify-around px-3 py-2">
          <Link to="/dashboard" className="flex flex-col items-center gap-[3px] no-undeline text-[11px] font-semibold px-4 py-2 rounded-[14px] text-petpulse-text-secondary transition-colors hover:bg-[#eaf0ea] hover:text-petpulse-primary-dark">
            <Icon icon="mdi:home-outline" width={22} height={22} />
            <span>Inicio</span>
          </Link>
          <Link to="/calendar" className="flex flex-col items-center gap-[3px] no-underline text-[11px] font-semibold px-4 py-2 rounded-[14px] text-petpulse-text-secondary transition-colors hover:bg-[#eaf0ea] hover:text-petpulse-primary-dark">
            <Icon icon="mdi:calendar-month-outline" width={22} height={22} />
            <span>Calendario</span>
          </Link>
          <Link to="/pet-ia" className="flex flex-col items-center gap-[3px] no-underline text-[11px] font-semibold px-4 py-2 rounded-[14px] text-petpulse-text-secondary transition-colors hover:bg-[#eaf0ea] hover:text-petpulse-primary-dark">
            <Icon icon="mdi:paw-outline" width={22} height={22} />
            <span>PetIA</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-[3px] no-underline text-[11px] font-semibold px-4 py-2 rounded-[14px] text-petpulse-text-secondary transition-colors hover:bg-[#eaf0ea] hover:text-petpulse-primary-dark">
            <Icon icon="mdi:account-outline" width={22} height={22} />
            <span>Perfil</span>
          </Link>
        </div>
      </nav>

      {/* Modal de confirmacion de eliminacion */}
      {confirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <div className="w-full max-w-[420px] bg-petpulse-bg rounded-[20px] px-6 pt-6 pb-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-petpulse-accent/15 flex items-center justify-center mb-4">
                <Icon icon="mdi:trash-can-outline" width={26} height={26} color="#E07A5F" />
              </div>
              <h3 className="font-poppins font-bold text-lg text-petpulse-text">¿Eliminar recordatorio?</h3>
              <p className="font-inter text-sm text-petpulse-text-secondary mt-1.5 px-4">
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setConfirmId(null)}
                className="flex-1 h-11 border border-petpulse-border rounded-xl font-poppins font-semibold text-sm text-petpulse-text hover:bg-[#eaf0ea] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 h-11 bg-petpulse-accent rounded-xl font-poppins font-semibold text-sm text-white hover:opacity-90 transition-opacity"
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

export default PetProfileTablet