import { useBreakpoint } from '../../hooks/useBreakpoint'
import EventFormMobile from './EventForm'
import EventFormTablet from './EventFormTablet'
import EventFormDesktop from './EventFormDesktop'

// Selector de pantalla segun el tamano de la ventana.
// Ultimo paso del flujo "Agendar cita": confirmar mascota, titulo y fecha.
function EventFormSelector() {
  const breakpoint = useBreakpoint()

  if (breakpoint === 'mobile') return <EventFormMobile />
  if (breakpoint === 'tablet') return <EventFormTablet />
  return <EventFormDesktop />
}

export default EventFormSelector