import { useBreakpoint } from '../../hooks/useBreakpoint'
import EventCategoryPickerMobile from './EventCategoryPicker'
import EventCategoryPickerTablet from './EventCategoryPickerTablet'
import EventCategoryPickerDesktop from './EventCategoryPickerDesktop'

// Selector de pantalla segun el tamano de la ventana.
// Primer paso del flujo "Agendar cita": elegir el tipo de evento.
function EventCategoryPickerSelector() {
  const breakpoint = useBreakpoint()

  if (breakpoint === 'mobile') return <EventCategoryPickerMobile />
  if (breakpoint === 'tablet') return <EventCategoryPickerTablet />
  return <EventCategoryPickerDesktop />
}

export default EventCategoryPickerSelector