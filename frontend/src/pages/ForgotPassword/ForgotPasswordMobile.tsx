import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, ApiError } from '../../api/client'
import logo from '../../assets/logo.png'
import tituloLogo from '../../assets/titulo_logo.png'
import fondoInicio from '../../assets/fondo_inicio.png'

type Step = 'request' | 'reset'

function ForgotPasswordMobile() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const hasMinLength = newPassword.length >= 8
  const hasLettersAndNumbers = /[a-zA-Z]/.test(newPassword) && /[0-9]/.test(newPassword)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleRequestCode(event: FormEvent) {
    event.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)
    try {
      await api.post('/api/auth/forgot-password', { email })
      setInfo('Si el correo existe, te enviamos un código.')
      setStep('reset')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo enviar el código')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResetPassword(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!hasMinLength || !hasLettersAndNumbers) {
      setError('La contraseña debe tener mínimo 8 caracteres e incluir números y letras')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/api/auth/reset-password', { email, code, new_password: newPassword })
      navigate('/reset-password-success')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo restablecer la contraseña')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-petpulse-bg flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[402px] min-h-screen flex flex-col">

        <div className="flex-1">
          {/* Logo */}
          <div className="flex flex-col items-center pt-6">
            <img src={logo} alt="Logo PetPulse" className="w-[70px] h-auto" />
            <img src={tituloLogo} alt="PetPulse" className="w-40 h-auto -mt-1" />
            <p className="font-encode-condensed text-petpulse-text text-xs text-center mt-0.5 leading-tight">
              Salud y bienestar para tus mascotas.
            </p>
          </div>

          {step === 'request' ? (
            <>
              {/* Título */}
              <h2 className="font-encode-expanded font-bold text-2xl text-petpulse-primary text-center mt-6">
                Recuperar contraseña
              </h2>
              <p className="font-encode-condensed text-petpulse-text-secondary text-sm text-center mt-1 px-10 leading-tight">
                Te ayudaremos a recuperar el acceso a tu cuenta
              </p>

              {/* Ícono sobre con huella */}
              <div className="flex justify-center mt-6">
                <div className="w-24 h-24 rounded-full bg-petpulse-primary/20 flex items-center justify-center">
                  <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
                    <rect x="3" y="10" width="40" height="28" rx="3" fill="#7A9A7B" />
                    <path d="M3 12 L23 27 L43 12" stroke="#FAF9F6" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <g transform="translate(15, 6) scale(0.55)">
                      <ellipse cx="15" cy="18" rx="9" ry="7" fill="#E07A5F" />
                      <ellipse cx="7" cy="8" rx="3.2" ry="4" fill="#E07A5F" />
                      <ellipse cx="15" cy="4" rx="3.2" ry="4" fill="#E07A5F" />
                      <ellipse cx="23" cy="8" rx="3.2" ry="4" fill="#E07A5F" />
                    </g>
                  </svg>
                </div>
              </div>

              <h3 className="font-encode-semi font-bold text-base text-petpulse-text text-center mt-4">
                Encuentra tu cuenta
              </h3>
              <p className="font-encode-condensed text-petpulse-text-secondary text-xs text-center mt-1 px-10 leading-tight">
                Ingresa tu dirección de correo electrónico y te ayudaremos a restablecer tu contraseña
              </p>

              {error && (
                <p role="alert" className="text-petpulse-accent text-sm text-center mt-3 px-8">
                  {error}
                </p>
              )}

              <form onSubmit={handleRequestCode} className="px-[55px] mt-5" noValidate>
                <label htmlFor="email" className="font-encode-condensed font-semibold text-sm text-petpulse-text block mb-1">
                  Correo electrónico
                </label>
                <div className="relative mb-5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-petpulse-text-secondary pointer-events-none">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M2 6l10 7 10-7" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="ejemplo@gmail.com"
                    className="w-full h-[44px] bg-white border border-petpulse-border rounded-lg pl-9 pr-3 text-sm text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-[51px] bg-petpulse-primary hover:bg-petpulse-primary-dark active:scale-[0.98] text-white font-encode-semi font-bold text-base rounded-full transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Enviando...' : 'Continuar'}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Paso 2: código + nueva contraseña */}
              <h2 className="font-encode-expanded font-bold text-2xl text-petpulse-primary text-center mt-6">
                Ingresa el código
              </h2>
              <p className="font-encode-condensed text-petpulse-text-secondary text-sm text-center mt-1 px-10 leading-tight">
                Revisa tu correo, te enviamos un código de 6 dígitos
              </p>

              {info && !error && (
                <p role="status" className="text-petpulse-primary text-sm text-center mt-3 px-8">
                  {info}
                </p>
              )}
              {error && (
                <p role="alert" className="text-petpulse-accent text-sm text-center mt-3 px-8">
                  {error}
                </p>
              )}

              <form onSubmit={handleResetPassword} className="px-[55px] mt-5" noValidate>
                <label htmlFor="code" className="font-encode-condensed font-semibold text-sm text-petpulse-text block mb-1">
                  Código de verificación
                </label>
                <input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  required
                  placeholder="000000"
                  className="w-full h-[44px] bg-white border border-petpulse-border rounded-lg px-3 text-center text-lg tracking-[0.5em] text-petpulse-text placeholder:tracking-normal placeholder:text-petpulse-text-secondary focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow mb-4"
                />

                <label htmlFor="newPassword" className="font-encode-condensed font-semibold text-sm text-petpulse-text block mb-1">
                  Nueva contraseña
                </label>
                <div className="relative mb-4">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-petpulse-text-secondary pointer-events-none">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                  </span>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="••••••••••"
                    className="w-full h-[44px] bg-white border border-petpulse-border rounded-lg pl-9 pr-3 text-sm text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow"
                  />
                </div>
                <div className="flex items-center gap-3 mt-1 mb-4">
                  <span className={`flex items-center gap-1 text-[10px] whitespace-nowrap transition-colors ${
                    hasMinLength ? 'text-petpulse-primary' : 'text-petpulse-accent'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
                      hasMinLength ? 'bg-petpulse-primary' : 'bg-petpulse-accent'
                    }`} />
                    Mínimo 8 Caracteres
                  </span>
                  <span className={`flex items-center gap-1 text-[10px] whitespace-nowrap transition-colors ${
                    hasLettersAndNumbers ? 'text-petpulse-primary' : 'text-petpulse-accent'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
                      hasLettersAndNumbers ? 'bg-petpulse-primary' : 'bg-petpulse-accent'
                    }`} />
                    Incluir números y letras
                  </span>
                </div>
                <label htmlFor="confirmPassword" className="font-encode-condensed font-semibold text-sm text-petpulse-text block mb-1">
                  Confirmar contraseña
                </label>
                <div className="relative mb-5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-petpulse-text-secondary pointer-events-none">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                  </span>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="••••••••••"
                    className="w-full h-[44px] bg-white border border-petpulse-border rounded-lg pl-9 pr-3 text-sm text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-[51px] bg-petpulse-primary hover:bg-petpulse-primary-dark active:scale-[0.98] text-white font-encode-semi font-bold text-base rounded-full transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Guardando...' : 'Restablecer contraseña'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="w-full text-center mt-3 font-encode-semi text-sm text-petpulse-text-secondary"
                >
                  ¿No recibiste el código? Volver a intentar
                </button>
              </form>
            </>
          )}
        </div>

        <div className="pb-2 mt-6">
          <p className="font-encode-semi text-sm text-center px-8">
            <span className="text-black/60">¿Recordaste tu contraseña? </span>
            <Link to="/login" className="font-bold text-petpulse-accent">
              Inicia sesión
            </Link>
          </p>
        </div>

        <img src={fondoInicio} alt="" className="w-full h-auto block" aria-hidden="true" />
      </div>
    </div>
  )
}

export default ForgotPasswordMobile