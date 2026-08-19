import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import SideMenu from '../../components/SideMenu'
import BottomNav from '../../components/BottomNav'
import { useAuth } from '../../context/AuthContext'
import { getPet } from '../../api/pets'
import { getEvents, deleteEvent } from '../../api/events'
import type { Pet, HealthEvent, EventType } from '../../api/types'

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

// Tarjeta reutilizable para cada categoría de eventos (Próximos recordatorios, Vacunas, Desparasitación): lista los eventos o muestra emptyText
function EventCard({ title, icon, events, emptyText, onAdd, onDelete }: EventCardProps) {
  return (
    <div className="bg-white border border-petpulse-border rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-inter font-bold text-sm text-petpulse-primary-dark">{title}</p>
        <button type="button" onClick={onAdd} aria-label={`Agregar ${title}`}>
          <Icon icon="mdi:plus" width={20} height={20} color="#7A9A7B" />
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
                className="bg-petpulse-bg border border-petpulse-border rounded-lg flex items-center px-3 py-2.5 gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-petpulse-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon icon={icon} width={18} height={18} color="#7A9A7B" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-encode-semi font-bold text-xs text-petpulse-text truncate">{ev.title}</p>
                  <p className="font-inter text-[10px] text-petpulse-text-secondary">{dateLabel}</p>
                  {ev.next_due_date && (
                    <p className="font-inter text-[8px] text-petpulse-text-secondary">
                      Próxima dosis: {new Date(ev.next_due_date).toLocaleDateString('es-VE')}
                    </p>
                  )}
                </div>
                <span className={`text-[10px] font-inter font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusInfo.className}`}>
                  {statusInfo.text}
                </span>
                <button type="button" onClick={() => onDelete(ev.id_event)} aria-label="Eliminar" className="text-petpulse-text-secondary flex-shrink-0">
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

// Pantalla de ficha de una mascota: datos básicos + eventos de salud filtrados por tipo (recordatorios, vacunas, desparasitación) + enfermedades
function PetProfileMobile() {
  const { id } = useParams() // id de la mascota, viene de la ruta /pets/:id
  const { token } = useAuth()
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const [pet, setPet] = useState<Pet | null>(null)
  const [events, setEvents] = useState<HealthEvent[]>([]) // ya filtrados: solo los de esta mascota
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmId, setConfirmId] = useState<number | null>(null) // id del evento pendiente de confirmar eliminación (null = modal cerrado)

  // Carga la mascota y TODOS los eventos del usuario en paralelo, luego filtra solo los de esta mascota
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

  // Eventos pendientes (status SCHEDULED) de esta mascota, ordenados por fecha más próxima
  const upcomingEvents = useMemo(
    () =>
      events
        .filter((ev) => ev.status === 'SCHEDULED')
        .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()),
    [events]
  )

  // Filtra los eventos de esta mascota por tipo (VACUNA, DESPARACITACION, etc.) - reutilizado para las tarjetas de Vacunas/Desparasitación
  function eventsByType(type: EventType) {
    return events
      .filter((ev) => ev.event_type === type)
      .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
  }

  const vacunas = eventsByType('VACUNA')
  const desparasitaciones = eventsByType('DESPARACITACION')
  // "Enfermedades" NO viene de eventos: es el campo de texto libre pet.diseases

  // Lleva al flujo de agregar recordatorio con esta mascota ya preseleccionada (botón "+" de cada sección)
  function goToAddEvent() {
    navigate(`/events/category?pet=${id}`)
  }

  // Elimina el evento confirmado en el modal
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
      <div className="h-screen w-full bg-petpulse-bg flex items-center justify-center">
        <p className="font-inter text-petpulse-text-secondary">Cargando...</p>
      </div>
    )
  }

  if (error || !pet) {
    return (
      <div className="h-screen w-full bg-petpulse-bg flex items-center justify-center px-8">
        <p className="font-inter text-petpulse-accent text-sm text-center">{error || 'Mascota no encontrada'}</p>
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-petpulse-bg flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[402px] h-screen flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <button type="button" aria-label="Abrir menú" onClick={() => setMenuOpen(true)}>
            <Icon icon="akar-icons:three-line-horizontal" width={22} height={22} color="#2F3E32" />
          </button>
          <h1 className="font-inter font-bold text-base text-petpulse-primary text-center">
            Información de la mascota
          </h1>
          <div className="w-[22px]" />
        </div>

        <div className="flex-1 overflow-y-auto pb-24 px-5">
          {/* ── Card principal: foto, nombre, raza, género + Peso/Edad/Color adentro ── */}
          <div className="bg-white border border-petpulse-border rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-[100px] h-[95px] rounded-full bg-petpulse-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
                {pet.pet_image_url ? (
                  <img src={pet.pet_image_url} alt={pet.name_pet} className="w-full h-full object-cover" />
                ) : (
                  <Icon icon="mdi:paw" width={40} height={40} color="white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-inter font-bold text-base text-petpulse-text">{pet.name_pet}</p>
                  <button
                    type="button"
                    onClick={() => navigate(`/pets/${pet.id_pet}/edit`)}
                    aria-label="Editar mascota"
                    className="text-petpulse-accent"
                  >
                    <Icon icon="mynaui:pencil" width={16} height={16} />
                  </button>
                </div>
                <p className="font-inter text-sm text-petpulse-text">{pet.breed || pet.species}</p>
                {pet.gender && (
                  <p className="font-inter text-xs text-petpulse-text-secondary flex items-center gap-1 mt-0.5">
                    {GENDER_LABEL[pet.gender] ?? pet.gender}
                    <Icon icon="ri:men-line" width={14} height={14} />
                  </p>
                )}
              </div>
            </div>

            {/* Peso / Edad / Color */}
            <div className="bg-petpulse-bg border border-petpulse-border rounded-xl flex mt-4 divide-x divide-petpulse-border">
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

          {/* ── Próximos recordatorios: eventos SCHEDULED de esta mascota ── */}
          <div className="mt-5">
            <EventCard
              title="Próximos recordatorios"
              icon="mdi:bell-outline"
              events={upcomingEvents}
              emptyText="No tiene recordatorios pendientes"
              onAdd={goToAddEvent}
              onDelete={setConfirmId}
            />
          </div>

          {/* ── Desparasitación: eventos filtrados por event_type DESPARACITACION ── */}
          <EventCard
            title="Desparasitación"
            icon="material-symbols:emergency"
            events={desparasitaciones}
            emptyText="Sin registros de desparasitación"
            onAdd={goToAddEvent}
            onDelete={setConfirmId}
          />

          {/* ── Vacunas: eventos filtrados por event_type VACUNA ── */}
          <EventCard
            title="Vacunas"
            icon="game-icons:medicines"
            events={vacunas}
            emptyText="Sin vacunas registradas"
            onAdd={goToAddEvent}
            onDelete={setConfirmId}
          />

          {/* ── Enfermedades: texto libre de pet.diseases, mensaje amigable si está vacío ── */}
          <div className="bg-white border border-petpulse-border rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon icon="mdi:heart-outline" width={18} height={18} color="#6B8C6C" />
              <p className="font-inter font-bold text-sm text-petpulse-primary-dark">Enfermedades</p>
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

        <BottomNav />
        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

        {/* ── Modal de confirmación de eliminación (de eventos, no de la mascota) ── */}
        {confirmId !== null && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmId(null)} />
            <div className="relative w-full max-w-[402px] bg-white rounded-t-3xl px-6 pt-6 pb-8">
              <div className="w-10 h-1 bg-petpulse-border rounded-full mx-auto mb-5" />
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-petpulse-accent/15 flex items-center justify-center mb-4">
                  <Icon icon="mdi:trash-can-outline" width={26} height={26} color="#E07A5F" />
                </div>
                <h3 className="font-encode-expanded font-bold text-lg text-petpulse-text">
                  ¿Eliminar recordatorio?
                </h3>
                <p className="font-inter text-sm text-petpulse-text-secondary mt-1.5 px-4">
                  Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setConfirmId(null)}
                  className="flex-1 h-11 border border-petpulse-border rounded-xl font-encode-semi font-semibold text-sm text-petpulse-text"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 h-11 bg-petpulse-accent rounded-xl font-encode-semi font-semibold text-sm text-white"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PetProfileMobile
