import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { useAuth } from '../../context/AuthContext'
import { deleteUser, getAdminStats, getUsers, updateUserRole } from '../../api/dashboard'
import type { AdminStats, User } from '../../api/types'
import SideMenu from '../../components/SideMenu'

// Panel de administración: solo accesible para usuarios con role_account === 'ADMIN' (App.tsx redirige aquí automáticamente desde /dashboard)
function AdminMobile() {
  const { user, token, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null) // usuario cuyo rol se está cambiando (null = modal cerrado)
  const [savingRole, setSavingRole] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null) // id del usuario pendiente de confirmar eliminación

  // Carga inicial: lista de usuarios + estadísticas del panel
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

  // Búsqueda con debounce: espera 350ms sin escribir antes de consultar al backend
  useEffect(() => {
    if (!token) return
    const timer = setTimeout(() => {
      getUsers(token, search)
        .then(setUsers)
        .catch(() => undefined)
    }, 350)
    return () => clearTimeout(timer)
  }, [search, token])

  // Elimina el usuario confirmado en el modal
  async function handleDeleteUser() {
    if (!token || confirmDeleteId === null) return
    try {
      await deleteUser(confirmDeleteId, token)
      setUsers((prev) => prev.filter((item) => item.id_user !== confirmDeleteId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el usuario')
    } finally {
      setConfirmDeleteId(null)
    }
  }

  // Cambia el rol del usuario que se está editando (USER ↔ ADMIN)
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

  const userToDelete = users.find((u) => u.id_user === confirmDeleteId)

  return (
    <div className="h-screen w-full bg-petpulse-bg flex justify-center overflow-hidden">
      <div className="relative w-full max-w-[402px] h-screen flex flex-col overflow-hidden">

        {/* Header: menú + título + cerrar sesión (el admin no tiene BottomNav, solo maneja este panel) */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <button type="button" aria-label="Abrir menú" onClick={() => setMenuOpen(true)}>
            <Icon icon="akar-icons:three-line-horizontal" width={22} height={22} color="#2F3E32" />
          </button>
          <h1 className="font-inter font-bold text-base text-petpulse-primary text-center flex items-center gap-1.5">
            Panel de administración
            <Icon icon="mdi:shield-crown-outline" width={16} height={16} color="#7A9A7B" />
          </h1>
          <button type="button" onClick={() => logout()} aria-label="Cerrar sesión">
            <Icon icon="mdi:logout" width={20} height={20} color="#E07A5F" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-10 px-5">
          <p className="font-inter text-xs text-petpulse-text-secondary text-center -mt-1 mb-4">
            Bienvenido/a {user?.name_user ?? 'Admin'}
          </p>

          {error && (
            <p role="alert" className="text-petpulse-accent text-sm text-center mb-4 px-4">
              {error}
            </p>
          )}

          {/* ── Stats: usuarios totales, storage usado en el chat de IA, consultas realizadas ── */}
          <div className="flex flex-col gap-3">
            <div className="bg-white border border-petpulse-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-petpulse-primary/15 flex items-center justify-center flex-shrink-0">
                <Icon icon="mdi:account-group-outline" width={20} height={20} color="#7A9A7B" />
              </div>
              <div>
                <p className="font-inter text-xs text-petpulse-text-secondary">Usuarios</p>
                <p className="font-encode-semi font-bold text-lg text-petpulse-text">{stats?.total_users ?? '—'}</p>
              </div>
            </div>

            <div className="bg-petpulse-primary/10 border border-petpulse-primary/20 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-petpulse-primary/20 flex items-center justify-center flex-shrink-0">
                <Icon icon="mdi:harddisk-outline" width={20} height={20} color="#7A9A7B" />
              </div>
              <div>
                <p className="font-inter text-xs text-petpulse-text-secondary">Storage utilizado</p>
                <p className="font-encode-semi font-bold text-lg text-petpulse-text">{stats?.storage_used_gb ?? 0} GB</p>
              </div>
            </div>

            <div className="bg-white border border-petpulse-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-petpulse-primary/15 flex items-center justify-center flex-shrink-0">
                <Icon icon="mdi:stethoscope" width={20} height={20} color="#7A9A7B" />
              </div>
              <div>
                <p className="font-inter text-xs text-petpulse-text-secondary">Consultas</p>
                <p className="font-encode-semi font-bold text-lg text-petpulse-text">{stats?.total_consultations ?? '—'}</p>
              </div>
            </div>
          </div>

          {/* ── Gestión de usuarios: buscar, editar rol, eliminar (el propio admin no puede editarse ni eliminarse a sí mismo) ── */}
          <p className="font-inter font-bold text-base text-petpulse-text mt-6 mb-3">Gestión de usuarios</p>

          <div className="relative mb-4">
            <Icon icon="mdi:magnify" width={16} height={16} color="#7A7A7A" className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar usuario..."
              className="w-full h-[42px] bg-white border border-petpulse-border rounded-full pl-9 pr-3 text-sm text-petpulse-text placeholder:text-petpulse-text-secondary focus:outline-none focus:ring-2 focus:ring-petpulse-primary focus:border-petpulse-primary transition-shadow"
            />
          </div>

          {loading ? (
            <p className="text-center text-petpulse-text-secondary text-sm font-inter py-6">Cargando usuarios...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-petpulse-text-secondary text-sm font-inter py-6">No se encontraron usuarios.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {users.map((item) => {
                const isSelf = item.id_user === user?.id_user // oculta los botones de editar/eliminar en la propia cuenta del admin
                return (
                  <div key={item.id_user} className="bg-white border border-petpulse-border rounded-xl p-3.5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-petpulse-primary/15 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.profile_image_url ? (
                        <img src={item.profile_image_url} alt={item.name_user} className="w-full h-full object-cover" />
                      ) : (
                        <Icon icon="mdi:account" width={20} height={20} color="#7A9A7B" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-encode-semi font-bold text-sm text-petpulse-text truncate">{item.name_user}</p>
                      <p className="font-inter text-xs text-petpulse-text-secondary truncate">{item.email}</p>
                      <span
                        className={`inline-block mt-1 text-[10px] font-inter font-semibold px-2 py-0.5 rounded-full ${
                          item.role_account === 'ADMIN'
                            ? 'bg-petpulse-primary/15 text-petpulse-primary-dark'
                            : 'bg-petpulse-text-secondary/15 text-petpulse-text-secondary'
                        }`}
                      >
                        {item.role_account === 'ADMIN' ? 'ADMINISTRADOR' : 'USUARIO'}
                      </span>
                    </div>
                    {!isSelf && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingUser(item)}
                          aria-label="Editar rol"
                          className="text-petpulse-accent active:scale-90 transition-transform"
                        >
                          <Icon icon="mynaui:pencil" width={17} height={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(item.id_user)}
                          aria-label="Eliminar usuario"
                          className="text-petpulse-text-secondary active:scale-90 transition-transform"
                        >
                          <Icon icon="mdi:trash-can-outline" width={17} height={17} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

        {/* ── Modal cambiar rol: convertir en usuario normal o administrador ── */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setEditingUser(null)} />
            <div className="relative w-full max-w-[402px] bg-petpulse-bg rounded-t-3xl px-6 pt-6 pb-8">
              <div className="w-10 h-1 bg-petpulse-border rounded-full mx-auto mb-5" />
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-petpulse-primary/15 flex items-center justify-center mb-4">
                  <Icon icon="mdi:shield-account-outline" width={26} height={26} color="#6B8C6C" />
                </div>
                <h3 className="font-encode-expanded font-bold text-lg text-petpulse-text">Cambiar rol</h3>
                <p className="font-inter text-sm text-petpulse-text-secondary mt-1.5">
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
                  className="h-11 rounded-xl font-encode-semi font-semibold text-sm border border-petpulse-border text-petpulse-text disabled:opacity-40"
                >
                  Hacer usuario normal
                </button>
                <button
                  type="button"
                  disabled={savingRole || editingUser.role_account === 'ADMIN'}
                  onClick={() => void handleSaveRole('ADMIN')}
                  className="h-11 rounded-xl font-encode-semi font-semibold text-sm bg-petpulse-primary text-white disabled:opacity-40"
                >
                  Hacer administrador
                </button>
              </div>

              <button
                type="button"
                onClick={() => setEditingUser(null)}
                disabled={savingRole}
                className="w-full h-11 mt-2.5 rounded-xl font-encode-semi font-semibold text-sm text-petpulse-text-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* ── Modal confirmar eliminar usuario ── */}
        {confirmDeleteId !== null && userToDelete && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDeleteId(null)} />
            <div className="relative w-full max-w-[402px] bg-white rounded-t-3xl px-6 pt-6 pb-8">
              <div className="w-10 h-1 bg-petpulse-border rounded-full mx-auto mb-5" />
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-petpulse-accent/15 flex items-center justify-center mb-4">
                  <Icon icon="mdi:trash-can-outline" width={26} height={26} color="#E07A5F" />
                </div>
                <h3 className="font-encode-expanded font-bold text-lg text-petpulse-text">¿Eliminar usuario?</h3>
                <p className="font-inter text-sm text-petpulse-text-secondary mt-1.5 px-4">
                  {userToDelete.name_user} será eliminado permanentemente.
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 h-11 border border-petpulse-border rounded-xl font-encode-semi font-semibold text-sm text-petpulse-text"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteUser()}
                  className="flex-1 h-11 bg-petpulse-accent rounded-xl font-encode-semi font-semibold text-sm text-white"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminMobile