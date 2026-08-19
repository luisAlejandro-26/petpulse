import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Icon } from '@iconify/react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createPet, getPet, updatePet } from '../../api/pets'
import { uploadPetImage } from '../../api/upload'
import type { PetSpecies } from '../../api/types'
import Sidebar from '../../components/dashboard/Sidebar'


const SPECIES_OPTIONS: { value: PetSpecies; label: string }[] = [
  { value: 'PERRO', label: 'Perro' },
  { value: 'GATO', label: 'Gato' },
  { value: 'CONEJO', label: 'Conejo' },
  { value: 'PAJARO', label: 'Pájaro' },
  { value: 'OTHER', label: 'Otro' },
]

function PetFormDesktop() {
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


  // ── Pet form ──

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
    'w-full box-border text-sm py-2.5 px-4 rounded-full border border-petpulse-border bg-petpulse-card text-petpulse-text transition-colors placeholder:text-petpulse-text-secondary focus:outline-none focus:border-petpulse-primary focus:ring-[3px] focus:ring-[rgba(122,154,123,0.18)]'

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-petpulse-bg flex items-center justify-center">
        <p className="text-petpulse-text-secondary">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-petpulse-bg flex">
      {/* layout principal */}
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
                {isEditing ? 'Editar mascota' : 'Agregar mascota'}
                <Icon icon="mdi:paw" width={20} height={20} className="text-petpulse-primary" />
              </h1>
              <p className="text-sm text-petpulse-text-secondary mt-0.5">
                Completa la información para {isEditing ? 'editar' : 'agregar'} a tu peludo
              </p>
            </div>
          </div>

          {/* Card del formulario */}
          <div className="bg-white border border-petpulse-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-bold text-base text-petpulse-text m-0 whitespace-nowrap">
                Datos de tu mascota
              </h2>
              <span className="h-px flex-1 bg-petpulse-border" />
              <Icon icon="mdi:paw" width={16} height={16} className="text-petpulse-primary shrink-0" />
              <span className="h-px flex-1 bg-petpulse-border" />
            </div>

            {error && (
              <p role="alert" className="text-sm px-4 py-3 rounded-xl mb-5 text-center bg-[#fbe9e5] text-petpulse-accent border border-[#f2cec3]">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="flex gap-8 flex-wrap">
                {/* Foto */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 rounded-full bg-petpulse-primary/10 flex flex-col items-center justify-center gap-1.5 border-0 cursor-pointer overflow-hidden text-petpulse-primary hover:bg-petpulse-primary/20 transition-colors"
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
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </div>

                {/* Campos */}
                <div className="flex-1 min-w-[280px] grid grid-cols-2 gap-x-6 gap-y-4">
                  {/* campo nombre */}
                  <div>
                    <label htmlFor="name_pet" className="block text-[13px] font-semibold text-petpulse-text mb-1.5">Nombre</label>
                    <div className="relative flex items-center">
                      <Icon icon="mdi:paw" width={16} height={16} className="absolute left-4 text-petpulse-text-secondary pointer-events-none" />
                      <input id="name_pet" value={name_pet} onChange={(e) => setNamePet(e.target.value)} required placeholder="Ej: Konan" className={`${inputClass} pl-10`} />
                    </div>
                  </div>

                  {/* campo especie */}
                  <div>
                    <label htmlFor="species" className="block text-[13px] font-semibold text-petpulse-text mb-1.5">Especie</label>
                    <div className="relative flex items-center">
                      <Icon icon="mdi:paw" width={16} height={16} className="absolute left-4 text-petpulse-text-secondary pointer-events-none" />
                      <select id="species" value={species} onChange={(e) => setSpecies(e.target.value as PetSpecies)} required className={`${inputClass} pl-10 cursor-pointer appearance-none`}>
                        <option value="" disabled>Seleccionar</option>
                        {SPECIES_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* campo raza */}
                  <div>
                    <label htmlFor="breed" className="block text-[13px] font-semibold text-petpulse-text mb-1.5">Raza</label>
                    <div className="relative flex items-center">
                      <Icon icon="mdi:paw" width={16} height={16} className="absolute left-4 text-petpulse-text-secondary pointer-events-none" />
                      <input id="breed" value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Ej: Golden Retriever" className={`${inputClass} pl-10`} />
                    </div>
                  </div>

                  {/* campo color */}
                  <div>
                    <label htmlFor="color" className="block text-[13px] font-semibold text-petpulse-text mb-1.5">
                      Color <span className="text-petpulse-text-secondary font-normal">(opcional)</span>
                    </label>
                    <div className="relative flex items-center">
                      <Icon icon="mdi:palette-outline" width={16} height={16} className="absolute left-4 text-petpulse-text-secondary pointer-events-none" />
                      <input id="color" value={color} onChange={(e) => setColor(e.target.value)} placeholder="Ej: Dorado" className={`${inputClass} pl-10`} />
                    </div>
                  </div>

                  {/* campo fecha nacimiento */}
                  <div>
                    <label htmlFor="birth_date" className="block text-[13px] font-semibold text-petpulse-text mb-1.5">Fecha de nacimiento</label>
                    <div className="relative flex items-center">
                      <Icon icon="mdi:calendar-month-outline" width={16} height={16} className="absolute left-4 text-petpulse-text-secondary pointer-events-none" />
                      <input id="birth_date" type="date" value={birth_date} onChange={(e) => setBirthDate(e.target.value)} required className={`${inputClass} pl-10`} />
                    </div>
                  </div>

                  {/* campo peso */}
                  <div>
                    <label htmlFor="peso" className="block text-[13px] font-semibold text-petpulse-text mb-1.5">Peso</label>
                    <div className="relative flex items-center">
                      <Icon icon="mdi:scale-bathroom" width={16} height={16} className="absolute left-4 text-petpulse-text-secondary pointer-events-none" />
                      <input id="peso" value={peso} onChange={(e) => setPeso(e.target.value)} placeholder="Ej: 8.5 kg" className={`${inputClass} pl-10`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Padecimientos */}
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
                  className="w-full box-border text-sm p-4 rounded-2xl border border-petpulse-border bg-petpulse-card text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none focus:border-petpulse-primary focus:ring-[3px] focus:ring-[rgba(122,154,123,0.18)] resize-none"
                />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <span className="h-px flex-1 bg-petpulse-border" />
                <Icon icon="mdi:paw" width={16} height={16} className="text-petpulse-primary shrink-0" />
                <span className="h-px flex-1 bg-petpulse-border" />
              </div>

              {/* Botones */}
              <div className="flex gap-4 flex-wrap">
                {/* boton guardar */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-petpulse-primary text-white font-bold text-sm rounded-full py-3 border-0 cursor-pointer transition-colors enabled:hover:bg-petpulse-primary-dark enabled:active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Icon icon="mdi:paw" width={16} height={16} />
                  {submitting ? 'Guardando...' : 'Guardar mascota'}
                </button>
                <Link
                  to="/dashboard"
                  className="flex-1 min-w-[160px] text-center bg-petpulse-card border border-petpulse-border text-petpulse-text font-bold text-sm rounded-full py-3 no-underline transition-colors hover:bg-[#eaf0ea]"
                >
                  Cancelar
                </Link>
              </div>
            </form>
          </div>

      </main>

      {/* ── Panel derecho (Consejos) ── */}
      <aside className="w-[320px] shrink-0 bg-white border-l border-petpulse-border h-screen sticky top-0 flex flex-col overflow-y-auto">


        <div className="flex justify-center px-6 py-6">
          <img src="/assets/imagen-centro-ia.svg" alt="Mascotas" className="w-48 h-auto object-contain" />
        </div>

        {/* consejos rápidos */}
        <div className="mx-6 bg-[#EAF0EB] rounded-3xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#6B8C6C] flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:lightbulb-outline" width={20} height={20} className="text-[#6B8C6C]" />
            </div>
            <p className="font-bold text-[#6B8C6C] text-base">Consejos rápidos</p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full border border-[#6B8C6C] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon icon="mdi:camera-outline" width={16} height={16} className="text-[#6B8C6C]" />
            </div>
            <p className="text-sm font-medium text-petpulse-text leading-snug">Usar foto clara de tu mascota.</p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full border border-[#6B8C6C] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon icon="mdi:paw" width={16} height={16} className="text-[#6B8C6C]" />
            </div>
            <p className="text-sm font-medium text-petpulse-text leading-snug">Describe bien los padecimientos si los tiene.</p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full border border-[#6B8C6C] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon icon="mdi:heart-outline" width={16} height={16} className="text-[#6B8C6C]" />
            </div>
            <p className="text-sm font-medium text-petpulse-text leading-snug">Mantén la información actualizada.</p>
          </div>

          <img src="/assets/banner-agg-pet.svg" alt="" className="w-full h-auto object-cover rounded-2xl mt-2" />
        </div>
      </aside>

    </div>
  )
}

export default PetFormDesktop
