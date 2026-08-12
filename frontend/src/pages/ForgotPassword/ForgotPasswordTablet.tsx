import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, ApiError } from '../../api/client'
import styles from './ForgotPasswordTablet.module.css'
import logo from '../../assets/logo.png'
import tituloLogo from '../../assets/titulo_logo.png'
import fondoInicio from '../../assets/fondo_inicio.png'

type Step = 'email' | 'code' | 'password' | 'success'

function ForgotPasswordTablet() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (step !== 'success') return
    const timer = setTimeout(() => navigate('/login'), 2500)
    return () => clearTimeout(timer)
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

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.logoWrap}>
          <img src={logo} alt="" className={styles.logoIcon} />
          <img src={tituloLogo} alt="PetPulse" className={styles.brandImg} />
          <p className={styles.tagline}>Salud y bienestar para tus mascotas.</p>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>
              <ShieldSmallIcon />
            </span>
            <p className={styles.featureTitle}>Seguridad</p>
            <p className={styles.featureCaption}>Protegemos la informacion de tus mascotas</p>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>
              <HeartSmallIcon />
            </span>
            <p className={styles.featureTitle}>Bienestar</p>
            <p className={styles.featureCaption}>Promovemos una vida saludable y feliz</p>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>
              <CalendarSmallIcon />
            </span>
            <p className={styles.featureTitle}>Recordatorios</p>
            <p className={styles.featureCaption}>Nunca olvides citas, vacunas y tratamientos</p>
          </div>
        </div>

        <div className={styles.card}>
          {step !== 'success' && (
            <button type="button" className={styles.backBtn} onClick={goBack} aria-label="Volver">
              <ArrowLeftIcon />
            </button>
          )}

          <h1 className={styles.cardTitle}>
            {step === 'success' ? 'Recuperacion exitosa, ya puedes iniciar sesion' : 'Recuperar contrasena'}
          </h1>

          {step === 'email' && (
            <>
              <div className={styles.bigIcon}>
                <MailBigIcon />
              </div>
              <h2 className={styles.stepHeading}>Encuentra tu cuenta</h2>
              <p className={styles.stepText}>
                Ingresa tu direccion de correo electronico y te ayudaremos a recuperar tu cuenta.
              </p>

              {error && (
                <p className={styles.alert} role="alert">
                  {error}
                </p>
              )}

              <form onSubmit={handleEmailSubmit}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="fp-email">
                    Correo electronico
                  </label>
                  <input
                    id="fp-email"
                    className={styles.input}
                    type="email"
                    placeholder="ejemplo@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <button className={styles.submit} type="submit" disabled={submitting}>
                  {submitting ? 'Enviando...' : 'Continuar'}
                </button>
              </form>

              <p className={styles.footer}>
                ¿Recordaste tu contrasena?{' '}
                <Link className={styles.footerLink} to="/login">
                  Inicia sesion
                </Link>
              </p>
            </>
          )}

          {step === 'code' && (
            <>
              <div className={styles.bigIcon}>
                <MailBigIcon />
              </div>
              <h2 className={styles.stepHeading}>Confirma tu cuenta</h2>
              <p className={styles.stepText}>
                Ingresa el codigo que enviamos a <strong>{email}</strong> para confirmar tu cuenta.
              </p>

              {notice && !error && (
                <p className={styles.status} role="status">
                  {notice}
                </p>
              )}
              {error && (
                <p className={styles.alert} role="alert">
                  {error}
                </p>
              )}

              <form onSubmit={handleCodeSubmit}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="fp-code">
                    Ingresa codigo de recuperacion
                  </label>
                  <input
                    id="fp-code"
                    className={styles.input}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
                <button className={styles.submit} type="submit" disabled={submitting}>
                  Continuar
                </button>
              </form>

              <button type="button" className={styles.resendLink} onClick={handleResend} disabled={submitting}>
                ¿No has recibido el codigo?
              </button>
            </>
          )}

          {step === 'password' && (
            <>
              <div className={styles.bigIcon}>
                <LockBigIcon />
              </div>
              <h2 className={styles.stepHeading}>Crea una contrasena nueva</h2>
              <p className={styles.stepText}>
                Ingresa una contrasena nueva que tenga al menos 8 caracteres.
              </p>

              {error && (
                <p className={styles.alert} role="alert">
                  {error}
                </p>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="fp-new-password">
                    Nueva contrasena
                  </label>
                  <input
                    id="fp-new-password"
                    className={styles.input}
                    type="password"
                    placeholder="********"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
                <button className={styles.submit} type="submit" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Continuar'}
                </button>
              </form>
            </>
          )}

          {step === 'success' && (
            <>
              <div className={`${styles.bigIcon} ${styles.bigIconSuccess}`}>
                <ShieldCheckBigIcon />
              </div>
              <p className={styles.successCaption}>Espera un momento para redirigirte al inicio.</p>
            </>
          )}
        </div>
      </div>

      <img src={fondoInicio} alt="" className={styles.illustration} />
    </div>
  )
}

/* ---------- Iconos pequenos (fila de features) ---------- */

function ShieldSmallIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" stroke="#faf9f6" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="#faf9f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HeartSmallIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20s-7-4.4-9.5-9C1 8 2 4.5 5.3 3.6 8 2.9 10.4 4.4 12 6.7 13.6 4.4 16 2.9 18.7 3.6 22 4.5 23 8 21.5 11 19 15.6 12 20 12 20z"
        stroke="#faf9f6"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CalendarSmallIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" stroke="#faf9f6" strokeWidth="1.8" />
      <path d="M3.5 10h17" stroke="#faf9f6" strokeWidth="1.8" />
      <path d="M8 3v4M16 3v4" stroke="#faf9f6" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.6" fill="#faf9f6" />
    </svg>
  )
}

/* ---------- Iconos grandes (centro de cada paso) ---------- */

function MailBigIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" stroke="#faf9f6" strokeWidth="1.8" />
      <path d="M4 7l8 6 8-6" stroke="#faf9f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockBigIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" stroke="#faf9f6" strokeWidth="1.8" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="#faf9f6" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ShieldCheckBigIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"
        stroke="#7a9a7b"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M8.5 12l2.5 2.5 4.5-5" stroke="#7a9a7b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

export default ForgotPasswordTablet