import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../api/client'
import type { LoginDTO, LoginResponse, MeResponse, RegisterDTO, UpdateProfileDTO, User } from '../api/types'

const TOKEN_KEY = 'petpulse_token'
const USER_KEY = 'petpulse_user'

interface AuthContextValue {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterDTO) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: UpdateProfileDTO) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    if (!savedToken) {
      setLoading(false)
      return
    }

    setToken(savedToken)
    api
      .get<MeResponse>('/api/auth/me', savedToken)
      .then((res) => setUser(res.user))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const credentials: LoginDTO = { email, password }
    const res = await api.post<LoginResponse>('/api/auth/login', credentials)
    localStorage.setItem(TOKEN_KEY, res.token)
    localStorage.setItem(USER_KEY, JSON.stringify(res.user))
    setToken(res.token)
    setUser(res.user)
  }

  async function register(data: RegisterDTO) {
    await api.post('/api/auth/register', data)
  }

  async function logout() {
    if (token) {
      await api.post('/api/auth/logout', {}, token).catch(() => undefined)
    }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  async function updateProfile(data: UpdateProfileDTO) {
    if (!token) return
    const res = await api.put<MeResponse>('/api/auth/profile', data, token)
    localStorage.setItem(USER_KEY, JSON.stringify(res.user))
    setUser(res.user)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return ctx
}
