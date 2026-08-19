import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import logo from '../../assets/logo.png'
import dogCatIllustration from '../../assets/dog-cat-illustration.png'

type Category = {
  type: 'VACUNA' | 'CONTROL' | 'DESPARACITACION' | 'CIRUGIA' | 'OTHER'
  label: string
  icon: string
  businessType: 'veterinaria' | 'peluqueria'
}

// Cada categoria dice ademas a que tipo de negocio corresponde
// (veterinaria o peluqueria), para saber que lista mostrar en el
// siguiente paso (BusinessBookingTablet).
const CATEGORIES: Category[] = [
  { type: 'VACUNA', label: 'Vacuna', icon: 'game-icons:medicines', businessType: 'veterinaria' },
  { type: 'CONTROL', label: 'Control médico', icon: 'hugeicons:doctor-01', businessType: 'veterinaria' },
  { type: 'DESPARACITACION', label: 'Desparasitación', icon: 'material-symbols:emergency', businessType: 'veterinaria' },
  { type: 'CIRUGIA', label: 'Cirugía', icon: 'material-symbols:emergency', businessType: 'veterinaria' },
  { type: 'OTHER', label: 'Peluquería (baño, corte)', icon: 'mdi:content-cut', businessType: 'peluqueria' },
]

// Primer paso del flujo "Agendar cita": elegir que tipo de evento se
// necesita (vacuna, control, peluqueria, etc.).
function EventCategoryPickerTablet() {
  const navigate = useNavigate()

  // Al elegir una categoria, pasa al paso de elegir negocio, llevando el
  // tipo de negocio y el tipo de evento en la URL.
  function handleSelect(category: Category) {
    navigate(`/events/booking?type=${category.businessType}&eventType=${category.type}`)
  }

  return (
    <div className="min-h-screen bg-petpulse-bg font-inter text-petpulse-text box-border pb-16">
      <div className="w-full max-w-[600px] mx-auto px-5 pt-8 flex flex-col gap-5">
        <header className="flex items-start justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="text-petpulse-text bg-transparent border-0 cursor-pointer flex items-center justify-center p-1 hover:text-petpulse-primary"
          >
            <Icon icon="mdi:arrow-left" width={24} height={24} />
          </button>

          <div className="flex-1 text-center">
            <h1 className="font-poppins font-bold text-xl text-petpulse-primary m-0">¿Qué necesitas agendar?</h1>
            <p className="text-[13px] text-petpulse-text-secondary mt-0.5 mb-0">Elige el tipo de cita para continuar</p>
          </div>

          <span className="w-10 h-10 shrink-0" aria-hidden="true" />
        </header>

        <div className="flex items-center gap-2 -mt-3">
          <img src={logo} alt="" className="w-[84px] h-auto shrink-0" />
          <div>
            <p className="font-poppins font-bold text-xl text-petpulse-primary m-0 tracking-[0.02em]">PETPULSE</p>
            <p className="text-[11px] text-petpulse-text-secondary m-0 leading-[1.3] max-w-[160px]">
              Salud y bienestar para tus mascotas.
            </p>
          </div>
          <img src={dogCatIllustration} alt="" className="h-16 w-auto ml-auto shrink-0 object-contain hidden sm:block" />
        </div>

        <div className="flex flex-col gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.type}
              type="button"
              onClick={() => handleSelect(cat)}
              className="w-full bg-petpulse-card border border-petpulse-border rounded-[16px] flex items-center px-4 py-3.5 gap-4 cursor-pointer transition-colors hover:bg-[#eaf0ea] hover:border-petpulse-primary active:scale-[0.99]"
            >
              <div className="w-11 h-11 rounded-full bg-[#eaf0ea] flex items-center justify-center shrink-0">
                <Icon icon={cat.icon} width={22} height={22} className="text-petpulse-primary" />
              </div>
              <span className="font-semibold text-sm text-petpulse-text flex-1 text-left">{cat.label}</span>
              <Icon icon="mdi:chevron-right" width={20} height={20} className="text-petpulse-border" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EventCategoryPickerTablet