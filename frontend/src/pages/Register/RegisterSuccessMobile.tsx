import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'
import tituloLogo from '../../assets/titulo_logo.png'
import fondoInicio from '../../assets/fondo_inicio.png'

const REDIRECT_MS = 3500

function RegisterSuccessMobile() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / REDIRECT_MS) * 100, 100)
      setProgress(pct)
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
    <div className="h-screen w-full bg-petpulse-bg flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[402px] h-screen overflow-hidden">
      <div className="h-full overflow-y-auto flex flex-col">

        <div className="flex-1 flex flex-col items-center">
          <div className="flex flex-col items-center pt-6">
            <img src={logo} alt="Logo PetPulse" className="w-[70px] h-auto" />
            <img src={tituloLogo} alt="PetPulse" className="w-40 h-auto -mt-1" />
            <p className="font-encode-condensed text-petpulse-text text-xs text-center mt-0.5 leading-tight">
              Salud y bienestar para tus mascotas.
            </p>
          </div>

          <h2 className="font-encode-expanded font-bold text-2xl text-petpulse-primary text-center mt-10">
            Registro exitoso
          </h2>

          {/* Escudo con check animado */}
          <div className="mt-10" role="status" aria-live="polite">
            <svg width="130" height="150" viewBox="0 0 130 150" fill="none">
              <path
                d="M65 8 L118 26 V72 C118 108 96 132 65 144 C34 132 12 108 12 72 V26 Z"
                stroke="#7A9A7B"
                strokeWidth="8"
                fill="none"
                strokeLinejoin="round"
                strokeDasharray="420"
                strokeDashoffset="420"
                style={{
                  animation: 'draw-shield 0.7s ease-out forwards',
                }}
              />
              <path
                d="M42 74 L58 90 L90 54"
                stroke="#7A9A7B"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="70"
                strokeDashoffset="70"
                style={{
                  animation: 'draw-check 0.4s ease-out forwards',
                  animationDelay: '0.6s',
                }}
              />
            </svg>
          </div>

          <p className="font-encode-semi text-sm text-petpulse-text text-center mt-10 px-10">
            Espere un momento será redirigido al inicio
          </p>

          {/* Barra de progreso */}
          <div className="w-40 h-1.5 bg-petpulse-border rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-petpulse-primary rounded-full transition-[width] duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <img src={fondoInicio} alt="" className="w-full h-auto block" aria-hidden="true" />
      </div>
      </div>

      <style>{`
        @keyframes draw-shield {
          to { stroke-dashoffset: 0; }
        }
        @keyframes draw-check {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  )
}

export default RegisterSuccessMobile