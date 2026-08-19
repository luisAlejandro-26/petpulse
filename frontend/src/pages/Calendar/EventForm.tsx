import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuth } from '../../context/AuthContext'
import { createEvent } from '../../api/events'
import { getPets } from '../../api/pets'
import type { EventType, Pet } from '../../api/types'

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  VACUNA: 'Vacuna',
  CONTROL: 'Control médico',
  DESPARACITACION: 'Desparasitación',
  CIRUGIA: 'Cirugía',
  OTHER: 'Peluquería',
}

// Último paso del flujo de agregar recordatorio: confirma mascota + descripción + fecha (tipo y negocio ya vienen fijos por la URL)
function EventForm() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const eventType = (searchParams.get('eventType') as EventType) || 'OTHER'
  const businessName = searchParams.get('business') || ''
  const preselectedPetId = searchParams.get('pet') || '' // viene con valor cuando el flujo se abrió desde el botón "+" de PetProfile

  const [pets, setPets] = useState<Pet[]>([])
  const [id_pet, setIdPet] = useState(preselectedPetId)
  const [title, setTitle] = useState('')
  const [event_date, setEventDate] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loadingPets, setLoadingPets] = useState(true)

  // Carga las mascotas del usuario para el selector
  useEffect(() => {
    if (!token) return
    getPets(token)
      .then(setPets)
      .catch(() => setError('No se pudieron cargar tus mascotas'))
      .finally(() => setLoadingPets(false))
  }, [token])

  // Crea el evento con status SCHEDULED (pendiente por defecto) y regresa al Calendario
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
        token
      )
      navigate('/calendar', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el recordatorio')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="h-screen w-full bg-petpulse-bg flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[402px] h-screen overflow-hidden">
      <div className="h-full overflow-y-auto pb-10">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="w-9 h-9 flex items-center justify-center rounded-full active:bg-petpulse-primary/10 transition-colors -ml-2"
          >
            <Icon icon="mdi:chevron-left" width={24} height={24} color="#2F3E32" />
          </button>
        </div>

        <h1 className="font-encode-expanded font-bold text-xl text-petpulse-primary text-center mt-2">
          Confirmar recordatorio
        </h1>
        <p className="font-inter text-sm text-petpulse-text-secondary text-center mt-1">
          {EVENT_TYPE_LABELS[eventType]}{businessName ? ` · ${businessName}` : ''}
        </p>

        {error && (
          <p role="alert" className="text-petpulse-accent text-sm text-center mt-3 px-8">
            {error}
          </p>
        )}

        {/* Si el usuario no tiene mascotas, no se puede agendar nada: se le avisa en vez de mostrar el formulario */}
        {loadingPets ? (
          <p className="text-center text-petpulse-text-secondary text-sm font-inter mt-8">Cargando...</p>
        ) : pets.length === 0 ? (
          <p className="text-center text-petpulse-text-secondary text-sm font-inter mt-8 px-8">
            Primero necesitas registrar una mascota antes de agregar recordatorios.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 mt-6" noValidate>
            <label htmlFor="id_pet" className="font-encode-condensed font-semibold text-sm text-petpulse-text block mb-1">
              Mascota
            </label>
            <div className="relative mb-4">
              <select
                id="id_pet"
                value={id_pet}
                onChange={(e) => setIdPet(e.target.value)}
                required
                className="w-full h-[42px] bg-white border border-petpulse-border rounded-lg pl-3 pr-9 text-sm text-petpulse-text focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow appearance-none"
              >
                <option value="" disabled>Seleccionar mascota</option>
                {pets.map((pet) => (
                  <option key={pet.id_pet} value={pet.id_pet}>{pet.name_pet}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icon icon="mdi:chevron-down" width={16} height={16} color="#7A9A7B" />
              </span>
            </div>

            <label htmlFor="title" className="font-encode-condensed font-semibold text-sm text-petpulse-text block mb-1">
              Descripción
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ej: Antirrábica anual"
              className="w-full h-[42px] bg-white border border-petpulse-border rounded-lg px-3 text-sm text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow mb-4"
            />

            <label htmlFor="event_date" className="font-encode-condensed font-semibold text-sm text-petpulse-text block mb-1">
              Fecha
            </label>
            <div className="relative mb-6">
              <input
                id="event_date"
                type="date"
                value={event_date}
                onChange={(e) => setEventDate(e.target.value)}
                required
                className="w-full h-[42px] bg-white border border-petpulse-border rounded-lg pl-3 pr-9 text-sm text-petpulse-text focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-9 [&::-webkit-calendar-picker-indicator]:h-full"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icon icon="mdi:calendar-month-outline" width={18} height={18} color="#7A9A7B" />
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-petpulse-primary hover:bg-petpulse-primary-dark active:scale-[0.98] text-white font-encode-semi font-bold text-base rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Guardando...' : 'Guardar recordatorio'}
            </button>
          </form>
        )}
      </div>
      </div>
    </div>
  )
}

export default EventForm