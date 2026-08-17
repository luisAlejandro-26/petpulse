import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { User } from '../api/types'

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: { access_token?: string; error?: string }) => void
          }) => { requestAccessToken: () => void }
        }
      }
    }
  }
}

const SCRIPT_ID = 'google-identity-services'

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve()

  const existing = document.getElementById(SCRIPT_ID)
  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener('load', () => resolve())
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar el script de Google'))
    document.head.appendChild(script)
  })
}

const CELEBRATION_MS = 2600

export interface GoogleAuthHandle {
  signIn: () => void
}

interface GoogleAuthProps {
  onError?: (message: string) => void
}

const GoogleAuth = forwardRef<GoogleAuthHandle, GoogleAuthProps>(function GoogleAuth({ onError }, ref) {
  const { loginWithToken } = useAuth()
  const navigate = useNavigate()
  const [celebrating, setCelebrating] = useState(false)
  const tokenClientRef = useRef<{ requestAccessToken: () => void } | null>(null)

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
    if (!clientId) return

    let cancelled = false

    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google) return

        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          callback: async (response) => {
            if (!response.access_token) {
              onError?.('No se pudo continuar con Google')
              return
            }
            try {
              const res = await api.post<{ token: string; user: User; isNewUser?: boolean }>(
                '/api/auth/google',
                { access_token: response.access_token },
              )
              loginWithToken(res.token, res.user)

              if (res.isNewUser) {
                setCelebrating(true)
                setTimeout(() => navigate('/dashboard'), CELEBRATION_MS)
              } else {
                navigate('/dashboard')
              }
            } catch (err) {
              onError?.(err instanceof ApiError ? err.message : 'No se pudo continuar con Google')
            }
          },
        })
      })
      .catch(() => {
        onError?.('No se pudo cargar el inicio de sesion de Google')
      })

    return () => {
      cancelled = true
    }
  }, [loginWithToken, navigate, onError])

  useImperativeHandle(ref, () => ({
    signIn() {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
      if (!clientId) {
        onError?.('Inicio con Google no esta configurado todavia')
        return
      }
      if (!tokenClientRef.current) {
        onError?.('Google se esta cargando, intenta de nuevo en un momento')
        return
      }
      tokenClientRef.current.requestAccessToken()
    },
  }))

  if (!celebrating) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-petpulse-bg/95 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <svg width="150" height="172" viewBox="0 0 120 138" fill="none" aria-hidden="true">
        <path
          d="M60 6 L110 24 V66 C110 100 90 122 60 133 C30 122 10 100 10 66 V24 Z"
          stroke="#7a9a7b"
          strokeWidth="7"
          fill="none"
          strokeLinejoin="round"
          className="[stroke-dasharray:400] [stroke-dashoffset:400] [animation:draw-shield_0.7s_ease-out_forwards] motion-reduce:[animation:none] motion-reduce:[stroke-dashoffset:0]"
        />
        <path
          d="M39 68 L54 83 L83 50"
          stroke="#7a9a7b"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="[stroke-dasharray:65] [stroke-dashoffset:65] [animation:draw-check_0.4s_ease-out_0.6s_forwards] motion-reduce:[animation:none] motion-reduce:[stroke-dashoffset:0]"
        />
      </svg>
      <p className="font-poppins font-bold text-xl text-petpulse-primary">Cuenta creada con Google</p>
      <p className="text-sm text-petpulse-text-secondary">Espera un momento, seras redirigido al inicio</p>
    </div>
  )
})

export default GoogleAuth