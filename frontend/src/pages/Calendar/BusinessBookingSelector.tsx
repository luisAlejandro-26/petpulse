import { useBreakpoint } from '../../hooks/useBreakpoint'
import BusinessBookingMobile from './BusinessBooking'
import BusinessBookingTablet from './BusinessBookingTablet'
import BusinessBookingDesktop from './BusinessBookingDesktop'

function BusinessBookingSelector() {
  const breakpoint = useBreakpoint()

  if (breakpoint === 'mobile') return <BusinessBookingMobile />
  if (breakpoint === 'tablet') return <BusinessBookingTablet />
  return <BusinessBookingDesktop />
}

export default BusinessBookingSelector