import { PawPrint, Pencil, Trash2, User as UserIcon } from 'lucide-react'

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
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-petpulse-primary/15 flex items-center justify-center flex-shrink-0 overflow-hidden text-petpulse-primary-dark">
        {avatarUrl ? (
          <img src={avatarUrl} alt={title} className="w-full h-full object-cover" />
        ) : fallback === 'paw' ? (
          <PawPrint className="w-6 h-6" />
        ) : (
          <UserIcon className="w-6 h-6" />
        )}
      </div>

      {/* Info */}
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

      {/* Acciones */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {onEdit && (
          <button
            type="button"
            aria-label="Editar"
            onClick={onEdit}
            className="w-9 h-9 rounded-full flex items-center justify-center text-petpulse-text-secondary hover:bg-petpulse-primary/10 hover:text-petpulse-primary-dark transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            aria-label="Eliminar"
            onClick={onDelete}
            className="w-9 h-9 rounded-full flex items-center justify-center text-petpulse-text-secondary hover:bg-petpulse-accent/10 hover:text-petpulse-accent transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default ListItemCard
