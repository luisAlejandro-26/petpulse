import { useBreakpoint } from '../../hooks/useBreakpoint'
import HomeDesktop from '../Home/HomeDesktop'
import AdminMobile from './AdminMobile'
import AdminTablet from './AdminTablet'

// Desktop ya tiene la pantalla de admin implementada dentro de HomeDesktop
// (recibe el prop role="admin" y muestra stats + gestion de usuarios),
// asi que aqui solo reutilizamos ese componente en vez de duplicarlo.
function Admin() {
  const breakpoint = useBreakpoint()

  if (breakpoint === 'mobile') return <AdminMobile />
  if (breakpoint === 'tablet') return <AdminTablet />
  return <HomeDesktop role="admin" />
}

export default Admin