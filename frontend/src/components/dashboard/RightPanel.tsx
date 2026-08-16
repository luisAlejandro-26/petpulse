import { AlertTriangle, Bell, BellRing, ChevronRight, Pill, Stethoscope, Syringe } from 'lucide-react'
import type { Activity, ActivityType } from '../../api/types'

const ACTIVITY_ICONS: Record<ActivityType, typeof Syringe> = {
  VACUNA: Syringe,
  CONSULTA: Stethoscope,
  MEDICAMENTO: Pill,
  RECORDATORIO: BellRing,
}

// Datos de ejemplo mientras no exista el endpoint de actividad reciente.
const SAMPLE_ACTIVITIES: Activity[] = [
  { id: 1, type: 'VACUNA', title: 'Vacuna anual', description: 'Max', time: 'Hace 2 h' },
  { id: 2, type: 'CONSULTA', title: 'Consulta veterinaria', description: 'Luna', time: 'Hace 5 h' },
  { id: 3, type: 'MEDICAMENTO', title: 'Antipulgas aplicado', description: 'Toby', time: 'Ayer' },
  { id: 4, type: 'RECORDATORIO', title: 'Cita de rutina', description: 'Próximo lunes', time: 'En 3 días' },
]

function RightPanel() {
  return (
    <aside className="w-[320px] shrink-0 bg-white border-l border-petpulse-border h-screen sticky top-0 flex flex-col">
      {/* Encabezado con campanita */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-petpulse-border">
        <h2 className="text-lg font-bold text-petpulse-text">Notificaciones</h2>
        <button
          type="button"
          aria-label="Ver notificaciones"
          className="relative w-10 h-10 rounded-full bg-petpulse-bg flex items-center justify-center text-petpulse-text hover:text-petpulse-primary-dark transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-petpulse-accent rounded-full border border-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
        {/* Alerta de salud */}
        <div className="rounded-2xl bg-petpulse-accent text-white p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">2</p>
              <p className="text-sm text-white/90">Alertas de salud activas</p>
            </div>
          </div>
          <p className="text-xs text-white/80 mt-3 leading-relaxed">
            Revisa el estado de tus mascotas y agenda una cita si lo consideras necesario.
          </p>
        </div>

        {/* Actividad reciente */}
        <div>
          <h3 className="text-sm font-bold text-petpulse-text uppercase tracking-wide mb-4">
            Actividad reciente
          </h3>
          <ul className="flex flex-col gap-1">
            {SAMPLE_ACTIVITIES.map((activity) => {
              const Icon = ACTIVITY_ICONS[activity.type]
              const isAlert = activity.type === 'CONSULTA' || activity.type === 'MEDICAMENTO'
              return (
                <li key={activity.id} className="flex items-center gap-3.5 py-2.5">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isAlert
                        ? 'bg-petpulse-accent/10 text-petpulse-accent'
                        : 'bg-petpulse-primary/15 text-petpulse-primary-dark'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-petpulse-text truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-petpulse-text-secondary truncate mt-0.5">
                      {activity.description} · {activity.time}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>

          <button
            type="button"
            className="w-full mt-5 py-3 rounded-full border border-petpulse-border text-sm font-semibold text-petpulse-primary-dark flex items-center justify-center gap-1.5 hover:bg-petpulse-primary/10 transition-colors"
          >
            Ver todas las actividades
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default RightPanel
