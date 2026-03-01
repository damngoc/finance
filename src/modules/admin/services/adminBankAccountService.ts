export type BankAccountCurrency = 'VND' | 'USDT'
export type UsdtNetwork = 'TRC20' | 'ERC20'

export interface BankAccountVND {
  id: number
  currency: 'VND'
  accountName: string
  accountNumber: string
  bankName: string
  createdAt: string
}

export interface BankAccountUSDT {
  id: number
  currency: 'USDT'
  network: UsdtNetwork
  walletAddress: string
  accountName: string
  createdAt: string
}

export type BankAccount = BankAccountVND | BankAccountUSDT

export interface CreateBankAccountVNDDto {
  currency: 'VND'
  accountName: string
  accountNumber: string
  bankName: string
}

export interface CreateBankAccountUSDTDto {
  currency: 'USDT'
  network: UsdtNetwork
  walletAddress: string
  accountName: string
}

export type CreateBankAccountDto = CreateBankAccountVNDDto | CreateBankAccountUSDTDto

let MOCK_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 1,
    currency: 'VND',
    accountName: 'Nguyễn Văn Admin',
    accountNumber: '1234567890',
    bankName: 'Vietcombank',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 2,
    currency: 'USDT',
    network: 'TRC20',
    walletAddress: 'TXyz1234567890ABCDefghijklmnopqrstu',
    accountName: 'USDT TRC20',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

let nextId = 3

export const adminBankAccountService = {
  getAll: async (): Promise<BankAccount[]> => {
    await new Promise(r => setTimeout(r, 300))
    return [...MOCK_BANK_ACCOUNTS]
  },

  create: async (dto: CreateBankAccountDto): Promise<BankAccount> => {
    await new Promise(r => setTimeout(r, 500))
    const account = { ...dto, id: nextId++, createdAt: new Date().toISOString() } as BankAccount
    MOCK_BANK_ACCOUNTS.push(account)
    return { ...account }
  },

  update: async (id: number, dto: CreateBankAccountDto): Promise<BankAccount> => {
    await new Promise(r => setTimeout(r, 500))
    const idx = MOCK_BANK_ACCOUNTS.findIndex(a => a.id === id)
    if (idx === -1) throw new Error('Không tìm thấy tài khoản')
    MOCK_BANK_ACCOUNTS[idx] = { ...dto, id, createdAt: MOCK_BANK_ACCOUNTS[idx].createdAt } as BankAccount
    return { ...MOCK_BANK_ACCOUNTS[idx] }
  },

  delete: async (id: number): Promise<void> => {
    await new Promise(r => setTimeout(r, 400))
    const idx = MOCK_BANK_ACCOUNTS.findIndex(a => a.id === id)
    if (idx === -1) throw new Error('Không tìm thấy tài khoản')
    MOCK_BANK_ACCOUNTS.splice(idx, 1)
  },
}