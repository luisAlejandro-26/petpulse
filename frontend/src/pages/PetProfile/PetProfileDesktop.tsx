import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuth } from '../../context/AuthContext'
import { getPet, updatePet } from '../../api/pets'
import { getEvents, deleteEvent } from '../../api/events'
import type { Pet, HealthEvent, EventType } from '../../api/types'
import Sidebar from '../../components/dashboard/Sidebar'
import { calculateAge, STATUS_LABEL, EVENT_ICONS } from '../../components/dashboard/dashboardUtils'


const GENDER_LABEL: Record<string, string> = {
  MACHO: 'Macho',
  HEMBRA: 'Hembra',
}

const GENDER_ICON: Record<string, string> = {
  MACHO: 'mdi:gender-male',
  HEMBRA: 'mdi:gender-female',
}

const EVENT_TYPE_META: Record<EventType, { label: string; empty: string }> = {
  VACUNA: { label: 'Vacunas', empty: 'Sin vacunas registradas' },
  CONTROL: { label: 'Control médico', empty: 'Sin controles médicos registrados' },
  DESPARACITACION: { label: 'Desparasitación', empty: 'Sin registros de desparasitación' },
  CIRUGIA: { label: 'Cirugía', empty: 'Sin cirugías registradas' },
  OTHER: { label: 'Peluquería', empty: 'Sin registros de peluquería' },
}

const EVENT_TYPE_ORDER: EventType[] = ['VACUNA', 'CONTROL', 'DESPARACITACION', 'CIRUGIA', 'OTHER']

function DonutChart({ percentage }: { percentage: number }) {
  const radius = 62
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  let color = '#6B8C6C'
  if (percentage <= 40) color = '#E07A5F'
  else if (percentage < 100) {
    const t = (percentage - 40) / 60
    const r = Math.round(224 + (107 - 224) * t)
    const g = Math.round(122 + (140 - 122) * t)
    const b = Math.round(95 + (108 - 95) * t)
    color = `rgb(${r},${g},${b})`
  }

  return (
    <div className="relative w-[160px] h-[160px] mx-auto">
      <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#e8e5e0" strokeWidth="20" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black" style={{ color }}>{percentage}%</span>
      </div>
    </div>
  )
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
    <div className="bg-white border border-petpulse-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[15px] text-[#6B8C6C]">{title}</h3>
        <button
          type="button"
          onClick={onAdd}
          aria-label={`Agregar ${title}`}
          className="w-9 h-9 rounded-full bg-petpulse-primary/10 flex items-center justify-center text-petpulse-primary hover:bg-petpulse-primary/20 transition-colors"
        >
          <Icon icon="mdi:plus" width={20} height={20} />
        </button>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-petpulse-text-secondary">{emptyText}</p>
      ) : (
        <div className="flex flex-col gap-2.5">
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
                className="bg-petpulse-bg border border-petpulse-border rounded-xl flex items-center px-4 py-3 gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-petpulse-primary/15 flex items-center justify-center shrink-0">
                  <Icon icon={icon} width={20} height={20} className="text-petpulse-primary-dark" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-petpulse-text truncate">{ev.title}</p>
                  <p className="text-xs text-petpulse-text-secondary">{dateLabel}</p>
                  {ev.next_due_date && (
                    <p className="text-[11px] text-petpulse-text-secondary">
                      Próxima dosis: {new Date(ev.next_due_date).toLocaleDateString('es-VE')}
                    </p>
                  )}
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusInfo.className}`}>
                  {statusInfo.text}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(ev.id_event)}
                  aria-label="Eliminar"
                  className="text-petpulse-text-secondary hover:text-petpulse-accent transition-colors shrink-0"
                >
                  <Icon icon="mdi:trash-can-outline" width={18} height={18} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PetProfileDesktop() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()

  const [pet, setPet] = useState<Pet | null>(null)
  const [events, setEvents] = useState<HealthEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [diseasesText, setDiseasesText] = useState('')
  const [savingDiseases, setSavingDiseases] = useState(false)
  const [diseasesSaved, setDiseasesSaved] = useState(false)

  useEffect(() => {
    if (!id || !token) return
    Promise.all([getPet(Number(id), token), getEvents(token)])
      .then(([petData, eventsData]) => {
        setPet(petData)
        setDiseasesText(petData.diseases || '')
        setEvents(eventsData.filter((ev) => ev.id_pet === Number(id)))
      })
      .catch(() => setError('No se pudo cargar la información de la mascota'))
      .finally(() => setLoading(false))
  }, [id, token])

  function eventsByType(type: EventType) {
    return events
      .filter((ev) => ev.event_type === type)
      .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
  }

  const completionPercentage = useMemo(() => {
    if (events.length === 0) return 100
    const completed = events.filter((ev) => ev.status === 'COMPLETED').length
    return Math.round((completed / events.length) * 100)
  }, [events])

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

  async function handleSaveDiseases() {
    if (!token || !id) return
    setSavingDiseases(true)
    try {
      await updatePet(Number(id), { diseases: diseasesText }, token)
      setPet((prev) => (prev ? { ...prev, diseases: diseasesText } : prev))
      setDiseasesSaved(true)
      setTimeout(() => setDiseasesSaved(false), 2000)
    } catch {
      // silencioso
    } finally {
      setSavingDiseases(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-petpulse-bg flex items-center justify-center">
        <p className="text-petpulse-text-secondary">Cargando...</p>
      </div>
    )
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen w-full bg-petpulse-bg flex items-center justify-center px-8">
        <p className="text-petpulse-accent text-sm text-center">{error || 'Mascota no encontrada'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-petpulse-bg flex">
      {/* sidebar */}
      <Sidebar />

      {/* layout principal */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto px-8 py-8 flex flex-col gap-5">
        {/* header mascota: foto + nombre */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            aria-label="Volver al inicio"
            className="w-10 h-10 rounded-full border border-petpulse-border bg-white flex items-center justify-center text-petpulse-text hover:text-petpulse-primary hover:border-petpulse-primary transition-colors"
          >
            <Icon icon="mdi:arrow-left" width={22} height={22} />
          </button>
          <h1 className="text-2xl font-bold text-petpulse-text">Información de la Mascota</h1>
        </div>

        {/* Cabecera de mascota */}
        <div className="bg-white border border-petpulse-border rounded-2xl p-6">
          <div className="flex items-center gap-5">
            <div className="w-[110px] h-[110px] rounded-full bg-petpulse-primary flex items-center justify-center shrink-0 overflow-hidden border-4 border-white shadow-md">
              {pet.pet_image_url ? (
                <img src={pet.pet_image_url} alt={pet.name_pet} className="w-full h-full object-cover" />
              ) : (
                <Icon icon="mdi:paw" width={44} height={44} color="white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-petpulse-text">{pet.name_pet}</h2>
                <button
                  type="button"
                  onClick={() => navigate(`/pets/${pet.id_pet}/edit`)}
                  aria-label="Editar mascota"
                  className="text-petpulse-accent hover:text-[#c96a52] transition-colors"
                >
                  <Icon icon="mynaui:pencil" width={18} height={18} />
                </button>
              </div>
              <p className="text-[15px] text-petpulse-text-secondary mt-0.5">{pet.breed || pet.species}</p>
              {pet.gender && (
                <p className="text-sm text-petpulse-text-secondary flex items-center gap-1.5 mt-1">
                  <Icon icon={GENDER_ICON[pet.gender] ?? 'mdi:gender-male-female'} width={16} height={16} className="text-petpulse-primary" />
                  {GENDER_LABEL[pet.gender] ?? pet.gender}
                </p>
              )}
            </div>
          </div>

        {/* barra atributos: peso, edad, color */}
        <div className="bg-petpulse-bg border border-petpulse-border rounded-xl flex mt-5 divide-x divide-petpulse-border">
            <div className="flex-1 flex flex-col items-center gap-1.5 py-4">
              <Icon icon="mdi:weight-kilogram" width={20} height={20} className="text-petpulse-primary" />
              <p className="text-sm font-semibold text-petpulse-text">{pet.weight ? `${pet.weight} Kg` : '—'}</p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1.5 py-4">
              <Icon icon="mdi:calendar-month-outline" width={20} height={20} className="text-petpulse-primary" />
              <p className="text-sm font-semibold text-petpulse-text">{calculateAge(pet.birth_date)}</p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1.5 py-4">
              <Icon icon="mdi:palette-outline" width={20} height={20} className="text-petpulse-primary" />
              <p className="text-sm font-semibold text-petpulse-text">{pet.color || '—'}</p>
            </div>
          </div>
        </div>

        {/* tarjetas eventos agrupados */}
        {EVENT_TYPE_ORDER.map((type) => {
          const meta = EVENT_TYPE_META[type]
          return (
            <EventCard
              key={type}
              title={meta.label}
              icon={EVENT_ICONS[type]}
              events={eventsByType(type)}
              emptyText={meta.empty}
              onAdd={goToAddEvent}
              onDelete={setConfirmId}
            />
          )
        })}

        {/* enfermedades card */}
        <div className="bg-white border border-petpulse-border rounded-2xl p-5">
          <h3 className="font-bold text-[15px] text-[#6B8C6C] mb-4">Enfermedades</h3>
          {pet.diseases ? (
            <div className="bg-petpulse-bg border border-petpulse-border rounded-xl flex items-center px-4 py-3 gap-3">
              <div className="w-10 h-10 rounded-full bg-petpulse-primary/15 flex items-center justify-center shrink-0">
                <Icon icon="mdi:heart-outline" width={20} height={20} className="text-petpulse-primary-dark" />
              </div>
              <p className="text-sm text-petpulse-text leading-relaxed">{pet.diseases}</p>
            </div>
          ) : (
            <p className="text-sm text-petpulse-text-secondary">
              {pet.name_pet} no tiene enfermedades registradas.
            </p>
          )}
        </div>
      </main>

      {/* right panel */}
      <aside className="w-[320px] shrink-0 bg-white border-l border-petpulse-border h-screen sticky top-0 flex flex-col overflow-y-auto">


        {/* donut chart salud */}
        <div className="px-6 py-6 flex flex-col items-center gap-4">
          <DonutChart percentage={completionPercentage} />
          <p className="text-sm font-semibold text-petpulse-text text-center">Recordatorios completados</p>
        </div>

      {/* scrollbar recordatorios */}
        <div className="mx-6 flex flex-col gap-4">
          <h3 className="font-bold text-[#6B8C6C] text-base text-center">Descripción Padecimiento</h3>

        {/* textarea enfermedades editable */}
        <div className="bg-white rounded-2xl border border-petpulse-border p-4 flex flex-col gap-3">
            <textarea
              value={diseasesText}
              onChange={(e) => setDiseasesText(e.target.value)}
              placeholder={`Describe los padecimientos de ${pet.name_pet} conforme vayan apareciendo...`}
              rows={5}
              className="w-full bg-[#EAF0EB] rounded-xl p-4 text-sm text-petpulse-text placeholder:text-petpulse-text-secondary resize-none focus:outline-none focus:ring-2 focus:ring-petpulse-primary/30 focus:border-petpulse-primary border border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => void handleSaveDiseases()}
              disabled={savingDiseases || diseasesText === (pet.diseases || '')}
              className="w-full py-2.5 rounded-full bg-petpulse-primary text-white text-sm font-semibold transition-colors enabled:hover:bg-petpulse-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingDiseases ? 'Guardando...' : diseasesSaved ? 'Guardado ✓' : 'Guardar padecimiento'}
            </button>
          </div>

        {/* banner consejo */}
        <img src="/assets/banner-agg-pet.svg" alt="" className="w-full h-auto object-cover rounded-2xl" />
        </div>
      </aside>

      {/* modal confirmar eliminar */}
      {confirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmId(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl px-6 pt-6 pb-8 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-petpulse-accent/15 flex items-center justify-center mb-4">
                <Icon icon="mdi:trash-can-outline" width={26} height={26} className="text-petpulse-accent" />
              </div>
              <h3 className="font-bold text-lg text-petpulse-text">¿Eliminar recordatorio?</h3>
              <p className="text-sm text-petpulse-text-secondary mt-1.5 px-4">Esta acción no se puede deshacer.</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setConfirmId(null)}
                className="flex-1 h-11 border border-petpulse-border rounded-xl font-semibold text-sm text-petpulse-text hover:bg-petpulse-bg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 h-11 bg-petpulse-accent rounded-xl font-semibold text-sm text-white hover:bg-[#c96a52] transition-colors"
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

export default PetProfileDesktop
