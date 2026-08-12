import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { LoginDTO } from '../../api/types'
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Heart, Calendar } from 'lucide-react'

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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
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
    // Contenedor principal: Ocupa toda la pantalla, fondo blanco, centra el contenido
    <div className="min-h-screen w-full bg-white flex p-6">

      {/* Contenedor Flex que divide la pantalla en 2 columnas con un ancho máximo */}
      <div className="m-auto w-full max-w-[1500px] flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        
        {/* ── Columna Izquierda: Branding e Ilustración ── */}
        <div className="hidden lg:flex flex-col items-center text-center w-full lg:w-1/2">
          
          {/* Logo sin bordes raros ni tamaños forzados */}
          <div className="w-40 mb-6">
            <img
              src="/assets/logo.svg"
              alt="Logo PetPulse"
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Títulos */}
          <div className="mb-8">
            <h1 className="text-5xl font-black tracking-widest text-[#5A7A5F] uppercase">
              PETPULSE
            </h1>
            <p className="text-gray-500 mt-3 text-lg">
              Salud y bienestar para tus mascotas.
            </p>
          </div>

          {/* Ilustración: Se ajusta al ancho automáticamente */}
          <div className="w-full max-w-[760px] mb-10">
            <img
              src="/assets/banner.svg"
              alt="Ilustración de mascotas"
              className="w-full h-auto object-contain"
            />
          </div>

          {/* 3 Pilares Inferiores */}
          <div className="flex w-full justify-center items-start divide-x divide-gray-200">
            {/* Seguridad */}
            <div className="flex-1 flex flex-col items-center text-center px-5">
              <ShieldCheck className="w-9 h-9 text-[#5A7A5F] mb-3" />
              <p className="font-bold text-gray-800 text-base">Seguridad</p>
              <p className="text-sm text-gray-500 mt-1 max-w-[180px]">
                Protegemos la información de tus mascotas
              </p>
            </div>

            {/* Bienestar */}
            <div className="flex-1 flex flex-col items-center text-center px-5">
              <Heart className="w-9 h-9 text-[#5A7A5F] mb-3" />
              <p className="font-bold text-gray-800 text-base">Bienestar</p>
              <p className="text-sm text-gray-500 mt-1 max-w-[180px]">
                Promovemos una vida saludable y feliz
              </p>
            </div>

            {/* Recordatorios */}
            <div className="flex-1 flex flex-col items-center text-center px-5">
              <Calendar className="w-9 h-9 text-[#5A7A5F] mb-3" />
              <p className="font-bold text-gray-800 text-base">Recordatorios</p>
              <p className="text-sm text-gray-500 mt-1 max-w-[180px]">
                Nunca olvides citas, vacunas y tratamientos
              </p>
            </div>
          </div>
        </div>

        {/* ── Columna Derecha: Tarjeta de Formulario ── */}
        <div className="w-full lg:w-1/2 flex justify-center">
          {/* Tarjeta flotante: ancho máximo de 520px, altura automática */}
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 w-full max-w-[520px] p-10 sm:p-14 flex flex-col max-h-[calc(100vh-4rem)] overflow-y-auto">
            
            {/* Encabezado centrado */}
            <div className="mb-10 text-center">
              <h2 className="text-[32px] font-bold text-[#5A7A5F]">
                Inicia sesión
              </h2>
              <p className="text-base text-gray-500 mt-2">
                Accede a tu cuenta para continuar
              </p>
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
              {/* Campo Correo Electrónico */}
              <div>
                <label htmlFor="email" className="block text-[15px] font-semibold text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
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

              {/* Campo Contraseña */}
              <div>
                <label htmlFor="password" className="block text-[15px] font-semibold text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
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
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Olvidaste tu contraseña */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  className="text-sm text-[#E76F51] font-medium hover:underline transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Botón Primario */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 mt-2 rounded-full bg-[#6B8E70] hover:bg-[#5A7A5F] text-white font-medium text-base transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Entrando...' : 'Iniciar Sesión'}
              </button>
            </form>

            {/* Divisor */}
            <div className="flex items-center gap-3 my-8">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-sm text-gray-400 whitespace-nowrap">o continuar con</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Botón Google */}
            <button
              type="button"
              className="w-full py-4 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-[15px] font-medium text-gray-700 flex items-center justify-center gap-3 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continuar con Google
            </button>

            {/* Footer */}
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