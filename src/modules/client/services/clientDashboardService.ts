// import apiClient from '@/shared/services/apiClient'
import { DashboardStats, ChartDataPoint } from '@/shared/types'

export const clientDashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    // const { data } = await apiClient.get<DashboardStats>('/dashboard/stats')
    // return data
    await new Promise(r => setTimeout(r, 500))
    return {
      totalUsers: 1284,
      activeUsers: 987,
      newUsersThisMonth: 142,
      totalRevenue: 128_500_000,
    }
  },

  getMonthlyChart: async (): Promise<ChartDataPoint[]> => {
    await new Promise(r => setTimeout(r, 300))
    return [
      { label: 'T1', value: 45 },
      { label: 'T2', value: 62 },
      { label: 'T3', value: 58 },
      { label: 'T4', value: 79 },
      { label: 'T5', value: 91 },
      { label: 'T6', value: 105 },
      { label: 'T7', value: 87 },
      { label: 'T8', value: 120 },
      { label: 'T9', value: 134 },
      { label: 'T10', value: 110 },
      { label: 'T11', value: 142 },
      { label: 'T12', value: 156 },
    ]
  },
}
