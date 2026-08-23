import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import logo from '../../assets/logo.png'
import dogCatIllustration from '../../assets/dog-cat-illustration.png'

type BusinessType = 'peluqueria' | 'veterinaria'

interface Business {
  id: string
  name: string
  phone: string
  address: string
  schedule: string
  verifiedLabel: string
  verifiedDesc: string
  embedUrl: string
}

// Coordenadas reales de San Cristóbal, Táchira
// Lista de negocios ficticios (veterinarias/peluquerias) para elegir
// donde se hara la cita. No viene del backend, esta fija en el frontend.
const BUSINESSES: Record<BusinessType, Business[]> = {
  peluqueria: [
    {
      id: 'peludog',
      name: 'El Oasis de Luna',
      phone: '+58 4247783153',
      address: 'Carr. 2 con Calle 4, Táriba, Táchira',
      schedule: 'Lunes a Sábados: 9:00 AM - 7:00 PM',
      verifiedLabel: 'Servicios profesionales',
      verifiedDesc: 'Baño, corte, limpieza de oídos, corte de uñas y más para el bienestar de tu mascota.',
      embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3474.0987295060313!2d-72.22672599011233!3d7.816019906764296!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e666da7cbf4b72f%3A0xffc805b3b8eef04e!2sEl%20Oasis%20De%20Luna!5e1!3m2!1ses!2sve!4v1787438273018!5m2!1ses!2sve',
    },
    {
      id: 'pawspa',
      name: 'Animales Felices',
      phone: '+58 2763440556',
      address: 'Av. España, San Cristóbal, Táchira',
      schedule: 'Lunes a Sábado: 8:00 AM - 5:00 PM',
      verifiedLabel: 'Servicios profesionales',
      verifiedDesc: 'Estética canina y felina, corte de uñas y tratamientos especiales.',
      embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10351.556826120492!2d-72.2315739907444!3d7.77629167392164!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e666c90321d8bc5%3A0x8171b022543c1d6b!2sTienda%20de%20Mascotas%20Animales%20Felices!5e1!3m2!1ses!2sve!4v1787439915011!5m2!1ses!2sve',
    },
  ],
  veterinaria: [
    {
      id: 'sanjose',
      name: 'Centro Veterinario La Ermita',
      phone: '+58 2765163457',
      address: 'Carr. 4 entre Calle 10 y Calle 11, San Cristóbal, Táchira',
      schedule: 'Lunes a Sábado: 8:30 AM - 4:00 PM',
      verifiedLabel: 'Clínica verificada',
      verifiedDesc: 'Profesionales certificados y atención de calidad para tu mascota.',
      embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3474.4796551732547!2d-72.23642839011269!3d7.770119007391877!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e666ca011644021%3A0x657b69ab0a150c7c!2sCentro%20veterinario%20la%20Ermita!5e1!3m2!1ses!2sve!4v1787440049586!5m2!1ses!2sve',
    },
    {
      id: 'animalhealth',
      name: 'Patas y Huellas',
      phone: '+58 4147261197',
      address: 'Av. Oriental, San Cristóbal, Táchira',
      schedule: 'Lunes a Viernes: 1:00 AM - 5:00 AM - 8:00 AM - 12:00 PM',
      verifiedLabel: 'Clínica verificada',
      verifiedDesc: 'Atención de emergencias 24h y consultas generales.',
      embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1062.9093671182873!2d-72.2222155074474!3d7.756140049703016!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e666d08e247829b%3A0x8d97bff8ddbd2b81!2sPatas%20y%20huellas%20C.A.!5e1!3m2!1ses!2sve!4v1787440648657!5m2!1ses!2sve',
    },
  ],
}

// Titulo y texto del selector segun si es veterinaria o peluqueria.
const TITLES: Record<BusinessType, { title: string; selectorLabel: string }> = {
  peluqueria: { title: 'Peluquerías', selectorLabel: 'Seleccionar peluquería' },
  veterinaria: { title: 'Veterinarias', selectorLabel: 'Seleccionar veterinaria' },
}

// Pantalla para elegir el negocio (veterinaria o peluqueria) donde se
// va a agendar la cita, segundo paso del flujo de "Agendar cita".
function BusinessBookingTablet() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const type: BusinessType = searchParams.get('type') === 'veterinaria' ? 'veterinaria' : 'peluqueria'

  const businesses = BUSINESSES[type]
  // Negocio seleccionado, arranca con el primero de la lista por defecto.
  const [selectedId, setSelectedId] = useState(businesses[0]?.id ?? '')

  const selected = businesses.find((b) => b.id === selectedId) ?? businesses[0]
  const copy = TITLES[type]

  // Pasa al siguiente paso (EventForm) llevando el negocio elegido en la URL.
  function handleAgendar() {
    const eventType = searchParams.get('eventType') || (type === 'peluqueria' ? 'OTHER' : 'CONTROL')
    navigate(`/events/new?business=${encodeURIComponent(selected.name)}&eventType=${eventType}`)
  }

  return (
    <div className="min-h-screen bg-petpulse-bg font-inter text-petpulse-text box-border pb-28">
      <div className="w-full max-w-[600px] mx-auto px-5 pt-8 flex flex-col gap-5">
        <header className="flex items-start justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/events/category', { replace: true })}
            aria-label="Cambiar tipo de cita"
            className="text-petpulse-text bg-transparent border-0 cursor-pointer flex items-center justify-center p-1 hover:text-petpulse-primary"
          >
            <Icon icon="mdi:arrow-left" width={24} height={24} />
          </button>

          <div className="flex-1 text-center">
            <h1 className="font-poppins font-bold text-xl text-petpulse-primary m-0 flex items-center justify-center gap-1.5">
              Agendar cita <Icon icon="mdi:paw" width={18} height={18} className="text-petpulse-primary" />
            </h1>
            <p className="text-[13px] text-petpulse-text-secondary mt-0.5 mb-0">{copy.title}</p>
          </div>
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

        <div className="bg-petpulse-card border border-petpulse-border rounded-[20px] p-5">
          <label htmlFor="business" className="block text-[11px] font-bold text-petpulse-primary tracking-[0.5px] uppercase mb-2">
            {copy.selectorLabel}
          </label>
          <div className="relative flex items-center">
            <select
              id="business"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full box-border font-inter font-semibold text-sm py-2.5 pl-4 pr-9 rounded-full border border-petpulse-border bg-petpulse-bg text-petpulse-text cursor-pointer appearance-none focus:outline-none focus:border-petpulse-primary focus:ring-[3px] focus:ring-[rgba(122,154,123,0.18)]"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <Icon
              icon="mdi:chevron-down"
              width={18}
              height={18}
              className="absolute right-4 text-petpulse-primary pointer-events-none"
            />
          </div>
        </div>

        <div className="bg-petpulse-card border border-petpulse-border rounded-[20px] p-5">
          <p className="text-[11px] font-bold text-petpulse-primary tracking-[0.5px] uppercase mb-3">Información</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Icon icon="mdi:phone" width={18} height={18} className="text-petpulse-primary shrink-0" />
              <a
                href={`tel:${selected.phone.replace(/\s/g, '')}`}
                className="text-sm text-petpulse-primary underline decoration-petpulse-primary/30 hover:decoration-petpulse-primary transition-colors"
              >
                {selected.phone}
              </a>
            </div>
            <div className="flex items-start gap-3">
              <Icon icon="mdi:map-marker" width={18} height={18} className="text-petpulse-accent shrink-0 mt-0.5" />
              <span className="text-sm text-petpulse-text">{selected.address}</span>
            </div>
            <div className="flex items-start gap-3">
              <Icon icon="mdi:clock-outline" width={18} height={18} className="text-petpulse-primary shrink-0 mt-0.5" />
              <span className="text-sm text-petpulse-text whitespace-pre-line">{selected.schedule}</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold text-petpulse-primary tracking-[0.5px] uppercase mb-2">
            Mapa de ubicación
          </p>
          <div className="h-[180px] rounded-[20px] border border-petpulse-border overflow-hidden">
            <iframe
              src={selected.embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title={`Mapa de ${selected.name}`}
            />
          </div>
        </div>

        <div
          className="rounded-[20px] p-5 flex items-start gap-3"
          style={{
            background: 'linear-gradient(103.66deg, rgba(122, 154, 123, 0.08) 0%, rgba(122, 154, 123, 0.04) 100%)',
            border: '1px solid rgba(122, 154, 123, 0.2)',
          }}
        >
          <div className="w-9 h-9 rounded-full bg-petpulse-primary flex items-center justify-center shrink-0">
            <Icon icon="mdi:check" width={18} height={18} color="white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-petpulse-primary-dark m-0">{selected.verifiedLabel}</p>
            <p className="text-xs text-petpulse-text-secondary mt-0.5 mb-0">{selected.verifiedDesc}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAgendar}
          className="w-full bg-petpulse-primary text-white font-inter font-bold text-sm rounded-full py-3.5 border-0 cursor-pointer transition-colors hover:bg-petpulse-primary-dark active:scale-[0.98]"
        >
          Agendar Cita
        </button>
      </div>

      <nav className="fixed bottom-4 left-0 right-0 flex justify-center px-5 z-10" aria-label="Navegación principal">
        <div className="w-full max-w-[620px] bg-petpulse-card border border-petpulse-border rounded-[20px] shadow-[0_16px_32px_-18px_rgba(47,62,50,0.3)] flex items-center justify-around px-3 py-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center gap-[3px] bg-transparent border-0 cursor-pointer text-[11px] font-semibold px-4 py-2 rounded-[14px] transition-colors text-petpulse-text-secondary hover:bg-[#eaf0ea] hover:text-petpulse-primary-dark"
          >
            <Icon icon="mdi:home-outline" width={22} height={22} />
            <span>Inicio</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/calendar')}
            className="flex flex-col items-center gap-[3px] bg-transparent border-0 cursor-pointer text-[11px] font-semibold px-4 py-2 rounded-[14px] transition-colors text-petpulse-text-secondary hover:bg-[#eaf0ea] hover:text-petpulse-primary-dark"
          >
            <Icon icon="mdi:calendar-month-outline" width={22} height={22} />
            <span>Calendario</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/pet-ia')}
            className="flex flex-col items-center gap-[3px] bg-transparent border-0 cursor-pointer text-[11px] font-semibold px-4 py-2 rounded-[14px] transition-colors text-petpulse-text-secondary hover:bg-[#eaf0ea] hover:text-petpulse-primary-dark"
          >
            <Icon icon="mdi:paw-outline" width={22} height={22} />
            <span>PetIA</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-[3px] bg-transparent border-0 cursor-pointer text-[11px] font-semibold px-4 py-2 rounded-[14px] transition-colors text-petpulse-text-secondary hover:bg-[#eaf0ea] hover:text-petpulse-primary-dark"
          >
            <Icon icon="mdi:account-outline" width={22} height={22} />
            <span>Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default BusinessBookingTablet