import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const REDIRECT_MS = 3500

function RegisterSuccessDesktop() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)

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
    <div className="min-h-screen w-full bg-white flex p-6">
      <div className="m-auto w-full max-w-[1500px] flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">

        {/* Columna Izquierda */}
        <div className="hidden lg:flex flex-col items-center text-center w-full lg:w-1/2">
          <div className="w-40 mb-6">
            <img src="/assets/logo.svg" alt="Logo PetPulse" className="w-full h-auto object-contain" />
          </div>
          <div className="mb-8">
            <h1 className="text-5xl font-black tracking-widest text-[#5A7A5F] uppercase">PETPULSE</h1>
            <p className="text-gray-500 mt-3 text-lg">Salud y bienestar para tus mascotas.</p>
          </div>
          <div className="w-full max-w-[760px] mb-10">
            <img src="/assets/banner.svg" alt="Ilustración de mascotas" className="w-full h-auto object-contain" />
          </div>
          {/* features: seguridad, bienestar, recordatorios */}
          <div className="flex w-full justify-center items-start divide-x divide-gray-200">
            <div className="flex-1 flex flex-col items-center text-center px-5">
              <svg className="w-9 h-9 text-[#5A7A5F] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="font-bold text-gray-800 text-base">Seguridad</p>
              <p className="text-sm text-gray-500 mt-1 max-w-[180px]">Protegemos la información de tus mascotas</p>
            </div>
            <div className="flex-1 flex flex-col items-center text-center px-5">
              <svg className="w-9 h-9 text-[#5A7A5F] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p className="font-bold text-gray-800 text-base">Bienestar</p>
              <p className="text-sm text-gray-500 mt-1 max-w-[180px]">Promovemos una vida saludable y feliz</p>
            </div>
            <div className="flex-1 flex flex-col items-center text-center px-5">
              <svg className="w-9 h-9 text-[#5A7A5F] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-bold text-gray-800 text-base">Recordatorios</p>
              <p className="text-sm text-gray-500 mt-1 max-w-[180px]">Nunca olvides citas, vacunas y tratamientos</p>
            </div>
          </div>
        </div>

        {/* Columna Derecha */}
        <div className="w-full lg:w-1/2 flex justify-center">
          {/* tarjeta registro exitoso */}
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 w-full max-w-[560px] p-10 sm:p-14 flex flex-col items-center text-center">

            <h2 className="text-[28px] font-bold text-[#6B8C6C] mb-8">Registro exitoso</h2>

            {/* escudo animado con checkmark */}
            <div className="mb-8" role="status" aria-live="polite">
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

            {/* mensaje redireccion */}
            <p className="text-sm text-[#7A7A7A] mb-5">Espere un momento, será redirigido al inicio de sesión</p>

            {/* barra de progreso */}
            <div className="w-40 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6B8C6C] rounded-full transition-[width] duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterSuccessDesktop
