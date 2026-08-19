import { useRef, useState, type FormEvent } from 'react'
import { Icon } from '@iconify/react'
import { useAuth } from '../../context/AuthContext'
import SideMenu from '../../components/SideMenu'
import BottomNav from '../../components/BottomNav'

function fileToBase64(file: File): Promise<{ base64: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const [prefix, data] = result.split(',')
      const mime = prefix.match(/data:(.*);base64/)?.[1] ?? file.type
      resolve({ base64: data, mime })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function formatBirthDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' })
}

const GENDER_LABEL: Record<string, string> = {
  MASCULINO: 'Masculino',
  FEMENINO: 'Femenino',
  OTRO: 'Otro',
}

// Pantalla de Perfil del usuario: vista de solo lectura por defecto, botón "Editar perfil" activa el formulario (nombre, género, fecha, foto)
function ProfileMobile() {
  const { user, updateProfile, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false) // alterna entre vista de solo lectura y formulario de edición
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name_user, setNameUser] = useState(user?.name_user ?? '')
  const [gender, setGender] = useState(user?.gender ?? '')
  const [birth_date, setBirthDate] = useState(user?.birth_date?.split('T')[0] ?? '')
  const [imagePreview, setImagePreview] = useState<string | null>(null) // preview local de la foto elegida, antes de guardar
  const [pendingImage, setPendingImage] = useState<{ base64: string; mime: string } | null>(null) // foto lista para subir en el próximo submit

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Precarga los campos con los datos actuales del usuario y entra en modo edición
  function startEditing() {
    setNameUser(user?.name_user ?? '')
    setGender(user?.gender ?? '')
    setBirthDate(user?.birth_date?.split('T')[0] ?? '')
    setImagePreview(null)
    setPendingImage(null)
    setError('')
    setEditing(true)
  }

  async function handlePickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const { base64, mime } = await fileToBase64(file)
    setPendingImage({ base64, mime })
    setImagePreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  // Guarda los cambios: la foto (si hay una nueva) se sube junto con los demás campos en la misma llamada a updateProfile
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name_user.trim()) {
      setError('El nombre no puede estar vacío')
      return
    }
    setError('')
    setSaving(true)
    try {
      await updateProfile({
        name_user: name_user.trim(),
        gender: gender || undefined,
        birth_date: birth_date || undefined,
        profile_image_base64: pendingImage?.base64,
        profile_image_mime_type: pendingImage?.mime,
      })
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el perfil')
    } finally {
      setSaving(false)
    }
  }

  const avatarSrc = imagePreview ?? user?.profile_image_url ?? null // prioriza el preview local sobre la foto guardada

  return (
    <div className="h-screen w-full bg-petpulse-bg flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[402px] h-screen flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <button type="button" aria-label="Abrir menú" onClick={() => setMenuOpen(true)}>
            <Icon icon="akar-icons:three-line-horizontal" width={22} height={22} color="#2F3E32" />
          </button>
          <h1 className="font-inter font-medium text-2xl text-petpulse-primary">Perfil</h1>
          <div className="w-[22px]" />
        </div>

        <div className="flex-1 overflow-y-auto pb-36 px-5">
          {/* ── Avatar: solo editable (botón de lápiz) cuando editing=true ── */}
          <div className="flex flex-col items-center mt-4">
            <div className="relative">
              <div className="w-[100px] h-[100px] rounded-full bg-petpulse-primary/15 border-2 border-petpulse-primary/20 flex items-center justify-center overflow-hidden">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <Icon icon="mdi:account" width={48} height={48} color="#7A9A7B" />
                )}
              </div>
              {editing && (
                <>
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
                    aria-label="Cambiar foto"
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-petpulse-primary border-2 border-petpulse-bg flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <Icon icon="mynaui:pencil" width={14} height={14} color="white" />
                  </button>
                </>
              )}
            </div>

            {!editing && (
              <>
                <p className="font-encode-expanded font-bold text-xl text-petpulse-text mt-3">
                  {user?.name_user}
                </p>
                <p className="font-inter text-sm text-petpulse-text-secondary">{user?.email}</p>
              </>
            )}
          </div>

          {error && (
            <p role="alert" className="text-petpulse-accent text-sm text-center mt-4">
              {error}
            </p>
          )}

          {!editing ? (
            /* ── Vista de solo lectura: correo, género, fecha de nacimiento + botones Editar/Cerrar sesión ── */
            <div className="mt-8">
              <p className="font-inter font-bold text-[14px] text-petpulse-primary tracking-[0.5px] uppercase mb-3">
                Información de la cuenta
              </p>

              <div className="bg-white border border-petpulse-border rounded-xl divide-y divide-petpulse-border">
                <div className="flex items-center gap-3 p-4">
                  <Icon icon="mdi:email-outline" width={20} height={20} color="#7A9A7B" />
                  <div>
                    <p className="font-inter text-xs text-petpulse-text-secondary">Correo</p>
                    <p className="font-inter text-sm text-petpulse-text">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4">
                  <Icon icon="mdi:gender-male-female" width={20} height={20} color="#7A9A7B" />
                  <div>
                    <p className="font-inter text-xs text-petpulse-text-secondary">Género</p>
                    <p className="font-inter text-sm text-petpulse-text">
                      {user?.gender ? (GENDER_LABEL[user.gender] ?? user.gender) : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4">
                  <Icon icon="mdi:calendar-month-outline" width={20} height={20} color="#7A9A7B" />
                  <div>
                    <p className="font-inter text-xs text-petpulse-text-secondary">Fecha de nacimiento</p>
                    <p className="font-inter text-sm text-petpulse-text">{formatBirthDate(user?.birth_date)}</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={startEditing}
                className="w-full h-11 bg-petpulse-primary hover:bg-petpulse-primary-dark active:scale-[0.98] text-white font-encode-semi font-bold text-sm rounded-xl transition-all mt-6 flex items-center justify-center gap-2"
              >
                <Icon icon="mynaui:pencil" width={16} height={16} color="white" />
                Editar perfil
              </button>

              <button
                type="button"
                onClick={() => logout()}
                className="w-full h-11 bg-white border border-petpulse-accent text-petpulse-accent font-encode-semi font-bold text-sm rounded-xl transition-all mt-3 active:scale-[0.98]"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            /* ── Formulario de edición: nombre, género, fecha de nacimiento ── */
            <form onSubmit={handleSubmit} className="mt-6">
              <label htmlFor="name_user" className="font-encode-condensed font-semibold text-sm text-petpulse-text block mb-1">
                Nombre
              </label>
              <input
                id="name_user"
                value={name_user}
                onChange={(e) => setNameUser(e.target.value)}
                required
                className="w-full h-[42px] bg-white border border-petpulse-border rounded-lg px-3 text-sm text-petpulse-text focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow mb-4"
              />

              <label htmlFor="gender" className="font-encode-condensed font-semibold text-sm text-petpulse-text block mb-1">
                Género
              </label>
              <div className="relative mb-4">
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full h-[42px] bg-white border border-petpulse-border rounded-lg pl-3 pr-9 text-sm text-petpulse-text focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow appearance-none"
                >
                  <option value="">Seleccionar</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                  <option value="OTRO">Otro</option>
                </select>
                <Icon icon="mdi:chevron-down" width={16} height={16} color="#7A9A7B" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <label htmlFor="birth_date" className="font-encode-condensed font-semibold text-sm text-petpulse-text block mb-1">
                Fecha de nacimiento
              </label>
              <input
                id="birth_date"
                type="date"
                value={birth_date}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full h-[42px] bg-white border border-petpulse-border rounded-lg px-3 text-sm text-petpulse-text focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow mb-6"
              />

              <button
                type="submit"
                disabled={saving}
                className="w-full h-11 bg-petpulse-primary hover:bg-petpulse-primary-dark active:scale-[0.98] text-white font-encode-semi font-bold text-sm rounded-xl transition-all disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>

              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
                className="w-full h-11 bg-white border border-petpulse-border text-petpulse-text font-encode-semi font-semibold text-sm rounded-xl transition-all mt-3 active:scale-[0.98]"
              >
                Cancelar
              </button>
            </form>
          )}
        </div>

        <BottomNav />
        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </div>
  )
}

export default ProfileMobile
 