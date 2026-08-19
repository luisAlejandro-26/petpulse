import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'
import tituloLogo from '../../assets/titulo_logo.png'
import fondoInicio from '../../assets/fondo_inicio.png'

// Pantalla de registro: crea una cuenta nueva con validación de contraseña en tiempo real
function RegisterMobile() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name_user, setNameUser] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Validaciones de contraseña que se recalculan en cada tecleo, para pintar los indicadores en vivo
  const hasMinLength = password.length >= 8
  const hasLettersAndNumbers = /[a-zA-Z]/.test(password) && /[0-9]/.test(password)
  const [gender, setGender] = useState('')
  const [birth_date, setBirthDate] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false) 

  // Valida la contraseña antes de enviar (aunque los indicadores ya avisan en vivo) y crea la cuenta
  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!hasMinLength || !hasLettersAndNumbers) {
      setError('La contraseña debe tener mínimo 8 caracteres e incluir números y letras')
      return
    }

    setSubmitting(true)
    try {
      await register({ name_user, email, password, gender, birth_date })
      navigate('/register-success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="h-screen w-full bg-petpulse-bg flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[402px] h-screen overflow-hidden">
      <div className="h-full overflow-y-auto">

        <div className="flex-1">
          {/* ── Logo y encabezado ── */}
          <div className="flex flex-col items-center pt-5">
            <img src={logo} alt="Logo PetPulse" className="w-[70px] h-auto" />
            <img src={tituloLogo} alt="PetPulse" className="w-40 h-auto -mt-1" />
            <p className="font-encode-condensed text-petpulse-text text-xs text-center mt-0.5 leading-tight">
              Salud y bienestar para tus mascotas.
            </p>
          </div>

          <h2 className="font-encode-expanded font-bold text-2xl text-petpulse-primary-dark text-center mt-2">
            Regístrate
          </h2>

          {error && (
            <p role="alert" className="text-petpulse-accent text-sm text-center mt-2 px-8">
              {error}
            </p>
          )}

          {/* ── Formulario de registro ── */}
          <form onSubmit={handleSubmit} className="px-12 mt-4" noValidate>
            <label htmlFor="name_user" className="font-encode-expanded font-semibold text-sm text-petpulse-text block mb-1">
              Nombre y apellido
            </label>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-petpulse-text-secondary pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                </svg>
              </span>
              <input
                id="name_user"
                value={name_user}
                onChange={(e) => setNameUser(e.target.value)}
                required
                placeholder="Tu nombre y apellido"
                className="w-full h-[42px] bg-white border border-petpulse-border rounded-lg pl-9 pr-3 text-sm text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow"
              />
            </div>

            <label htmlFor="gender" className="font-encode-expanded font-semibold text-sm text-petpulse-text block mb-1">
              Sexo
            </label>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-petpulse-text-secondary pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="10" cy="14" r="5" />
                  <path d="M19 5l-5.4 5.4M19 5h-4M19 5v4" />
                </svg>
              </span>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="w-full h-[42px] bg-white border border-petpulse-border rounded-lg pl-9 pr-3 text-sm text-petpulse-text focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow appearance-none"
              >
                <option value="" disabled>Seleccionar</option>
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <label htmlFor="birth_date" className="font-encode-expanded font-semibold text-sm text-petpulse-text block mb-1">
              Edad
            </label>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-petpulse-text-secondary pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M3 10h18M8 3v4M16 3v4" />
                </svg>
              </span>
              <input
                id="birth_date"
                type="date"
                value={birth_date}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                placeholder="Tu edad"
                className="w-full h-[42px] bg-white border border-petpulse-border rounded-lg pl-9 pr-3 text-sm text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow"
              />
            </div>

            <label htmlFor="email" className="font-encode-expanded font-semibold text-sm text-petpulse-text block mb-1">
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
                className="w-full h-[42px] bg-white border border-petpulse-border rounded-lg pl-9 pr-3 text-sm text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow"
              />
            </div>

            <label htmlFor="password" className="font-encode-expanded font-semibold text-sm text-petpulse-text block mb-1">
              Contraseña
            </label>
            {/* Input de contraseña con validaciones en vivo y botón de ojito */}
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
                minLength={8}
                autoComplete="new-password"
                placeholder="••••••••••"
                className="w-full h-11 bg-white border border-petpulse-border rounded-lg pl-9 pr-10 text-sm text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow"
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
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {/* Indicadores en vivo de las reglas de contraseña (se pintan de verde cuando se cumplen) */}
            <div className="flex items-center gap-4 mt-1 mb-5">
              <span className={`flex items-center gap-1 text-[11px] transition-colors ${
                hasMinLength ? 'text-petpulse-primary' : 'text-petpulse-accent'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  hasMinLength ? 'bg-petpulse-primary' : 'bg-petpulse-accent'
                }`} />
                Mínimo 8 Caracteres
              </span>
              <span className={`flex items-center gap-1 text-[11px] transition-colors ${
                hasLettersAndNumbers ? 'text-petpulse-primary' : 'text-petpulse-accent'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  hasLettersAndNumbers ? 'bg-petpulse-primary' : 'bg-petpulse-accent'
                }`} />
                Incluir números y letras
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[51px] bg-petpulse-primary hover:bg-petpulse-primary-dark active:scale-[0.98] text-white font-encode-semi font-bold text-lg rounded-full transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <p className="font-encode-semi text-sm text-center mt-6 px-8">
            <span className="text-black/60">¿Ya tienes cuenta? </span>
            <Link to="/login" className="font-bold text-petpulse-accent">
              Inicia Sesión
            </Link>
          </p>
        </div>

        {/* Imagen decorativa al final del flujo (no es absolute aquí: fluye después del formulario) */}
        <img src={fondoInicio} alt="" className="w-full h-auto block" aria-hidden="true" />

      </div>
      </div>
    </div>
  )
}

export default RegisterMobile