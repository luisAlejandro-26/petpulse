import { useRef, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { LoginDTO } from '../../api/types'
import { Icon } from '@iconify/react'
import GoogleAuth, { type GoogleAuthHandle } from '../../components/GoogleAuth'

interface LoginDesktopProps {
  onNavigateToRegister?: () => void
}

function LoginDesktop({ onNavigateToRegister }: LoginDesktopProps) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const registered = (location.state as { registered?: boolean } | null)?.registered

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const googleRef = useRef<GoogleAuthHandle>(null)

  function handleGoogleClick() {
    googleRef.current?.signIn()
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!email.includes('@')) {
      setError('Ingresa un correo electrónico válido')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setSubmitting(true)
    try {
      const credentials: LoginDTO = { email, password }
      await login(credentials.email, credentials.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setSubmitting(false)
    }
  }

  function goToRegister() {
    if (onNavigateToRegister) {
      onNavigateToRegister()
    } else {
      navigate('/register')
    }
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
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 w-full max-w-[520px] p-10 sm:p-14 flex flex-col max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="mb-10 text-center">
              <h2 className="text-[32px] font-bold text-[#5A7A5F]">Inicia sesión</h2>
              <p className="text-base text-gray-500 mt-2">Accede a tu cuenta para continuar</p>
            </div>

            {registered && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm text-center">
                Registro exitoso. Inicia sesión para continuar.
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-[15px] font-semibold text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Icon icon="mdi:email-outline" width={20} height={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@gmail.com"
                    required
                    className="w-full pl-11 pr-4 py-4 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#5A7A5F]/20 focus:border-[#5A7A5F] transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-[15px] font-semibold text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Icon icon="mdi:lock-outline" width={20} height={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-11 pr-11 py-4 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#5A7A5F]/20 focus:border-[#5A7A5F] transition-all placeholder:text-gray-300 tracking-widest"
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
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-[#E76F51] font-medium hover:underline transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 mt-2 rounded-full bg-[#6B8E70] hover:bg-[#5A7A5F] text-white font-medium text-base transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Entrando...' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-8">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-sm text-gray-400 whitespace-nowrap">o continuar con</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <button
              type="button"
              onClick={handleGoogleClick}
              className="w-full py-4 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-[15px] font-medium text-gray-700 flex items-center justify-center gap-3 transition-colors shadow-sm"
            >
              <Icon icon="logos:google-icon" width={20} height={20} />
              Continuar con Google
            </button>
            <GoogleAuth ref={googleRef} onError={setError} />

            <p className="text-center text-sm text-gray-500 mt-10">
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={goToRegister}
                className="text-[#E76F51] hover:underline font-semibold transition-colors"
              >
                Regístrate
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginDesktop
