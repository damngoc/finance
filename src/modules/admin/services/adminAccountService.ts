import { PaginatedResponse, PaginationParams } from '@/shared/types'

export type AdminAccountStatus = 'active' | 'inactive'

export interface AdminAccount {
  id: number
  username: string
  email: string
  status: AdminAccountStatus
  createdAt: string
}

export interface CreateAdminAccountDto {
  username: string
  email: string
  password: string
}

export interface UpdateAdminAccountDto {
  username?: string
  email?: string
  status?: AdminAccountStatus
  password?: string
}

let MOCK_ADMINS: AdminAccount[] = [
  { id: 1, username: 'admin_main',    email: 'admin@example.com',   status: 'active',   createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
  { id: 2, username: 'admin_support', email: 'support@example.com', status: 'active',   createdAt: new Date(Date.now() - 86400000 * 14).toISOString() },
  { id: 3, username: 'admin_finance', email: 'finance@example.com', status: 'inactive', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
]

let nextId = 4

export const adminAccountService = {
  getAll: async (params: PaginationParams = {}): Promise<PaginatedResponse<AdminAccount>> => {
    await new Promise(r => setTimeout(r, 350))
    const { page = 1, limit = 10, search = '' } = params
    let filtered = [...MOCK_ADMINS]
    if (search) {
      filtered = filtered.filter(a =>
        a.username.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase())
      )
    }
    const start = (page - 1) * limit
    return { data: filtered.slice(start, start + limit), total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) }
  },

  create: async (dto: CreateAdminAccountDto): Promise<AdminAccount> => {
    await new Promise(r => setTimeout(r, 500))
    const exists = MOCK_ADMINS.find(a => a.username === dto.username || a.email === dto.email)
    if (exists) throw new Error('Username hoặc email đã tồn tại')
    const account: AdminAccount = { id: nextId++, username: dto.username, email: dto.email, status: 'active', createdAt: new Date().toISOString() }
    MOCK_ADMINS.unshift(account)
    return { ...account }
  },

  update: async (id: number, dto: UpdateAdminAccountDto): Promise<AdminAccount> => {
    await new Promise(r => setTimeout(r, 500))
    const idx = MOCK_ADMINS.findIndex(a => a.id === id)
    if (idx === -1) throw new Error('Không tìm thấy tài khoản')
    MOCK_ADMINS[idx] = { ...MOCK_ADMINS[idx], ...dto }
    return { ...MOCK_ADMINS[idx] }
  },

  delete: async (id: number): Promise<void> => {
    await new Promise(r => setTimeout(r, 400))
    const idx = MOCK_ADMINS.findIndex(a => a.id === id)
    if (idx === -1) throw new Error('Không tìm thấy tài khoản')
    MOCK_ADMINS.splice(idx, 1)
  },
}