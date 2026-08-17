import { Icon } from '@iconify/react'

interface ListItemCardProps {
  avatarUrl?: string | null
  fallback?: 'paw' | 'user'
  title: string
  subtitle: string
  badge?: string
  badgeTone?: 'admin' | 'user'
  onEdit?: () => void
  onDelete?: () => void
}

function ListItemCard({
  avatarUrl,
  fallback = 'paw',
  title,
  subtitle,
  badge,
  badgeTone = 'user',
  onEdit,
  onDelete,
}: ListItemCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-petpulse-border p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-full bg-petpulse-primary/15 flex items-center justify-center flex-shrink-0 overflow-hidden text-petpulse-primary-dark">
        {avatarUrl ? (
          <img src={avatarUrl} alt={title} className="w-full h-full object-cover" />
        ) : fallback === 'paw' ? (
          <Icon icon="mdi:paw" width={24} height={24} />
        ) : (
          <Icon icon="mdi:account" width={24} height={24} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-petpulse-text truncate">{title}</p>
          {badge && (
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${
                badgeTone === 'admin'
                  ? 'bg-petpulse-primary/15 text-petpulse-primary-dark'
                  : 'bg-gray-100 text-petpulse-text-secondary'
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-petpulse-text-secondary truncate mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {onEdit && (
          <button
            type="button"
            aria-label="Editar"
            onClick={onEdit}
            className="w-9 h-9 rounded-full flex items-center justify-center text-petpulse-accent hover:bg-petpulse-accent/10 transition-colors"
          >
            <Icon icon="mynaui:pencil" width={16} height={16} />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            aria-label="Eliminar"
            onClick={onDelete}
            className="w-9 h-9 rounded-full flex items-center justify-center text-petpulse-text-secondary hover:bg-petpulse-accent/10 hover:text-petpulse-accent transition-colors"
          >
            <Icon icon="mdi:trash-can-outline" width={16} height={16} />
          </button>
        )}
      </div>
    </div>
  )
}

export default ListItemCard
