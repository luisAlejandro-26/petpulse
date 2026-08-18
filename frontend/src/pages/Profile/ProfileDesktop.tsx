import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Icon } from '@iconify/react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../api/client'
import { getPets } from '../../api/pets'
import Sidebar from '../../components/dashboard/Sidebar'

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

function ProfileDesktop() {
  const { user, token, updateProfile } = useAuth()

  const [petsCount, setPetsCount] = useState(0)
  const [photoSaving, setPhotoSaving] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (token) getPets(token).then((p) => setPetsCount(p.length)).catch(() => {})
  }, [token])

  const initials = (user?.name_user ?? 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

  async function handlePickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !token) return
    e.target.value = ''
    setPhotoError('')
    setPhotoSaving(true)
    try {
      const { base64, mime } = await fileToBase64(file)
      const { url } = await api.post<{ url: string }>('/api/upload/profile-image', { image_base64: base64, image_mime_type: mime }, token)
      await updateProfile({ profile_image_url: url })
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'No se pudo actualizar la foto')
    } finally {
      setPhotoSaving(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-petpulse-bg flex">
      <Sidebar />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto px-8 py-8 flex flex-col gap-5">

          {/* Header card */}
          <div className="bg-white rounded-2xl border border-petpulse-border p-6 flex items-start gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-petpulse-primary/15 border-2 border-petpulse-primary/20 flex items-center justify-center overflow-hidden text-petpulse-primary-dark font-bold text-3xl">
                {user?.profile_image_url ? (
                  <img src={user.profile_image_url} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePickImage} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoSaving}
                aria-label="Cambiar foto"
                className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-petpulse-primary border-2 border-white flex items-center justify-center hover:bg-petpulse-primary-dark transition-colors disabled:opacity-50"
              >
                <Icon icon="mynaui:pencil" width={14} height={14} color="white" />
              </button>
            </div>

            <div className="flex-1 min-w-0 pt-2">
              <p className="font-bold text-xl text-petpulse-text">{user?.name_user}</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-petpulse-text-secondary">
                  <span className="font-semibold text-petpulse-text">Edad:</span>{' '}
                  {user?.birth_date ? (() => { const b = new Date(user.birth_date); const now = new Date(); let y = now.getFullYear() - b.getFullYear(); const m = now.getMonth() - b.getMonth(); if (m < 0 || (m === 0 && now.getDate() < b.getDate())) y--; return `${y} años` })() : '—'}
                </p>
                <p className="text-sm text-petpulse-text-secondary">
                  <span className="font-semibold text-petpulse-text">Correo Electrónico:</span> {user?.email}
                </p>
                <p className="text-sm text-petpulse-text-secondary">
                  <span className="font-semibold text-petpulse-text">Mascotas:</span> {photoSaving ? '...' : petsCount}
                </p>
              </div>
            </div>
          </div>

          {photoError && <p role="alert" className="text-petpulse-accent text-sm text-center">{photoError}</p>}

          <PersonalInfoCard />

          <PasswordCard />

          <a
            href="https://luisalejandro-26.github.io/blog-sistemas-informaci-n-I/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white border border-petpulse-border rounded-full px-5 py-3 hover:shadow-md transition-shadow self-center no-underline"
          >
            <div className="w-10 h-10 rounded-full bg-petpulse-primary/15 flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:information-outline" width={20} height={20} className="text-petpulse-primary-dark" />
            </div>
            <div>
              <p className="font-bold text-sm text-petpulse-text leading-tight">Sobre nosotros</p>
              <p className="text-xs text-petpulse-text-secondary">Conoce más sobre PetPulse</p>
            </div>
            <Icon icon="mdi:open-in-new" width={16} height={16} className="text-petpulse-text-secondary ml-1" />
          </a>

      </main>

      {/* ── Panel derecho (PetIA style) ── */}
      <aside className="w-[320px] shrink-0 bg-white border-l border-petpulse-border h-screen sticky top-0 flex flex-col overflow-y-auto">
        <div className="flex justify-end px-6 pt-6">
          <button type="button" aria-label="Notificaciones" className="relative w-10 h-10 rounded-full bg-petpulse-bg flex items-center justify-center text-petpulse-text hover:text-petpulse-primary-dark transition-colors">
            <Icon icon="mdi:bell-outline" width={20} height={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-petpulse-accent rounded-full border border-white" />
          </button>
        </div>

        <div className="flex justify-center px-6 py-6">
          <img src="/assets/imagen-centro-ia.svg" alt="Mascotas" className="w-48 h-auto object-contain" />
        </div>

        <div className="mx-6 bg-[#EAF0EB] rounded-3xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#6B8C6C] flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:lightbulb-outline" width={20} height={20} className="text-[#6B8C6C]" />
            </div>
            <p className="font-bold text-[#6B8C6C] text-base">Consejos</p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full border border-[#6B8C6C] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon icon="mdi:camera-outline" width={16} height={16} className="text-[#6B8C6C]" />
            </div>
            <p className="text-sm font-medium text-petpulse-text leading-snug">
              Usar foto clara de tus mascotas.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full border border-[#6B8C6C] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon icon="mdi:clipboard-list-outline" width={16} height={16} className="text-[#6B8C6C]" />
            </div>
            <p className="text-sm font-medium text-petpulse-text leading-snug">
              Mantener la información actualizada.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full border border-[#6B8C6C] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon icon="mdi:heart-outline" width={16} height={16} className="text-[#6B8C6C]" />
            </div>
            <p className="text-sm font-medium text-petpulse-text leading-snug">
              Esto nos ayuda a brindarles el mejor cuidado.
            </p>
          </div>

          <img src="/assets/banner-agg-pet.svg" alt="" className="w-full h-auto object-cover rounded-2xl mt-2" />
        </div>
      </aside>
    </div>
  )
}

/* ─── Información personal ─── */
function PersonalInfoCard() {
  const { user, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name_user, setNameUser] = useState(user?.name_user ?? '')
  const [gender, setGender] = useState(user?.gender ?? '')
  const [birth_date, setBirthDate] = useState(user?.birth_date?.split('T')[0] ?? '')

  function startEditing() {
    setNameUser(user?.name_user ?? '')
    setGender(user?.gender ?? '')
    setBirthDate(user?.birth_date?.split('T')[0] ?? '')
    setError('')
    setEditing(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name_user.trim()) { setError('El nombre no puede estar vacío'); return }
    setError('')
    setSaving(true)
    try {
      await updateProfile({
        name_user: name_user.trim(),
        gender: gender || undefined,
        birth_date: birth_date || undefined,
      })
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-petpulse-border">
      <div className="px-6 py-4 border-b border-petpulse-border flex items-center justify-between">
        <p className="font-bold text-sm text-petpulse-text">Información personal</p>
        {!editing && (
          <button type="button" onClick={startEditing} className="text-petpulse-accent hover:opacity-80 transition-opacity">
            <Icon icon="mynaui:pencil" width={18} height={18} />
          </button>
        )}
      </div>

      {error && <p role="alert" className="text-petpulse-accent text-xs text-center pt-3">{error}</p>}

      {editing ? (
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs text-petpulse-text-secondary mb-1 block">Nombre completo</label>
            <input value={name_user} onChange={(e) => setNameUser(e.target.value)} required
              className="w-full h-10 bg-white border border-petpulse-border rounded-xl px-3 text-sm text-petpulse-text focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow" />
          </div>
          <div>
            <label className="text-xs text-petpulse-text-secondary mb-1 block">Correo electrónico</label>
            <input value={user?.email ?? ''} disabled
              className="w-full h-10 bg-petpulse-bg border border-petpulse-border rounded-xl px-3 text-sm text-petpulse-text-secondary cursor-not-allowed" />
          </div>
          <div>
            <label className="text-xs text-petpulse-text-secondary mb-1 block">Género</label>
            <div className="relative">
              <select value={gender} onChange={(e) => setGender(e.target.value)}
                className="w-full h-10 bg-white border border-petpulse-border rounded-xl pl-3 pr-9 text-sm text-petpulse-text focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow appearance-none">
                <option value="">Seleccionar</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMENINO">Femenino</option>
                <option value="OTRO">Otro</option>
              </select>
              <Icon icon="mdi:chevron-down" width={16} height={16} color="#7A9A7B" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-xs text-petpulse-text-secondary mb-1 block">Fecha de nacimiento</label>
            <input type="date" value={birth_date} onChange={(e) => setBirthDate(e.target.value)}
              className="w-full h-10 bg-white border border-petpulse-border rounded-xl px-3 text-sm text-petpulse-text focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow" />
          </div>
          <div className="flex gap-2 mt-2">
            <button type="submit" disabled={saving}
              className="flex-1 h-10 rounded-xl bg-petpulse-primary text-white text-sm font-semibold hover:bg-petpulse-primary-dark transition-colors disabled:opacity-60">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={() => setEditing(false)} disabled={saving}
              className="px-4 h-10 rounded-xl bg-white border border-petpulse-border text-petpulse-text text-sm font-semibold transition-colors disabled:opacity-60">
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="divide-y divide-petpulse-border">
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="w-10 h-10 rounded-full bg-petpulse-primary/15 flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:account-outline" width={20} height={20} className="text-petpulse-primary-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-petpulse-text-secondary">Nombre completo</p>
              <p className="text-sm text-petpulse-text">{user?.name_user}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="w-10 h-10 rounded-full bg-petpulse-primary/15 flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:email-outline" width={20} height={20} className="text-petpulse-primary-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-petpulse-text-secondary">Correo electrónico</p>
              <p className="text-sm text-petpulse-text">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="w-10 h-10 rounded-full bg-petpulse-primary/15 flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:gender-male-female" width={20} height={20} className="text-petpulse-primary-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-petpulse-text-secondary">Género</p>
              <p className="text-sm text-petpulse-text">{user?.gender ? (GENDER_LABEL[user.gender] ?? user.gender) : '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="w-10 h-10 rounded-full bg-petpulse-primary/15 flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:calendar-month-outline" width={20} height={20} className="text-petpulse-primary-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-petpulse-text-secondary">Fecha de nacimiento</p>
              <p className="text-sm text-petpulse-text">{formatBirthDate(user?.birth_date)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Contraseña (ForgotPassword style) ─── */
function PasswordCard() {
  const { updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const hasMinLength = password.length >= 8
  const hasLettersAndNumbers = /[a-zA-Z]/.test(password) && /[0-9]/.test(password)

  function startEditing() {
    setPassword('')
    setConfirmPassword('')
    setError('')
    setEditing(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!hasMinLength || !hasLettersAndNumbers) { setError('La contraseña no cumple los requisitos'); return }
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return }
    setError('')
    setSaving(true)
    try {
      await updateProfile({ password })
      setEditing(false)
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-petpulse-border">
      <div className="px-6 py-4 border-b border-petpulse-border flex items-center justify-between">
        <p className="font-bold text-sm text-petpulse-text">Contraseña</p>
        {!editing && (
          <button type="button" onClick={startEditing} className="text-petpulse-accent hover:opacity-80 transition-opacity">
            <Icon icon="mynaui:pencil" width={18} height={18} />
          </button>
        )}
      </div>

      {error && <p role="alert" className="text-petpulse-accent text-xs text-center pt-3">{error}</p>}

      {editing ? (
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div>
            <label htmlFor="profile-new-password" className="block text-[15px] font-semibold text-gray-700 mb-2">Nueva contraseña</label>
            <div className="relative">
              <Icon icon="mdi:lock-outline" width={20} height={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                id="profile-new-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-11 py-4 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#6B8C6C]/20 focus:border-[#6B8C6C] transition-all placeholder:text-gray-300 tracking-widest"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <Icon icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} width={20} height={20} />
              </button>
            </div>
            <div className="flex gap-4 mt-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-[11px] ${password.length === 0 ? 'text-[#7A7A7A]' : hasMinLength ? 'text-[#6B8C6C] font-semibold' : 'text-[#E07A5F] font-semibold'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${password.length === 0 ? 'bg-[#7A7A7A]' : hasMinLength ? 'bg-[#6B8C6C]' : 'bg-[#E07A5F]'}`} />
                Mínimo 8 caracteres
              </span>
              <span className={`inline-flex items-center gap-1.5 text-[11px] ${password.length === 0 ? 'text-[#7A7A7A]' : hasLettersAndNumbers ? 'text-[#6B8C6C] font-semibold' : 'text-[#E07A5F] font-semibold'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${password.length === 0 ? 'bg-[#7A7A7A]' : hasLettersAndNumbers ? 'bg-[#6B8C6C]' : 'bg-[#E07A5F]'}`} />
                Incluir números y letras
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="profile-confirm-password" className="block text-[15px] font-semibold text-gray-700 mb-2">Confirmar contraseña</label>
            <div className="relative">
              <Icon icon="mdi:lock-outline" width={20} height={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                id="profile-confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-11 py-4 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#6B8C6C]/20 focus:border-[#6B8C6C] transition-all placeholder:text-gray-300 tracking-widest"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <Icon icon={showConfirm ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} width={20} height={20} />
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <p className={`text-xs mt-1.5 font-semibold ${confirmPassword === password ? 'text-[#6B8C6C]' : 'text-[#E07A5F]'}`}>
                {confirmPassword === password ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
              </p>
            )}
          </div>

          <div className="flex gap-2 mt-1">
            <button type="submit" disabled={saving}
              className="flex-1 py-3.5 rounded-full bg-[#6B8C6C] hover:bg-[#5a7a5b] text-white font-medium text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Guardando...' : 'Guardar contraseña'}
            </button>
            <button type="button" onClick={() => setEditing(false)} disabled={saving}
              className="px-5 py-3.5 rounded-full bg-white border border-petpulse-border text-petpulse-text text-sm font-semibold transition-colors disabled:opacity-60">
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-4 px-6 py-4">
          <div className="w-10 h-10 rounded-full bg-petpulse-primary/15 flex items-center justify-center flex-shrink-0">
            <Icon icon="mdi:lock-outline" width={20} height={20} className="text-petpulse-primary-dark" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-petpulse-text-secondary">Contraseña</p>
            <p className="text-sm text-petpulse-text tracking-widest">••••••••••••</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileDesktop
