import { useBreakpoint } from '../../hooks/useBreakpoint'
import ForgotPasswordDesktop from './ForgotPasswordDesktop'
import ForgotPasswordTablet from './ForgotPasswordTablet'
import ForgotPasswordMobile from './ForgotPasswordMobile'

// Selector de pantalla segun el tamano de la ventana.
// Muestra la version del flujo de "olvide mi contraseña" que corresponda
// al breakpoint (4 pasos: correo, codigo, nueva contraseña, exito).
function ForgotPassword() {
  const breakpoint = useBreakpoint()
  if (breakpoint === 'mobile') return <ForgotPasswordMobile />
  if (breakpoint === 'tablet') return <ForgotPasswordTablet />
  return <ForgotPasswordDesktop />
}

export default ForgotPassword