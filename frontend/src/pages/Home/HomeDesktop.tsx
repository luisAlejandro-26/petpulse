import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { deletePet, getPets } from '../../api/pets'
import { getEvents } from '../../api/events'
import { deleteUser, getAdminStats, getUsers, updateUserRole } from '../../api/dashboard'
import type { AdminStats, HealthEvent, Pet, User } from '../../api/types'
import Sidebar from '../../components/dashboard/Sidebar'
import StatCard from '../../components/dashboard/StatCard'
import ListItemCard from '../../components/dashboard/ListItemCard'
import { ACTIVITY_META, STATUS_LABEL, calculateAge, formatDate } from '../../components/dashboard/dashboardUtils'
import { Icon } from '@iconify/react'
import petsIllustration from '../../assets/pets-illustration.png'
import { useNotifications } from '../../components/dashboard/useNotifications'
import NotificationsModal from '../../components/dashboard/NotificationsModal'
import HealthToast from '../../components/dashboard/HealthToast'

interface HomeDesktopProps {
  role: 'user' | 'admin'
}

function HomeDesktop({ role }: HomeDesktopProps) {
  const { user, token } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [pets, setPets] = useState<Pet[]>([])
  const [events, setEvents] = useState<HealthEvent[]>([])

  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [savingRole, setSavingRole] = useState(false)

  const { alertaSalud: notifAlertaSalud, actividadReciente: notifActividadReciente, notifOpen, setNotifOpen, toastVisible, setToastVisible, loading: notifLoading, hasBadge } = useNotifications()

  useEffect(() => {
    if (!token) return
    const authToken = token
    let cancelled = false
    setLoading(true)
    setError('')

    async function load() {
      try {
        if (role === 'user') {
          const [petsData, eventsData] = await Promise.all([
            getPets(authToken),
            getEvents(authToken),
          ])
          if (cancelled) return
          setPets(petsData)
          setEvents(eventsData)
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
    return () => { cancelled = true }
  }, [token, role])

  useEffect(() => {
    if (role !== 'admin' || !token) return
    const timer = setTimeout(() => {
      getUsers(token, search)
        .then(setUsers)
        .catch(() => undefined)
    }, 350)
    return () => clearTimeout(timer)
  }, [search, token, role])

  const proximasCitas = useMemo(
    () => events.filter((e) => e.status === 'SCHEDULED').length,
    [events],
  )

  const recordatorios = useMemo(
    () =>
      events.filter((e) => e.next_due_date && new Date(e.next_due_date).getTime() >= Date.now()).length,
    [events],
  )

  const HEALTH_EVENT_TYPES = new Set(['VACUNA', 'CONTROL', 'DESPARACITACION', 'CIRUGIA'])

  const alertaSalud = useMemo(() => {
    const now = new Date()
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000
    return events.filter((e) => {
      if (e.status === 'CANCELLED') return false
      if (!HEALTH_EVENT_TYPES.has(e.event_type)) return false
      const eventTime = new Date(e.event_date).getTime()
      if (eventTime <= now.getTime() + threeDaysMs) return true
      if (e.next_due_date) {
        const dueTime = new Date(e.next_due_date).getTime()
        if (dueTime <= now.getTime() + threeDaysMs) return true
      }
      return false
    }).length
  }, [events])

  const actividadReciente = useMemo(() => {
    return events
      .filter((e) => e.status === 'COMPLETED' || e.status === 'SCHEDULED')
      .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
      .slice(0, 10)
  }, [events])

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

  async function handleSaveRole(newRole: 'USER' | 'ADMIN') {
    if (!token || !editingUser) return
    setSavingRole(true)
    try {
      const updated = await updateUserRole(editingUser.id_user, newRole, token)
      setUsers((prev) => prev.map((item) => (item.id_user === updated.id_user ? updated : item)))
      setEditingUser(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar el rol')
    } finally {
      setSavingRole(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-petpulse-bg flex">
      <Sidebar />

      <main className="flex-1 min-w-0 px-8 lg:px-10 py-8 flex flex-col gap-8">
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

        <section className="grid grid-cols-2 xl:grid-cols-3 gap-5">
          {role === 'user' ? (
            <>
              <StatCard
                icon="mdi:calendar-month-outline"
                label="Próximas citas"
                value={proximasCitas}
                hint="Citas programadas"
                tall
                link="/calendar"
                linkLabel="ver calendario"
              />
              <StatCard
                icon="mdi:bell-ring-outline"
                label="Recordatorios"
                value={recordatorios}
                hint="Pendientes"
                tall
                link="/calendar"
                linkLabel="ver recordatorios"
              />
            </>
          ) : (
            <>
              <StatCard
                icon="mdi:account-group-outline"
                label="Usuarios"
                value={stats?.total_users ?? '—'}
                hint="Registrados en la plataforma"
              />
              <StatCard
                icon="mdi:harddisk-outline"
                label="Storage utilizado"
                value={`${stats?.storage_used_gb ?? 0} GB`}
                hint="Imágenes del chat de IA"
                accent
              />
              <StatCard
                icon="mdi:stethoscope"
                label="Consultas"
                value={stats?.total_consultations ?? '—'}
                hint="Registradas en total"
              />
            </>
          )}
        </section>

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
                  <Icon icon="mdi:plus" width={16} height={16} />
                  Agregar
                </button>
              </div>

              {loading ? (
                <div className="py-10 flex items-center justify-center gap-2 text-petpulse-text-secondary">
                  <Icon icon="svg-spinners:dots-2" width={20} height={20} />
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
                      onClick={() => navigate(`/pets/${pet.id_pet}`)}
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
                  <Icon icon="mdi:magnify" width={16} height={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-petpulse-text-secondary" />
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
                  <Icon icon="svg-spinners:dots-2" width={20} height={20} />
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
                      onEdit={item.id_user === user?.id_user ? undefined : () => setEditingUser(item)}
                      onDelete={item.id_user === user?.id_user ? undefined : () => void handleDeleteUser(item.id_user)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
        {role === 'user' && (<section className="relative flex items-center gap-5 bg-gradient-to-r from-[#dce7dc] to-[#eaf0ea] rounded-[20px] px-6 py-5 overflow-hidden min-h-[96px]">
          <img src={petsIllustration} alt="" className="h-[88px] w-auto shrink-0 object-contain" />
          <div className="flex-1 min-w-[140px]">
            <p className="font-bold text-[15px] text-petpulse-text m-0">Tu compromiso es su bienestar</p>
            <p className="text-xs text-petpulse-text-secondary mt-0.5 mb-0 max-w-[320px]">
              Mantén al día sus cuidados para una vida más saludable
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/calendar')}
            className="shrink-0 bg-petpulse-primary-dark text-white rounded-full px-6 py-3 font-bold text-sm no-underline whitespace-nowrap transition-colors hover:bg-[#5c7c5d] active:scale-[0.98]"
          >
            Agendar cita
          </button>
        </section>)}
        
      </main>

      {role === 'user' && (
      <aside className="w-[320px] shrink-0 bg-white border-l border-petpulse-border h-screen sticky top-0 flex flex-col">
        <div className="flex items-center justify-between px-6 py-6 border-b border-petpulse-border">
          <h2 className="text-lg font-bold text-petpulse-text">Notificaciones</h2>
          <button
            type="button"
            onClick={() => setNotifOpen(true)}
            className="relative w-10 h-10 rounded-full bg-petpulse-bg flex items-center justify-center text-petpulse-text hover:text-petpulse-primary-dark transition-colors"
            aria-label="Notificaciones"
          >
            <Icon icon="mdi:bell-outline" width={20} height={20} />
            {hasBadge && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-petpulse-accent rounded-full border border-white" />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          <div className="rounded-2xl bg-white border border-petpulse-border p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#fbe9e5] flex items-center justify-center flex-shrink-0">
                <Icon icon="mdi:heart-pulse" width={20} height={20} className="text-petpulse-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none text-petpulse-text">{alertaSalud}</p>
                <p className="text-sm text-petpulse-text-secondary">Alertas de salud activas</p>
              </div>
            </div>
            <p className="text-xs text-petpulse-text-secondary mt-3 leading-relaxed">
              Revisa el estado de tus mascotas y agenda una cita si lo consideras necesario.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-petpulse-text uppercase tracking-wide mb-4">
              Actividad reciente
            </h3>

            {loading && (
              <div className="flex items-center justify-center gap-2 py-6 text-petpulse-text-secondary">
                <Icon icon="svg-spinners:dots-2" width={20} height={20} />
                Cargando...
              </div>
            )}

            {!loading && actividadReciente.length === 0 && (
              <p className="text-sm text-petpulse-text-secondary py-4 text-center">
                Aún no hay actividad registrada.
              </p>
            )}

            {!loading && actividadReciente.length > 0 && (
              <ul className="flex flex-col gap-2">
                {actividadReciente.map((ev) => {
                  const meta = ACTIVITY_META[ev.event_type] ?? ACTIVITY_META.OTHER
                  const statusInfo = STATUS_LABEL[ev.status] ?? STATUS_LABEL.SCHEDULED
                  const isAccent = meta.tone === 'accent'
                  return (
                    <li
                      key={ev.id_event}
                      className="flex items-center gap-3 bg-petpulse-bg border border-petpulse-border rounded-xl px-3.5 py-3"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isAccent
                            ? 'bg-petpulse-accent/10 text-petpulse-accent'
                            : 'bg-petpulse-primary/15 text-petpulse-primary-dark'
                        }`}
                      >
                        <Icon icon={meta.icon} width={18} height={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-petpulse-text truncate">
                          {meta.label} {ev.pet?.name_pet ? `· ${ev.pet.name_pet}` : ''}
                        </p>
                        <p className="text-xs text-petpulse-text-secondary mt-0.5">
                          {formatDate(ev.event_date)}
                        </p>
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusInfo.className}`}>
                        {statusInfo.text}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}

            {!loading && actividadReciente.length > 0 && (
              <button
                type="button"
                onClick={() => navigate('/calendar')}
                className="w-full mt-5 py-3 rounded-full border border-petpulse-border text-sm font-semibold text-petpulse-primary-dark flex items-center justify-center gap-1.5 hover:bg-petpulse-primary/10 transition-colors"
              >
                Ver todas las actividades
                <Icon icon="mdi:chevron-right" width={16} height={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <div className="w-full max-w-[400px] bg-petpulse-bg rounded-[20px] px-6 py-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-petpulse-primary/15 flex items-center justify-center mb-4">
                <Icon icon="mdi:shield-account-outline" width={26} height={26} color="#6B8C6C" />
              </div>
              <h3 className="font-bold text-lg text-petpulse-text m-0">Cambiar rol</h3>
              <p className="text-sm text-petpulse-text-secondary mt-1.5 mb-0">
                {editingUser.name_user} · {editingUser.email}
              </p>
              <p className="text-xs text-petpulse-text-secondary mt-1">
                Rol actual: {editingUser.role_account === 'ADMIN' ? 'Administrador' : 'Usuario'}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 mt-5">
              <button
                type="button"
                disabled={savingRole || editingUser.role_account === 'USER'}
                onClick={() => void handleSaveRole('USER')}
                className="h-11 rounded-xl font-semibold text-sm border border-petpulse-border text-petpulse-text disabled:opacity-40 hover:bg-[#eaf0ea] transition-colors"
              >
                Hacer usuario normal
              </button>
              <button
                type="button"
                disabled={savingRole || editingUser.role_account === 'ADMIN'}
                onClick={() => void handleSaveRole('ADMIN')}
                className="h-11 rounded-xl font-semibold text-sm bg-petpulse-primary text-white disabled:opacity-40 hover:bg-petpulse-primary-dark transition-colors"
              >
                Hacer administrador
              </button>
            </div>

            <button
              type="button"
              onClick={() => setEditingUser(null)}
              disabled={savingRole}
              className="w-full h-11 mt-2.5 rounded-xl font-semibold text-sm text-petpulse-text-secondary hover:bg-[#eaf0ea] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      <NotificationsModal
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        alertaSalud={notifAlertaSalud}
        actividadReciente={notifActividadReciente}
        loading={notifLoading}
      />
      <HealthToast
        visible={toastVisible}
        alertaSalud={notifAlertaSalud}
        onDismiss={() => setToastVisible(false)}
        onViewDetails={() => { setToastVisible(false); setNotifOpen(true) }}
      />
    </div>
  )
}

export default HomeDesktop
