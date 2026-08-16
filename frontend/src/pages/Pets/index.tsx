import { useBreakpoint } from '../../hooks/useBreakpoint'
import PetForm from './PetForm'
import PetFormTablet from './PetFormTablet'
import PetFormDesktop from './PetFormDesktop'

function Pets() {
  const breakpoint = useBreakpoint()

  if (breakpoint === 'mobile') return <PetForm />
  if (breakpoint === 'tablet') return <PetFormTablet />
  return <PetFormDesktop />
}

export default Pets