import { MOCK_TRANSACTIONS_REF } from '@/modules/admin/services/adminTransactionService'
import { Transaction } from '@/shared/types'

export interface WithdrawRequest {
  amount: number
}

// Mock balance per user (key = userId)
const MOCK_BALANCES: Record<number, number> = {}

export const clientWithdrawService = {
  getBalance: async (userId: number): Promise<number> => {
    // TODO: const { data } = await apiClient.get('/user/balance')
    await new Promise(r => setTimeout(r, 200))
    if (!(userId in MOCK_BALANCES)) {
      MOCK_BALANCES[userId] = Math.floor((Math.random() * 40 + 10) * 100_000)
    }
    return MOCK_BALANCES[userId]
  },

  createWithdraw: async (userId: number, username: string, req: WithdrawRequest): Promise<Transaction> => {
    // TODO: const { data } = await apiClient.post('/user/withdraw', req)
    await new Promise(r => setTimeout(r, 800))

    const balance = MOCK_BALANCES[userId] ?? 0
    if (req.amount > balance) throw new Error('Số dư không đủ để thực hiện rút tiền')
    if (req.amount < 50_000) throw new Error('Số tiền rút tối thiểu là 50.000đ')

    const tx: Transaction = {
      id: MOCK_TRANSACTIONS_REF.getNextId(),
      username,
      amount: req.amount,
      type: 'withdraw',
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    // Push vào MOCK_TRANSACTIONS của admin → admin thấy ngay
    MOCK_TRANSACTIONS_REF.push(tx)

    // Trừ balance tạm
    MOCK_BALANCES[userId] = balance - req.amount

    return tx
  },
}