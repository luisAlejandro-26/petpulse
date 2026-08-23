import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'

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

const TITLES: Record<BusinessType, { title: string; selectorLabel: string }> = {
  peluqueria: { title: 'Peluquerías', selectorLabel: 'Seleccionar Peluquería' },
  veterinaria: { title: 'Veterinarias', selectorLabel: 'Seleccionar veterinaria' },
}

function BusinessBooking() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const type: BusinessType = searchParams.get('type') === 'veterinaria' ? 'veterinaria' : 'peluqueria'

  const businesses = BUSINESSES[type]
  const [selectedId, setSelectedId] = useState(businesses[0]?.id ?? '')

  const selected = businesses.find((b) => b.id === selectedId) ?? businesses[0]
  const copy = TITLES[type]

  function handleAgendar() {
    const eventType = searchParams.get('eventType') || (type === 'peluqueria' ? 'OTHER' : 'CONTROL')
    navigate(`/events/new?business=${encodeURIComponent(selected.name)}&eventType=${eventType}`)
  }

  return (
    <div className="h-screen w-full bg-petpulse-bg flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[402px] h-screen overflow-hidden">
      <div className="h-full overflow-y-auto pb-10">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6">
          <button
            type="button"
            onClick={() => navigate('/events/category', { replace: true })}
            aria-label="Cambiar tipo de cita"
            className="w-9 h-9 flex items-center justify-center rounded-full active:bg-petpulse-primary/10 transition-colors -ml-2"
          >
            <Icon icon="mdi:chevron-left" width={24} height={24} color="#2F3E32" />
          </button>
        </div>

        <h1 className="font-inter font-bold text-base text-petpulse-primary-dark text-center mt-4">
          {copy.title}
        </h1>

        {/* Selector */}
        <div className="px-5 mt-4">
          <label htmlFor="business" className="font-inter font-semibold text-sm text-petpulse-primary block mb-2">
            {copy.selectorLabel}
          </label>
          <div className="relative">
            <select
              id="business"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full h-[42px] bg-white border border-petpulse-border rounded-lg pl-3 pr-9 text-sm text-petpulse-text focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow appearance-none"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon icon="mdi:chevron-down" width={18} height={18} color="#7A9A7B" />
            </span>
          </div>
        </div>

        {/* Información */}
        <p className="font-inter font-bold text-[13px] text-petpulse-primary tracking-[0.5px] uppercase px-5 mt-6 mb-2">
          Información
        </p>

        <div className="mx-5 bg-white border border-petpulse-border rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Icon icon="mdi:phone" width={18} height={18} color="#7A9A7B" />
            <a
              href={`tel:${selected.phone.replace(/\s/g, '')}`}
              className="font-inter text-sm text-petpulse-primary underline decoration-petpulse-primary/30 hover:decoration-petpulse-primary transition-colors"
            >
              {selected.phone}
            </a>
          </div>
          <div className="flex items-start gap-3">
            <Icon icon="mdi:map-marker" width={18} height={18} color="#E07A5F" className="mt-0.5 flex-shrink-0" />
            <span className="font-inter text-sm text-petpulse-text">{selected.address}</span>
          </div>
          <div className="flex items-start gap-3">
            <Icon icon="mdi:clock-outline" width={18} height={18} color="#7A9A7B" className="mt-0.5 flex-shrink-0" />
            <span className="font-inter text-sm text-petpulse-text whitespace-pre-line">{selected.schedule}</span>
          </div>
        </div>

        {/* Mapa real con Google Maps */}
        <div className="mx-5 mt-4 h-[220px] rounded-xl border border-petpulse-border overflow-hidden">
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

        {/* Card verificada */}
        <div
          className="mx-5 mt-4 rounded-xl p-4 flex items-start gap-3"
          style={{
            background: 'linear-gradient(103.66deg, rgba(122, 154, 123, 0.08) 0%, rgba(122, 154, 123, 0.04) 100%)',
            border: '1px solid rgba(122, 154, 123, 0.2)',
          }}
        >
          <div className="w-9 h-9 rounded-full bg-petpulse-primary flex items-center justify-center flex-shrink-0">
            <Icon icon="mdi:check" width={18} height={18} color="white" />
          </div>
          <div>
            <p className="font-encode-semi font-bold text-sm text-petpulse-primary-dark">{selected.verifiedLabel}</p>
            <p className="font-inter text-xs text-petpulse-text-secondary mt-0.5">{selected.verifiedDesc}</p>
          </div>
        </div>

        {/* Botón agendar */}
        <div className="px-5 mt-6">
          <button
            type="button"
            onClick={handleAgendar}
            className="w-full h-11 bg-petpulse-primary hover:bg-petpulse-primary-dark active:scale-[0.98] text-white font-encode-semi font-bold text-base rounded-xl transition-all"
          >
            Agendar Cita
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}

export default BusinessBooking