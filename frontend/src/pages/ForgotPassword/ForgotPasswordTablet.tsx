import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, ApiError } from '../../api/client'
import styles from './ForgotPasswordTablet.module.css'
import logo from '../../assets/logo.png'
import tituloLogo from '../../assets/titulo_logo.png'

type Step = 'request' | 'reset'

function ForgotPasswordTablet() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
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
      setInfo('Si el correo existe, te enviamos un codigo. Revisa tu bandeja de entrada.')
      setStep('reset')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo enviar el codigo')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResetPassword(event: FormEvent) {
    event.preventDefault()
    setError('')
    setInfo('')

    if (newPassword !== confirmPassword) {
      setError('Las contrasenas no coinciden')
      return
    }
    if (newPassword.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/api/auth/reset-password', {
        email,
        code,
        new_password: newPassword,
      })
      navigate('/login', { state: { passwordReset: true } })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo restablecer la contrasena')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.logoWrap}>
          <img src={logo} alt="" className={styles.logoIcon} />
          <img src={tituloLogo} alt="PetPulse" className={styles.brandImg} />
        </div>

        <div className={styles.card}>
          {step === 'request' ? (
            <>
              <h1 className={styles.cardHeading}>Recuperar contrasena</h1>
              <p className={styles.cardSubtitle}>
                Ingresa tu correo y te enviaremos un codigo de recuperacion
              </p>

              {error && (
                <p className={styles.alert} role="alert">
                  {error}
                </p>
              )}

              <form onSubmit={handleRequestCode}>
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
                  {submitting ? 'Enviando...' : 'Enviar codigo'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className={styles.cardHeading}>Ingresa el codigo</h1>
              <p className={styles.cardSubtitle}>
                Enviamos un codigo de 6 digitos a <strong>{email}</strong>
              </p>

              {info && !error && (
                <p className={styles.status} role="status">
                  {info}
                </p>
              )}
              {error && (
                <p className={styles.alert} role="alert">
                  {error}
                </p>
              )}

              <form onSubmit={handleResetPassword}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="fp-code">
                    Codigo de verificacion
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
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="fp-confirm-password">
                    Confirmar contrasena
                  </label>
                  <input
                    id="fp-confirm-password"
                    className={styles.input}
                    type="password"
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                <button className={styles.submit} type="submit" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Restablecer contrasena'}
                </button>
              </form>

              <button
                type="button"
                className={styles.resendLink}
                onClick={() => {
                  setStep('request')
                  setCode('')
                  setError('')
                  setInfo('')
                }}
              >
                ¿No te llego? Volver a intentar
              </button>
            </>
          )}
        </div>

        <p className={styles.footer}>
          <Link className={styles.footerLink} to="/login">
            Volver a iniciar sesion
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPasswordTablet