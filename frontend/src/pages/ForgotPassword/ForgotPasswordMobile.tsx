import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, ApiError } from '../../api/client'

type Step = 'request' | 'reset'

function ForgotPasswordMobile() {
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
      setInfo('Si el correo existe, te enviamos un codigo.')
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
    if (newPassword !== confirmPassword) {
      setError('Las contrasenas no coinciden')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/api/auth/reset-password', { email, code, new_password: newPassword })
      navigate('/login', { state: { passwordReset: true } })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo restablecer la contrasena')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <p>Version: Mobile (placeholder, pendiente de diseno)</p>
      {step === 'request' ? (
        <form onSubmit={handleRequestCode}>
          <h1>Recuperar contrasena</h1>
          {error && <p role="alert">{error}</p>}
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Enviando...' : 'Enviar codigo'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <h1>Ingresa el codigo</h1>
          {info && !error && <p role="status">{info}</p>}
          {error && <p role="alert">{error}</p>}
          <label>
            Codigo
            <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} maxLength={6} required />
          </label>
          <label>
            Nueva contrasena
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
          </label>
          <label>
            Confirmar contrasena
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Restablecer contrasena'}
          </button>
        </form>
      )}
      <p>
        <Link to="/login">Volver a iniciar sesion</Link>
      </p>
    </div>
  )
}

export default ForgotPasswordMobile