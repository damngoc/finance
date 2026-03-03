import {
  Transaction,
  TransactionFilterParams,
  PaginatedResponse,
  ApproveTransactionDto,
  RejectTransactionDto,
} from '@/shared/types'

const USERNAMES = [
  'nguyenvana', 'tranthib', 'leminhc', 'phamhoad',
  'hoanglong', 'buithie', 'doanvang', 'ngoth', 'lyvanI', 'vuquanj',
]

const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 38 }, (_, i) => ({
  id: i + 1,
  username: USERNAMES[i % USERNAMES.length],
  amount: Math.floor((Math.random() * 49 + 1) * 100_000),
  type: (i % 3 === 0 ? 'withdraw' : 'deposit') as Transaction['type'],
  status: 'pending' as Transaction['status'],
  createdAt: new Date(Date.now() - i * 3_600_000 * (i + 1)).toISOString(),
}))

export const adminTransactionService = {
  getAll: async (params: TransactionFilterParams = {}): Promise<PaginatedResponse<Transaction>> => {
    // Thay bằng API thật:
    // const { data } = await apiClient.get('/admin/transactions', { params })
    // return data

    await new Promise(r => setTimeout(r, 350))
    const { page = 1, limit = 10, search = '', type = 'all' } = params

    let filtered = [...MOCK_TRANSACTIONS]
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

  approve: async (dto: ApproveTransactionDto): Promise<Transaction> => {
    // const { data } = await apiClient.patch(`/admin/transactions/${dto.id}/approve`)
    // return data

    await new Promise(r => setTimeout(r, 500))
    const tx = MOCK_TRANSACTIONS.find(t => t.id === dto.id)
    if (!tx) throw new Error('Không tìm thấy giao dịch')
    tx.status = 'approved'
    return { ...tx }
  },

  reject: async (dto: RejectTransactionDto): Promise<Transaction> => {
    // const { data } = await apiClient.patch(`/admin/transactions/${dto.id}/reject`, { reason: dto.reason })
    // return data

    await new Promise(r => setTimeout(r, 500))
    const tx = MOCK_TRANSACTIONS.find(t => t.id === dto.id)
    if (!tx) throw new Error('Không tìm thấy giao dịch')
    tx.status = 'rejected'
    tx.rejectedReason = dto.reason
    return { ...tx }
  },
}

// ─── Exported so client service can push new transactions ────────
export const MOCK_TRANSACTIONS_REF = {
  push: (tx: Transaction) => {
    MOCK_TRANSACTIONS.unshift(tx)
  },
  getNextId: () => MOCK_TRANSACTIONS.length + 1,
}