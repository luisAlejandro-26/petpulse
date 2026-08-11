import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function RegisterTablet() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name_user, setNameUser] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [gender, setGender] = useState('Femenino')
  const [birth_date, setBirthDate] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register({ name_user, email, password, gender, birth_date })
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Registro</h1>
      <p>Version: Tablet</p>
      {error && <p role="alert">{error}</p>}
      <label>
        Nombre
        <input value={name_user} onChange={(e) => setNameUser(e.target.value)} required />
      </label>
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label>
        Contrasena
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
      </label>
      <label>
        Genero
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="Femenino">Femenino</option>
          <option value="Masculino">Masculino</option>
          <option value="Otro">Otro</option>
        </select>
      </label>
      <label>
        Fecha de nacimiento
        <input type="date" value={birth_date} onChange={(e) => setBirthDate(e.target.value)} required />
      </label>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Registrando...' : 'Registrarse'}
      </button>
      <p>
        <Link to="/login">Ya tengo cuenta</Link>
      </p>
    </form>
  )
}

export default RegisterTablet
