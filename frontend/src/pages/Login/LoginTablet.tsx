import { useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuth } from '../../context/AuthContext'
import GoogleAuth, { type GoogleAuthHandle } from '../../components/GoogleAuth'
import logo from '../../assets/logo.png'
import tituloLogo from '../../assets/titulo_logo.png'
import fondoInicio from '../../assets/fondo_inicio.png'

// Pantalla de inicio de sesion para Tablet: formulario email/contraseña
// mas boton de Google. La animacion/tamanos siguen el Figma.
function LoginTablet() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const registered = (location.state as { registered?: boolean } | null)?.registered
  // Campos del formulario y estados de la UI (error, mensaje info, carga).
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const googleRef = useRef<GoogleAuthHandle>(null)

  // Llama a login() del contexto de autenticacion con email/contraseña.
  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesion')
    } finally {
      setSubmitting(false)
    }
  }

  // Dispara el boton de Google (usa un ref hacia el boton visual propio,
  // conectado via imperativeHandle en vez del boton nativo de Google).
  function handleGoogleClick() {
    setError('')
    setInfo('')
    googleRef.current?.signIn()
  }

  return (
    <div className="min-h-screen bg-petpulse-bg font-inter text-petpulse-text flex flex-col items-center pt-10 px-6 overflow-x-hidden">
      <div className="w-full max-w-[440px] flex flex-col items-center">
        <div className="flex flex-col items-center text-center mb-6">
          <img src={logo} alt="" className="w-[72px] h-auto mb-2" />
          <img src={tituloLogo} alt="PetPulse" className="h-8 w-auto mb-2" />
          <p className="text-sm text-petpulse-text-secondary leading-[1.4]">
            Salud y bienestar para tus mascotas.
          </p>
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
          <h2 className="font-poppins font-bold text-[22px] text-petpulse-primary text-center mb-1">
            Inicia sesion
          </h2>
          <p className="text-sm text-petpulse-text-secondary text-center mb-6">
            accede a tu cuenta para continuar
          </p>

          {registered && (
            <p
              className="text-[13px] px-4 py-3 rounded-[14px] mb-5 text-center bg-[#eef4ee] text-petpulse-primary-dark border border-[#d3e2d3]"
              role="status"
            >
              Registro exitoso, inicia sesion
            </p>
          )}
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
            <div className="block mb-5">
              <label className="block text-[13px] font-semibold text-petpulse-text mb-2" htmlFor="login-email">
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
                  id="login-email"
                  className="w-full box-border font-inter text-[15px] py-[13px] pr-4 pl-11 rounded-full border-[1.5px] border-petpulse-border bg-petpulse-bg text-petpulse-text transition-colors placeholder:text-petpulse-text-secondary focus:outline-none focus:border-petpulse-primary focus:ring-[3px] focus:ring-[rgba(122,154,123,0.18)] focus:bg-petpulse-card"
                  type="email"
                  placeholder="ejemplo@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="block mb-5">
              <label className="block text-[13px] font-semibold text-petpulse-text mb-2" htmlFor="login-password">
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
                  id="login-password"
                  className="w-full box-border font-inter text-[15px] py-[13px] pr-11 pl-11 rounded-full border-[1.5px] border-petpulse-border bg-petpulse-bg text-petpulse-text transition-colors placeholder:text-petpulse-text-secondary focus:outline-none focus:border-petpulse-primary focus:ring-[3px] focus:ring-[rgba(122,154,123,0.18)] focus:bg-petpulse-card"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 bg-transparent border-0 p-1.5 cursor-pointer text-petpulse-text-secondary flex items-center justify-center hover:text-petpulse-text"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                >
                  <Icon icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} width={18} height={18} />
                </button>
              </div>
            </div>

            <div className="flex justify-end -mt-2 mb-5">
              <Link className="text-[13px] font-semibold text-petpulse-accent no-underline hover:underline" to="/forgot-password">
                ¿Olvidaste tu contrasena?
              </Link>
            </div>

            <button
              className="w-full font-inter text-base font-bold text-white bg-petpulse-primary border-none rounded-full py-[15px] cursor-pointer transition-colors enabled:hover:bg-petpulse-primary-dark enabled:active:scale-[0.99] disabled:bg-petpulse-border disabled:cursor-not-allowed"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Entrando...' : 'Iniciar Sesion'}
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
          <GoogleAuth ref={googleRef} onError={setError} />
        </div>

        <p className="text-center mt-6 text-sm text-petpulse-text">
          ¿No tienes cuenta?{' '}
          <Link className="text-petpulse-accent font-bold no-underline hover:underline" to="/register">
            Registrate
          </Link>
        </p>
      </div>

      <img src={fondoInicio} alt="" className="w-screen h-auto mt-auto pt-8 block object-cover" />
    </div>
  )
}

export default LoginTablet