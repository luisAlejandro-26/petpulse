import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import logo from '../../assets/logo.png'
import tituloLogo from '../../assets/titulo_logo.png'
import fondoInicio from '../../assets/fondo_inicio.png'

// Tiempo (en ms) que se queda en pantalla antes de redirigir al login.
const REDIRECT_MS = 3500

// Pantalla de exito tras registrarse: muestra una animacion de check
// y redirige sola al login despues de REDIRECT_MS.
function RegisterSuccessTablet() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)

  // Anima una barra de progreso en tiempo real (cada 30ms) mientras
  // corre el temporizador que redirige al login.
  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      setProgress(Math.min((elapsed / REDIRECT_MS) * 100, 100))
    }, 30)

    const timer = setTimeout(() => {
      navigate('/login', { state: { registered: true } })
    }, REDIRECT_MS)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-petpulse-bg font-inter text-petpulse-text flex flex-col items-center pt-10 px-6 box-border">
      <div className="w-full max-w-[604px] flex flex-col items-center">
        <div className="flex flex-col items-center text-center mb-8">
          <img src={logo} alt="" className="w-[92px] h-auto mb-2" />
          <img src={tituloLogo} alt="PetPulse" className="h-10 w-auto mb-2" />
          <p className="text-sm text-petpulse-text-secondary">Salud y bienestar para tus mascotas.</p>
        </div>

        <div className="flex items-start justify-center gap-7 mb-8 w-full">
          <div className="flex flex-col items-center text-center w-[108px]">
            <span className="w-11 h-11 rounded-full bg-petpulse-primary flex items-center justify-center mb-2">
              <Icon icon="mdi:shield-check-outline" width={18} height={18} color="#faf9f6" />
            </span>
            <p className="text-[13px] font-semibold text-petpulse-text mb-0.5">Seguridad</p>
            <p className="text-[11px] text-petpulse-text-secondary leading-[1.4]">
              Protegemos la informacion de tus mascotas
            </p>
          </div>
          <span className="w-px h-10 bg-petpulse-border self-center shrink-0" aria-hidden="true" />
          <div className="flex flex-col items-center text-center w-[108px]">
            <span className="w-11 h-11 rounded-full bg-petpulse-primary flex items-center justify-center mb-2">
              <Icon icon="mdi:heart-outline" width={18} height={18} color="#faf9f6" />
            </span>
            <p className="text-[13px] font-semibold text-petpulse-text mb-0.5">Bienestar</p>
            <p className="text-[11px] text-petpulse-text-secondary leading-[1.4]">
              Promovemos una vida saludable y feliz
            </p>
          </div>
          <span className="w-px h-10 bg-petpulse-border self-center shrink-0" aria-hidden="true" />
          <div className="flex flex-col items-center text-center w-[108px]">
            <span className="w-11 h-11 rounded-full bg-petpulse-primary flex items-center justify-center mb-2">
              <Icon icon="mdi:calendar-month-outline" width={18} height={18} color="#faf9f6" />
            </span>
            <p className="text-[13px] font-semibold text-petpulse-text mb-0.5">Recordatorios</p>
            <p className="text-[11px] text-petpulse-text-secondary leading-[1.4]">
              Nunca olvides citas, vacunas y tratamientos
            </p>
          </div>
        </div>

        <div className="w-[536px] max-w-full bg-petpulse-card rounded-xl border border-petpulse-border shadow-[0_20px_44px_-28px_rgba(47,62,50,0.18)] px-6 py-11 box-border text-center">
          <h1 className="font-poppins font-bold text-2xl text-petpulse-primary mb-8">Registro exitoso</h1>

          <div className="flex justify-center mb-8" role="status" aria-live="polite">
            <svg width="150" height="172" viewBox="0 0 120 138" fill="none" aria-hidden="true">
              <path
                d="M60 6 L110 24 V66 C110 100 90 122 60 133 C30 122 10 100 10 66 V24 Z"
                stroke="#7a9a7b"
                strokeWidth="7"
                fill="none"
                strokeLinejoin="round"
                className="[stroke-dasharray:400] [stroke-dashoffset:400] [animation:draw-shield_0.7s_ease-out_forwards] motion-reduce:[animation:none] motion-reduce:[stroke-dashoffset:0]"
              />
              <path
                d="M39 68 L54 83 L83 50"
                stroke="#7a9a7b"
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="[stroke-dasharray:65] [stroke-dashoffset:65] [animation:draw-check_0.4s_ease-out_0.6s_forwards] motion-reduce:[animation:none] motion-reduce:[stroke-dashoffset:0]"
              />
            </svg>
          </div>

          <p className="text-sm text-petpulse-text-secondary mb-5">Espere un momento, será redirigido al inicio</p>

          <div className="w-40 h-1.5 bg-petpulse-border rounded-full overflow-hidden mx-auto">
            <div
              className="h-full bg-petpulse-primary rounded-full transition-[width] duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <img src={fondoInicio} alt="" className="w-screen h-auto mt-auto pt-8 block object-cover" />
    </div>
  )
}

export default RegisterSuccessTablet