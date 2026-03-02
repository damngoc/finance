export interface MarginPackage {
  id: number
  name: string
  duration: string
  durationDays: number
  profitPercent: number
  createdAt: string
}

export interface CreateMarginPackageDto {
  name: string
  duration: string
  durationDays: number
  profitPercent: number
}

let MOCK_PACKAGES: MarginPackage[] = [
  { id: 1, name: 'Gói Cơ Bản',     duration: '30 ngày',  durationDays: 30,  profitPercent: 5,  createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 2, name: 'Gói Tiêu Chuẩn', duration: '60 ngày',  durationDays: 60,  profitPercent: 8,  createdAt: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: 3, name: 'Gói Nâng Cao',   duration: '90 ngày',  durationDays: 90,  profitPercent: 12, createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 4, name: 'Gói Vàng',       duration: '180 ngày', durationDays: 180, profitPercent: 18, createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 5, name: 'Gói Bạch Kim',   duration: '270 ngày', durationDays: 270, profitPercent: 24, createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 6, name: 'Gói Kim Cương',  duration: '365 ngày', durationDays: 365, profitPercent: 36, createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
]

let nextId = 7

export const adminMarginPackageService = {
  getAll: async (): Promise<MarginPackage[]> => {
    // const { data } = await apiClient.get('/admin/margin-packages')
    // return data
    await new Promise(r => setTimeout(r, 350))
    return [...MOCK_PACKAGES]
  },

  create: async (dto: CreateMarginPackageDto): Promise<MarginPackage> => {
    // const { data } = await apiClient.post('/admin/margin-packages', dto)
    // return data
    await new Promise(r => setTimeout(r, 500))
    const exists = MOCK_PACKAGES.find(p => p.name.toLowerCase() === dto.name.toLowerCase())
    if (exists) throw new Error('Tên gói đã tồn tại')
    const pkg: MarginPackage = { id: nextId++, ...dto, createdAt: new Date().toISOString() }
    MOCK_PACKAGES.push(pkg)
    return { ...pkg }
  },

  delete: async (id: number): Promise<void> => {
    // await apiClient.delete(`/admin/margin-packages/${id}`)
    await new Promise(r => setTimeout(r, 400))
    const idx = MOCK_PACKAGES.findIndex(p => p.id === id)
    if (idx === -1) throw new Error('Không tìm thấy gói')
    MOCK_PACKAGES.splice(idx, 1)
  },
}