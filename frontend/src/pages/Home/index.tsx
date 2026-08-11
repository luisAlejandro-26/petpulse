import { useBreakpoint } from '../../hooks/useBreakpoint'
import HomeDesktop from './HomeDesktop'
import HomeTablet from './HomeTablet'
import HomeMobile from './HomeMobile'

function Home() {
  const breakpoint = useBreakpoint()
  if (breakpoint === 'mobile') return <HomeMobile />
  if (breakpoint === 'tablet') return <HomeTablet />
  return <HomeDesktop />
}

export default Home
