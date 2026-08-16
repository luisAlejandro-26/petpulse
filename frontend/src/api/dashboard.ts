import { api } from './client'
import type { AdminStats, Appointment, Reminder, UsersResponse, User } from './types'

export async function getUsers(token: string, search = ''): Promise<User[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : ''
  const res = await api.get<UsersResponse>(`/api/users${params}`, token)
  return res.users
}

export async function deleteUser(id: number, token: string): Promise<void> {
  await api.del(`/api/users/${id}`, token)
}

export async function getAdminStats(token: string): Promise<AdminStats> {
  return api.get<AdminStats>('/api/stats/admin', token)
}

// ─────────────────────────────────────────────────────────────
// STUBS: los siguientes endpoints NO existen aún en el backend.
// Se dejan los servicios preparados para cuando existan las
// tablas de citas (appointments) y recordatorios (reminders).
// Mientras tanto devuelven datos vacíos para no romper la UI.
// ─────────────────────────────────────────────────────────────

export async function getUpcomingAppointments(token: string): Promise<Appointment[]> {
  try {
    // TODO: crear GET /api/appointments/upcoming (requiere token)
    const res = await api.get<{ appointments: Appointment[] }>('/api/appointments/upcoming', token)
    return res.appointments
  } catch {
    return []
  }
}

export async function getReminders(token: string): Promise<Reminder[]> {
  try {
    // TODO: crear GET /api/reminders (requiere token)
    const res = await api.get<{ reminders: Reminder[] }>('/api/reminders', token)
    return res.reminders
  } catch {
    return []
  }
}
