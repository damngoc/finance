export type PackageCode = '15s' | '25s' | '45s' | '60s'
export type TradeDirection = 'buy' | 'sell'
export type TradeOrderStatus = 'pending' | 'win' | 'lose'

export interface TradeOrder {
  id: number
  username: string
  packageCode: PackageCode
  packageName: string
  seconds: number
  betAmount: number
  profitPercent: number
  profitAmount: number
  status: TradeOrderStatus
  direction: TradeDirection
  createdAt: string
}

const PACKAGE_MAP: Record<PackageCode, { name: string; totalSeconds: number }> = {
  '15s': { name: 'Gói 15 giây', totalSeconds: 15 },
  '25s': { name: 'Gói 25 giây', totalSeconds: 25 },
  '45s': { name: 'Gói 45 giây', totalSeconds: 45 },
  '60s': { name: 'Gói 60 giây', totalSeconds: 60 },
}

const PROFIT_RATES: Record<PackageCode, number> = {
  '15s': 85, '25s': 88, '45s': 90, '60s': 92,
}

const USERNAMES = ['user001', 'user002', 'user003', 'user004', 'user005', 'tran_thi_b', 'le_minh_c', 'hoang_long']
const PACKAGES: PackageCode[] = ['15s', '25s', '45s', '60s']
const BET_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000]

function makeOrder(i: number, status: TradeOrderStatus, idOffset = 0): TradeOrder {
  const pkg = PACKAGES[i % PACKAGES.length]
  const betAmount = BET_AMOUNTS[i % BET_AMOUNTS.length]
  const profitPercent = PROFIT_RATES[pkg]
  const profitAmount = betAmount + Math.round(betAmount * profitPercent / 100)
  const totalSec = PACKAGE_MAP[pkg].totalSeconds
  // pending: countdown ngẫu nhiên | win/lose: hiển thị tổng giây của gói
  const secondsLeft = status === 'pending'
    ? Math.floor(Math.random() * totalSec)
    : totalSec

  return {
    id: idOffset + i + 1,
    username: USERNAMES[i % USERNAMES.length],
    packageCode: pkg,
    packageName: PACKAGE_MAP[pkg].name,
    seconds: secondsLeft,
    betAmount,
    profitPercent,
    profitAmount,
    status,
    direction: i % 2 === 0 ? 'buy' : 'sell',
    createdAt: new Date(Date.now() - (idOffset + i) * 60000 * 5).toISOString(),
  }
}

// 10 lệnh đang chờ (pending) — hiển thị ở trang "Mua/Bán xử lý"
const PENDING_ORDERS: TradeOrder[] = Array.from({ length: 10 }, (_, i) => makeOrder(i, 'pending', 0))

// 15 lệnh thắng (win) — hiển thị ở trang "Mua/Bán đã xử lý"
const WIN_ORDERS: TradeOrder[] = Array.from({ length: 15 }, (_, i) => makeOrder(i, 'win', 100))

// 15 lệnh thua (lose) — hiển thị ở trang "Mua/Bán đã xử lý"
const LOSE_ORDERS: TradeOrder[] = Array.from({ length: 15 }, (_, i) => makeOrder(i, 'lose', 200))

let MOCK_ORDERS: TradeOrder[] = [...PENDING_ORDERS, ...WIN_ORDERS, ...LOSE_ORDERS]

export const adminTradeOrderService = {
  getAll: async (params: {
    page?: number
    limit?: number
    search?: string
    status?: TradeOrderStatus | 'all'
  } = {}) => {
    // const { data } = await apiClient.get('/admin/trade-orders', { params })
    // return data
    await new Promise(r => setTimeout(r, 350))
    const { page = 1, limit = 10, search = '', status = 'all' } = params

    let filtered = [...MOCK_ORDERS]
    if (search) {
      filtered = filtered.filter(o =>
        o.username.toLowerCase().includes(search.toLowerCase()) ||
        o.packageCode.includes(search.toLowerCase())
      )
    }
    if (status !== 'all') {
      filtered = filtered.filter(o => o.status === status)
    }

    const start = (page - 1) * limit
    return {
      data: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    }
  },

  resolveWin: async (id: number): Promise<TradeOrder> => {
    // const { data } = await apiClient.patch(`/admin/trade-orders/${id}/win`)
    // return data
    await new Promise(r => setTimeout(r, 500))
    const idx = MOCK_ORDERS.findIndex(o => o.id === id)
    if (idx === -1) throw new Error('Không tìm thấy lệnh')
    MOCK_ORDERS[idx] = {
      ...MOCK_ORDERS[idx],
      status: 'win',
      seconds: PACKAGE_MAP[MOCK_ORDERS[idx].packageCode].totalSeconds,
    }
    return { ...MOCK_ORDERS[idx] }
  },

  resolveLose: async (id: number): Promise<TradeOrder> => {
    // const { data } = await apiClient.patch(`/admin/trade-orders/${id}/lose`)
    // return data
    await new Promise(r => setTimeout(r, 500))
    const idx = MOCK_ORDERS.findIndex(o => o.id === id)
    if (idx === -1) throw new Error('Không tìm thấy lệnh')
    MOCK_ORDERS[idx] = {
      ...MOCK_ORDERS[idx],
      status: 'lose',
      seconds: PACKAGE_MAP[MOCK_ORDERS[idx].packageCode].totalSeconds,
    }
    return { ...MOCK_ORDERS[idx] }
  },
}