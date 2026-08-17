export const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const ACTIVITY_META: Record<string, { label: string; icon: string; tone: 'primary' | 'accent' }> = {
  VACUNA: { label: 'Vacuna aplicada', icon: 'mdi:syringe', tone: 'primary' },
  CONTROL: { label: 'Consulta realizada', icon: 'mdi:stethoscope', tone: 'primary' },
  DESPARACITACION: { label: 'Medicamento registrado', icon: 'mdi:pill', tone: 'primary' },
  CIRUGIA: { label: 'Cirugía realizada', icon: 'mdi:medical-bag', tone: 'primary' },
  OTHER: { label: 'Recordatorio', icon: 'mdi:alert-circle-outline', tone: 'accent' },
}

export const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  COMPLETED: { text: 'Aplicado', className: 'bg-petpulse-primary/15 text-petpulse-primary-dark' },
  SCHEDULED: { text: 'Pendiente', className: 'bg-petpulse-accent/15 text-petpulse-accent' },
  CANCELLED: { text: 'Cancelado', className: 'bg-petpulse-text-secondary/15 text-petpulse-text-secondary' },
}

export const EVENT_ICONS: Record<string, string> = {
  VACUNA: 'game-icons:medicines',
  CONTROL: 'hugeicons:doctor-01',
  DESPARACITACION: 'material-symbols:emergency',
  CIRUGIA: 'material-symbols:emergency',
  OTHER: 'mdi:content-cut',
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '—'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${dd}/${mm}/${yy}`
}

export function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) years--
  if (years < 1) {
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    return `${months} ${months === 1 ? 'mes' : 'meses'}`
  }
  return `${years} ${years === 1 ? 'año' : 'años'}`
}
