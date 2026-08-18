import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Icon } from '@iconify/react'

const NAV_ITEMS = [
  { label: 'Inicio', path: '/dashboard', icon: 'mdi:home-outline' },
  { label: 'Calendario', path: '/calendar', icon: 'mdi:calendar-month-outline' },
  { label: 'PetIA', path: '/pet-ia', icon: 'mdi:robot-outline' },
  { label: 'Perfil', path: '/profile', icon: 'mdi:account-outline' },
]

function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const initials = (user?.name_user ?? 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="w-[260px] shrink-0 bg-white border-r border-petpulse-border h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="px-6 pt-8 pb-6 flex flex-col items-center gap-3 text-center">
        <img src="/assets/logo.svg" alt="Logo PetPulse" className="w-20 h-20 object-contain" />
        <span className="text-lg font-black tracking-widest text-petpulse-primary-dark uppercase">
          PETPULSE
        </span>
        <p className="text-xs text-gray-500 leading-tight">
          Salud y bienestar para tus mascotas.
        </p>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col gap-1.5 px-4 pt-6">
        {NAV_ITEMS.map(({ label, path, icon }) => {
          const active = location.pathname === path
          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className={`flex items-center gap-3 px-4 py-4 rounded-xl text-[15px] border transition-colors ${
                active
                  ? 'bg-[#6B8C6C] border-[#6B8C6C] text-white font-semibold shadow-sm'
                  : 'border-petpulse-border text-petpulse-text-secondary hover:bg-petpulse-bg hover:text-petpulse-text'
              }`}
            >
              <Icon icon={icon} width={20} height={20} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Agregar mascotas */}
      <div className="mt-auto px-4">
        <button
          type="button"
          onClick={() => navigate('/pets/new')}
          className="w-full py-3 rounded-full bg-white border border-petpulse-primary text-petpulse-primary-dark font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm hover:bg-[#6B8C6C] hover:text-white hover:border-[#6B8C6C]"
        >
          <Icon icon="mdi:paw" width={18} height={18} />
          Agregar mascotas
        </button>
      </div>

      {/* Footer: avatar + cerrar sesión */}
      <div className="px-4 py-4 mt-4 border-t border-petpulse-border flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          aria-label="Ir al perfil"
          className="w-11 h-11 rounded-full bg-petpulse-primary/15 text-petpulse-primary-dark font-bold flex items-center justify-center overflow-hidden hover:bg-petpulse-primary/25 transition-colors"
        >
          {user?.profile_image_url ? (
            <img src={user.profile_image_url} alt="Foto de perfil" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </button>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex items-center gap-2 text-sm text-petpulse-text-secondary hover:text-petpulse-accent font-medium transition-colors"
        >
          <Icon icon="mdi:logout" width={20} height={20} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
