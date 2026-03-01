import { Transaction, TransactionFilterParams, PaginatedResponse } from '@/shared/types'

const MOCK_MY_TRANSACTIONS: Transaction[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  username: 'nguyenvana',
  amount: Math.floor((Math.random() * 49 + 1) * 100_000),
  type: (i % 3 === 0 ? 'withdraw' : 'deposit') as Transaction['type'],
  status: (
    ['approved', 'approved', 'rejected', 'approved', 'rejected'] as Transaction['status'][]
  )[i % 5],
  createdAt: new Date(Date.now() - i * 3_600_000 * (i + 1)).toISOString(),
  rejectedReason: i % 5 === 4 ? 'Số tiền vượt hạn mức cho phép' : undefined,
}))

export const clientTransactionService = {
  getMyTransactions: async (
    params: TransactionFilterParams = {}
  ): Promise<PaginatedResponse<Transaction>> => {
    // Thay bằng API thật:
    // const { data } = await apiClient.get('/user/transactions', { params })
    // return data

    await new Promise(r => setTimeout(r, 350))
    const { page = 1, limit = 10, search = '', type = 'all' } = params

    let filtered = [...MOCK_MY_TRANSACTIONS]
    if (search) {
      filtered = filtered.filter(t =>
        t.username.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (type !== 'all') {
      filtered = filtered.filter(t => t.type === type)
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
}