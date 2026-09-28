import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { loadSession, saveSession, setSessionListener } from '../api/client'
import { authApi } from '../api/endpoints'
import type { AuthResponse, Role } from '../api/types'

interface AuthState {
  session: AuthResponse | null
  signIn: (s: AuthResponse) => void
  signOut: () => Promise<void>
  hasRole: (...roles: Role[]) => boolean
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(loadSession)

  useEffect(() => setSessionListener(setSession), [])

  const value: AuthState = {
    session,
    signIn: saveSession,
    signOut: async () => {
      if (session) await authApi.logout(session.refreshToken).catch(() => {})
      saveSession(null)
    },
    hasRole: (...roles) => !!session && roles.includes(session.role),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth fora do AuthProvider')
  return ctx
}
