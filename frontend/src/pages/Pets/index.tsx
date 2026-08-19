import { useBreakpoint } from '../../hooks/useBreakpoint'
import PetForm from './PetForm'
import PetFormTablet from './PetFormTablet'
import PetFormDesktop from './PetFormDesktop'

// Selector de pantalla segun el tamano de la ventana.
// Elige entre PetForm (mobile), PetFormTablet o PetFormDesktop segun el
// breakpoint actual. Este mismo formulario sirve para agregar Y editar
// una mascota (la logica de cual modo usar vive dentro de cada version).
function Pets() {
  const breakpoint = useBreakpoint()

  if (breakpoint === 'mobile') return <PetForm />
  if (breakpoint === 'tablet') return <PetFormTablet />
  return <PetFormDesktop />
}

export default Pets