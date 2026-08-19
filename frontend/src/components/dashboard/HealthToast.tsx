import { Icon } from '@iconify/react'

interface HealthToastProps {
  visible: boolean
  alertaSalud: number
  onDismiss: () => void
  onViewDetails: () => void
}

export default function HealthToast({ visible, alertaSalud, onDismiss, onViewDetails }: HealthToastProps) {
  if (!visible || alertaSalud === 0) return null

  return (
    <>
      <div className="fixed top-6 right-6 z-50 w-full max-w-[340px] animate-[toast-in_0.25s_ease-out]">
        <div className="bg-white border border-petpulse-accent/30 rounded-2xl shadow-[0_16px_32px_-14px_rgba(47,62,50,0.35)] p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#fbe9e5] flex items-center justify-center shrink-0">
            <Icon icon="mdi:heart-pulse" width={20} height={20} className="text-petpulse-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-petpulse-text">
              {alertaSalud} {alertaSalud === 1 ? 'alerta de salud próxima' : 'alertas de salud próximas'}
            </p>
            <p className="text-xs text-petpulse-text-secondary mt-1">
              Tienes {alertaSalud === 1 ? 'un evento' : 'eventos'} de salud en los próximos 3 días.
            </p>
            <button
              type="button"
              onClick={onViewDetails}
              className="text-xs font-semibold text-petpulse-primary-dark mt-2 hover:underline"
            >
              Ver detalles
            </button>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Cerrar aviso"
            className="text-petpulse-text-secondary shrink-0 hover:text-petpulse-text"
          >
            <Icon icon="mdi:close" width={18} height={18} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
