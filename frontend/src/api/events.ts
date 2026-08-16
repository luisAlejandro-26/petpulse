import { api } from './client'
import type { HealthEvent, EventsResponse, EventResponse, CreateEventDTO, UpdateEventDTO } from './types'

export async function getEvents(token: string): Promise<HealthEvent[]> {
  const res = await api.get<EventsResponse>('/api/events', token)
  return res.events
}

export async function createEvent(data: CreateEventDTO, token: string): Promise<HealthEvent> {
  const res = await api.post<EventResponse>('/api/events', data, token)
  return res.event
}

export async function updateEvent(id: number, data: UpdateEventDTO, token: string): Promise<HealthEvent> {
  const res = await api.put<EventResponse>(`/api/events/${id}`, data, token)
  return res.event
}

export async function deleteEvent(id: number, token: string): Promise<void> {
  await api.del(`/api/events/${id}`, token)
}