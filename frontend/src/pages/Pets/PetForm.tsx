import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createPet, getPet, updatePet } from '../../api/pets'
import { uploadPetImage } from '../../api/upload'
import type { PetSpecies } from '../../api/types'
import iconPaw from '../../assets/icon-paw.png'

const SPECIES_OPTIONS: { value: PetSpecies; label: string }[] = [
  { value: 'PERRO', label: 'Perro' },
  { value: 'GATO', label: 'Gato' },
  { value: 'CONEJO', label: 'Conejo' },
  { value: 'PAJARO', label: 'Pájaro' },
  { value: 'OTHER', label: 'Otro' },
]

// Formulario de mascota: crear (sin id en la ruta) o editar (con id en /pets/:id/edit), decidido por isEditing
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
  const [loading, setLoading] = useState(isEditing) // solo hay carga inicial cuando se está editando (crear arranca vacío)

  const [pet_image_url, setPetImageUrl] = useState('') // URL ya subida a Supabase Storage (se llena tras handlePickImage)
  const [color, setColor] = useState('')
  const [weight, setWeight] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null) // preview local mientras se sube la imagen
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Modo edición: precarga todos los campos con los datos actuales de la mascota
  useEffect(() => {
    if (!isEditing || !id || !token) return

    getPet(Number(id), token)
      .then((pet) => {
        setNamePet(pet.name_pet)
        setSpecies(pet.species)
        setBreed(pet.breed ?? '')
        setBirthDate(pet.birth_date.split('T')[0])
        setDiseases(pet.diseases ?? '')
        setPetImageUrl(pet.pet_image_url ?? '')
        setColor(pet.color ?? '')
        setWeight(pet.weight != null ? String(pet.weight) : '')
      })
      .catch(() => setError('No se pudo cargar la mascota'))
      .finally(() => setLoading(false))
  }, [id, isEditing, token])

  // Sube la imagen a Supabase Storage apenas se elige el archivo (no espera al submit del formulario)
  async function handlePickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !token) return

    setImagePreview(URL.createObjectURL(file))
    setUploadingImage(true)
    setError('')
    try {
      const url = await uploadPetImage(file, token)
      setPetImageUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir la imagen')
      setImagePreview(null)
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  // Crea o actualiza la mascota según isEditing, con todos los campos incluyendo la URL de imagen ya subida
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
      const weightValue = weight ? Number(weight) : undefined
      if (isEditing && id) {
        await updatePet(Number(id), { name_pet, species, breed, birth_date, diseases, pet_image_url, color, weight: weightValue }, token)
      } else {
        await createPet({ name_pet, species, breed, birth_date, diseases, pet_image_url, color, weight: weightValue }, token)
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

  const displayImage = imagePreview ?? (pet_image_url || null) // prioriza el preview local mientras se sube sobre la URL ya guardada

  return (
    <div className="h-screen w-full bg-petpulse-bg flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[402px] h-screen overflow-hidden">
      <div className="h-full overflow-y-auto pb-10">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6">
          <button type="button" onClick={() => navigate(-1)} aria-label="Volver">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F3E32" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
          {/* ── Subir imagen: input file oculto, disparado por el botón/preview ── */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePickImage}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-[226px] bg-petpulse-primary/5 border-2 border-dashed border-petpulse-border rounded-xl flex flex-col items-center justify-center gap-2 overflow-hidden relative"
          >
            {displayImage ? (
              <img src={displayImage} alt="Mascota" className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-petpulse-primary/20 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7A9A7B" strokeWidth="2">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <p className="font-inter font-semibold text-sm text-petpulse-text">Subir imagen</p>
                <p className="font-inter text-xs text-petpulse-text-secondary">JPG, PNG (máx. 5MB)</p>
              </>
            )}
            {uploadingImage && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <p className="text-white text-sm font-inter">Subiendo...</p>
              </div>
            )}
          </button>

          {/* ── Sección DATOS ── */}
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

          {/* Color: campo opcional, se usa en la ficha de la mascota (PetProfile) */}
          <label htmlFor="color" className="font-encode-condensed font-semibold text-sm text-petpulse-text block mb-1">
            Color <span className="text-petpulse-text-secondary font-normal normal-case">(opcional)</span>
          </label>
          <div className="relative mb-4">
            <input
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Ej: Dorado"
              className="w-full h-[42px] bg-white border border-petpulse-border rounded-lg pl-3 pr-10 text-sm text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow"
            />
          </div>

          {/* Peso: opcional, se envía como número (undefined si el campo queda vacío) */}
          <label htmlFor="weight" className="font-encode-condensed font-semibold text-sm text-petpulse-text block mb-1">
            Peso (Kg) <span className="text-petpulse-text-secondary font-normal normal-case">(opcional)</span>
          </label>
          <div className="relative mb-4">
            <input
              id="weight"
              type="number"
              step="0.1"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Ej: 32"
              className="w-full h-[42px] bg-white border border-petpulse-border rounded-lg pl-3 pr-10 text-sm text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow"
            />
          </div>

          {/* Enfermedades: texto libre, opcional */}
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
            disabled={submitting || uploadingImage}
            className="w-full h-11 bg-petpulse-primary hover:bg-petpulse-primary-dark active:scale-[0.98] text-white font-encode-semi font-bold text-base rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Guardando...' : 'Guardar Mascota'}
          </button>
        </form>
      </div>
      </div>
    </div>
  )
}

export default PetForm