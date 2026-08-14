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
}

const BUSINESSES: Record<BusinessType, Business[]> = {
  peluqueria: [
    {
      id: 'peludog',
      name: 'PeluDog Spa & Grooming',
      phone: '+58 424 676 7676',
      address: 'Calle Sucre, Urb. El bosque, Maracay 1203.',
      schedule: 'Lunes a Viernes: 9:00 AM - 5:00 PM\nSábados: 9:00 AM - 2:00 PM',
      verifiedLabel: 'Servicios profesionales',
      verifiedDesc: 'Baño, corte, limpieza de oídos, corte de uñas y más para el bienestar de tu mascota.',
    },
  ],
  veterinaria: [
    {
      id: 'sanjose',
      name: 'Clínica Veterinaria San José',
      phone: '+58 412 123 4567',
      address: 'Av. Principal de Las Acacias, C.C. Vet Center, Local 12. Maracay.',
      schedule: 'Lunes a Sábado: 8:00 AM - 6:00 PM',
      verifiedLabel: 'Clínica verificada',
      verifiedDesc: 'Profesionales certificados y atención de calidad para tu mascota.',
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
    <div className="min-h-screen w-full bg-petpulse-bg flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[402px] min-h-screen pb-24">

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
          <button type="button" aria-label="Notificaciones" className="relative">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F3E32" strokeWidth="2">
              <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-petpulse-accent rounded-full border border-petpulse-bg" />
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
            <span className="font-inter text-sm text-petpulse-text">{selected.phone}</span>
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

        {/* Mapa (placeholder) */}
        <div
          className="mx-5 mt-4 h-[200px] rounded-xl border border-petpulse-border flex items-center justify-center"
          style={{ background: 'linear-gradient(119.64deg, #E8F5E9 0%, #F1F8F6 100%)' }}
        >
          <div className="flex flex-col items-center gap-1">
            <Icon icon="mdi:map-marker" width={28} height={28} color="#E53935" />
            <span className="font-inter text-xs text-petpulse-text-secondary">Mapa de ubicación</span>
          </div>
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
  )
}

export default BusinessBooking