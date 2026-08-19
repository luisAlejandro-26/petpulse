import { useBreakpoint } from '../../hooks/useBreakpoint'
import BusinessBookingMobile from './BusinessBooking'
import BusinessBookingTablet from './BusinessBookingTablet'
import BusinessBookingDesktop from './BusinessBookingDesktop'

// Selector de pantalla segun el tamano de la ventana.
// Segundo paso del flujo "Agendar cita": elegir el negocio (veterinaria
// o peluqueria) donde se hara la cita.
function BusinessBookingSelector() {
  const breakpoint = useBreakpoint()

  if (breakpoint === 'mobile') return <BusinessBookingMobile />
  if (breakpoint === 'tablet') return <BusinessBookingTablet />
  return <BusinessBookingDesktop />
}

export default BusinessBookingSelector