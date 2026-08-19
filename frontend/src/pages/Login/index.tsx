import { useBreakpoint } from '../../hooks/useBreakpoint'
import LoginDesktop from './LoginDesktop'
import LoginTablet from './LoginTablet'
import LoginMobile from './LoginMobile'

// Selector de pantalla segun el tamano de la ventana.
// Muestra la version de inicio de sesion que corresponda al breakpoint.
function Login() {
  const breakpoint = useBreakpoint()
  if (breakpoint === 'mobile') return <LoginMobile />
  if (breakpoint === 'tablet') return <LoginTablet />
  return <LoginDesktop />
}

export default Login