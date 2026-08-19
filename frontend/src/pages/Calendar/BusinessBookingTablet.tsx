import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import logo from '../../assets/logo.png'
import dogCatIllustration from '../../assets/dog-cat-illustration.png'

// Fix del ícono por defecto de Leaflet (problema conocido con bundlers)
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

// Coordenadas reales de San Cristóbal, Táchira
// Lista de negocios ficticios (veterinarias/peluquerias) para elegir
// donde se hara la cita. No viene del backend, esta fija en el frontend.
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

        <div>
          <p className="text-[11px] font-bold text-petpulse-primary tracking-[0.5px] uppercase mb-2">
            Mapa de ubicación
          </p>
          <div className="h-[180px] rounded-[20px] border border-petpulse-border overflow-hidden">
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