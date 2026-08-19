import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import Sidebar from '../../components/dashboard/Sidebar'


type Category = {
  type: 'VACUNA' | 'CONTROL' | 'DESPARACITACION' | 'CIRUGIA' | 'OTHER'
  label: string
  icon: string
  businessType: 'veterinaria' | 'peluqueria'
}

const CATEGORIES: Category[] = [
  { type: 'VACUNA', label: 'Vacuna', icon: 'game-icons:medicines', businessType: 'veterinaria' },
  { type: 'CONTROL', label: 'Control médico', icon: 'hugeicons:doctor-01', businessType: 'veterinaria' },
  { type: 'DESPARACITACION', label: 'Desparasitación', icon: 'material-symbols:emergency', businessType: 'veterinaria' },
  { type: 'CIRUGIA', label: 'Cirugía', icon: 'material-symbols:emergency', businessType: 'veterinaria' },
  { type: 'OTHER', label: 'Peluquería (baño, corte)', icon: 'mdi:content-cut', businessType: 'peluqueria' },
]

function EventCategoryPickerDesktop() {
  const navigate = useNavigate()

  function handleSelect(category: Category) {
    navigate(`/events/booking?type=${category.businessType}&eventType=${category.type}`)
  }

  return (
    <div className="min-h-screen w-full bg-petpulse-bg flex">
      <Sidebar />

      {/* ── Centro ── */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto px-8 py-8 flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="w-10 h-10 rounded-full border border-petpulse-border bg-white flex items-center justify-center text-petpulse-text hover:text-petpulse-primary hover:border-petpulse-primary transition-colors"
          >
            <Icon icon="mdi:arrow-left" width={22} height={22} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-petpulse-text">¿Qué necesitas agendar?</h1>
            <p className="text-sm text-petpulse-text-secondary mt-0.5">Elige el tipo de cita para continuar</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.type}
              type="button"
              onClick={() => handleSelect(cat)}
              className="w-full bg-white border border-petpulse-border rounded-2xl flex items-center px-5 py-4 gap-4 cursor-pointer transition-colors hover:bg-[#eaf0ea] hover:border-petpulse-primary active:scale-[0.99]"
            >
              <div className="w-12 h-12 rounded-full bg-[#eaf0ea] flex items-center justify-center shrink-0">
                <Icon icon={cat.icon} width={24} height={24} className="text-petpulse-primary" />
              </div>
              <span className="font-semibold text-[15px] text-petpulse-text flex-1 text-left">{cat.label}</span>
              <Icon icon="mdi:chevron-right" width={22} height={22} className="text-petpulse-border" />
            </button>
          ))}
        </div>
      </main>

      {/* ── Panel derecho (Consejos) ── */}
      <aside className="w-[320px] shrink-0 bg-white border-l border-petpulse-border h-screen sticky top-0 flex flex-col overflow-y-auto">


        <div className="flex justify-center px-6 py-6">
          <img src="/assets/imagen-centro-ia.svg" alt="Mascotas" className="w-48 h-auto object-contain" />
        </div>

        <div className="mx-6 bg-[#EAF0EB] rounded-3xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#6B8C6C] flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:lightbulb-outline" width={20} height={20} className="text-[#6B8C6C]" />
            </div>
            <p className="font-bold text-[#6B8C6C] text-base">Consejos rápidos</p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full border border-[#6B8C6C] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon icon="mdi:stethoscope" width={16} height={16} className="text-[#6B8C6C]" />
            </div>
            <p className="text-sm font-medium text-petpulse-text leading-snug">Elige el tipo de cita según la necesidad de tu mascota.</p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full border border-[#6B8C6C] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon icon="mdi:calendar-clock-outline" width={16} height={16} className="text-[#6B8C6C]" />
            </div>
            <p className="text-sm font-medium text-petpulse-text leading-snug">Agenda con anticipación para asegurar disponibilidad.</p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full border border-[#6B8C6C] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon icon="mdi:heart-outline" width={16} height={16} className="text-[#6B8C6C]" />
            </div>
            <p className="text-sm font-medium text-petpulse-text leading-snug">Mantén al día las vacunas y controles preventivos.</p>
          </div>

          <img src="/assets/banner-agg-pet.svg" alt="" className="w-full h-auto object-cover rounded-2xl mt-2" />
        </div>
      </aside>

    </div>
  )
}

export default EventCategoryPickerDesktop
