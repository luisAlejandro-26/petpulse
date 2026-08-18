import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Icon } from '@iconify/react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createPet, getPet, updatePet } from '../../api/pets'
import { uploadPetImage } from '../../api/upload'
import type { PetSpecies } from '../../api/types'
import logo from '../../assets/logo.png'
import dogCatIllustration from '../../assets/dog-cat-illustration.png'

const SPECIES_OPTIONS: { value: PetSpecies; label: string }[] = [
  { value: 'PERRO', label: 'Perro' },
  { value: 'GATO', label: 'Gato' },
  { value: 'CONEJO', label: 'Conejo' },
  { value: 'PAJARO', label: 'Pájaro' },
  { value: 'OTHER', label: 'Otro' },
]

function PetFormTablet() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name_pet, setNamePet] = useState('')
  const [species, setSpecies] = useState<PetSpecies | ''>('')
  const [breed, setBreed] = useState('')
  const [birth_date, setBirthDate] = useState('')
  const [diseases, setDiseases] = useState('')
  const [color, setColor] = useState('')
  const [peso, setPeso] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

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
        setColor(pet.color ?? '')
        setPeso(pet.weight !== null ? String(pet.weight) : '')
        if (pet.pet_image_url) setPhotoPreview(pet.pet_image_url)
      })
      .catch(() => setError('No se pudo cargar la mascota'))
      .finally(() => setLoading(false))
  }, [id, isEditing, token])

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

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
      let pet_image_url: string | undefined
      if (photoFile) {
        pet_image_url = await uploadPetImage(photoFile, token)
      }

      const payload = {
        name_pet,
        species,
        breed,
        birth_date,
        diseases,
        color: color || undefined,
        weight: peso ? Number(peso) : undefined,
        ...(pet_image_url ? { pet_image_url } : {}),
      }

      if (isEditing && id) {
        await updatePet(Number(id), payload, token)
      } else {
        await createPet(payload, token)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la mascota')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full box-border font-inter text-sm py-2.5 px-4 rounded-full border border-petpulse-border bg-petpulse-card text-petpulse-text transition-colors placeholder:text-petpulse-text-secondary focus:outline-none focus:border-petpulse-primary focus:ring-[3px] focus:ring-[rgba(122,154,123,0.18)]'

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-petpulse-bg flex items-center justify-center">
        <p className="font-inter text-petpulse-text-secondary">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-petpulse-bg font-inter text-petpulse-text box-border pb-28">
      <div className="w-full max-w-[900px] mx-auto px-5 pt-8 flex flex-col gap-5">
        <header className="flex items-start justify-between gap-4 flex-wrap max-[560px]:justify-center max-[560px]:text-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="text-petpulse-text bg-transparent border-0 cursor-pointer flex items-center justify-center p-1 hover:text-petpulse-primary"
          >
            <Icon icon="mdi:arrow-left" width={24} height={24} />
          </button>

          <div className="flex-1 min-w-[220px] text-center">
            <h1 className="font-poppins font-bold text-xl text-petpulse-primary m-0 flex items-center justify-center gap-1.5">
              Agregar mascota <Icon icon="mdi:paw" width={18} height={18} className="text-petpulse-primary" />
            </h1>
            <p className="text-[13px] text-petpulse-text-secondary mt-0.5 mb-0">
              Completa la información para agregar a tu peludo
            </p>
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

        <div className="bg-petpulse-card border border-petpulse-border rounded-[20px] shadow-[0_20px_44px_-28px_rgba(47,62,50,0.18)] px-6 py-7">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-poppins font-bold text-base text-petpulse-text m-0 whitespace-nowrap">
              Datos de tus mascotas
            </h2>
            <span className="h-px flex-1 bg-petpulse-border" />
            <Icon icon="mdi:paw" width={16} height={16} className="text-petpulse-primary shrink-0" />
            <span className="h-px flex-1 bg-petpulse-border" />
          </div>

          {error && (
            <p role="alert" className="text-[13px] px-4 py-3 rounded-[14px] mb-5 text-center bg-[#fbe9e5] text-petpulse-accent border border-[#f2cec3]">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex gap-8 flex-wrap">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 rounded-full bg-[#eaf0ea] flex flex-col items-center justify-center gap-1.5 border-0 cursor-pointer overflow-hidden text-petpulse-primary hover:bg-[#dfe9df] transition-colors"
                  aria-label="Subir foto de la mascota"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Icon icon="mdi:camera-outline" width={30} height={30} />
                      <span className="text-xs font-semibold">foto</span>
                    </>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>

              <div className="flex-1 min-w-[280px] grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label htmlFor="name_pet" className="block text-[13px] font-semibold text-petpulse-text mb-1.5">
                    Nombre
                  </label>
                  <div className="relative flex items-center">
                    <Icon icon="mdi:paw" width={16} height={16} className="absolute left-4 text-petpulse-text-secondary pointer-events-none" />
                    <input
                      id="name_pet"
                      value={name_pet}
                      onChange={(e) => setNamePet(e.target.value)}
                      required
                      placeholder="Ej: Konan"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="species" className="block text-[13px] font-semibold text-petpulse-text mb-1.5">
                    Especie
                  </label>
                  <div className="relative flex items-center">
                    <Icon icon="mdi:paw" width={16} height={16} className="absolute left-4 text-petpulse-text-secondary pointer-events-none" />
                    <select
                      id="species"
                      value={species}
                      onChange={(e) => setSpecies(e.target.value as PetSpecies)}
                      required
                      className={`${inputClass} pl-10 cursor-pointer appearance-none`}
                    >
                      <option value="" disabled>
                        Seleccionar
                      </option>
                      {SPECIES_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="breed" className="block text-[13px] font-semibold text-petpulse-text mb-1.5">
                    Raza
                  </label>
                  <div className="relative flex items-center">
                    <Icon icon="mdi:paw" width={16} height={16} className="absolute left-4 text-petpulse-text-secondary pointer-events-none" />
                    <input
                      id="breed"
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      placeholder="Ej: Golden Retriever"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="color" className="block text-[13px] font-semibold text-petpulse-text mb-1.5">
                    Color <span className="text-petpulse-text-secondary font-normal">(opcional)</span>
                  </label>
                  <div className="relative flex items-center">
                    <Icon icon="mdi:palette-outline" width={16} height={16} className="absolute left-4 text-petpulse-text-secondary pointer-events-none" />
                    <input
                      id="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="Ej: Dorado"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="birth_date" className="block text-[13px] font-semibold text-petpulse-text mb-1.5">
                    Edad
                  </label>
                  <div className="relative flex items-center">
                    <Icon icon="mdi:calendar-month-outline" width={16} height={16} className="absolute left-4 text-petpulse-text-secondary pointer-events-none" />
                    <input
                      id="birth_date"
                      type="date"
                      value={birth_date}
                      onChange={(e) => setBirthDate(e.target.value)}
                      required
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="peso" className="block text-[13px] font-semibold text-petpulse-text mb-1.5">
                    Peso
                  </label>
                  <div className="relative flex items-center">
                    <Icon icon="mdi:scale-bathroom" width={16} height={16} className="absolute left-4 text-petpulse-text-secondary pointer-events-none" />
                    <input
                      id="peso"
                      value={peso}
                      onChange={(e) => setPeso(e.target.value)}
                      placeholder="Ej: 8.5 kg"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="diseases" className="block text-[13px] font-semibold text-petpulse-text mb-1.5">
                Descripción padecimiento <span className="text-petpulse-text-secondary font-normal">(opcional)</span>
              </label>
              <textarea
                id="diseases"
                value={diseases}
                onChange={(e) => setDiseases(e.target.value)}
                rows={4}
                placeholder="Descripción de enfermedades o condiciones médicas..."
                className="w-full box-border font-inter text-sm p-4 rounded-2xl border border-petpulse-border bg-petpulse-card text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none focus:border-petpulse-primary focus:ring-[3px] focus:ring-[rgba(122,154,123,0.18)] resize-none"
              />
            </div>

            <div className="flex items-center gap-3 my-6">
              <span className="h-px flex-1 bg-petpulse-border" />
              <Icon icon="mdi:paw" width={16} height={16} className="text-petpulse-primary shrink-0" />
              <span className="h-px flex-1 bg-petpulse-border" />
            </div>

            <div className="flex gap-4 flex-wrap">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-petpulse-primary text-white font-inter font-bold text-sm rounded-full py-3 border-0 cursor-pointer transition-colors enabled:hover:bg-petpulse-primary-dark enabled:active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Icon icon="mdi:paw" width={16} height={16} />
                {submitting ? 'Guardando...' : 'Guardar mascota'}
              </button>
              <Link
                to="/dashboard"
                className="flex-1 min-w-[160px] text-center bg-petpulse-card border border-petpulse-border text-petpulse-text font-inter font-bold text-sm rounded-full py-3 no-underline transition-colors hover:bg-[#eaf0ea]"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>

        <div className="bg-petpulse-card border border-petpulse-border rounded-[20px] px-6 py-4 flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <Icon icon="mdi:lightbulb-outline" width={20} height={20} className="text-petpulse-primary" />
            <span className="font-poppins font-bold text-sm text-petpulse-text">Consejos</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-[#eaf0ea] text-petpulse-primary flex items-center justify-center shrink-0">
              <Icon icon="mdi:camera-outline" width={18} height={18} />
            </span>
            <span className="text-xs text-petpulse-text-secondary leading-tight max-w-[130px]">
              Usar fotos claras de tus mascotas
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-[#eaf0ea] text-petpulse-primary flex items-center justify-center shrink-0">
              <Icon icon="mdi:clipboard-text-outline" width={18} height={18} />
            </span>
            <span className="text-xs text-petpulse-text-secondary leading-tight max-w-[140px]">
              Mantener la información actualizada
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-[#fbe9e5] text-petpulse-accent flex items-center justify-center shrink-0">
              <Icon icon="mdi:heart-outline" width={18} height={18} />
            </span>
            <span className="text-xs text-petpulse-text-secondary leading-tight max-w-[150px]">
              Esto nos ayuda a brindarles el mejor cuidado
            </span>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-4 left-0 right-0 flex justify-center px-5 z-10" aria-label="Navegación principal">
        <div className="w-full max-w-[620px] bg-petpulse-card border border-petpulse-border rounded-[20px] shadow-[0_16px_32px_-18px_rgba(47,62,50,0.3)] flex items-center justify-around px-3 py-2">
          <Link
            to="/dashboard"
            className="flex flex-col items-center gap-[3px] no-underline text-[11px] font-semibold px-4 py-2 rounded-[14px] transition-colors text-petpulse-text-secondary hover:bg-[#eaf0ea] hover:text-petpulse-primary-dark"
          >
            <Icon icon="mdi:home-outline" width={22} height={22} />
            <span>Inicio</span>
          </Link>
          <Link
            to="/calendar"
            className="flex flex-col items-center gap-[3px] no-underline text-[11px] font-semibold px-4 py-2 rounded-[14px] transition-colors text-petpulse-text-secondary hover:bg-[#eaf0ea] hover:text-petpulse-primary-dark"
          >
            <Icon icon="mdi:calendar-month-outline" width={22} height={22} />
            <span>Calendario</span>
          </Link>
          <Link
            to="/pet-ia"
            className="flex flex-col items-center gap-[3px] no-underline text-[11px] font-semibold px-4 py-2 rounded-[14px] transition-colors text-petpulse-text-secondary hover:bg-[#eaf0ea] hover:text-petpulse-primary-dark"
          >
            <Icon icon="mdi:paw-outline" width={22} height={22} />
            <span>PetIA</span>
          </Link>
          <Link
            to="/profile"
            className="flex flex-col items-center gap-[3px] no-underline text-[11px] font-semibold px-4 py-2 rounded-[14px] transition-colors text-petpulse-text-secondary hover:bg-[#eaf0ea] hover:text-petpulse-primary-dark"
          >
            <Icon icon="mdi:account-outline" width={22} height={22} />
            <span>Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}

export default PetFormTablet