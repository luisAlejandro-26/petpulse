import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'
import type { HealthEvent } from '../../api/types'
import { ACTIVITY_META, formatDate } from './dashboardUtils'

interface NotificationsModalProps {
  open: boolean
  onClose: () => void
  alertaSalud: number
  actividadReciente: HealthEvent[]
  loading: boolean
}

export default function NotificationsModal({ open, onClose, alertaSalud, actividadReciente, loading }: NotificationsModalProps) {
  const navigate = useNavigate()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
      <div className="w-full max-w-[440px] max-h-[80vh] bg-petpulse-bg rounded-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-petpulse-border">
          <h2 className="font-bold text-lg text-petpulse-text">Notificaciones</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar notificaciones">
            <Icon icon="mdi:close" width={22} height={22} className="text-petpulse-text" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {/* Alerta de salud */}
          <div className="rounded-2xl bg-white border border-petpulse-border p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#fbe9e5] flex items-center justify-center shrink-0">
                <Icon icon="mdi:heart-pulse" width={20} height={20} className="text-petpulse-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none text-petpulse-text">{alertaSalud}</p>
                <p className="text-sm text-petpulse-text-secondary">Alertas de salud activas</p>
              </div>
            </div>
            <p className="text-xs text-petpulse-text-secondary mt-3 leading-relaxed">
              Revisa el estado de tus mascotas y agenda una cita si lo consideras necesario.
            </p>
          </div>

          {/* Actividad reciente */}
          <div>
            <h3 className="text-sm font-bold text-petpulse-text uppercase tracking-wide mb-4">
              Actividad reciente
            </h3>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-petpulse-text-secondary">
                <Icon icon="svg-spinners:dots-2" width={20} height={20} />
                Cargando...
              </div>
            ) : actividadReciente.length === 0 ? (
              <p className="text-sm text-petpulse-text-secondary py-4 text-center">
                Aún no hay actividad registrada.
              </p>
            ) : (
              <ul className="flex flex-col gap-2 list-none p-0 m-0">
                {actividadReciente.map((ev) => {
                  const meta = ACTIVITY_META[ev.event_type] ?? ACTIVITY_META.OTHER
                  const isAccent = meta.tone === 'accent'
                  return (
                    <li
                      key={ev.id_event}
                      className="flex items-center gap-3 bg-white border border-petpulse-border rounded-xl px-3.5 py-3"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          isAccent
                            ? 'bg-petpulse-accent/10 text-petpulse-accent'
                            : 'bg-petpulse-primary/15 text-petpulse-primary-dark'
                        }`}
                      >
                        <Icon icon={meta.icon} width={18} height={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-petpulse-text truncate">
                          {meta.label} {ev.pet?.name_pet ? `· ${ev.pet.name_pet}` : ''}
                        </p>
                        <p className="text-xs text-petpulse-text-secondary mt-0.5">
                          {formatDate(ev.event_date)}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            {!loading && actividadReciente.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  navigate('/calendar')
                }}
                className="w-full mt-5 py-3 rounded-full border border-petpulse-border text-sm font-semibold text-petpulse-primary-dark flex items-center justify-center gap-1.5 hover:bg-petpulse-primary/10 transition-colors"
              >
                Ver todas las actividades
                <Icon icon="mdi:chevron-right" width={16} height={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
