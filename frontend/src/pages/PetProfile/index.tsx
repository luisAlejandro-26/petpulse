import { useBreakpoint } from '../../hooks/useBreakpoint'
import PetProfileMobile from './PetProfileMobile'
import PetProfileTablet from './PetProfileTablet'
import PetProfileDesktop from './PetProfileDesktop'

function PetProfile() {
  const breakpoint = useBreakpoint()

  if (breakpoint === 'mobile') return <PetProfileMobile />
  if (breakpoint === 'tablet') return <PetProfileTablet />
  return <PetProfileDesktop />
}

export default PetProfile
