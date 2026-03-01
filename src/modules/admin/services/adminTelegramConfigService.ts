export type TelegramFeatureKey =
  | 'deposit' | 'withdraw' | 'register'
  | 'login' | 'admin_delete_user' | 'admin_edit_bank'

export interface TelegramFeatureConfig {
  key: TelegramFeatureKey
  label: string
  icon: string
  description: string
  token: string
  groupId: string
}

export interface UpdateTelegramConfigDto {
  key: TelegramFeatureKey
  token: string
  groupId: string
}

const FEATURE_DEFAULTS: Omit<TelegramFeatureConfig, 'token' | 'groupId'>[] = [
  { key: 'deposit',           label: 'Noti Nạp tiền',         icon: '⬆',  description: 'Thông báo khi có lệnh nạp tiền mới' },
  { key: 'withdraw',          label: 'Noti Rút tiền',          icon: '⬇',  description: 'Thông báo khi có lệnh rút tiền mới' },
  { key: 'register',          label: 'Noti Đăng ký',           icon: '✏️',  description: 'Thông báo khi có người dùng đăng ký mới' },
  { key: 'login',             label: 'Noti Đăng nhập',         icon: '🔑',  description: 'Thông báo khi có người dùng đăng nhập' },
  { key: 'admin_delete_user', label: 'Noti Admin xoá User',    icon: '🗑',  description: 'Thông báo khi admin xoá tài khoản người dùng' },
  { key: 'admin_edit_bank',   label: 'Noti Admin cập nhật Bank',    icon: '🏦',  description: 'Thông báo khi admin chỉnh cập nhật tài khoản ngân hàng' },
]

let MOCK_CONFIGS: TelegramFeatureConfig[] = FEATURE_DEFAULTS.map(f => ({ ...f, token: '', groupId: '' }))

export const adminTelegramConfigService = {
  getAll: async (): Promise<TelegramFeatureConfig[]> => {
    // const { data } = await apiClient.get('/admin/telegram-config')
    // return data
    await new Promise(r => setTimeout(r, 300))
    return MOCK_CONFIGS.map(c => ({ ...c }))
  },

  update: async (dto: UpdateTelegramConfigDto): Promise<TelegramFeatureConfig> => {
    // const { data } = await apiClient.patch(`/admin/telegram-config/${dto.key}`, dto)
    // return data
    await new Promise(r => setTimeout(r, 500))
    const idx = MOCK_CONFIGS.findIndex(c => c.key === dto.key)
    if (idx === -1) throw new Error('Không tìm thấy cấu hình')
    MOCK_CONFIGS[idx] = { ...MOCK_CONFIGS[idx], token: dto.token, groupId: dto.groupId }
    return { ...MOCK_CONFIGS[idx] }
  },
}