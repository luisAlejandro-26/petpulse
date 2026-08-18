import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuth } from '../../context/AuthContext'
import { createEvent } from '../../api/events'
import { getPets } from '../../api/pets'
import type { EventType, Pet } from '../../api/types'
import logo from '../../assets/logo.png'
import dogCatIllustration from '../../assets/dog-cat-illustration.png'

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  VACUNA: 'Vacuna',
  CONTROL: 'Control médico',
  DESPARACITACION: 'Desparasitación',
  CIRUGIA: 'Cirugía',
  OTHER: 'Peluquería',
}

// Mismo layout visual del Figma (2 arriba, 1 completo, 2 abajo),
// usando las etiquetas reales que acepta la base de datos.
const TYPE_LAYOUT: EventType[][] = [
  ['VACUNA', 'DESPARACITACION'],
  ['CONTROL'],
  ['CIRUGIA', 'OTHER'],
]

function EventFormTablet() {
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
    'w-full box-border font-inter text-sm py-2.5 px-4 rounded-full border border-petpulse-border bg-petpulse-bg text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none focus:border-petpulse-primary focus:ring-[3px] focus:ring-[rgba(122,154,123,0.18)]'

  return (
    <div className="min-h-screen bg-petpulse-bg font-inter text-petpulse-text box-border pb-16">
      <div className="w-full max-w-[680px] mx-auto px-5 pt-8 flex flex-col gap-5">
        <header className="flex items-start justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="text-petpulse-text bg-transparent border-0 cursor-pointer flex items-center justify-center p-1 hover:text-petpulse-primary"
          >
            <Icon icon="mdi:arrow-left" width={24} height={24} />
          </button>

          <div className="flex-1 text-center">
            <h1 className="font-poppins font-bold text-xl text-petpulse-primary m-0 flex items-center justify-center gap-1.5">
              Agregar recordatorio <Icon icon="mdi:paw" width={18} height={18} className="text-petpulse-primary" />
            </h1>
            {businessName && <p className="text-[13px] text-petpulse-text-secondary mt-0.5 mb-0">{businessName}</p>}
          </div>

          <button
            type="button"
            className="w-10 h-10 rounded-full border border-petpulse-border bg-petpulse-card text-petpulse-text flex items-center justify-center cursor-pointer shrink-0 transition-colors hover:bg-[#eaf0ea] hover:border-petpulse-primary"
            aria-label="Notificaciones"
          >
            <Icon icon="mdi:bell-outline" width={22} height={22} />
          </button>
        </header>

        <div className="flex items-center gap-2 -mt-3">
          <img src={logo} alt="" className="w-[84px] h-auto shrink-0" />
          <div>
            <p className="font-poppins font-bold text-xl text-petpulse-primary m-0 tracking-[0.02em]">PETPULSE</p>
            <p className="text-[11px] text-petpulse-text-secondary m-0 leading-[1.3] max-w-[160px]">
              Salud y bienestar para tus mascotas.
            </p>
          </div>
          <img src={dogCatIllustration} alt="" className="h-16 w-auto ml-auto shrink-0 object-contain hidden sm:block" />
        </div>

        <div className="bg-petpulse-card border border-petpulse-border rounded-[20px] shadow-[0_20px_44px_-28px_rgba(47,62,50,0.18)] p-6">
          {error && (
            <p
              role="alert"
              className="text-[13px] px-4 py-3 rounded-[14px] mb-5 text-center bg-[#fbe9e5] text-petpulse-accent border border-[#f2cec3]"
            >
              {error}
            </p>
          )}

          {loadingPets ? (
            <p className="text-center text-petpulse-text-secondary text-sm">Cargando...</p>
          ) : pets.length === 0 ? (
            <p className="text-center text-petpulse-text-secondary text-sm">
              Primero necesitas registrar una mascota antes de agregar recordatorios.
            </p>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
                    <option value="" disabled>
                      Seleccionar mascota
                    </option>
                    {pets.map((pet) => (
                      <option key={pet.id_pet} value={pet.id_pet}>
                        {pet.name_pet}
                      </option>
                    ))}
                  </select>
                  <Icon
                    icon="mdi:chevron-down"
                    width={16}
                    height={16}
                    className="absolute right-4 text-petpulse-primary pointer-events-none"
                  />
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
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Ej: Antirrábica anual"
                  className={inputClass}
                />
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
                    className={`${inputClass} pr-9`}
                  />
                  <Icon
                    icon="mdi:calendar-month-outline"
                    width={18}
                    height={18}
                    className="absolute right-4 text-petpulse-primary pointer-events-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-petpulse-primary text-white font-inter font-bold text-sm rounded-full py-3.5 border-0 cursor-pointer transition-colors mt-2 enabled:hover:bg-petpulse-primary-dark enabled:active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Guardando...' : 'Guardar Recordatorio'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventFormTablet