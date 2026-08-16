import { useBreakpoint } from '../../hooks/useBreakpoint'
import CalendarMobile from './CalendarMobile'
import CalendarTablet from './CalendarTablet'
import CalendarDesktop from './CalendarDesktop'

function Calendar() {
  const breakpoint = useBreakpoint()

  if (breakpoint === 'mobile') return <CalendarMobile />
  if (breakpoint === 'tablet') return <CalendarTablet />
  return <CalendarDesktop />
}

export default Calendar