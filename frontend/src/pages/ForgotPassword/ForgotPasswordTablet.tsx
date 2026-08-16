import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { api, ApiError } from '../../api/client'
import logo from '../../assets/logo.png'
import tituloLogo from '../../assets/titulo_logo.png'
import fondoInicio from '../../assets/fondo_inicio.png'

type Step = 'email' | 'code' | 'password' | 'success'

function ForgotPasswordTablet() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [progress, setProgress] = useState(0)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const REDIRECT_MS = 2500

  useEffect(() => {
    if (step !== 'success') return
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      setProgress(Math.min((elapsed / REDIRECT_MS) * 100, 100))
    }, 30)
    const timer = setTimeout(() => navigate('/login'), REDIRECT_MS)
    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [step, navigate])

  async function handleEmailSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post('/api/auth/forgot-password', { email })
      setStep('code')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo enviar el codigo')
    } finally {
      setSubmitting(false)
    }
  }

  function handleCodeSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (code.length !== 6) {
      setError('El codigo debe tener 6 digitos')
      return
    }
    setStep('password')
  }

  async function handleResend() {
    setError('')
    setSubmitting(true)
    try {
      await api.post('/api/auth/forgot-password', { email })
      setNotice('Te reenviamos el codigo a tu correo')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo reenviar el codigo')
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (newPassword.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Las contrasenas no coinciden')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/api/auth/reset-password', { email, code, new_password: newPassword })
      setStep('success')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo restablecer la contrasena')
    } finally {
      setSubmitting(false)
    }
  }

  function goBack() {
    setError('')
    setNotice('')
    if (step === 'code') setStep('email')
    else if (step === 'password') setStep('code')
    else navigate('/login')
  }

  const isWide = step === 'success'
  const inputClass =
    'w-full box-border font-inter text-[15px] py-[13px] px-4 rounded-full border-[1.5px] border-petpulse-border bg-petpulse-bg text-petpulse-text transition-colors placeholder:text-petpulse-text-secondary focus:outline-none focus:border-petpulse-primary focus:ring-[3px] focus:ring-[rgba(122,154,123,0.18)] focus:bg-petpulse-card'

  return (
    <div className="min-h-screen bg-petpulse-bg font-inter text-petpulse-text flex flex-col items-center pt-10 px-6 box-border">
      <div className={`w-full flex flex-col items-center ${isWide ? 'max-w-[604px]' : 'max-w-[440px]'}`}>
        <div className="flex flex-col items-center text-center mb-6">
          <img src={logo} alt="" className={`h-auto mb-2 ${isWide ? 'w-[92px]' : 'w-[72px]'}`} />
          <img src={tituloLogo} alt="PetPulse" className={`w-auto mb-2 ${isWide ? 'h-10' : 'h-8'}`} />
          <p className="text-sm text-petpulse-text-secondary">Salud y bienestar para tus mascotas.</p>
        </div>

        <div className="flex items-start justify-center gap-7 mb-8 w-full">
          <div className="flex flex-col items-center text-center w-[108px]">
            <span className="w-11 h-11 rounded-full bg-petpulse-primary flex items-center justify-center mb-2">
              <Icon icon="mdi:shield-check-outline" width={18} height={18} color="#faf9f6" />
            </span>
            <p className="text-[13px] font-semibold text-petpulse-text mb-0.5">Seguridad</p>
            <p className="text-[11px] text-petpulse-text-secondary leading-[1.4]">
              Protegemos la informacion de tus mascotas
            </p>
          </div>
          <span className="w-px h-10 bg-petpulse-border self-center shrink-0" aria-hidden="true" />
          <div className="flex flex-col items-center text-center w-[108px]">
            <span className="w-11 h-11 rounded-full bg-petpulse-primary flex items-center justify-center mb-2">
              <Icon icon="mdi:heart-outline" width={18} height={18} color="#faf9f6" />
            </span>
            <p className="text-[13px] font-semibold text-petpulse-text mb-0.5">Bienestar</p>
            <p className="text-[11px] text-petpulse-text-secondary leading-[1.4]">
              Promovemos una vida saludable y feliz
            </p>
          </div>
          <span className="w-px h-10 bg-petpulse-border self-center shrink-0" aria-hidden="true" />
          <div className="flex flex-col items-center text-center w-[108px]">
            <span className="w-11 h-11 rounded-full bg-petpulse-primary flex items-center justify-center mb-2">
              <Icon icon="mdi:calendar-month-outline" width={18} height={18} color="#faf9f6" />
            </span>
            <p className="text-[13px] font-semibold text-petpulse-text mb-0.5">Recordatorios</p>
            <p className="text-[11px] text-petpulse-text-secondary leading-[1.4]">
              Nunca olvides citas, vacunas y tratamientos
            </p>
          </div>
        </div>

        <div
          className={`relative text-center box-border bg-petpulse-card px-6 py-8 ${
            isWide
              ? 'w-[536px] max-w-full mx-auto rounded-xl border border-petpulse-border shadow-[0_20px_44px_-28px_rgba(47,62,50,0.18)]'
              : 'w-full rounded-3xl shadow-[0_24px_48px_-28px_rgba(47,62,50,0.25)]'
          }`}
        >
          {step !== 'success' && (
            <button
              type="button"
              className="absolute top-5 left-5 bg-transparent border-0 cursor-pointer text-petpulse-text flex items-center justify-center p-1 hover:text-petpulse-primary"
              onClick={goBack}
              aria-label="Volver"
            >
              <Icon icon="mdi:arrow-left" width={20} height={20} />
            </button>
          )}

          <h1 className="font-poppins font-bold text-xl text-petpulse-primary mb-6 leading-[1.3]">
            {step === 'success' ? 'Recuperacion exitosa, ya puedes iniciar sesion' : 'Recuperar contrasena'}
          </h1>

          {step === 'email' && (
            <>
              <div className="w-16 h-16 rounded-full bg-petpulse-primary flex items-center justify-center mx-auto mb-5">
                <Icon icon="mdi:email-outline" width={28} height={28} color="#faf9f6" />
              </div>
              <h2 className="font-poppins font-bold text-lg text-petpulse-text mb-2">Encuentra tu cuenta</h2>
              <p className="text-sm text-petpulse-text-secondary leading-relaxed mb-6">
                Ingresa tu direccion de correo electronico y te ayudaremos a recuperar tu cuenta.
              </p>

              {error && (
                <p
                  className="text-[13px] px-4 py-3 rounded-[14px] mb-5 text-center bg-[#fbe9e5] text-petpulse-accent border border-[#f2cec3]"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <form onSubmit={handleEmailSubmit}>
                <div className="mb-5 text-left">
                  <label className="block text-[13px] font-semibold text-petpulse-text mb-2" htmlFor="fp-email">
                    Correo electronico
                  </label>
                  <input
                    id="fp-email"
                    className={inputClass}
                    type="email"
                    placeholder="ejemplo@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <button
                  className="w-full font-inter text-base font-bold text-white bg-petpulse-primary border-none rounded-full py-[15px] cursor-pointer transition-colors enabled:hover:bg-petpulse-primary-dark enabled:active:scale-[0.99] disabled:bg-petpulse-border disabled:cursor-not-allowed"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Enviando...' : 'Continuar'}
                </button>
              </form>

              <p className="text-center mt-6 mb-0 text-sm">
                ¿Recordaste tu contrasena?{' '}
                <Link className="text-petpulse-accent font-bold no-underline hover:underline" to="/login">
                  Inicia sesion
                </Link>
              </p>
            </>
          )}

          {step === 'code' && (
            <>
              <div className="w-16 h-16 rounded-full bg-petpulse-primary flex items-center justify-center mx-auto mb-5">
                <Icon icon="mdi:email-outline" width={28} height={28} color="#faf9f6" />
              </div>
              <h2 className="font-poppins font-bold text-lg text-petpulse-text mb-2">Confirma tu cuenta</h2>
              <p className="text-sm text-petpulse-text-secondary leading-relaxed mb-6">
                Ingresa el codigo que enviamos a <strong className="text-petpulse-text">{email}</strong> para
                confirmar tu cuenta.
              </p>

              {notice && !error && (
                <p
                  className="text-[13px] px-4 py-3 rounded-[14px] mb-5 text-center bg-[#eef4ee] text-petpulse-primary-dark border border-[#d3e2d3]"
                  role="status"
                >
                  {notice}
                </p>
              )}
              {error && (
                <p
                  className="text-[13px] px-4 py-3 rounded-[14px] mb-5 text-center bg-[#fbe9e5] text-petpulse-accent border border-[#f2cec3]"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <form onSubmit={handleCodeSubmit}>
                <div className="mb-5 text-left">
                  <label className="block text-[13px] font-semibold text-petpulse-text mb-2" htmlFor="fp-code">
                    Ingresa codigo de recuperacion
                  </label>
                  <input
                    id="fp-code"
                    className={inputClass}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
                <button
                  className="w-full font-inter text-base font-bold text-white bg-petpulse-primary border-none rounded-full py-[15px] cursor-pointer transition-colors enabled:hover:bg-petpulse-primary-dark enabled:active:scale-[0.99] disabled:bg-petpulse-border disabled:cursor-not-allowed"
                  type="submit"
                  disabled={submitting}
                >
                  Continuar
                </button>
              </form>

              <button
                type="button"
                className="block w-full text-center bg-transparent border-0 cursor-pointer font-inter text-[13px] font-semibold text-petpulse-accent mt-5 p-0 enabled:hover:underline disabled:text-petpulse-text-secondary disabled:cursor-not-allowed"
                onClick={handleResend}
                disabled={submitting}
              >
                ¿No has recibido el codigo?
              </button>
            </>
          )}

          {step === 'password' && (
            <>
              <div className="w-16 h-16 rounded-full bg-petpulse-primary flex items-center justify-center mx-auto mb-5">
                <Icon icon="mdi:lock-outline" width={26} height={26} color="#faf9f6" />
              </div>
              <h2 className="font-poppins font-bold text-lg text-petpulse-text mb-2">Crea una contrasena nueva</h2>
              <p className="text-sm text-petpulse-text-secondary leading-relaxed mb-6">
                Ingresa una contrasena nueva que tenga al menos 8 caracteres.
              </p>

              {error && (
                <p
                  className="text-[13px] px-4 py-3 rounded-[14px] mb-5 text-center bg-[#fbe9e5] text-petpulse-accent border border-[#f2cec3]"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-5 text-left">
                  <label className="block text-[13px] font-semibold text-petpulse-text mb-2" htmlFor="fp-new-password">
                    Nueva contrasena
                  </label>
                  <input
                    id="fp-new-password"
                    className={inputClass}
                    type="password"
                    placeholder="********"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>

                <div className="mb-5 text-left">
                  <label
                    className="block text-[13px] font-semibold text-petpulse-text mb-2"
                    htmlFor="fp-confirm-password"
                  >
                    Confirmar contrasena
                  </label>
                  <input
                    id="fp-confirm-password"
                    className={inputClass}
                    type="password"
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  {confirmPassword.length > 0 && (
                    <p
                      className={`text-[13px] mt-2 mb-0 font-semibold ${
                        confirmPassword === newPassword ? 'text-petpulse-primary' : 'text-petpulse-accent'
                      }`}
                    >
                      {confirmPassword === newPassword
                        ? 'Las contrasenas coinciden'
                        : 'Las contrasenas no coinciden'}
                    </p>
                  )}
                </div>

                <button
                  className="w-full font-inter text-base font-bold text-white bg-petpulse-primary border-none rounded-full py-[15px] cursor-pointer transition-colors enabled:hover:bg-petpulse-primary-dark enabled:active:scale-[0.99] disabled:bg-petpulse-border disabled:cursor-not-allowed"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Guardando...' : 'Continuar'}
                </button>
              </form>
            </>
          )}

          {step === 'success' && (
            <>
              <div className="flex justify-center mb-5" role="status" aria-live="polite">
                <svg width="150" height="172" viewBox="0 0 120 138" fill="none" aria-hidden="true">
                  <path
                    d="M60 6 L110 24 V66 C110 100 90 122 60 133 C30 122 10 100 10 66 V24 Z"
                    stroke="#7a9a7b"
                    strokeWidth="7"
                    fill="none"
                    strokeLinejoin="round"
                    className="[stroke-dasharray:400] [stroke-dashoffset:400] [animation:draw-shield_0.7s_ease-out_forwards] motion-reduce:[animation:none] motion-reduce:[stroke-dashoffset:0]"
                  />
                  <path
                    d="M39 68 L54 83 L83 50"
                    stroke="#7a9a7b"
                    strokeWidth="7"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="[stroke-dasharray:65] [stroke-dashoffset:65] [animation:draw-check_0.4s_ease-out_0.6s_forwards] motion-reduce:[animation:none] motion-reduce:[stroke-dashoffset:0]"
                  />
                </svg>
              </div>
              <p className="text-sm text-petpulse-text-secondary mb-5">Espera un momento para redirigirte al inicio.</p>
              <div className="w-40 h-1.5 bg-petpulse-border rounded-full overflow-hidden mx-auto">
                <div
                  className="h-full bg-petpulse-primary rounded-full transition-[width] duration-75 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <img src={fondoInicio} alt="" className="w-screen h-auto mt-auto pt-8 block object-cover" />
    </div>
  )
}

export default ForgotPasswordTablet