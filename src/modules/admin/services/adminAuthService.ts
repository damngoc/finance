import apiClient from '@/shared/services/apiClient'
import { AuthUser, LoginCredentials, AuthTokens } from '@/shared/types'

export const adminAuthService = {
  login: async (credentials: LoginCredentials): Promise<{ user: AuthUser; tokens: AuthTokens }> => {
    // Thay bằng API thật:
    // const { data } = await apiClient.post('/admin/auth/login', credentials)
    // return data

    // Mock:
    console.log('Admin login:', credentials)
    await new Promise(r => setTimeout(r, 600))
    return {
      user: { id: 1, name: 'Admin System', email: credentials.email, role: 'admin' },
      tokens: { accessToken: 'admin-token', refreshToken: 'admin-refresh' }
    }
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/admin/auth/logout').catch(() => {})
  },

  getProfile: async (): Promise<AuthUser> => {
    const { data } = await apiClient.get<AuthUser>('/admin/profile')
    return data
  },
}
