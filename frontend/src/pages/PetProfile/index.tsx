import { useBreakpoint } from '../../hooks/useBreakpoint'
import PetProfileMobile from './PetProfileMobile'
import PetProfileTablet from './PetProfileTablet'
import PetProfileDesktop from './PetProfileDesktop'

// Selector de pantalla segun el tamano de la ventana.
// Muestra la ficha de la mascota (recordatorios, vacunas, desparasitacion,
// enfermedades) en la version que corresponda al breakpoint actual.
function PetProfile() {
  const breakpoint = useBreakpoint()

  if (breakpoint === 'mobile') return <PetProfileMobile />
  if (breakpoint === 'tablet') return <PetProfileTablet />
  return <PetProfileDesktop />
}

export default PetProfile