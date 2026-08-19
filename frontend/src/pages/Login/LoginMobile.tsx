import { useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import GoogleAuth, { type GoogleAuthHandle } from '../../components/GoogleAuth'
import logo from '../../assets/logo.png'
import tituloLogo from '../../assets/titulo_logo.png'
import fondoInicio from '../../assets/fondo_inicio.png'

// Pantalla de inicio de sesión: login con email/contraseña o con Google (GoogleAuth)
function LoginMobile() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const registered = (location.state as { registered?: boolean } | null)?.registered // viene true si el usuario acaba de registrarse (RegisterSuccessMobile redirige aquí)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false) // controla el ojito de mostrar/ocultar contraseña
  const googleRef = useRef<GoogleAuthHandle>(null) // referencia al componente GoogleAuth para disparar el login desde nuestro propio botón

  // El botón visual de Google no hace el login directo: delega en GoogleAuth vía la ref
  function handleGoogleClick() {
    googleRef.current?.signIn()
  }

  // Login con email/contraseña: valida formato mínimo, llama al AuthContext y redirige al dashboard
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
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-petpulse-bg flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[402px] min-h-screen">

        {/* Contenido con padding inferior para dejar espacio a la imagen */}
        <div className="pb-40">
          {/* ── Logo y encabezado ── */}
          <div className="flex flex-col items-center pt-6">
            <img src={logo} alt="Logo PetPulse" className="w-24 h-auto" />
            <img src={tituloLogo} alt="PetPulse" className="w-48 h-auto -mt-2" />
            <p className="font-encode-condensed text-petpulse-text text-sm text-center mt-1 leading-tight">
              Salud y bienestar para tus mascotas.
            </p>
          </div>

          <h2 className="font-inter font-bold text-[26px] text-petpulse-primary text-center mt-6">
            Inicia sesión
          </h2>

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

          {/* ── Formulario de login ── */}
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
            {/* Input de contraseña con botón de ojito para mostrar/ocultar el texto */}
            <div className="relative mb-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-petpulse-text-secondary pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••••"
                className="w-full h-[44px] bg-white border border-petpulse-border rounded-lg pl-9 pr-10 text-sm text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-petpulse-text-secondary"
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

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

          {/* ── Login alternativo con Google ── */}
          <div className="flex items-center gap-3 px-[55px] mt-6">
            <div className="flex-1 h-px bg-petpulse-border" />
            <span className="font-inter font-bold text-xs text-petpulse-text-secondary">o continuar con</span>
            <div className="flex-1 h-px bg-petpulse-border" />
          </div>

          <div className="px-[55px] mt-5">
            <button
              type="button"
              onClick={handleGoogleClick}
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
            {/* GoogleAuth no renderiza nada visible; solo maneja el flujo OAuth cuando handleGoogleClick lo dispara */}
            <GoogleAuth ref={googleRef} onError={setError} />
          </div>
        </div>

        {/* ── Pie de pantalla: link a registro + imagen decorativa, fijos abajo (absolute) ── */}
        <div className="absolute bottom-0 left-0 w-full">
          <p className="font-encode-semi text-sm text-petpulse-text text-center px-8 mb-2">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-bold text-petpulse-accent">
              Regístrate
            </Link>
          </p>
          <img src={fondoInicio} alt="" className="w-full h-auto block" aria-hidden="true" />
        </div>

      </div>
    </div>
  )
}

export default LoginMobile