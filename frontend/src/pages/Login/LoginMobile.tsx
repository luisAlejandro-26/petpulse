import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function LoginMobile() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const registered = (location.state as { registered?: boolean } | null)?.registered
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    // Prevención de errores (ley de usabilidad)
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
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-petpulse-bg flex justify-center">
      <div className="relative w-full max-w-[402px] min-h-screen pb-8">

        {/* Logo con huella y corazón */}
        <div className="flex flex-col items-center pt-6">
          <svg width="90" height="70" viewBox="0 0 90 70" fill="none" role="img" aria-label="Logo PetPulse">
            <ellipse cx="45" cy="42" rx="20" ry="16" fill="#7A9A7B" />
            <ellipse cx="27" cy="24" rx="7" ry="9" fill="#7A9A7B" />
            <ellipse cx="45" cy="16" rx="7" ry="9" fill="#7A9A7B" />
            <ellipse cx="63" cy="24" rx="7" ry="9" fill="#7A9A7B" />
            <path d="M45 34 C42 30 35 30 35 37 C35 43 45 50 45 50 C45 50 55 43 55 37 C55 30 48 30 45 34 Z" fill="#FAF9F6" />
          </svg>
          <svg width="220" height="14" viewBox="0 0 220 14" fill="none" className="-mt-1">
            <path d="M0 7 H80 L88 1 L96 13 L104 3 L110 7 H220" stroke="#E07A5F" strokeWidth="1.5" fill="none" />
          </svg>
          <h1 className="font-inter font-bold text-[26px] text-petpulse-primary-dark tracking-wide -mt-1">
            PETPULSE
          </h1>
          <p className="font-encode-condensed text-petpulse-text text-sm text-center mt-0.5 leading-tight">
            Salud y bienestar para tus mascotas.
          </p>
        </div>

        {/* Inicia sesión */}
        <h2 className="font-inter font-bold text-[26px] text-petpulse-primary text-center mt-6">
          Inicia sesión
        </h2>

        {/* Visibilidad del estado del sistema */}
        {registered && (
          <p role="status" className="text-petpulse-primary text-sm text-center mt-3 px-8">
            Registro exitoso, inicia sesión
          </p>
        )}
        {error && (
          <p role="alert" className="text-petpulse-accent text-sm text-center mt-3 px-8">
            {error}
          </p>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-[55px] mt-7" noValidate>
          <label htmlFor="email" className="font-encode-condensed font-semibold text-base text-petpulse-text block mb-1">
            Correo Electrónico
          </label>
          <div className="relative mb-4">
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

          <label htmlFor="password" className="font-encode-condensed font-semibold text-base text-petpulse-text block mb-1">
            Contraseña
          </label>
          <div className="relative mb-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-petpulse-text-secondary pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </span>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••••"
              className="w-full h-[44px] bg-white border border-petpulse-border rounded-lg pl-9 pr-3 text-sm text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow"
            />
          </div>

          {/* Ley de Fitts: botón grande y fácil de tocar */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-[51px] bg-petpulse-primary hover:bg-petpulse-primary-dark active:scale-[0.98] text-white font-encode-semi font-bold text-base rounded-full mt-6 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Entrando...' : 'Iniciar Sesión'}
          </button>

          <div className="text-center mt-4">
            <Link to="/forgot-password" className="font-encode-semi font-bold text-base text-petpulse-accent">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>

        {/* Separador */}
        <div className="flex items-center gap-3 px-[55px] mt-6">
          <div className="flex-1 h-px bg-petpulse-border" />
          <span className="font-inter font-bold text-xs text-petpulse-text-secondary">o continuar con</span>
          <div className="flex-1 h-px bg-petpulse-border" />
        </div>

        {/* Google - consistencia con estándares */}
        <div className="px-[55px] mt-5">
          <button
            type="button"
            className="w-full h-11 bg-petpulse-google-bg border border-petpulse-border rounded-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0012 23z" />
              <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 015.5 12c0-.73.13-1.43.34-2.09V7.06H2.18A11 11 0 001 12c0 1.77.43 3.45 1.18 4.94l3.66-2.85z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 00-9.82 6.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="font-encode-expanded text-sm text-black">Iniciar Sesión con Google</span>
          </button>
        </div>

        {/* Ilustración de animalitos */}
        <div className="mt-8 relative h-24 overflow-hidden" aria-hidden="true">
          <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="xMidYMax slice">
            <ellipse cx="200" cy="90" rx="220" ry="40" fill="#E8E6DD" />
            <ellipse cx="30" cy="70" rx="6" ry="8" fill="#B7C6B7" opacity="0.6" />
            <ellipse cx="370" cy="65" rx="6" ry="8" fill="#B7C6B7" opacity="0.6" />
            <path d="M60 95 Q60 60 75 55 Q90 60 90 95 Z" fill="#8FAE8F" />
            <path d="M300 95 Q300 65 315 60 Q330 65 330 95 Z" fill="#8FAE8F" />
            <ellipse cx="160" cy="70" rx="26" ry="30" fill="#8FAE8F" />
            <circle cx="160" cy="52" r="16" fill="#8FAE8F" />
            <ellipse cx="152" cy="46" rx="4" ry="6" fill="#8FAE8F" />
            <ellipse cx="168" cy="46" rx="4" ry="6" fill="#8FAE8F" />
            <ellipse cx="230" cy="75" rx="22" ry="25" fill="#A9BFA9" />
            <circle cx="230" cy="58" r="14" fill="#A9BFA9" />
            <path d="M219 48 L216 40 L224 46 Z" fill="#A9BFA9" />
            <path d="M241 48 L244 40 L236 46 Z" fill="#A9BFA9" />
            <path d="M215 40 Q220 35 225 40" stroke="#E07A5F" strokeWidth="2" fill="none" />
          </svg>
        </div>

        {/* Registro */}
        <p className="font-encode-semi text-sm text-petpulse-text text-center px-8">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-bold text-petpulse-accent">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginMobile