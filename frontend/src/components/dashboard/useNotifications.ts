import { useEffect, useMemo, useState, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getEvents } from '../../api/events'
import type { HealthEvent } from '../../api/types'

const HEALTH_EVENT_TYPES = new Set(['VACUNA', 'CONTROL', 'DESPARACITACION', 'CIRUGIA'])

export function useNotifications() {
  const { token } = useAuth()
  const [events, setEvents] = useState<HealthEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [notifOpen, setNotifOpen] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)

  const fetchEvents = useCallback(() => {
    if (!token) return
    getEvents(token)
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible') fetchEvents()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [fetchEvents])

  const alertaSalud = useMemo(() => {
    const now = new Date()
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000
    return events.filter((e) => {
      if (e.status === 'CANCELLED' || e.status === 'COMPLETED') return false
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
      .filter((e) => e.status === 'COMPLETED')
      .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
      .slice(0, 4)
  }, [events])

  useEffect(() => {
    if (!loading && alertaSalud > 0) {
      setToastVisible(true)
    }
  }, [loading, alertaSalud])

  return {
    loading,
    alertaSalud,
    actividadReciente,
    notifOpen,
    setNotifOpen,
    toastVisible,
    setToastVisible,
    hasBadge: alertaSalud > 0 || actividadReciente.length > 0,
  }
}
