const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  token?: string
  body?: unknown
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const message = data && typeof data.error === 'string' ? data.error : `Error ${res.status}`
    throw new ApiError(message, res.status)
  }

  return data as T
}

export const api = {
  get: <T>(path: string, token?: string) => request<T>(path, { token }),
  post: <T>(path: string, body?: unknown, token?: string) => request<T>(path, { method: 'POST', body, token }),
  put: <T>(path: string, body?: unknown, token?: string) => request<T>(path, { method: 'PUT', body, token }),
  del: <T>(path: string, token?: string) => request<T>(path, { method: 'DELETE', token }),
}
