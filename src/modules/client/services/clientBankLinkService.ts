import { adminUserService } from '@/modules/admin/services/adminUserService'

export interface BankLinkInfo {
  bankName: string
  bankAccountName: string
  bankAccountNumber: string
}

// Dùng chung MOCK_USERS với admin
// → khi client cập nhật, admin thấy ngay 3 cột tương ứng
export const clientBankLinkService = {
  getMyBankInfo: async (userId: number): Promise<BankLinkInfo> => {
    // TODO: const { data } = await apiClient.get('/user/bank-info')
    // return data
    await new Promise(r => setTimeout(r, 350))
    const user = await adminUserService.getById(userId)
    return {
      bankName: user.bankName || '',
      bankAccountName: user.bankAccountName || '',
      bankAccountNumber: user.bankAccountNumber || '',
    }
  },

  updateMyBankInfo: async (userId: number, info: BankLinkInfo): Promise<void> => {
    // TODO: await apiClient.patch('/user/bank-info', info)
    await new Promise(r => setTimeout(r, 600))
    await adminUserService.update(userId, {
      bankName: info.bankName,
      bankAccountName: info.bankAccountName,
      bankAccountNumber: info.bankAccountNumber,
    })
  },
}