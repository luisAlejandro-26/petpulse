import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import SideMenu from '../../components/SideMenu'
import { Link, useNavigate } from 'react-router-dom'
import BottomNav from '../../components/BottomNav'
import { getPets } from '../../api/pets'
import type { Pet } from '../../api/types'
import logo from '../../assets/logo.png'
import tituloLogo from '../../assets/titulo_logo.png'

function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    years--
  }
  if (years < 1) {
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    return `${months} meses`
  }
  return `${years} ${years === 1 ? 'año' : 'años'}`
}

function HomeMobile() {
  const { user, token } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return

    getPets(token)
      .then((data) => setPets(data))
      .catch(() => setError('No se pudieron cargar las mascotas'))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div className="min-h-screen w-full bg-petpulse-bg flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[402px] min-h-screen flex flex-col">

        <div className="flex-1 pb-24">
          {/* Header: menú + campana */}
          <div className="flex items-center justify-between px-6 pt-6">
            <button type="button" aria-label="Abrir menú" onClick={() => setMenuOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F3E32" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              </svg>
            </button>
            <button type="button" aria-label="Notificaciones" className="relative">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F3E32" strokeWidth="2">
                <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-petpulse-accent rounded-full border border-petpulse-bg" />
            </button>
          </div>

          {/* Logo */}
          <div className="flex flex-col items-center mt-2">
            <img src={logo} alt="Logo PetPulse" className="w-24 h-auto" />
          </div>

          {/* Bienvenida */}
          <h1 className="font-encode-expanded font-bold text-xl text-petpulse-primary text-center mt-3 flex items-center justify-center gap-1.5">
            Bienvenido\a {user?.name_user ?? 'Nombre'}
            <span aria-hidden="true">🐾</span>
          </h1>
          <p className="font-inter font-semibold text-sm text-petpulse-text-secondary text-center mt-1 px-16 leading-tight">
            Aquí tienes la información de tus mascotas
          </p>

          {/* Lista de mascotas */}
          <div className="px-[27px] mt-10 flex flex-col gap-6">
            {loading && (
              <p className="text-center text-petpulse-text-secondary text-sm font-inter">Cargando mascotas...</p>
            )}

            {!loading && error && (
              <p className="text-center text-petpulse-accent text-sm font-inter">{error}</p>
            )}

            {!loading && !error && pets.length === 0 && (
              <p className="text-center text-petpulse-text-secondary text-sm font-inter px-6">
                Aún no tienes mascotas registradas. ¡Agrega la primera!
              </p>
            )}

            {!loading && !error && pets.map((pet) => (
              <Link
                key={pet.id_pet}
                to={`/pets/${pet.id_pet}`}
                className="relative w-full h-[86px] bg-white border border-petpulse-border rounded-xl shadow-md flex items-center px-4 active:scale-[0.98] transition-transform"
              >
                {/* Avatar circular */}
                <div className="w-12 h-12 rounded-full bg-petpulse-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {pet.pet_image_url ? (
                    <img src={pet.pet_image_url} alt={pet.name_pet} className="w-full h-full object-cover" />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#7A9A7B">
                      <ellipse cx="12" cy="15" rx="6" ry="5" />
                      <ellipse cx="6" cy="8" rx="2.2" ry="3" />
                      <ellipse cx="12" cy="5" rx="2.2" ry="3" />
                      <ellipse cx="18" cy="8" rx="2.2" ry="3" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="ml-3">
                  <p className="font-encode-semi font-bold text-sm text-petpulse-text">{pet.name_pet}</p>
                  <p className="font-encode-condensed text-xs text-petpulse-text-secondary leading-tight">
                    {pet.breed || pet.species}
                  </p>
                  <p className="font-encode-condensed text-xs text-petpulse-text-secondary leading-tight">
                    {calculateAge(pet.birth_date)}
                  </p>
                </div>

                {/* Botón editar */}
                <button
                  type="button"
                  aria-label={`Editar ${pet.name_pet}`}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(`/pets/${pet.id_pet}/edit`)
                  }}
                  className="absolute top-3 right-3 text-petpulse-accent"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" strokeLinecap="round" />
                    <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </Link>
            ))}
          </div>

          {/* Botón agregar mascota */}
          <div className="flex justify-center mt-8">
            <Link
              to="/pets/new"
              className="h-11 px-6 border border-petpulse-primary rounded-full flex items-center gap-2 text-petpulse-primary font-encode-semi font-semibold text-sm active:scale-[0.98] transition-transform"
            >
              Agregar mascotas
              <span aria-hidden="true">🐾</span>
            </Link>
          </div>
        </div>

        {/* NavBar inferior */}
        <BottomNav />
      </div>

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  )
}

export default HomeMobile