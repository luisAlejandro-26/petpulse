import { Icon } from '@iconify/react'

interface StatCardProps {
  icon: string
  label: string
  value: string | number
  hint?: string
  accent?: boolean
  tall?: boolean
  link?: string
  linkLabel?: string
}

function StatCard({ icon, label, value, hint, accent = false, tall = false, link, linkLabel }: StatCardProps) {
  const iconBg = accent ? 'bg-[#fbe9e5]' : 'bg-[#eaf0ea]'
  const iconColor = accent ? 'text-petpulse-accent' : 'text-petpulse-primary'

  if (tall) {
    return (
      <div className="bg-white rounded-2xl border border-petpulse-border p-5 flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <span className={`w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
            <Icon icon={icon} width={26} height={26} />
          </span>
          <span className="font-bold text-[15px] leading-[1.2] text-petpulse-text">{label}</span>
        </div>
        <p className="font-extrabold text-[34px] leading-none mb-1 text-petpulse-text">{value}</p>
        {hint && <p className="text-xs text-petpulse-text-secondary mb-3">{hint}</p>}
        {link && (
          <a
            href={link}
            className="mt-auto inline-flex items-center gap-1 text-[13px] font-semibold text-petpulse-primary no-underline hover:underline"
          >
            {linkLabel ?? 'ver más'} <Icon icon="mdi:arrow-right" width={16} height={16} />
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-petpulse-border p-5 flex items-start gap-4">
      <div className={`${iconBg} ${iconColor} w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon icon={icon} width={20} height={20} />
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
