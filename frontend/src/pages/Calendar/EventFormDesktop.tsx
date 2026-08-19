import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuth } from '../../context/AuthContext'
import { createEvent } from '../../api/events'
import { getPets } from '../../api/pets'
import type { EventType, Pet } from '../../api/types'
import Sidebar from '../../components/dashboard/Sidebar'


const EVENT_TYPE_LABELS: Record<EventType, string> = {
  VACUNA: 'Vacuna',
  CONTROL: 'Control médico',
  DESPARACITACION: 'Desparasitación',
  CIRUGIA: 'Cirugía',
  OTHER: 'Peluquería',
}

const TYPE_LAYOUT: EventType[][] = [
  ['VACUNA', 'DESPARACITACION'],
  ['CONTROL'],
  ['CIRUGIA', 'OTHER'],
]

function EventFormDesktop() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const businessName = searchParams.get('business') || ''
  const initialType = (searchParams.get('eventType') as EventType) || 'OTHER'

  const [eventType] = useState<EventType>(initialType)
  const [pets, setPets] = useState<Pet[]>([])
  const [id_pet, setIdPet] = useState('')
  const [title, setTitle] = useState('')
  const [event_date, setEventDate] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loadingPets, setLoadingPets] = useState(true)

  useEffect(() => {
    if (!token) return
    getPets(token)
      .then(setPets)
      .catch(() => setError('No se pudieron cargar tus mascotas'))
      .finally(() => setLoadingPets(false))
  }, [token])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!id_pet || !title || !event_date) {
      setError('Todos los campos son obligatorios')
      return
    }

    if (!token) return

    setSubmitting(true)
    try {
      await createEvent(
        {
          id_pet: Number(id_pet),
          event_type: eventType,
          title,
          event_date,
          event_place: businessName || 'Sin especificar',
          status: 'SCHEDULED',
        },
        token,
      )
      navigate('/calendar', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el recordatorio')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full box-border text-sm py-2.5 px-4 rounded-full border border-petpulse-border bg-petpulse-bg text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none focus:border-petpulse-primary focus:ring-[3px] focus:ring-[rgba(122,154,123,0.18)]'

  return (
    <div className="min-h-screen w-full bg-petpulse-bg flex">
      {/* sidebar */}
      <Sidebar />

      {/* ── Centro: Formulario ── */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto px-8 py-8 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="w-10 h-10 rounded-full border border-petpulse-border bg-white flex items-center justify-center text-petpulse-text hover:text-petpulse-primary hover:border-petpulse-primary transition-colors"
          >
            <Icon icon="mdi:arrow-left" width={22} height={22} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-petpulse-text flex items-center gap-2">
              Agregar recordatorio
              <Icon icon="mdi:paw" width={20} height={20} className="text-petpulse-primary" />
            </h1>
            {businessName && <p className="text-sm text-petpulse-text-secondary mt-0.5">{businessName}</p>}
          </div>
        </div>

        {/* Card del formulario */}
        <div className="bg-white border border-petpulse-border rounded-2xl p-6">
          {error && (
            <p role="alert" className="text-sm px-4 py-3 rounded-xl mb-5 text-center bg-[#fbe9e5] text-petpulse-accent border border-[#f2cec3]">
              {error}
            </p>
          )}

          {loadingPets ? (
            <p className="text-center text-petpulse-text-secondary text-sm py-10">Cargando...</p>
          ) : pets.length === 0 ? (
            <p className="text-center text-petpulse-text-secondary text-sm py-10">
              Primero necesitas registrar una mascota antes de agregar recordatorios.
            </p>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {/* campos: mascota, tipo, titulo, fecha */}
              <div>
                <label htmlFor="id_pet" className="block text-[13px] font-semibold text-petpulse-text mb-1.5">
                  Mascota
                </label>
                <div className="relative flex items-center">
                  <select
                    id="id_pet"
                    value={id_pet}
                    onChange={(e) => setIdPet(e.target.value)}
                    required
                    className={`${inputClass} cursor-pointer appearance-none pr-9`}
                  >
                    <option value="" disabled>Seleccionar mascota</option>
                    {pets.map((pet) => (
                      <option key={pet.id_pet} value={pet.id_pet}>{pet.name_pet}</option>
                    ))}
                  </select>
                  <Icon icon="mdi:chevron-down" width={16} height={16} className="absolute right-4 text-petpulse-primary pointer-events-none" />
                </div>
              </div>

              <div>
                <p className="block text-[13px] font-semibold text-petpulse-text mb-1.5">Tipo</p>
                <div className="flex flex-col gap-2.5">
                  {TYPE_LAYOUT.map((row, i) => (
                    <div key={i} className="flex gap-2.5">
                      {row.map((type) => {
                        const active = type === eventType
                        return (
                          <div
                            key={type}
                            aria-current={active ? 'true' : undefined}
                            className={`flex-1 py-3.5 px-5 rounded-xl font-semibold text-sm text-center border ${
                              active
                                ? 'bg-petpulse-primary text-white border-petpulse-primary shadow-[inset_0_2px_4px_rgba(0,0,0,0.18)]'
                                : 'bg-[#eaf0ea] text-petpulse-primary-dark/40 border-petpulse-primary/10'
                            }`}
                          >
                            {EVENT_TYPE_LABELS[type]}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="title" className="block text-[13px] font-semibold text-petpulse-text mb-1.5">
                  Descripción
                </label>
                <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ej: Antirrábica anual" className={inputClass} />
              </div>

              <div>
                <label htmlFor="event_date" className="block text-[13px] font-semibold text-petpulse-text mb-1.5">
                  Fecha
                </label>
                <div className="relative flex items-center">
                  <input
                    id="event_date"
                    type="date"
                    value={event_date}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                    className={`${inputClass} pr-9 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-9 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                  />
                  <Icon icon="mdi:calendar-month-outline" width={18} height={18} className="absolute right-4 text-petpulse-primary pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-petpulse-primary text-white font-bold text-sm rounded-full py-3.5 border-0 cursor-pointer transition-colors mt-2 enabled:hover:bg-petpulse-primary-dark enabled:active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Guardando...' : 'Guardar Recordatorio'}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* ── Panel derecho (Consejos) ── */}
      <aside className="w-[320px] shrink-0 bg-white border-l border-petpulse-border h-screen sticky top-0 flex flex-col overflow-y-auto">


        <div className="flex justify-center px-6 py-6">
          <img src="/assets/imagen-centro-ia.svg" alt="Mascotas" className="w-48 h-auto object-contain" />
        </div>

        <div className="mx-6 bg-[#EAF0EB] rounded-3xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#6B8C6C] flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:lightbulb-outline" width={20} height={20} className="text-[#6B8C6C]" />
            </div>
            <p className="font-bold text-[#6B8C6C] text-base">Consejos rápidos</p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full border border-[#6B8C6C] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon icon="mdi:calendar-clock-outline" width={16} height={16} className="text-[#6B8C6C]" />
            </div>
            <p className="text-sm font-medium text-petpulse-text leading-snug">Programa recordatorios con anticipación.</p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full border border-[#6B8C6C] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon icon="mdi:paw" width={16} height={16} className="text-[#6B8C6C]" />
            </div>
            <p className="text-sm font-medium text-petpulse-text leading-snug">Selecciona bien el tipo de evento para un mejor seguimiento.</p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full border border-[#6B8C6C] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon icon="mdi:heart-outline" width={16} height={16} className="text-[#6B8C6C]" />
            </div>
            <p className="text-sm font-medium text-petpulse-text leading-snug">Mantén al día las vacunas y controles de tu mascota.</p>
          </div>

          <img src="/assets/banner-agg-pet.svg" alt="" className="w-full h-auto object-cover rounded-2xl mt-2" />
        </div>
      </aside>

    </div>
  )
}

export default EventFormDesktop
