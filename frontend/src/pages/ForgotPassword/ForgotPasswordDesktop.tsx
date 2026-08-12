import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, ApiError } from '../../api/client'
import type { ForgotPasswordDTO, VerifyCodeDTO, ResetPasswordDTO } from '../../api/types'
import { Mail, Lock, Eye, EyeOff, KeyRound, ShieldCheck, Heart, Calendar, ArrowLeft } from 'lucide-react'

type Step = 'email' | 'code' | 'password' | 'success'

const RESEND_COOLDOWN = 30

function ForgotPasswordDesktop() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  useEffect(() => {
    if (step !== 'success') return
    const timer = setTimeout(() => navigate('/login'), 2500)
    return () => clearTimeout(timer)
  }, [step, navigate])

  useEffect(() => {
    if (step !== 'code') return
    setResendCountdown(RESEND_COOLDOWN)
    const interval = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [step])

  async function handleEmailSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setNotice('')
    setSubmitting(true)
    try {
      const payload: ForgotPasswordDTO = { email }
      await api.post('/api/auth/forgot-password', payload)
      setStep('code')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo enviar el código')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCodeSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos')
      return
    }
    setSubmitting(true)
    try {
      const payload: VerifyCodeDTO = { email, code }
      await api.post('/api/auth/verify-code', payload)
      setStep('password')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'El código es incorrecto')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend() {
    setError('')
    setNotice('')
    setSubmitting(true)
    try {
      const payload: ForgotPasswordDTO = { email }
      await api.post('/api/auth/forgot-password', payload)
      setNotice('Código reenviado')
      setResendCountdown(RESEND_COOLDOWN)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo reenviar el código')
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    setSubmitting(true)
    try {
      const payload: ResetPasswordDTO = { email, code, new_password: newPassword }
      await api.post('/api/auth/reset-password', payload)
      setStep('success')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo restablecer la contraseña')
    } finally {
      setSubmitting(false)
    }
  }

  function goBack() {
    if (step === 'code') {
      setStep('email')
    } else if (step === 'password') {
      setStep('code')
    } else {
      navigate('/login')
    }
  }

  const stepContent = {
    email: {
      icon: Mail,
      title: 'Encuentra tu cuenta',
      description: 'Ingresa tu correo electrónico y te enviaremos un código de recuperación.',
    },
    code: {
      icon: KeyRound,
      title: 'Confirma tu cuenta',
      description: `Ingresa el código de 6 dígitos que enviamos a ${email || 'tu correo'}.`,
    },
    password: {
      icon: Lock,
      title: 'Crea una contraseña nueva',
      description: 'La contraseña debe tener al menos 8 caracteres.',
    },
    success: {
      icon: ShieldCheck,
      title: 'Recuperación exitosa',
      description: 'Ya puedes iniciar sesión con tu nueva contraseña.',
    },
  }

  const StepIcon = stepContent[step].icon

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
          {/* Tarjeta flotante: ancho máximo de 560px, altura automática */}
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 w-full max-w-[560px] p-10 sm:p-14 flex flex-col max-h-[calc(100vh-4rem)] overflow-y-auto">

            {/* Botón Volver */}
            {step !== 'success' && (
              <div className="flex justify-start mb-6">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-1.5 text-sm text-[#7A7A7A] hover:text-[#6B8C6C] font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </button>
              </div>
            )}

            {/* Encabezado centrado */}
            <div className="mb-8 text-center">
              <h2 className="text-[28px] font-bold text-[#6B8C6C]">
                {step === 'success' ? 'Recuperación exitosa' : 'Recuperar contraseña'}
              </h2>
              {step === 'success' ? (
                <p className="text-base text-gray-500 mt-2">
                  Ya puedes iniciar sesión
                </p>
              ) : (
                <p className="text-base text-gray-500 mt-2">
                  Recupera el acceso a tu cuenta en unos pasos
                </p>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            {notice && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm text-center">
                {notice}
              </div>
            )}

            {step === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#6B8C6C]/10 flex items-center justify-center mb-4">
                    <StepIcon className="w-8 h-8 text-[#6B8C6C]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">{stepContent.email.title}</h3>
                  <p className="text-sm text-gray-500 mt-1.5 max-w-[340px]">
                    {stepContent.email.description}
                  </p>
                </div>

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
                      className="w-full pl-11 pr-4 py-4 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#6B8C6C]/20 focus:border-[#6B8C6C] transition-all placeholder:text-gray-300"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 mt-2 rounded-full bg-[#6B8C6C] hover:bg-[#5a7a5b] text-white font-medium text-base transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Enviando...' : 'Enviar código'}
                </button>

                <p className="text-center text-sm text-gray-500">
                  ¿Recordaste tu contraseña?{' '}
                  <Link to="/login" className="text-[#E07A5F] hover:underline font-semibold transition-colors">
                    Inicia sesión
                  </Link>
                </p>
              </form>
            )}

            {step === 'code' && (
              <form onSubmit={handleCodeSubmit} className="space-y-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#6B8C6C]/10 flex items-center justify-center mb-4">
                    <StepIcon className="w-8 h-8 text-[#6B8C6C]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">{stepContent.code.title}</h3>
                  <p className="text-sm text-gray-500 mt-1.5 max-w-[340px]">
                    {stepContent.code.description}
                  </p>
                </div>

                <div>
                  <label htmlFor="code" className="block text-[15px] font-semibold text-gray-700 mb-2">
                    Código de recuperación
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      id="code"
                      inputMode="numeric"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      maxLength={6}
                      required
                      className="w-full pl-11 pr-4 py-4 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#6B8C6C]/20 focus:border-[#6B8C6C] transition-all placeholder:text-gray-300 tracking-widest text-center"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 mt-2 rounded-full bg-[#6B8C6C] hover:bg-[#5a7a5b] text-white font-medium text-base transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Verificando...' : 'Verificar'}
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCountdown > 0 || submitting}
                  className="w-full text-center text-sm text-[#E07A5F] hover:text-[#c96a52] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-[#E07A5F]"
                >
                  {resendCountdown > 0
                    ? `Reenviar código en ${resendCountdown}s`
                    : submitting
                      ? 'Reenviando...'
                      : '¿No has recibido el código? Reenviar'}
                </button>
              </form>
            )}

            {step === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#6B8C6C]/10 flex items-center justify-center mb-4">
                    <StepIcon className="w-8 h-8 text-[#6B8C6C]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">{stepContent.password.title}</h3>
                  <p className="text-sm text-gray-500 mt-1.5 max-w-[340px]">
                    {stepContent.password.description}
                  </p>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-[15px] font-semibold text-gray-700 mb-2">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="w-full pl-11 pr-11 py-4 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#6B8C6C]/20 focus:border-[#6B8C6C] transition-all placeholder:text-gray-300 tracking-widest"
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 mt-2 rounded-full bg-[#6B8C6C] hover:bg-[#5a7a5b] text-white font-medium text-base transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Guardando...' : 'Restablecer contraseña'}
                </button>
              </form>
            )}

            {step === 'success' && (
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-[#6B8C6C]/10 flex items-center justify-center mb-5">
                  <ShieldCheck className="w-10 h-10 text-[#6B8C6C]" />
                </div>
                <p className="text-lg font-semibold text-gray-800">
                  {stepContent.success.title}
                </p>
                <p className="text-sm text-gray-500 mt-1.5 max-w-[340px]">
                  {stepContent.success.description}
                </p>
                <p className="text-sm text-[#7A7A7A] mt-4">
                  Serás redirigido al inicio de sesión...
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full py-4 mt-8 rounded-full bg-[#6B8C6C] hover:bg-[#5a7a5b] text-white font-medium text-base transition-all shadow-sm"
                >
                  Ir a iniciar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordDesktop
