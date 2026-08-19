import { useBreakpoint } from '../../hooks/useBreakpoint'
import ProfileMobile from './ProfileMobile'
import ProfileTablet from './ProfileTablet'
import ProfileDesktop from './ProfileDesktop'

// Selector de pantalla segun el tamano de la ventana.
// Muestra la version de "Mi perfil" que corresponda al breakpoint actual.
function Profile() {
  const breakpoint = useBreakpoint()

  if (breakpoint === 'mobile') return <ProfileMobile />
  if (breakpoint === 'tablet') return <ProfileTablet />
  return <ProfileDesktop />
}

export default Profile