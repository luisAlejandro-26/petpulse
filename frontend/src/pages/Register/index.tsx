import { useBreakpoint } from '../../hooks/useBreakpoint'
import RegisterDesktop from './RegisterDesktop'
import RegisterTablet from './RegisterTablet'
import RegisterMobile from './RegisterMobile'

// Selector de pantalla segun el tamano de la ventana.
// Muestra la version de registro que corresponda al breakpoint.
function Register() {
  const breakpoint = useBreakpoint()
  if (breakpoint === 'mobile') return <RegisterMobile />
  if (breakpoint === 'tablet') return <RegisterTablet />
  return <RegisterDesktop />
}

export default Register