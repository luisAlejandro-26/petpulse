import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  hint?: string
  accent?: boolean
  tall?: boolean
}

function StatCard({ icon: Icon, label, value, hint, accent = false, tall = false }: StatCardProps) {
  const iconTone = accent
    ? 'bg-petpulse-accent/10 text-petpulse-accent'
    : 'bg-petpulse-primary/15 text-petpulse-primary-dark'

  if (tall) {
    return (
      <div className="bg-white rounded-2xl border border-petpulse-border p-6 flex flex-col justify-between">
        <div className="flex items-center gap-4">
          <div className={`${iconTone} w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold text-petpulse-text leading-none">{value}</p>
            <p className="text-sm text-petpulse-text-secondary mt-1.5">{label}</p>
          </div>
        </div>
        {hint && <p className="text-xs text-petpulse-text-secondary mt-4 leading-relaxed">{hint}</p>}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-petpulse-border p-5 flex items-start gap-4">
      <div className={`${iconTone} w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-petpulse-text-secondary">{label}</p>
        <p className="text-2xl font-bold text-petpulse-text leading-tight">{value}</p>
        {hint && <p className="text-xs text-petpulse-text-secondary mt-1">{hint}</p>}
      </div>
    </div>
  )
}

export default StatCard
