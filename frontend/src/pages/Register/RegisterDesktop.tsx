import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { RegisterDTO } from '../../api/types'
import { User, Users, Calendar, Mail, Lock, Eye, EyeOff, ShieldCheck, Heart } from 'lucide-react'

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
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setSubmitting(false)
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
          {/* Tarjeta flotante: ancho máximo de 480px, altura automática */}
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 w-full max-w-[480px] p-10 sm:p-12 flex flex-col max-h-[calc(100vh-4rem)] overflow-y-auto">

            {/* Encabezado centrado */}
            <div className="mb-8 text-center">
              <h2 className="text-[28px] font-bold text-[#6B8C6C]">
                Regístrate
              </h2>
              <p className="text-sm text-[#7A7A7A] mt-1.5">
                Crea tu cuenta para comenzar
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Fila 1: Nombre / Apellido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-[#7A7A7A] mb-1.5">
                    Nombre
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      id="firstName"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8C6C]/20 focus:border-[#6B8C6C] transition-all placeholder:text-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-[#7A7A7A] mb-1.5">
                    Apellido
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Tu apellido"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8C6C]/20 focus:border-[#6B8C6C] transition-all placeholder:text-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* Fila 2: Sexo */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-[#7A7A7A] mb-1.5">
                  Sexo
                </label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8C6C]/20 focus:border-[#6B8C6C] transition-all ${gender ? 'text-gray-700' : 'text-gray-400'}`}
                  >
                    <option value="" disabled>
                      Seleccionar
                    </option>
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              {/* Fila 3: Fecha de nacimiento */}
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-[#7A7A7A] mb-1.5">
                  Fecha de nacimiento
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
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

              {/* Fila 4: Correo electrónico */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#7A7A7A] mb-1.5">
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
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8C6C]/20 focus:border-[#6B8C6C] transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* Fila 5: Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#7A7A7A] mb-1.5">
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
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8C6C]/20 focus:border-[#6B8C6C] transition-all placeholder:text-gray-300 tracking-widest"
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

                {/* Lista de validación de contraseña */}
                <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#6B8C6C] shrink-0" />
                    <span className="text-xs text-[#7A7A7A]">Mínimo 8 Caracteres</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#6B8C6C] shrink-0" />
                    <span className="text-xs text-[#7A7A7A]">Incluir números y letras</span>
                  </div>
                </div>
              </div>

              {/* Botón Primario */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-full bg-[#6B8C6C] hover:bg-[#5a7a5b] text-white font-medium text-base transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>

            {/* Botón Google (mantenido separado, sin divisor) */}
            <button
              type="button"
              className="w-full py-3.5 mt-6 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-[15px] font-medium text-gray-700 flex items-center justify-center gap-3 transition-colors shadow-sm"
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
