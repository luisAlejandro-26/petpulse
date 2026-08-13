import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createPet, getPet, updatePet } from '../../api/pets'
import type { PetSpecies } from '../../api/types'
import iconPaw from '../../assets/icon-paw.png'

const SPECIES_OPTIONS: { value: PetSpecies; label: string }[] = [
  { value: 'PERRO', label: 'Perro' },
  { value: 'GATO', label: 'Gato' },
  { value: 'CONEJO', label: 'Conejo' },
  { value: 'PAJARO', label: 'Pájaro' },
  { value: 'OTHER', label: 'Otro' },
]

function PetForm() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [name_pet, setNamePet] = useState('')
  const [species, setSpecies] = useState<PetSpecies | ''>('')
  const [breed, setBreed] = useState('')
  const [birth_date, setBirthDate] = useState('')
  const [diseases, setDiseases] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(isEditing)

  useEffect(() => {
    if (!isEditing || !id || !token) return

    getPet(Number(id), token)
      .then((pet) => {
        setNamePet(pet.name_pet)
        setSpecies(pet.species)
        setBreed(pet.breed ?? '')
        setBirthDate(pet.birth_date.split('T')[0])
        setDiseases(pet.diseases ?? '')
      })
      .catch(() => setError('No se pudo cargar la mascota'))
      .finally(() => setLoading(false))
  }, [id, isEditing, token])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!name_pet || !species || !birth_date) {
      setError('Nombre, especie y fecha de nacimiento son obligatorios')
      return
    }

    if (!token) return

    setSubmitting(true)
    try {
      if (isEditing && id) {
        await updatePet(Number(id), { name_pet, species, breed, birth_date, diseases }, token)
      } else {
        await createPet({ name_pet, species, breed, birth_date, diseases }, token)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la mascota')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-petpulse-bg flex items-center justify-center">
        <p className="font-inter text-petpulse-text-secondary">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-petpulse-bg flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[402px] min-h-screen pb-10">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6">
          <button type="button" onClick={() => navigate(-1)} aria-label="Volver">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F3E32" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>
          <button type="button" aria-label="Notificaciones" className="relative">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F3E32" strokeWidth="2">
              <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-petpulse-accent rounded-full border border-petpulse-bg" />
          </button>
        </div>

        <h1 className="font-encode-expanded font-bold text-xl text-petpulse-primary text-center mt-3">
          {isEditing ? 'Editar mascota' : 'Agregar mascota'}
        </h1>

        {error && (
          <p role="alert" className="text-petpulse-accent text-sm text-center mt-3 px-8">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="px-5 mt-5" noValidate>
          {/* Subir imagen */}
          <div className="h-[226px] bg-petpulse-primary/5 border-2 border-dashed border-petpulse-border rounded-xl flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-petpulse-primary/20 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7A9A7B" strokeWidth="2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <p className="font-inter font-semibold text-sm text-petpulse-text">Subir imagen</p>
            <p className="font-inter text-xs text-petpulse-text-secondary">JPG, PNG (máx. 5MB)</p>
          </div>

          {/* Sección DATOS */}
          <p className="font-inter font-bold text-[14px] text-petpulse-primary tracking-[0.5px] uppercase mt-8 mb-3">
            Datos
          </p>

          {/* Nombre */}
          <label htmlFor="name_pet" className="font-encode-condensed font-semibold text-sm text-petpulse-text block mb-1">
            Nombre
          </label>
          <div className="relative mb-4">
            <input
              id="name_pet"
              value={name_pet}
              onChange={(e) => setNamePet(e.target.value)}
              required
              placeholder="Ej: Konan"
              className="w-full h-[42px] bg-white border border-petpulse-border rounded-lg pl-3 pr-10 text-sm text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow"
            />
            <img src={iconPaw} alt="" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60" aria-hidden="true" />
          </div>

          {/* Especie */}
          <label htmlFor="species" className="font-encode-condensed font-semibold text-sm text-petpulse-text block mb-1">
            Especie
          </label>
          <div className="relative mb-4">
            <select
              id="species"
              value={species}
              onChange={(e) => setSpecies(e.target.value as PetSpecies)}
              required
              className="w-full h-[42px] bg-white border border-petpulse-border rounded-lg pl-3 pr-9 text-sm text-petpulse-text focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow appearance-none"
            >
              <option value="" disabled>Seleccionar especie</option>
              {SPECIES_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-petpulse-text-secondary pointer-events-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>

          {/* Raza */}
          <label htmlFor="breed" className="font-encode-condensed font-semibold text-sm text-petpulse-text block mb-1">
            Raza
          </label>
          <div className="relative mb-4">
            <input
              id="breed"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Ej: Golden Retriever"
              className="w-full h-[42px] bg-white border border-petpulse-border rounded-lg pl-3 pr-10 text-sm text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow"
            />
            <img src={iconPaw} alt="" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60" aria-hidden="true" />
          </div>

          {/* Fecha de nacimiento */}
          <label htmlFor="birth_date" className="font-encode-condensed font-semibold text-sm text-petpulse-text block mb-1">
            Fecha de nacimiento
          </label>
          <div className="relative mb-4">
            <input
              id="birth_date"
              type="date"
              value={birth_date}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              className="w-full h-[42px] bg-white border border-petpulse-border rounded-lg pl-3 pr-10 text-sm text-petpulse-text focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow"
            />
          </div>

          {/* Enfermedades */}
          <label htmlFor="diseases" className="font-encode-condensed font-semibold text-sm text-petpulse-text block mb-1">
            Enfermedades <span className="text-petpulse-text-secondary font-normal normal-case">(opcional)</span>
          </label>
          <textarea
            id="diseases"
            value={diseases}
            onChange={(e) => setDiseases(e.target.value)}
            rows={3}
            placeholder="Descripción de enfermedades o condiciones médicas..."
            className="w-full bg-white border border-petpulse-border rounded-lg p-3 text-sm text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow resize-none mb-6"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 bg-petpulse-primary hover:bg-petpulse-primary-dark active:scale-[0.98] text-white font-encode-semi font-bold text-base rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Guardando...' : 'Guardar Mascota'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default PetForm