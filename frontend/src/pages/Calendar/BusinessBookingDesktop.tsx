import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import Sidebar from '../../components/dashboard/Sidebar'

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

type BusinessType = 'peluqueria' | 'veterinaria'

interface Business {
  id: string
  name: string
  phone: string
  address: string
  schedule: string
  verifiedLabel: string
  verifiedDesc: string
  lat: number
  lng: number
}

const BUSINESSES: Record<BusinessType, Business[]> = {
  peluqueria: [
    {
      id: 'peludog',
      name: 'PeluDog Spa & Grooming',
      phone: '+58 424 676 7676',
      address: 'Av. Ferrero Tamayo, San Cristóbal, Táchira',
      schedule: 'Lunes a Viernes: 9:00 AM - 5:00 PM\nSábados: 9:00 AM - 2:00 PM',
      verifiedLabel: 'Servicios profesionales',
      verifiedDesc: 'Baño, corte, limpieza de oídos, corte de uñas y más para el bienestar de tu mascota.',
      lat: 7.7669,
      lng: -72.225,
    },
    {
      id: 'pawspa',
      name: 'Paw Spa Táchira',
      phone: '+58 414 555 2233',
      address: 'Av. España, San Cristóbal, Táchira',
      schedule: 'Lunes a Sábado: 8:00 AM - 5:00 PM',
      verifiedLabel: 'Servicios profesionales',
      verifiedDesc: 'Estética canina y felina, corte de uñas y tratamientos especiales.',
      lat: 7.7788,
      lng: -72.2308,
    },
  ],
  veterinaria: [
    {
      id: 'sanjose',
      name: 'Clínica Veterinaria San José',
      phone: '+58 412 123 4567',
      address: 'Av. Libertador, San Cristóbal, Táchira',
      schedule: 'Lunes a Sábado: 8:00 AM - 6:00 PM',
      verifiedLabel: 'Clínica verificada',
      verifiedDesc: 'Profesionales certificados y atención de calidad para tu mascota.',
      lat: 7.7738,
      lng: -72.2245,
    },
    {
      id: 'animalhealth',
      name: 'Animal Health Center',
      phone: '+58 276 344 5566',
      address: 'Av. Carabobo, San Cristóbal, Táchira',
      schedule: 'Lunes a Viernes: 8:00 AM - 7:00 PM',
      verifiedLabel: 'Clínica verificada',
      verifiedDesc: 'Atención de emergencias 24h y consultas generales.',
      lat: 7.7695,
      lng: -72.2198,
    },
  ],
}

const TITLES: Record<BusinessType, { title: string; selectorLabel: string }> = {
  peluqueria: { title: 'Peluquerías', selectorLabel: 'Seleccionar peluquería' },
  veterinaria: { title: 'Veterinarias', selectorLabel: 'Seleccionar veterinaria' },
}

function BusinessBookingDesktop() {
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
    <div className="min-h-screen w-full bg-petpulse-bg flex">
      <Sidebar />

      {/* ── Centro ── */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto px-8 py-8 flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            aria-label="Cambiar tipo de cita"
            className="w-10 h-10 rounded-full border border-petpulse-border bg-white flex items-center justify-center text-petpulse-text hover:text-petpulse-primary hover:border-petpulse-primary transition-colors"
          >
            <Icon icon="mdi:arrow-left" width={22} height={22} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-petpulse-text flex items-center gap-2">
              Agendar cita
              <Icon icon="mdi:paw" width={20} height={20} className="text-petpulse-primary" />
            </h1>
            <p className="text-sm text-petpulse-text-secondary mt-0.5">{copy.title}</p>
          </div>
        </div>

        {/* Selector */}
        <div className="bg-white border border-petpulse-border rounded-2xl p-5">
          <label htmlFor="business" className="block text-[11px] font-bold text-petpulse-primary tracking-[0.5px] uppercase mb-2">
            {copy.selectorLabel}
          </label>
          <div className="relative flex items-center">
            <select
              id="business"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full font-semibold text-sm py-2.5 pl-4 pr-9 rounded-full border border-petpulse-border bg-petpulse-bg text-petpulse-text cursor-pointer appearance-none focus:outline-none focus:border-petpulse-primary focus:ring-[3px] focus:ring-[rgba(122,154,123,0.18)]"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <Icon icon="mdi:chevron-down" width={18} height={18} className="absolute right-4 text-petpulse-primary pointer-events-none" />
          </div>
        </div>

        {/* Info del negocio */}
        <div className="bg-white border border-petpulse-border rounded-2xl p-5">
          <p className="text-[11px] font-bold text-petpulse-primary tracking-[0.5px] uppercase mb-3">Información</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Icon icon="mdi:phone" width={18} height={18} className="text-petpulse-primary shrink-0" />
              <span className="text-sm text-petpulse-text">{selected.phone}</span>
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

        {/* Mapa */}
        <div>
          <p className="text-[11px] font-bold text-petpulse-primary tracking-[0.5px] uppercase mb-2">Mapa de ubicación</p>
          <div className="h-[220px] rounded-2xl border border-petpulse-border overflow-hidden">
            <MapContainer
              center={[selected.lat, selected.lng]}
              zoom={14}
              scrollWheelZoom
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {businesses.map((b) => (
                <Marker key={b.id} position={[b.lat, b.lng]}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{b.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{b.address}</p>
                      <button
                        type="button"
                        onClick={() => setSelectedId(b.id)}
                        className="mt-2 text-xs font-semibold text-white bg-[#7A9A7B] px-3 py-1 rounded-full"
                      >
                        Ver información
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Badge verificado */}
        <div
          className="rounded-2xl p-5 flex items-start gap-3"
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

        {/* Botón agendar */}
        <button
          type="button"
          onClick={handleAgendar}
          className="w-full bg-petpulse-primary text-white font-bold text-sm rounded-full py-3.5 border-0 cursor-pointer transition-colors hover:bg-petpulse-primary-dark active:scale-[0.98]"
        >
          Agendar Cita
        </button>
      </main>

      {/* ── Panel derecho (Consejos) ── */}
      <aside className="w-[320px] shrink-0 bg-white border-l border-petpulse-border h-screen sticky top-0 flex flex-col overflow-y-auto">
        <div className="flex justify-end px-6 pt-6">
          <button type="button" aria-label="Notificaciones" className="relative w-10 h-10 rounded-full bg-petpulse-bg flex items-center justify-center text-petpulse-text hover:text-petpulse-primary-dark transition-colors">
            <Icon icon="mdi:bell-outline" width={20} height={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-petpulse-accent rounded-full border border-white" />
          </button>
        </div>

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
              <Icon icon="mdi:map-marker-check" width={16} height={16} className="text-[#6B8C6C]" />
            </div>
            <p className="text-sm font-medium text-petpulse-text leading-snug">Revisa la ubicación y horario antes de agendar.</p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full border border-[#6B8C6C] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon icon="mdi:phone-outline" width={16} height={16} className="text-[#6B8C6C]" />
            </div>
            <p className="text-sm font-medium text-petpulse-text leading-snug">Puedes llamar directamente para confirmar disponibilidad.</p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full border border-[#6B8C6C] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon icon="mdi:shield-check" width={16} height={16} className="text-[#6B8C6C]" />
            </div>
            <p className="text-sm font-medium text-petpulse-text leading-snug">Prefiere negocios verificados para mayor confianza.</p>
          </div>

          <img src="/assets/banner-agg-pet.svg" alt="" className="w-full h-auto object-cover rounded-2xl mt-2" />
        </div>
      </aside>
    </div>
  )
}

export default BusinessBookingDesktop
