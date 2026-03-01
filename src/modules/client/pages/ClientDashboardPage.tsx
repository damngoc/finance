import React from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import { useApi } from '@/shared/hooks/useApi'
import { Spinner, ErrorAlert, StatCard } from '@/shared/components'
import { clientDashboardService } from '../services/clientDashboardService'
import MiniChart from '../components/MiniChart'

const ClientDashboardPage: React.FC = () => {
  const { user } = useAuth()
  const { data: stats, loading: statsLoading, error: statsError } = useApi(
    () => clientDashboardService.getStats()
  )
  const { data: chartData } = useApi(() => clientDashboardService.getMonthlyChart())

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-violet-200 text-sm mb-1">Chào mừng trở lại</p>
        <h1 className="text-2xl font-bold">{user?.name} 👋</h1>
        <p className="text-violet-200 text-sm mt-2">
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      {statsLoading && <div className="flex justify-center py-8"><Spinner size="lg" className="text-indigo-500" /></div>}
      {statsError && <ErrorAlert message={statsError} />}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Tổng Users" value={stats.totalUsers.toLocaleString()} icon="👥" color="indigo" trend={{ value: 12, label: 'tháng này' }} />
          <StatCard label="Users Hoạt động" value={stats.activeUsers.toLocaleString()} icon="✅" color="emerald" trend={{ value: 8, label: 'tháng này' }} />
          <StatCard label="Users mới" value={stats.newUsersThisMonth.toLocaleString()} icon="🆕" color="amber" trend={{ value: 5, label: 'tháng này' }} />
          <StatCard label="Doanh thu" value={formatCurrency(stats.totalRevenue)} icon="💰" color="rose" trend={{ value: 18, label: 'tháng này' }} />
        </div>
      )}

      {/* Chart + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-slate-800">Users theo tháng</h2>
              <p className="text-sm text-slate-400">Năm {new Date().getFullYear()}</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-medium">+12% ↑</span>
          </div>
          {chartData ? (
            <div className="h-[80%]">
              <MiniChart data={chartData} color="#6366f1" />
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center"><Spinner /></div>
          )}
          {chartData && (
            <div className="flex justify-between mt-3">
              {chartData.filter((_, i) => i % 2 === 0).map(d => (
                <span key={d.label} className="text-xs text-slate-400">{d.label}</span>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Thao tác nhanh</h2>
          <div className="space-y-3">
            {[
              { icon: '👤', label: 'Cập nhật hồ sơ', desc: 'Chỉnh sửa thông tin cá nhân', color: 'bg-indigo-50 text-indigo-600' },
              { icon: '🔒', label: 'Đổi mật khẩu', desc: 'Bảo mật tài khoản', color: 'bg-amber-50 text-amber-600' },
              { icon: '🔔', label: 'Thông báo', desc: '3 thông báo mới', color: 'bg-emerald-50 text-emerald-600' },
              { icon: '📊', label: 'Báo cáo', desc: 'Xem báo cáo chi tiết', color: 'bg-violet-50 text-violet-600' },
            ].map(({ icon, label, desc, color }) => (
              <button
                key={label}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${color}`}>
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
                <span className="ml-auto text-slate-300 group-hover:text-indigo-400 transition-colors">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-4">Hoạt động gần đây</h2>
        <div className="space-y-3">
          {[
            { icon: '✅', text: 'Đăng nhập thành công', time: 'Vừa xong', color: 'text-emerald-500' },
            { icon: '👤', text: 'Cập nhật thông tin hồ sơ', time: '2 ngày trước', color: 'text-indigo-500' },
            { icon: '🔒', text: 'Đổi mật khẩu', time: '1 tuần trước', color: 'text-amber-500' },
          ].map(({ icon, text, time, color }) => (
            <div key={text} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
              <span className={`text-base ${color}`}>{icon}</span>
              <span className="text-sm text-slate-600 flex-1">{text}</span>
              <span className="text-xs text-slate-400">{time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ClientDashboardPage
