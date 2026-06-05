import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch, clearToken } from '../lib/apiClient'

type User = {
  id: string
  email: string
  username: string
  full_name: string
  profile_image?: string
  role: string
  is_email_verified: boolean
  is_active: boolean
  date_joined: string
}

type AuthContextValue = {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (accessToken: string) => void
  logout: () => void
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshMe = useCallback(async () => {
    setLoading(true)
    try {
      const me = await apiFetch<User>('/api/auth/me', { method: 'GET' })

      setUser(me)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshMe()
  }, [refreshMe])

  const login = useCallback((accessToken: string) => {
    localStorage.setItem('access_token', accessToken)
    // Fetch latest /me
    refreshMe().catch(() => {})
  }, [refreshMe])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
    setLoading(false)
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshMe
    }
  }, [user, loading, login, logout, refreshMe])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
