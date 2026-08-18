import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { useAuth } from '../../context/AuthContext'
import { deleteUser, getAdminStats, getUsers, updateUserRole } from '../../api/dashboard'
import type { AdminStats, User } from '../../api/types'
import StatCard from '../../components/dashboard/StatCard'
import ListItemCard from '../../components/dashboard/ListItemCard'
import logo from '../../assets/logo.png'

function AdminTablet() {
  const { user, token, logout } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [savingRole, setSavingRole] = useState(false)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    setError('')
    Promise.all([getUsers(token), getAdminStats(token)])
      .then(([usersData, statsData]) => {
        setUsers(usersData)
        setStats(statsData)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar los datos'))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    if (!token) return
    const timer = setTimeout(() => {
      getUsers(token, search)
        .then(setUsers)
        .catch(() => undefined)
    }, 350)
    return () => clearTimeout(timer)
  }, [search, token])

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
    <div className="min-h-screen w-full bg-petpulse-bg font-inter text-petpulse-text box-border pb-10 *:box-border">
      <div className="w-full max-w-[1100px] mx-auto px-6 pt-8 flex flex-col gap-6">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="w-[84px] h-auto shrink-0" />
            <div>
              <p className="font-poppins font-bold text-xl text-petpulse-primary m-0 tracking-[0.02em]">PETPULSE</p>
              <p className="text-[11px] text-petpulse-text-secondary m-0 leading-[1.3] max-w-[180px]">
                Salud y bienestar para tus mascotas.
              </p>
            </div>
          </div>

          <div className="flex-1 min-w-[200px] text-center">
            <h1 className="font-poppins font-bold text-xl text-petpulse-primary m-0 inline-flex items-center gap-1.5">
              Panel de administración
              <Icon icon="mdi:shield-crown-outline" width={18} height={18} className="text-petpulse-primary" />
            </h1>
            <p className="text-[13px] text-petpulse-text-secondary mt-0.5 mb-0">
              Bienvenido/a {user?.name_user ?? 'Admin'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center gap-2 bg-petpulse-card border border-petpulse-accent text-petpulse-accent font-inter font-bold text-sm rounded-full px-4 py-2.5 shrink-0 transition-all hover:bg-[#fbe9e5] active:scale-[0.98]"
          >
            <Icon icon="mdi:logout" width={16} height={16} />
            Cerrar sesión
          </button>
        </header>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <section className="grid grid-cols-3 gap-4 max-[720px]:grid-cols-1">
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
        </section>

        <section className="bg-petpulse-card rounded-2xl border border-petpulse-border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <h2 className="text-lg font-bold text-petpulse-text m-0">Gestión de usuarios</h2>
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
                  badge={item.role_account === 'ADMIN' ? 'ADMINISTRADOR' : 'USUARIO'}
                  badgeTone={item.role_account === 'ADMIN' ? 'admin' : 'user'}
                  onEdit={item.id_user === user?.id_user ? undefined : () => setEditingUser(item)}
                  onDelete={item.id_user === user?.id_user ? undefined : () => void handleDeleteUser(item.id_user)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <div className="w-full max-w-[400px] bg-petpulse-bg rounded-[20px] px-6 py-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-petpulse-primary/15 flex items-center justify-center mb-4">
                <Icon icon="mdi:shield-account-outline" width={26} height={26} color="#6B8C6C" />
              </div>
              <h3 className="font-poppins font-bold text-lg text-petpulse-text m-0">Cambiar rol</h3>
              <p className="font-inter text-sm text-petpulse-text-secondary mt-1.5 mb-0">
                {editingUser.name_user} · {editingUser.email}
              </p>
              <p className="font-inter text-xs text-petpulse-text-secondary mt-1">
                Rol actual: {editingUser.role_account === 'ADMIN' ? 'Administrador' : 'Usuario'}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 mt-5">
              <button
                type="button"
                disabled={savingRole || editingUser.role_account === 'USER'}
                onClick={() => void handleSaveRole('USER')}
                className="h-11 rounded-xl font-poppins font-semibold text-sm border border-petpulse-border text-petpulse-text disabled:opacity-40 hover:bg-[#eaf0ea] transition-colors"
              >
                Hacer usuario normal
              </button>
              <button
                type="button"
                disabled={savingRole || editingUser.role_account === 'ADMIN'}
                onClick={() => void handleSaveRole('ADMIN')}
                className="h-11 rounded-xl font-poppins font-semibold text-sm bg-petpulse-primary text-white disabled:opacity-40 hover:bg-petpulse-primary-dark transition-colors"
              >
                Hacer administrador
              </button>
            </div>

            <button
              type="button"
              onClick={() => setEditingUser(null)}
              disabled={savingRole}
              className="w-full h-11 mt-2.5 rounded-xl font-poppins font-semibold text-sm text-petpulse-text-secondary hover:bg-[#eaf0ea] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminTablet