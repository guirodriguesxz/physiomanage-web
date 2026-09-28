import type { AuthResponse } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1'
const SESSION_KEY = 'physiomanage.session'

export class ApiError extends Error {
  status: number
  fields?: Record<string, string>

  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

export function loadSession(): AuthResponse | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as AuthResponse) : null
  } catch {
    return null
  }
}

let session = loadSession()
let onSessionChange: (s: AuthResponse | null) => void = () => {}

export function setSessionListener(fn: (s: AuthResponse | null) => void) {
  onSessionChange = fn
}

export function saveSession(s: AuthResponse | null) {
  session = s
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s))
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    // storage indisponível: sessão fica só em memória
  }
  onSessionChange(s)
}

// Refresh tokens são rotacionados no backend: duas chamadas concorrentes com o
// mesmo token fariam a segunda falhar. Por isso todas compartilham uma promise.
let refreshing: Promise<boolean> | null = null

function refreshSession(): Promise<boolean> {
  if (!session) return Promise.resolve(false)
  refreshing ??= fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  })
    .then(async (res) => {
      if (!res.ok) return false
      saveSession((await res.json()) as AuthResponse)
      return true
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

export async function api<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body) headers.set('Content-Type', 'application/json')
  if (session) headers.set('Authorization', `Bearer ${session.token}`)

  const res = await fetch(`${API_URL}${path}`, { ...init, headers })

  if (res.status === 401 && retry && session && !path.startsWith('/auth/')) {
    if (await refreshSession()) return api<T>(path, init, false)
    saveSession(null)
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, body?.message ?? `Erro ${res.status}`, body?.fields)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const json = (body: unknown) => JSON.stringify(body)
