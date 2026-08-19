import { useBreakpoint } from '../../hooks/useBreakpoint'
import { useAuth } from '../../context/AuthContext'
import HomeDesktop from './HomeDesktop'
import HomeTablet from './HomeTablet'
import HomeMobile from './HomeMobile'

// Selector de pantalla segun el tamano de la ventana.
// role solo se usa en Desktop, porque HomeDesktop maneja tanto la vista
// de usuario normal como la de administrador dentro del mismo componente.
// Mobile y Tablet tienen su propia pantalla dedicada para admin (ver
// carpeta Admin/), a la que se llega desde App.tsx segun el rol.
function Home() {
  const breakpoint = useBreakpoint()
  const { user } = useAuth()
  const role: 'user' | 'admin' = user?.role_account === 'ADMIN' ? 'admin' : 'user'

  if (breakpoint === 'mobile') return <HomeMobile />
  if (breakpoint === 'tablet') return <HomeTablet />
  return <HomeDesktop role={role} />
}

export default Home