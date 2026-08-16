import { useBreakpoint } from '../../hooks/useBreakpoint'
import RegisterSuccessDesktop from './RegisterSuccessDesktop'
import RegisterSuccessTablet from './RegisterSuccessTablet'
import RegisterSuccessMobile from '../Register/RegisterSuccessMobile'

function RegisterSuccess() {
  const breakpoint = useBreakpoint()
  if (breakpoint === 'mobile') return <RegisterSuccessMobile />
  if (breakpoint === 'tablet') return <RegisterSuccessTablet />
  return <RegisterSuccessDesktop />
}

export default RegisterSuccess