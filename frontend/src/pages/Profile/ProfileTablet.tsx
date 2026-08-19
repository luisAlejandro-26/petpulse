import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Icon } from '@iconify/react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { uploadProfileImage } from '../../api/upload'
import { getPets } from '../../api/pets'
import logo from '../../assets/logo.png'

const GENDER_LABEL: Record<string, string> = {
  MASCULINO: 'Masculino',
  FEMENINO: 'Femenino',
  OTRO: 'Otro',
}

const TIPS = [
  { icon: 'mdi:lock-outline', label: 'Usa contraseñas seguras que usen números, letras y símbolos' },
  { icon: 'mdi:email-outline', label: 'Mantén tu correo electrónico actualizado para recuperarlo' },
  { icon: 'mdi:heart-outline', label: 'Esto nos ayuda a brindarte la mejor experiencia' },
]

// Calcula la edad en años a partir de la fecha de nacimiento del usuario.
function calculateAge(birthDate?: string): number | null {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    years--
  }
  return years
}

// Formatea la fecha de nacimiento a texto legible ("11 de julio de 2009").
function formatBirthDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' })
}

// Saca las iniciales del nombre para el avatar cuando no hay foto
// (ej. "Carolina Zapata" -> "CZ").
function getInitials(name?: string) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const second = parts[1]?.[0] ?? ''
  return (first + second).toUpperCase()
}

// Pantalla de Mi perfil para Tablet: card resumen + Informacion personal
// (editable) + Contraseña (editable por separado) + Consejos de seguridad.
function ProfileTablet() {
  const { user, token, updateProfile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  // editingInfo y changingPassword son independientes: se puede editar
  // el nombre/fecha sin tocar la contraseña, y viceversa.
  const [editingInfo, setEditingInfo] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [petsCount, setPetsCount] = useState<number | null>(null)

  // Copias editables de los datos del usuario (se llenan al empezar a
  // editar, no se tocan los datos reales hasta guardar).
  const [name_user, setNameUser] = useState(user?.name_user ?? '')
  const [gender, setGender] = useState(user?.gender ?? '')
  const [birth_date, setBirthDate] = useState(user?.birth_date?.split('T')[0] ?? '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Trae la cantidad de mascotas del usuario, para mostrarla en la card resumen.
  useEffect(() => {
    if (!token) return
    getPets(token)
      .then((pets) => setPetsCount(pets.length))
      .catch(() => setPetsCount(null))
  }, [token])

  // Copia los datos actuales del usuario a los campos editables y
  // activa el modo edicion de la card "Informacion personal".
  function startEditingInfo() {
    setNameUser(user?.name_user ?? '')
    setGender(user?.gender ?? '')
    setBirthDate(user?.birth_date?.split('T')[0] ?? '')
    setPhotoFile(null)
    setPhotoPreview(null)
    setError('')
    setEditingInfo(true)
  }

  // Guarda el archivo elegido y genera una vista previa local.
  function handlePickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  // Guarda nombre/genero/fecha de nacimiento (y sube la foto nueva si
  // hay una) llamando a updateProfile del contexto de autenticacion.
  async function handleSaveInfo(e: FormEvent) {
    e.preventDefault()
    if (!name_user.trim()) {
      setError('El nombre no puede estar vacío')
      return
    }
    if (!token) return

    setError('')
    setSaving(true)
    try {
      let profile_image_url: string | undefined
      if (photoFile) {
        profile_image_url = await uploadProfileImage(photoFile, token)
      }

      await updateProfile({
        name_user: name_user.trim(),
        gender: gender || undefined,
        birth_date: birth_date || undefined,
        profile_image_url,
      })
      setEditingInfo(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el perfil')
    } finally {
      setSaving(false)
    }
  }

  // Cambia la contraseña, validando primero que las dos coincidan.
  async function handleSavePassword(e: FormEvent) {
    e.preventDefault()
    if (!password || password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    setError('')
    setSaving(true)
    try {
      await updateProfile({ password })
      setPassword('')
      setConfirmPassword('')
      setChangingPassword(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar la contraseña')
    } finally {
      setSaving(false)
    }
  }

  const avatarSrc = photoPreview ?? user?.profile_image_url ?? null
  const age = calculateAge(user?.birth_date)

  const fieldInputClass =
    'flex-1 h-[42px] bg-petpulse-bg border border-petpulse-border rounded-lg px-3 text-sm text-petpulse-text focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow'

  const navItemClass = (path: string) =>
    `flex flex-col items-center gap-[3px] no-underline text-[11px] font-semibold px-4 py-2 rounded-[14px] transition-colors hover:bg-[#eaf0ea] hover:text-petpulse-primary-dark ${
      isActive(path) ? 'bg-[#eaf0ea] text-petpulse-primary-dark' : 'text-petpulse-text-secondary'
    }`

  return (
    <div className="min-h-screen bg-petpulse-bg font-inter text-petpulse-text box-border pb-28 *:box-border">
      <div className="w-full max-w-[1100px] mx-auto px-6 pt-8 flex flex-col gap-4">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Volver"
              className="w-10 h-10 rounded-full border border-petpulse-border bg-petpulse-card text-petpulse-text flex items-center justify-center cursor-pointer transition-colors hover:bg-[#eaf0ea]"
            >
              <Icon icon="mdi:arrow-left" width={20} height={20} />
            </button>
            <img src={logo} alt="" className="w-[84px] h-auto shrink-0" />
            <div>
              <p className="font-poppins font-bold text-xl text-petpulse-primary m-0 tracking-[0.02em]">PETPULSE</p>
              <p className="text-[11px] text-petpulse-text-secondary m-0 leading-[1.3] max-w-[180px]">
                Salud y bienestar para tus mascotas.
              </p>
            </div>
          </div>

          <div className="flex-1 min-w-[220px] text-center">
            <h1 className="font-poppins font-bold text-xl text-petpulse-primary m-0 inline-flex items-center gap-1.5">
              Mi perfil
              <Icon icon="mdi:paw" width={18} height={18} className="text-petpulse-primary" />
            </h1>
            <p className="text-[13px] text-petpulse-text-secondary mt-0.5 mb-0">Actualiza tu información personal</p>
          </div>
        </header>

        {error && (
          <p role="alert" className="text-[13px] px-4 py-3 rounded-[14px] text-center bg-[#fbe9e5] text-petpulse-accent border border-[#f2cec3]">
            {error}
          </p>
        )}

        {/* Card 1: resumen */}
        <div className="w-full bg-petpulse-card border border-petpulse-border rounded-[20px] shadow-[0_20px_44px_-28px_rgba(47,62,50,0.18)] px-6 py-6">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="relative shrink-0">
              <div className="w-[92px] h-[92px] rounded-full bg-[#eaf0ea] flex items-center justify-center overflow-hidden">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-poppins font-bold text-2xl text-petpulse-primary">
                    {getInitials(user?.name_user)}
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePickImage}
              />
              <button
                type="button"
                onClick={() => {
                  if (!editingInfo) startEditingInfo()
                  fileInputRef.current?.click()
                }}
                aria-label="Cambiar foto"
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-petpulse-primary border-2 border-petpulse-card flex items-center justify-center hover:bg-petpulse-primary-dark transition-colors"
              >
                <Icon icon="mynaui:pencil" width={12} height={12} color="white" />
              </button>
            </div>

            <div className="flex-1 min-w-[200px]">
              <p className="font-poppins font-bold text-xl text-petpulse-text m-0">{user?.name_user}</p>
              <div className="flex flex-col gap-1 mt-2 text-sm">
                <p className="m-0">
                  <span className="font-semibold text-petpulse-text">Edad: </span>
                  <span className="text-petpulse-primary-dark">{age !== null ? `${age} años` : '—'}</span>
                </p>
                <p className="m-0">
                  <span className="font-semibold text-petpulse-text">Correo Electrónico: </span>
                  <span className="text-petpulse-primary-dark">{user?.email}</span>
                </p>
                <p className="m-0">
                  <span className="font-semibold text-petpulse-text">Mascotas: </span>
                  <span className="text-petpulse-primary-dark">{petsCount ?? '—'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: informacion personal */}
        <form
          onSubmit={handleSaveInfo}
          className="w-full bg-petpulse-card border border-petpulse-border rounded-[20px] shadow-[0_20px_44px_-28px_rgba(47,62,50,0.18)] overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-petpulse-border">
            <h2 className="font-poppins font-bold text-sm text-petpulse-text m-0">Información personal</h2>
            {!editingInfo && (
              <button type="button" onClick={startEditingInfo} aria-label="Editar información personal" className="text-petpulse-accent">
                <Icon icon="mynaui:pencil" width={17} height={17} />
              </button>
            )}
          </div>

          <div className="divide-y divide-petpulse-border">
            <div className="flex items-center gap-3 px-6 py-4">
              <span className="w-9 h-9 rounded-full bg-[#eaf0ea] text-petpulse-primary flex items-center justify-center shrink-0">
                <Icon icon="mdi:account-outline" width={18} height={18} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-xs text-petpulse-text-secondary m-0">Nombre completo</p>
                {editingInfo ? (
                  <input
                    value={name_user}
                    onChange={(e) => setNameUser(e.target.value)}
                    required
                    className={`${fieldInputClass} h-9 mt-1`}
                  />
                ) : (
                  <p className="font-poppins font-bold text-sm text-petpulse-primary-dark m-0">{user?.name_user}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-4">
              <span className="w-9 h-9 rounded-full bg-[#eaf0ea] text-petpulse-primary flex items-center justify-center shrink-0">
                <Icon icon="mdi:email-outline" width={18} height={18} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-xs text-petpulse-text-secondary m-0">Correo electrónico</p>
                <p className="font-poppins font-bold text-sm text-petpulse-primary-dark m-0">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-4">
              <span className="w-9 h-9 rounded-full bg-[#eaf0ea] text-petpulse-primary flex items-center justify-center shrink-0">
                <Icon icon="mdi:gender-male-female" width={18} height={18} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-xs text-petpulse-text-secondary m-0">Género</p>
                {editingInfo ? (
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={`${fieldInputClass} h-9 mt-1 cursor-pointer`}
                  >
                    <option value="">Seleccionar</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                    <option value="OTRO">Otro</option>
                  </select>
                ) : (
                  <p className="font-poppins font-bold text-sm text-petpulse-primary-dark m-0">
                    {user?.gender ? (GENDER_LABEL[user.gender] ?? user.gender) : '—'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-4">
              <span className="w-9 h-9 rounded-full bg-[#eaf0ea] text-petpulse-primary flex items-center justify-center shrink-0">
                <Icon icon="mdi:calendar-month-outline" width={18} height={18} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-xs text-petpulse-text-secondary m-0">Fecha de nacimiento</p>
                {editingInfo ? (
                  <input
                    type="date"
                    value={birth_date}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className={`${fieldInputClass} h-9 mt-1`}
                  />
                ) : (
                  <p className="font-poppins font-bold text-sm text-petpulse-primary-dark m-0">
                    {formatBirthDate(user?.birth_date)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {editingInfo && (
            <div className="flex gap-3 px-6 py-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 h-10 bg-petpulse-primary hover:bg-petpulse-primary-dark active:scale-[0.98] text-white font-inter font-bold text-sm rounded-full transition-all disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button
                type="button"
                onClick={() => setEditingInfo(false)}
                disabled={saving}
                className="flex-1 h-10 bg-petpulse-bg border border-petpulse-border text-petpulse-text font-inter font-bold text-sm rounded-full transition-all active:scale-[0.98]"
              >
                Cancelar
              </button>
            </div>
          )}
        </form>

        {/* Card 3: contraseña */}
        <form
          onSubmit={handleSavePassword}
          className="w-full bg-petpulse-card border border-petpulse-border rounded-[20px] shadow-[0_20px_44px_-28px_rgba(47,62,50,0.18)] overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-petpulse-border">
            <h2 className="font-poppins font-bold text-sm text-petpulse-text m-0">Contraseña</h2>
            {!changingPassword && (
              <button
                type="button"
                onClick={() => setChangingPassword(true)}
                aria-label="Cambiar contraseña"
                className="text-petpulse-accent"
              >
                <Icon icon="mynaui:pencil" width={17} height={17} />
              </button>
            )}
          </div>

          <div className="px-6 py-4">
            {!changingPassword ? (
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-[#eaf0ea] text-petpulse-primary flex items-center justify-center shrink-0">
                  <Icon icon="mdi:lock-outline" width={18} height={18} />
                </span>
                <div>
                  <p className="font-inter text-xs text-petpulse-text-secondary m-0">Contraseña</p>
                  <p className="font-poppins font-bold text-sm text-petpulse-primary-dark m-0 tracking-widest">••••••••••</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-w-[420px]">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-[#eaf0ea] text-petpulse-primary flex items-center justify-center shrink-0">
                    <Icon icon="mdi:lock-outline" width={18} height={18} />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nueva contraseña"
                    className={fieldInputClass}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-[#eaf0ea] text-petpulse-primary flex items-center justify-center shrink-0">
                    <Icon icon="mdi:lock-check-outline" width={18} height={18} />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma nueva contraseña"
                    className={fieldInputClass}
                  />
                </div>
                <div className="flex gap-3 mt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 h-10 bg-petpulse-primary hover:bg-petpulse-primary-dark active:scale-[0.98] text-white font-inter font-bold text-sm rounded-full transition-all disabled:opacity-60"
                  >
                    {saving ? 'Guardando...' : 'Guardar contraseña'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChangingPassword(false)
                      setPassword('')
                      setConfirmPassword('')
                    }}
                    disabled={saving}
                    className="flex-1 h-10 bg-petpulse-bg border border-petpulse-border text-petpulse-text font-inter font-bold text-sm rounded-full transition-all active:scale-[0.98]"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Botones sueltos, fuera de las cards */}
        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center gap-2 bg-petpulse-card border border-petpulse-accent text-petpulse-accent font-inter font-bold text-sm rounded-full px-5 py-2.5 transition-all hover:bg-[#fbe9e5] active:scale-[0.98]"
          >
            <Icon icon="mdi:logout" width={16} height={16} />
            Cerrar sesión
          </button>
          <a
            href="https://luisalejandro-26.github.io/blog-sistemas-informaci-n-I/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-petpulse-card border border-petpulse-border text-petpulse-text font-inter font-bold text-sm rounded-full px-5 py-2.5 no-underline transition-colors hover:bg-[#eaf0ea]"
          >
            <Icon icon="mdi:information-outline" width={16} height={16} />
            Sobre nosotros
          </a>
        </div>

        {/* Tira de Consejos de seguridad */}
        <div className="bg-petpulse-card border border-petpulse-border rounded-[20px] px-6 py-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:shield-check-outline" width={20} height={20} className="text-petpulse-primary" />
            <span className="font-poppins font-bold text-sm text-petpulse-text">Consejos de seguridad</span>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            {TIPS.map((tip) => (
              <div key={tip.label} className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-full bg-[#eaf0ea] text-petpulse-primary flex items-center justify-center shrink-0">
                  <Icon icon={tip.icon} width={18} height={18} />
                </span>
                <span className="text-xs text-petpulse-text-secondary leading-tight max-w-[180px]">{tip.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nav inferior */}
      <nav className="fixed bottom-4 left-0 right-0 flex justify-center px-5 z-10" aria-label="Navegación principal">
        <div className="w-full max-w-[620px] bg-petpulse-card border border-petpulse-border rounded-[20px] shadow-[0_16px_32px_-18px_rgba(47,62,50,0.3)] flex items-center justify-around px-3 py-2">
          <Link to="/dashboard" className={navItemClass('/dashboard')}>
            <Icon icon="mdi:home-outline" width={22} height={22} />
            <span>Inicio</span>
          </Link>
          <Link to="/calendar" className={navItemClass('/calendar')}>
            <Icon icon="mdi:calendar-month-outline" width={22} height={22} />
            <span>Calendario</span>
          </Link>
          <Link to="/pet-ia" className={navItemClass('/pet-ia')}>
            <Icon icon="mdi:paw-outline" width={22} height={22} />
            <span>PetIA</span>
          </Link>
          <Link to="/profile" className={navItemClass('/profile')}>
            <Icon icon="mdi:account-outline" width={22} height={22} />
            <span>Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}

export default ProfileTablet