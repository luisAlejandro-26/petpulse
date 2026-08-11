import { useBreakpoint } from '../../hooks/useBreakpoint'
import LoginDesktop from './LoginDesktop'
import LoginTablet from './LoginTablet'
import LoginMobile from './LoginMobile'

function Login() {
  const breakpoint = useBreakpoint()
  if (breakpoint === 'mobile') return <LoginMobile />
  if (breakpoint === 'tablet') return <LoginTablet />
  return <LoginDesktop />
}

export default Login
