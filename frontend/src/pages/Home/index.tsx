import { useBreakpoint } from '../../hooks/useBreakpoint'
import { useAuth } from '../../context/AuthContext'
import HomeDesktop from './HomeDesktop'
import HomeTablet from './HomeTablet'
import HomeMobile from './HomeMobile'

function Home() {
  const breakpoint = useBreakpoint()
  const { user } = useAuth()
  const role: 'user' | 'admin' = user?.role_account === 'ADMIN' ? 'admin' : 'user'

  if (breakpoint === 'mobile') return <HomeMobile />
  if (breakpoint === 'tablet') return <HomeTablet />
  return <HomeDesktop role={role} />
}

export default Home
