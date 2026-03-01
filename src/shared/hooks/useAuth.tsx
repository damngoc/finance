import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { AuthUser, AuthTokens, LoginCredentials, UserRole } from '@/shared/types'
import { LOCAL_STORAGE_KEYS } from '@/shared/constants'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials, role: UserRole) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Fake auth service (thay bằng API thật) ───────────────────────
const fakeLogin = async (
  credentials: LoginCredentials,
  role: UserRole
): Promise<{ user: AuthUser; tokens: AuthTokens }> => {
  await new Promise((r) => setTimeout(r, 800)) // simulate network

  if (credentials.password !== '123456') {
    throw new Error('Sai email hoặc mật khẩu')
  }

  const user: AuthUser = {
    id: role === 'super_admin' ? 0 : role === 'admin' ? 1 : 2,
    name: role === 'super_admin' ? 'Super Admin' : role === 'admin' ? 'Admin System' : 'Nguyễn Văn A',
    email: credentials.email,
    role,
    avatar: undefined,
  }
  const tokens: AuthTokens = {
    accessToken: `fake-access-token-${Date.now()}`,
    refreshToken: `fake-refresh-token-${Date.now()}`,
  }
  return { user, tokens }
}

// ─── Provider ─────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.USER)
    return stored ? JSON.parse(stored) : null
  })
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (credentials: LoginCredentials, role: UserRole) => {
    setIsLoading(true)
    try {
      const { user, tokens } = await fakeLogin(credentials, role)
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken)
      localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken)
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user))
      setUser(user)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
