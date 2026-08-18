import { useBreakpoint } from '../../hooks/useBreakpoint'
import EventCategoryPickerMobile from './EventCategoryPicker'
import EventCategoryPickerTablet from './EventCategoryPickerTablet'
import EventCategoryPickerDesktop from './EventCategoryPickerDesktop'

function EventCategoryPickerSelector() {
  const breakpoint = useBreakpoint()

  if (breakpoint === 'mobile') return <EventCategoryPickerMobile />
  if (breakpoint === 'tablet') return <EventCategoryPickerTablet />
  return <EventCategoryPickerDesktop />
}

export default EventCategoryPickerSelector
