import { useBreakpoint } from '../../hooks/useBreakpoint'
import CalendarMobile from './CalendarMobile'
import CalendarTablet from './CalendarTablet'
import CalendarDesktop from './CalendarDesktop'

// Selector de pantalla segun el tamano de la ventana.
// El hook useBreakpoint devuelve 'mobile' | 'tablet' | 'desktop' y aqui
// decidimos que version del Calendario mostrar (cada una es un archivo
// distinto, hecho a la medida de ese tamano de pantalla).
function Calendar() {
  const breakpoint = useBreakpoint()

  if (breakpoint === 'mobile') return <CalendarMobile />
  if (breakpoint === 'tablet') return <CalendarTablet />
  return <CalendarDesktop />
}

export default Calendar