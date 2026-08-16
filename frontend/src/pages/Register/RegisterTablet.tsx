import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'
import tituloLogo from '../../assets/titulo_logo.png'
import fondoInicio from '../../assets/fondo_inicio.png'

function Dot({ state }: { state: 'neutral' | 'ok' | 'error' }) {
  const color = state === 'ok' ? '#7a9a7b' : state === 'error' ? '#e07a5f' : '#d8d3cd'
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
      <circle cx="4" cy="4" r="4" fill={color} />
    </svg>
  )
}

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

  const inputClass =
    'w-full box-border font-inter text-[15px] py-[13px] pr-4 pl-11 rounded-full border-[1.5px] border-petpulse-border bg-petpulse-bg text-petpulse-text transition-colors appearance-none placeholder:text-petpulse-text-secondary focus:outline-none focus:border-petpulse-primary focus:ring-[3px] focus:ring-[rgba(122,154,123,0.18)] focus:bg-petpulse-card'

  return (
    <div className="relative min-h-screen bg-petpulse-bg font-inter text-petpulse-text flex flex-col items-center pt-10 px-6 box-border">
      <Link
        to="/login"
        className="absolute top-6 left-6 text-petpulse-text flex items-center justify-center no-underline hover:text-petpulse-primary"
        aria-label="Volver a iniciar sesion"
      >
        <Icon icon="mdi:arrow-left" width={20} height={20} />
      </Link>

      <div className="w-full max-w-[460px] flex flex-col items-center">
        <div className="flex flex-col items-center text-center mb-6">
          <img src={logo} alt="" className="w-[72px] h-auto mb-2" />
          <img src={tituloLogo} alt="PetPulse" className="h-8 w-auto mb-2" />
          <p className="text-sm text-petpulse-text-secondary">Salud y bienestar para tus mascotas.</p>
        </div>

        <div className="flex items-start justify-center gap-6 mb-8 w-full">
          <div className="flex flex-col items-center text-center w-[108px]">
            <span className="w-11 h-11 rounded-full bg-petpulse-primary flex items-center justify-center mb-2">
              <Icon icon="mdi:shield-check-outline" width={20} height={20} color="#faf9f6" />
            </span>
            <p className="text-[13px] font-semibold text-petpulse-text mb-0.5">Seguridad</p>
            <p className="text-[11px] text-petpulse-text-secondary leading-[1.4]">
              Protegemos la informacion de tus mascotas
            </p>
          </div>
          <div className="flex flex-col items-center text-center w-[108px]">
            <span className="w-11 h-11 rounded-full bg-petpulse-primary flex items-center justify-center mb-2">
              <Icon icon="mdi:heart-outline" width={20} height={20} color="#faf9f6" />
            </span>
            <p className="text-[13px] font-semibold text-petpulse-text mb-0.5">Bienestar</p>
            <p className="text-[11px] text-petpulse-text-secondary leading-[1.4]">
              Promovemos una vida saludable y feliz
            </p>
          </div>
          <div className="flex flex-col items-center text-center w-[108px]">
            <span className="w-11 h-11 rounded-full bg-petpulse-primary flex items-center justify-center mb-2">
              <Icon icon="mdi:calendar-month-outline" width={20} height={20} color="#faf9f6" />
            </span>
            <p className="text-[13px] font-semibold text-petpulse-text mb-0.5">Recordatorios</p>
            <p className="text-[11px] text-petpulse-text-secondary leading-[1.4]">
              Nunca olvides citas, vacunas y tratamientos
            </p>
          </div>
        </div>

        <div className="w-full bg-petpulse-card rounded-3xl shadow-[0_24px_48px_-28px_rgba(47,62,50,0.25)] px-6 pt-8 pb-6 box-border">
          <h1 className="font-poppins font-bold text-[22px] text-petpulse-primary text-center mb-1">Registrate</h1>
          <p className="text-sm text-petpulse-text-secondary text-center mb-6">Crea tu cuenta para comenzar</p>

          {error && (
            <p
              className="text-[13px] px-4 py-3 rounded-[14px] mb-5 text-center bg-[#fbe9e5] text-petpulse-accent border border-[#f2cec3]"
              role="alert"
            >
              {error}
            </p>
          )}
          {info && !error && (
            <p
              className="text-[13px] px-4 py-3 rounded-[14px] mb-5 text-center bg-[#f2f2f0] text-petpulse-text-secondary border border-petpulse-border"
              role="status"
            >
              {info}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex gap-4">
              <div className="flex-1 min-w-0 mb-5">
                <label className="block text-[13px] font-semibold text-petpulse-text mb-2" htmlFor="reg-nombre">
                  Nombre
                </label>
                <div className="relative flex items-center">
                  <Icon
                    icon="mdi:account-outline"
                    width={18}
                    height={18}
                    className="absolute left-4 text-petpulse-text-secondary pointer-events-none"
                  />
                  <input
                    id="reg-nombre"
                    className={inputClass}
                    placeholder="Tu nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0 mb-5">
                <label className="block text-[13px] font-semibold text-petpulse-text mb-2" htmlFor="reg-apellido">
                  Apellido
                </label>
                <div className="relative flex items-center">
                  <Icon
                    icon="mdi:account-outline"
                    width={18}
                    height={18}
                    className="absolute left-4 text-petpulse-text-secondary pointer-events-none"
                  />
                  <input
                    id="reg-apellido"
                    className={inputClass}
                    placeholder="Tu apellido"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 min-w-0 mb-5">
                <label className="block text-[13px] font-semibold text-petpulse-text mb-2" htmlFor="reg-genero">
                  Sexo
                </label>
                <div className="relative flex items-center">
                  <Icon
                    icon="mdi:account-outline"
                    width={18}
                    height={18}
                    className="absolute left-4 text-petpulse-text-secondary pointer-events-none"
                  />
                  <select
                    id="reg-genero"
                    className={`${inputClass} cursor-pointer`}
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
              <div className="flex-1 min-w-0 mb-5">
                <label className="block text-[13px] font-semibold text-petpulse-text mb-2" htmlFor="reg-fecha">
                  Fecha de nacimiento
                </label>
                <div className="relative flex items-center">
                  <Icon
                    icon="mdi:calendar-month-outline"
                    width={18}
                    height={18}
                    className="absolute left-4 text-petpulse-text-secondary pointer-events-none"
                  />
                  <input
                    id="reg-fecha"
                    className={inputClass}
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-petpulse-text mb-2" htmlFor="reg-email">
                Correo electronico
              </label>
              <div className="relative flex items-center">
                <Icon
                  icon="mdi:email-outline"
                  width={18}
                  height={18}
                  className="absolute left-4 text-petpulse-text-secondary pointer-events-none"
                />
                <input
                  id="reg-email"
                  className={inputClass}
                  type="email"
                  placeholder="ejemplo@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-petpulse-text mb-2" htmlFor="reg-password">
                Contrasena
              </label>
              <div className="relative flex items-center">
                <Icon
                  icon="mdi:lock-outline"
                  width={18}
                  height={18}
                  className="absolute left-4 text-petpulse-text-secondary pointer-events-none"
                />
                <input
                  id="reg-password"
                  className={inputClass}
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="flex gap-4 mt-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] ${
                    password.length === 0
                      ? 'text-petpulse-text-secondary'
                      : hasMinLength
                        ? 'text-petpulse-primary font-semibold'
                        : 'text-petpulse-accent font-semibold'
                  }`}
                >
                  <Dot state={password.length === 0 ? 'neutral' : hasMinLength ? 'ok' : 'error'} />
                  Minimo 8 caracteres
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] ${
                    password.length === 0
                      ? 'text-petpulse-text-secondary'
                      : hasLettersAndNumbers
                        ? 'text-petpulse-primary font-semibold'
                        : 'text-petpulse-accent font-semibold'
                  }`}
                >
                  <Dot state={password.length === 0 ? 'neutral' : hasLettersAndNumbers ? 'ok' : 'error'} />
                  Incluir numeros y letras
                </span>
              </div>
            </div>

            <button
              className="w-full font-inter text-base font-bold text-white bg-petpulse-primary border-none rounded-full py-[15px] cursor-pointer transition-colors mt-2 enabled:hover:bg-petpulse-primary-dark enabled:active:scale-[0.99] disabled:bg-petpulse-border disabled:cursor-not-allowed"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <span className="flex-1 h-px bg-petpulse-border" />
            <span className="text-[13px] text-petpulse-text-secondary whitespace-nowrap">o continuar con</span>
            <span className="flex-1 h-px bg-petpulse-border" />
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 font-inter text-[15px] font-semibold text-petpulse-text bg-petpulse-card border-[1.5px] border-petpulse-border rounded-[14px] p-3 cursor-pointer box-border transition-colors hover:bg-petpulse-bg hover:border-petpulse-text-secondary"
            onClick={handleGoogleClick}
          >
            <Icon icon="logos:google-icon" width={18} height={18} />
            Continuar con Google
          </button>

          <p className="text-center mt-6 mb-0 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link className="text-petpulse-accent font-bold no-underline hover:underline" to="/login">
              Inicia sesion
            </Link>
          </p>
        </div>
      </div>

      <img src={fondoInicio} alt="" className="w-screen h-auto mt-auto pt-8 block object-cover" />
    </div>
  )
}

export default RegisterTablet