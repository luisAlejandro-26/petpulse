import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './RegisterTablet.module.css'
import logo from '../../assets/logo.png'
import tituloLogo from '../../assets/titulo_logo.png'
import fondoInicio from '../../assets/fondo_inicio.png'

function RegisterTablet() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [gender, setGender] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const hasMinLength = password.length >= 8
  const hasLettersAndNumbers = /[a-zA-Z]/.test(password) && /[0-9]/.test(password)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setInfo('')

    if (!hasMinLength || !hasLettersAndNumbers) {
      setError('La contrasena debe tener minimo 8 caracteres, con numeros y letras')
      return
    }

    setSubmitting(true)
    try {
      await register({
        name_user: `${nombre.trim()} ${apellido.trim()}`.trim(),
        email,
        password,
        gender,
        birth_date: birthDate,
      })
      navigate('/register-success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setSubmitting(false)
    }
  }

  function handleGoogleClick() {
    setError('')
    setInfo('Registro con Google estara disponible proximamente')
  }

  return (
    <div className={styles.page}>
      <Link to="/login" className={styles.backBtn} aria-label="Volver a iniciar sesion">
        <ArrowLeftIcon />
      </Link>

      <div className={styles.container}>
        <div className={styles.logoWrap}>
          <img src={logo} alt="" className={styles.logoIcon} />
          <img src={tituloLogo} alt="PetPulse" className={styles.brandImg} />
          <p className={styles.tagline}>Salud y bienestar para tus mascotas.</p>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>
              <ShieldIcon />
            </span>
            <p className={styles.featureTitle}>Seguridad</p>
            <p className={styles.featureCaption}>Protegemos la informacion de tus mascotas</p>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>
              <HeartIcon />
            </span>
            <p className={styles.featureTitle}>Bienestar</p>
            <p className={styles.featureCaption}>Promovemos una vida saludable y feliz</p>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>
              <CalendarIcon />
            </span>
            <p className={styles.featureTitle}>Recordatorios</p>
            <p className={styles.featureCaption}>Nunca olvides citas, vacunas y tratamientos</p>
          </div>
        </div>

        <div className={styles.card}>
          <h1 className={styles.cardHeading}>Registrate</h1>
          <p className={styles.cardSubtitle}>Crea tu cuenta para comenzar</p>

          {error && (
            <p className={styles.alert} role="alert">
              {error}
            </p>
          )}
          {info && !error && (
            <p className={styles.info} role="status">
              {info}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="reg-nombre">
                  Nombre
                </label>
                <div className={styles.inputWrap}>
                  <UserIcon className={styles.inputIcon} />
                  <input
                    id="reg-nombre"
                    className={styles.input}
                    placeholder="Tu nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="reg-apellido">
                  Apellido
                </label>
                <div className={styles.inputWrap}>
                  <UserIcon className={styles.inputIcon} />
                  <input
                    id="reg-apellido"
                    className={styles.input}
                    placeholder="Tu apellido"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="reg-genero">
                  Sexo
                </label>
                <div className={styles.inputWrap}>
                  <UserIcon className={styles.inputIcon} />
                  <select
                    id="reg-genero"
                    className={styles.input}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
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
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="reg-fecha">
                  Fecha de nacimiento
                </label>
                <div className={styles.inputWrap}>
                  <CalendarSmallIcon className={styles.inputIcon} />
                  <input
                    id="reg-fecha"
                    className={styles.input}
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="reg-email">
                Correo electronico
              </label>
              <div className={styles.inputWrap}>
                <MailIcon className={styles.inputIcon} />
                <input
                  id="reg-email"
                  className={styles.input}
                  type="email"
                  placeholder="ejemplo@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="reg-password">
                Contrasena
              </label>
              <div className={styles.inputWrap}>
                <LockIcon className={styles.inputIcon} />
                <input
                  id="reg-password"
                  className={styles.input}
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className={styles.passwordHints}>
                <span
                  className={
                    password.length === 0
                      ? styles.hint
                      : hasMinLength
                        ? styles.hintOk
                        : styles.hintError
                  }
                >
                  <Dot state={password.length === 0 ? 'neutral' : hasMinLength ? 'ok' : 'error'} />{' '}
                  Minimo 8 caracteres
                </span>
                <span
                  className={
                    password.length === 0
                      ? styles.hint
                      : hasLettersAndNumbers
                        ? styles.hintOk
                        : styles.hintError
                  }
                >
                  <Dot state={password.length === 0 ? 'neutral' : hasLettersAndNumbers ? 'ok' : 'error'} />{' '}
                  Incluir numeros y letras
                </span>
              </div>
            </div>

            <button className={styles.submit} type="submit" disabled={submitting}>
              {submitting ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>o continuar con</span>
            <span className={styles.dividerLine} />
          </div>

          <button type="button" className={styles.googleBtn} onClick={handleGoogleClick}>
            <GoogleIcon />
            Continuar con Google
          </button>

          <p className={styles.footer}>
            ¿Ya tienes cuenta?{' '}
            <Link className={styles.footerLink} to="/login">
              Inicia sesion
            </Link>
          </p>
        </div>
      </div>

      <img src={fondoInicio} alt="" className={styles.illustration} />
    </div>
  )
}

/* ---------- Iconos ---------- */

function Dot({ state }: { state: 'neutral' | 'ok' | 'error' }) {
  const color = state === 'ok' ? '#7a9a7b' : state === 'error' ? '#e07a5f' : '#d8d3cd'
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
      <circle cx="4" cy="4" r="4" fill={color} />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M5 12l6-6M5 12l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" stroke="#faf9f6" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="#faf9f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20s-7-4.4-9.5-9C1 8 2 4.5 5.3 3.6 8 2.9 10.4 4.4 12 6.7 13.6 4.4 16 2.9 18.7 3.6 22 4.5 23 8 21.5 11 19 15.6 12 20 12 20z"
        stroke="#faf9f6"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" stroke="#faf9f6" strokeWidth="1.8" />
      <path d="M3.5 10h17" stroke="#faf9f6" strokeWidth="1.8" />
      <path d="M8 3v4M16 3v4" stroke="#faf9f6" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.6" fill="#faf9f6" />
    </svg>
  )
}

function CalendarSmallIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 10h17" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 20c1.5-4 5-5.5 7.5-5.5s6 1.5 7.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1C3.3 21.3 7.3 24 12 24z"
      />
      <path fill="#FBBC05" d="M5.3 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V6.6H1.3A12 12 0 0 0 0 12c0 1.9.5 3.8 1.3 5.4l4-3.1z" />
      <path
        fill="#EA4335"
        d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.3 0 3.3 2.7 1.3 6.6l4 3.1c.9-2.9 3.6-5 6.7-5z"
      />
    </svg>
  )
}

export default RegisterTablet