import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { RegisterDTO } from '../../api/types'
import { Icon } from '@iconify/react'
import GoogleAuth, { type GoogleAuthHandle } from '../../components/GoogleAuth'

interface RegisterDesktopProps {
  onNavigateToLogin?: () => void
}

function RegisterDesktop({ onNavigateToLogin }: RegisterDesktopProps) {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [gender, setGender] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const googleRef = useRef<GoogleAuthHandle>(null)

  const hasMinLength = password.length >= 8
  const hasLettersAndNumbers = /[a-zA-Z]/.test(password) && /[0-9]/.test(password)

  function handleGoogleClick() {
    setError('')
    googleRef.current?.signIn()
  }

  function goToLogin() {
    if (onNavigateToLogin) {
      onNavigateToLogin()
    } else {
      navigate('/login')
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!hasMinLength || !hasLettersAndNumbers) {
      setError('La contraseña debe tener mínimo 8 caracteres e incluir números y letras')
      return
    }

    setSubmitting(true)
    try {
      const payload: RegisterDTO = {
        name_user: `${name} ${lastName}`.trim(),
        email,
        password,
        gender,
        birth_date: birthDate,
      }
      await register(payload)
      navigate('/register-success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setSubmitting(false)
    }
  }

  function inputClass(hasValue: boolean) {
    return `w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8C6C]/20 focus:border-[#6B8C6C] transition-all placeholder:text-gray-300 ${hasValue ? 'text-gray-700' : 'text-gray-400'}`
  }

  return (
    <div className="min-h-screen w-full bg-white flex p-6">
      <div className="m-auto w-full max-w-[1500px] flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">

        {/* Columna Izquierda */}
        <div className="hidden lg:flex flex-col items-center text-center w-full lg:w-1/2">
          <div className="w-40 mb-6">
            <img src="/assets/logo.svg" alt="Logo PetPulse" className="w-full h-auto object-contain" />
          </div>
          <div className="mb-8">
            <h1 className="text-5xl font-black tracking-widest text-[#5A7A5F] uppercase">PETPULSE</h1>
            <p className="text-gray-500 mt-3 text-lg">Salud y bienestar para tus mascotas.</p>
          </div>
          <div className="w-full max-w-[760px] mb-10">
            <img src="/assets/banner.svg" alt="Ilustración de mascotas" className="w-full h-auto object-contain" />
          </div>
          <div className="flex w-full justify-center items-start divide-x divide-gray-200">
            <div className="flex-1 flex flex-col items-center text-center px-5">
              <Icon icon="mdi:shield-check-outline" width={36} height={36} className="text-[#5A7A5F] mb-3" />
              <p className="font-bold text-gray-800 text-base">Seguridad</p>
              <p className="text-sm text-gray-500 mt-1 max-w-[180px]">Protegemos la información de tus mascotas</p>
            </div>
            <div className="flex-1 flex flex-col items-center text-center px-5">
              <Icon icon="mdi:heart-outline" width={36} height={36} className="text-[#5A7A5F] mb-3" />
              <p className="font-bold text-gray-800 text-base">Bienestar</p>
              <p className="text-sm text-gray-500 mt-1 max-w-[180px]">Promovemos una vida saludable y feliz</p>
            </div>
            <div className="flex-1 flex flex-col items-center text-center px-5">
              <Icon icon="mdi:calendar-month-outline" width={36} height={36} className="text-[#5A7A5F] mb-3" />
              <p className="font-bold text-gray-800 text-base">Recordatorios</p>
              <p className="text-sm text-gray-500 mt-1 max-w-[180px]">Nunca olvides citas, vacunas y tratamientos</p>
            </div>
          </div>
        </div>

        {/* Columna Derecha */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 w-full max-w-[480px] p-10 sm:p-12 flex flex-col max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="mb-8 text-center">
              <h2 className="text-[28px] font-bold text-[#6B8C6C]">Regístrate</h2>
              <p className="text-sm text-[#7A7A7A] mt-1.5">Crea tu cuenta para comenzar</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-[#7A7A7A] mb-1.5">Nombre</label>
                  <div className="relative">
                    <Icon icon="mdi:account-outline" width={20} height={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      id="firstName"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      required
                      className={inputClass(!!name)}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-[#7A7A7A] mb-1.5">Apellido</label>
                  <div className="relative">
                    <Icon icon="mdi:account-outline" width={20} height={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Tu apellido"
                      required
                      className={inputClass(!!lastName)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-[#7A7A7A] mb-1.5">Sexo</label>
                <div className="relative">
                  <Icon icon="mdi:account-outline" width={20} height={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8C6C]/20 focus:border-[#6B8C6C] transition-all ${gender ? 'text-gray-700' : 'text-gray-400'}`}
                  >
                    <option value="" disabled>Seleccionar</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-[#7A7A7A] mb-1.5">Fecha de nacimiento</label>
                <div className="relative">
                  <Icon icon="mdi:calendar-month-outline" width={20} height={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8C6C]/20 focus:border-[#6B8C6C] transition-all text-gray-700"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#7A7A7A] mb-1.5">Correo electrónico</label>
                <div className="relative">
                  <Icon icon="mdi:email-outline" width={20} height={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@gmail.com"
                    required
                    className={inputClass(!!email)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#7A7A7A] mb-1.5">Contraseña</label>
                <div className="relative">
                  <Icon icon="mdi:lock-outline" width={20} height={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8C6C]/20 focus:border-[#6B8C6C] transition-all placeholder:text-gray-300 tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    <Icon icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} width={20} height={20} />
                  </button>
                </div>

                <div className="flex gap-4 mt-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] ${
                    password.length === 0
                      ? 'text-[#7A7A7A]'
                      : hasMinLength
                        ? 'text-[#6B8C6C] font-semibold'
                        : 'text-[#E07A5F] font-semibold'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      password.length === 0
                        ? 'bg-[#7A7A7A]'
                        : hasMinLength
                          ? 'bg-[#6B8C6C]'
                          : 'bg-[#E07A5F]'
                    }`} />
                    Mínimo 8 Caracteres
                  </span>
                  <span className={`inline-flex items-center gap-1.5 text-[11px] ${
                    password.length === 0
                      ? 'text-[#7A7A7A]'
                      : hasLettersAndNumbers
                        ? 'text-[#6B8C6C] font-semibold'
                        : 'text-[#E07A5F] font-semibold'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      password.length === 0
                        ? 'bg-[#7A7A7A]'
                        : hasLettersAndNumbers
                          ? 'bg-[#6B8C6C]'
                          : 'bg-[#E07A5F]'
                    }`} />
                    Incluir números y letras
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-full bg-[#6B8C6C] hover:bg-[#5a7a5b] text-white font-medium text-base transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>

            <button
              type="button"
              onClick={handleGoogleClick}
              className="w-full py-3.5 mt-6 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-[15px] font-medium text-gray-700 flex items-center justify-center gap-3 transition-colors shadow-sm"
            >
              <Icon icon="logos:google-icon" width={20} height={20} />
              Continuar con Google
            </button>
            <GoogleAuth ref={googleRef} onError={setError} />

            <p className="text-center text-sm text-[#7A7A7A] mt-8">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={goToLogin}
                className="text-[#E07A5F] hover:text-[#c96a52] font-semibold transition-colors"
              >
                Inicia sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterDesktop
