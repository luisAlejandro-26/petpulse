import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

interface SideMenuProps {
  open: boolean
  onClose: () => void
}

function SideMenu({ open, onClose }: SideMenuProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  async function handleLogout() {
    try {
      await logout()
      onClose()
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  function handleAbout() {
    onClose()
    navigate('/about')
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menú secundario"
        tabIndex={-1}
        className={`fixed top-0 left-0 h-full w-[247px] bg-white shadow-lg z-50 transition-transform duration-300 ease-out flex flex-col outline-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col items-center pt-9 pb-4">
          <img src={logo} alt="Logo PetPulse" className="w-16 h-auto" />
          <p className="font-inter font-semibold text-sm text-petpulse-text-secondary text-center mt-2 px-6 leading-snug">
            Salud y bienestar para tus mascotas.
          </p>
        </div>

        <div className="h-px bg-petpulse-primary mx-3" />

        {/* Solo opciones secundarias, no duplicadas del bottom nav */}
        <nav className="flex flex-col gap-3 px-[22px] pt-6" aria-label="Opciones secundarias">
          <button
            type="button"
            onClick={handleAbout}
            className="h-[54px] bg-petpulse-bg border border-petpulse-border rounded-[10px] flex items-center px-4 gap-3 active:scale-[0.98] transition-transform"
          >
            <Icon icon="mdi:information-outline" width={22} height={22} className="text-petpulse-primary" />
            <span className="font-inter text-base text-petpulse-text">Sobre Nosotros</span>
          </button>
        </nav>

        <div className="flex-1" />

        <div className="px-[22px] pb-8">
          <div className="h-px bg-petpulse-primary mb-5" />
          <button
            type="button"
            onClick={handleLogout}
            className="w-full h-[53px] bg-petpulse-bg border border-petpulse-border rounded-[10px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Icon icon="mdi:logout" width={18} height={18} className="text-petpulse-accent" />
            <span className="font-inter font-bold text-sm text-petpulse-accent">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default SideMenu