export interface FinancePackage {
  id: number
  name: string
  duration: string
  durationSeconds: number
  profitPercent: number
  createdAt: string
}

export interface CreateFinancePackageDto {
  name: string
  duration: string
  durationSeconds: number
  profitPercent: number
}

let MOCK_PACKAGES: FinancePackage[] = [
  { id: 1, name: 'Gói 15 giây', duration: '15 giây', durationSeconds: 15,  profitPercent: 85, createdAt: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: 2, name: 'Gói 25 giây', duration: '25 giây', durationSeconds: 25,  profitPercent: 88, createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 3, name: 'Gói 45 giây', duration: '45 giây', durationSeconds: 45,  profitPercent: 90, createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 4, name: 'Gói 60 giây', duration: '60 giây', durationSeconds: 60,  profitPercent: 92, createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 5, name: 'Gói 2 phút',  duration: '2 phút',  durationSeconds: 120, profitPercent: 95, createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 6, name: 'Gói 5 phút',  duration: '5 phút',  durationSeconds: 300, profitPercent: 98, createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
]

let nextId = 7

export const adminFinancePackageService = {
  getAll: async (): Promise<FinancePackage[]> => {
    await new Promise(r => setTimeout(r, 350))
    return [...MOCK_PACKAGES]
  },

  create: async (dto: CreateFinancePackageDto): Promise<FinancePackage> => {
    await new Promise(r => setTimeout(r, 500))
    const exists = MOCK_PACKAGES.find(p => p.name.toLowerCase() === dto.name.toLowerCase())
    if (exists) throw new Error('Tên gói đã tồn tại')
    const pkg: FinancePackage = { id: nextId++, ...dto, createdAt: new Date().toISOString() }
    MOCK_PACKAGES.push(pkg)
    return { ...pkg }
  },

  delete: async (id: number): Promise<void> => {
    await new Promise(r => setTimeout(r, 400))
    const idx = MOCK_PACKAGES.findIndex(p => p.id === id)
    if (idx === -1) throw new Error('Không tìm thấy gói')
    MOCK_PACKAGES.splice(idx, 1)
  },
}