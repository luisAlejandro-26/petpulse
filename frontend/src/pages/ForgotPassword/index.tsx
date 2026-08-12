import { useBreakpoint } from '../../hooks/useBreakpoint'
import ForgotPasswordDesktop from './ForgotPasswordDesktop'
import ForgotPasswordTablet from './ForgotPasswordTablet'
import ForgotPasswordMobile from './ForgotPasswordMobile'

function ForgotPassword() {
  const breakpoint = useBreakpoint()
  if (breakpoint === 'mobile') return <ForgotPasswordMobile />
  if (breakpoint === 'tablet') return <ForgotPasswordTablet />
  return <ForgotPasswordDesktop />
}

export default ForgotPassword