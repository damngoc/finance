export interface SupportConfig {
  telegramUsername: string
  telegramLink: string
  telegramGroupLink?: string
  workingHours: string
  note?: string
}

export let MOCK_SUPPORT_CONFIG: SupportConfig = {
  telegramUsername: 'cskh_myapp',
  telegramLink: 'https://t.me/cskh_myapp',
  telegramGroupLink: 'https://t.me/+myapp_community',
  workingHours: '8:00 – 22:00 mỗi ngày',
  note: 'Phản hồi trong vòng 5–15 phút trong giờ làm việc.',
}

export const clientSupportService = {
  getConfig: async (): Promise<SupportConfig> => {
    // TODO: const { data } = await apiClient.get('/public/support-config')
    await new Promise(r => setTimeout(r, 200))
    return { ...MOCK_SUPPORT_CONFIG }
  },
}