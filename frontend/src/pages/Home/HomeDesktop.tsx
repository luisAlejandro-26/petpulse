import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { deletePet, getPets } from '../../api/pets'
import {
  deleteUser,
  getAdminStats,
  getReminders,
  getUpcomingAppointments,
  getUsers,
} from '../../api/dashboard'
import type { AdminStats, Pet, User } from '../../api/types'
import {
  AlarmClock,
  CalendarClock,
  HardDrive,
  Loader2,
  Plus,
  Search,
  Stethoscope,
  Users as UsersIcon,
} from 'lucide-react'
import Sidebar from '../../components/dashboard/Sidebar'
import RightPanel from '../../components/dashboard/RightPanel'
import StatCard from '../../components/dashboard/StatCard'
import ListItemCard from '../../components/dashboard/ListItemCard'

interface HomeDesktopProps {
  role: 'user' | 'admin'
}

function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    years--
  }
  if (years < 1) {
    const months =
      (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    return `${months} meses`
  }
  return `${years} ${years === 1 ? 'año' : 'años'}`
}

function HomeDesktop({ role }: HomeDesktopProps) {
  const { user, token } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Datos de usuario
  const [pets, setPets] = useState<Pet[]>([])
  const [upcomingCount, setUpcomingCount] = useState(0)
  const [remindersCount, setRemindersCount] = useState(0)

  // Datos de administrador
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState<AdminStats | null>(null)

  useEffect(() => {
    if (!token) return
    const authToken = token
    let cancelled = false
    setLoading(true)
    setError('')

    async function load() {
      try {
        if (role === 'user') {
          const [petsData, appointments, reminders] = await Promise.all([
            getPets(authToken),
            getUpcomingAppointments(authToken),
            getReminders(authToken),
          ])
          if (cancelled) return
          setPets(petsData)
          setUpcomingCount(appointments.length)
          setRemindersCount(reminders.length)
        } else {
          const [usersData, statsData] = await Promise.all([
            getUsers(authToken),
            getAdminStats(authToken),
          ])
          if (cancelled) return
          setUsers(usersData)
          setStats(statsData)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar los datos')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [token, role])

  // Búsqueda de usuarios (debounce)
  useEffect(() => {
    if (role !== 'admin' || !token) return
    const timer = setTimeout(() => {
      getUsers(token, search)
        .then(setUsers)
        .catch(() => undefined)
    }, 350)
    return () => clearTimeout(timer)
  }, [search, token, role])

  async function handleDeletePet(id: number) {
    if (!token) return
    if (!window.confirm('¿Seguro que deseas eliminar esta mascota?')) return
    try {
      await deletePet(id, token)
      setPets((prev) => prev.filter((pet) => pet.id_pet !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la mascota')
    }
  }

  async function handleDeleteUser(id: number) {
    if (!token) return
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return
    try {
      await deleteUser(id, token)
      setUsers((prev) => prev.filter((item) => item.id_user !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el usuario')
    }
  }

  return (
    <div className="min-h-screen w-full bg-white flex">
      <Sidebar />

      {/* ── Contenido Central ── */}
      <main className="flex-1 min-w-0 px-8 lg:px-10 py-8 flex flex-col gap-8">
        {/* Bienvenida */}
        <header>
          <h1 className="text-3xl font-bold text-petpulse-text">
            Bienvenido/a {user?.name_user ?? 'Usuario'}
          </h1>
          <p className="text-petpulse-text-secondary mt-1.5">
            {role === 'admin'
              ? 'Aquí tienes un resumen general de la plataforma.'
              : 'Aquí tienes la información de tus mascotas hoy.'}
          </p>
        </header>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* Tarjetas de estadísticas */}
        <section className="grid grid-cols-2 xl:grid-cols-3 gap-5">
          {role === 'user' ? (
            <>
              <StatCard
                icon={CalendarClock}
                label="Próximas citas"
                value={upcomingCount}
                hint="Agendadas en los próximos 7 días. Aquí verás las citas veterinarias y de rutina de tus mascotas."
                tall
              />
              <StatCard
                icon={AlarmClock}
                label="Recordatorios"
                value={remindersCount}
                hint="Pendientes de completar"
              />
            </>
          ) : (
            <>
              <StatCard
                icon={UsersIcon}
                label="Usuarios"
                value={stats?.total_users ?? '—'}
                hint="Registrados en la plataforma"
              />
              <StatCard
                icon={HardDrive}
                label="Storage utilizado"
                value={`${stats?.storage_used_gb ?? 0} GB`}
                hint="Imágenes del chat de IA"
                accent
              />
              <StatCard
                icon={Stethoscope}
                label="Consultas"
                value={stats?.total_consultations ?? '—'}
                hint="Registradas en total"
              />
            </>
          )}
        </section>

        {/* Lista principal */}
        <section className="bg-white rounded-2xl border border-petpulse-border p-6">
          {role === 'user' ? (
            <>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-petpulse-text">Mis mascotas</h2>
                <button
                  type="button"
                  onClick={() => navigate('/pets/new')}
                  className="text-sm font-semibold text-petpulse-primary-dark flex items-center gap-1.5 hover:underline transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
              </div>

              {loading ? (
                <div className="py-10 flex items-center justify-center gap-2 text-petpulse-text-secondary">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Cargando mascotas...
                </div>
              ) : pets.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-petpulse-text-secondary">
                    Aún no tienes mascotas registradas. ¡Agrega la primera!
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/pets/new')}
                    className="mt-4 px-6 py-2.5 rounded-full bg-petpulse-primary hover:bg-petpulse-primary-dark text-white text-sm font-semibold transition-colors"
                  >
                    Agregar mascota
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pets.map((pet) => (
                    <ListItemCard
                      key={pet.id_pet}
                      avatarUrl={pet.pet_image_url}
                      fallback="paw"
                      title={pet.name_pet}
                      subtitle={`${pet.breed || pet.species} · ${calculateAge(pet.birth_date)}`}
                      onEdit={() => navigate(`/pets/${pet.id_pet}/edit`)}
                      onDelete={() => void handleDeletePet(pet.id_pet)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                <h2 className="text-lg font-bold text-petpulse-text">Gestión de usuarios</h2>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-petpulse-text-secondary" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar usuario..."
                    className="w-full sm:w-72 pl-10 pr-4 py-2.5 rounded-full border border-petpulse-border bg-petpulse-bg text-sm focus:outline-none focus:ring-2 focus:ring-petpulse-primary/20 focus:border-petpulse-primary transition-all"
                  />
                </div>
              </div>

              {loading ? (
                <div className="py-10 flex items-center justify-center gap-2 text-petpulse-text-secondary">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Cargando usuarios...
                </div>
              ) : users.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-petpulse-text-secondary">No se encontraron usuarios.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {users.map((item) => (
                    <ListItemCard
                      key={item.id_user}
                      avatarUrl={item.profile_image_url}
                      fallback="user"
                      title={item.name_user}
                      subtitle={item.email}
                      badge={
                        item.role_account === 'ADMIN' ? 'ADMINISTRADOR' : 'USUARIO'
                      }
                      badgeTone={item.role_account === 'ADMIN' ? 'admin' : 'user'}
                      onEdit={() => {
                        // TODO: pantalla de edición de usuario aún no existe
                        navigate(`/users/${item.id_user}/edit`)
                      }}
                      onDelete={() => void handleDeleteUser(item.id_user)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* Banner inferior */}
        <section className="rounded-2xl bg-[#6B8C6C] text-white px-6 sm:px-8 py-5 flex flex-col lg:flex-row items-center justify-between gap-5">
          <img
            src="/assets/banner-agg-pet.svg"
            alt="Agrega tu mascota"
            className="w-40 sm:w-48 h-auto object-contain flex-shrink-0"
          />
          <div className="flex-1 text-center lg:text-left">
            <h3 className="text-xl font-bold">Tu compromiso es su bienestar</h3>
            <p className="text-sm text-white/85 mt-0.5">
              Agenda una cita y mantén al día la salud de tus mascotas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/calendar')}
            className="px-6 py-3 rounded-full bg-white text-[#6B8C6C] font-semibold text-sm transition-colors shadow-sm hover:bg-[#5a7a5b] hover:text-white flex-shrink-0"
          >
            Agendar cita
          </button>
        </section>
      </main>

      <RightPanel />
    </div>
  )
}

export default HomeDesktop
