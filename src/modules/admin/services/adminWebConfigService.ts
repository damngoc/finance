export interface WebConfig {
  logo: string
  banners: string[]     // max 5
  marqueeText: string
}

let MOCK_CONFIG: WebConfig = {
  logo: '',
  banners: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80',
    'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1200&q=80',
    'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80&sat=-100',
    'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1200&q=80&sat=-100',
  ],
  marqueeText: '🎉 Chào mừng bạn đến với nền tảng đầu tư hàng đầu! 💹 Giao dịch an toàn, lợi nhuận hấp dẫn. 🚀 Đăng ký ngay hôm nay để nhận ưu đãi đặc biệt!',
}

export const adminWebConfigService = {
  getConfig: async (): Promise<WebConfig> => {
    // const { data } = await apiClient.get('/admin/web-config')
    // return data
    await new Promise(r => setTimeout(r, 400))
    return { ...MOCK_CONFIG, banners: [...MOCK_CONFIG.banners] }
  },

  saveLogo: async (logoUrl: string): Promise<void> => {
    // await apiClient.patch('/admin/web-config/logo', { logo: logoUrl })
    await new Promise(r => setTimeout(r, 500))
    MOCK_CONFIG.logo = logoUrl
  },

  saveBanners: async (banners: string[]): Promise<void> => {
    // await apiClient.patch('/admin/web-config/banners', { banners })
    await new Promise(r => setTimeout(r, 500))
    MOCK_CONFIG.banners = [...banners]
  },

  saveMarquee: async (text: string): Promise<void> => {
    // await apiClient.patch('/admin/web-config/marquee', { text })
    await new Promise(r => setTimeout(r, 400))
    MOCK_CONFIG.marqueeText = text
  },
}