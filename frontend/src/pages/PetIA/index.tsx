import { useBreakpoint } from '../../hooks/useBreakpoint'
import PetIAMobile from './PetIAMobile'
import PetIATablet from './PetIATablet'
import PetIADesktop from './PetIADesktop'

// Selector de pantalla segun el tamano de la ventana.
// Elige la version del chat de IA (PetIA) que corresponda al breakpoint.
function PetIA() {
  const breakpoint = useBreakpoint()

  if (breakpoint === 'mobile') return <PetIAMobile />
  if (breakpoint === 'tablet') return <PetIATablet />
  return <PetIADesktop />
}

export default PetIA