import { Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from '@iconify/react'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Inicio', icon: 'mdi:home-outline' },
  { to: '/calendar', label: 'Calendario', icon: 'mdi:calendar-month-outline' },
  { to: '/pet-ia', label: 'PetIA', icon: 'mdi:paw-outline' },
  { to: '/profile', label: 'Perfil', icon: 'mdi:account-outline' },
]

function BottomNav() {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[338px] h-[60px] bg-white/10 border border-petpulse-border rounded-2xl backdrop-blur-sm flex items-center justify-around">
      {NAV_ITEMS.map((item, i) => (
        <Fragment key={item.to}>
          <Link
            to={item.to}
            className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
              isActive(item.to) ? 'bg-petpulse-primary/15' : ''
            }`}
          >
            <Icon
              icon={item.icon}
              width={24}
              height={24}
              color={isActive(item.to) ? '#6B8C6C' : '#7A9A7B'}
            />
            <span
              className={`font-inter text-[12px] ${
                isActive(item.to) ? 'text-petpulse-primary-dark font-semibold' : 'text-petpulse-text'
              }`}
            >
              {item.label}
            </span>
          </Link>
          {i < NAV_ITEMS.length - 1 && <div className="w-px h-[60%] bg-petpulse-border" />}
        </Fragment>
      ))}
    </nav>
  )
}

export default BottomNav