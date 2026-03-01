import { User, CreateUserDto, UpdateUserDto, PaginatedResponse, PaginationParams } from '@/shared/types'

const randomIp = () =>
  `${Math.floor(Math.random() * 220 + 10)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`

const BANKS = ['Vietcombank', 'Techcombank', 'BIDV', 'VPBank', 'MB Bank', 'ACB', 'Sacombank']
const NAMES = ['Nguyễn Văn An', 'Trần Thị Bích', 'Lê Minh Cường', 'Phạm Thị Dung', 'Hoàng Minh Long']

let MOCK_USERS: User[] = Array.from({ length: 25 }, (_, i) => {
  const username = `user${String(i + 1).padStart(3, '0')}`
  return {
    id: i + 1,
    username,
    name: NAMES[i % 5],
    email: `${username}@example.com`,
    role: 'client',
    status: (['active', 'active', 'active', 'inactive', 'banned'] as User['status'][])[i % 5],
    createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
    registerIp: randomIp(),
    lastLoginIp: randomIp(),
    bankAccountName: NAMES[i % 5],
    bankAccountNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    bankName: BANKS[i % BANKS.length],
    avatar: undefined,
    phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
  }
})

let nextId = 26

export const adminUserService = {
  getAll: async (params: PaginationParams = {}): Promise<PaginatedResponse<User>> => {
    await new Promise(r => setTimeout(r, 400))
    const { page = 1, limit = 10, search = '' } = params
    const filtered = MOCK_USERS.filter(u =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.bankAccountName.toLowerCase().includes(search.toLowerCase())
    )
    const start = (page - 1) * limit
    return {
      data: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    }
  },

  create: async (dto: CreateUserDto): Promise<User> => {
    // const { data } = await apiClient.post('/admin/users', dto)
    // return data
    await new Promise(r => setTimeout(r, 500))
    const exists = MOCK_USERS.find(u => u.username === dto.username)
    if (exists) throw new Error('Username đã tồn tại')
    const user: User = {
      id: nextId++,
      username: dto.username,
      status: 'active',
      createdAt: new Date().toISOString(),
      registerIp: dto.registerIp || '0.0.0.0',
      lastLoginIp: dto.lastLoginIp || '0.0.0.0',
      bankAccountName: dto.bankAccountName || '',
      bankAccountNumber: dto.bankAccountNumber || '',
      bankName: dto.bankName || '',
    }
    MOCK_USERS.unshift(user)
    return { ...user }
  },

  update: async (id: number, payload: UpdateUserDto): Promise<User> => {
    // const { data } = await apiClient.patch(`/admin/users/${id}`, payload)
    // return data
    await new Promise(r => setTimeout(r, 500))
    const idx = MOCK_USERS.findIndex(u => u.id === id)
    if (idx === -1) throw new Error('Không tìm thấy user')
    MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...payload }
    return { ...MOCK_USERS[idx] }
  },

  delete: async (id: number): Promise<void> => {
    // await apiClient.delete(`/admin/users/${id}`)
    await new Promise(r => setTimeout(r, 400))
    const idx = MOCK_USERS.findIndex(u => u.id === id)
    if (idx === -1) throw new Error('Không tìm thấy user')
    MOCK_USERS.splice(idx, 1)
  },
}