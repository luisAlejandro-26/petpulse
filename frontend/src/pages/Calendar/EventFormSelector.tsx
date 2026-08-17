import { useBreakpoint } from '../../hooks/useBreakpoint'
import EventFormMobile from './EventForm'
import EventFormTablet from './EventFormTablet'
import EventFormDesktop from './EventFormDesktop'

function EventFormSelector() {
  const breakpoint = useBreakpoint()

  if (breakpoint === 'mobile') return <EventFormMobile />
  if (breakpoint === 'tablet') return <EventFormTablet />
  return <EventFormDesktop />
}

export default EventFormSelector
