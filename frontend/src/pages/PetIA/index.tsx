import { useBreakpoint } from '../../hooks/useBreakpoint'
import PetIAMobile from './PetIAMobile'
import PetIATablet from './PetIATablet'
import PetIADesktop from './PetIADesktop'

function PetIA() {
  const breakpoint = useBreakpoint()

  if (breakpoint === 'mobile') return <PetIAMobile />
  if (breakpoint === 'tablet') return <PetIATablet />
  return <PetIADesktop />
}

export default PetIA