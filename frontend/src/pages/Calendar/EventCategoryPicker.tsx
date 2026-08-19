import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'

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

function EventCategoryPicker() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const petId = searchParams.get('pet')

  function handleSelect(category: Category) {
    const petParam = petId ? `&pet=${petId}` : ''
    navigate(`/events/booking?type=${category.businessType}&eventType=${category.type}${petParam}`)
  }

  return (
    <div className="h-screen w-full bg-petpulse-bg flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[402px] h-screen overflow-hidden">
      <div className="h-full overflow-y-auto pb-10">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6">
          <button type="button" onClick={() => navigate(-1)} aria-label="Volver">
            <Icon icon="mdi:chevron-left" width={26} height={26} color="#2F3E32" />
          </button>
        </div>

        <h1 className="font-encode-expanded font-bold text-xl text-petpulse-primary text-center mt-2">
          ¿Qué necesitas agendar?
        </h1>
        <p className="font-inter text-sm text-petpulse-text-secondary text-center mt-1 px-10">
          Elige el tipo de cita para continuar
        </p>

        {/* Lista de categorías */}
        <div className="px-5 mt-8 flex flex-col gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.type}
              type="button"
              onClick={() => handleSelect(cat)}
              className="w-full h-16 bg-white border border-petpulse-border rounded-xl flex items-center px-4 gap-4 active:scale-[0.98] transition-transform"
            >
              <div className="w-11 h-11 rounded-full bg-petpulse-primary/15 flex items-center justify-center flex-shrink-0">
                <Icon icon={cat.icon} width={22} height={22} color="#7A9A7B" />
              </div>
              <span className="font-encode-semi font-semibold text-sm text-petpulse-text flex-1 text-left">
                {cat.label}
              </span>
              <Icon icon="mdi:chevron-right" width={20} height={20} color="#D8D3CD" />
            </button>
          ))}
        </div>
      </div>
      </div>
    </div>
  )
}

export default EventCategoryPicker
