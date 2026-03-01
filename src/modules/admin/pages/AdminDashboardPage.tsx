import React from 'react'
import { StatCard } from '@/shared/components'
import { useAuth } from '@/shared/hooks/useAuth'

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth()

  const stats = [
    { label: 'Tổng Users', value: '1,284', icon: '👥', color: 'indigo' as const, trend: { value: 12, label: 'so với tháng trước' } },
    { label: 'Tổng số tiền nạp', value: '987', icon: '✅', color: 'emerald' as const, trend: { value: 8, label: 'tháng này' } },
    { label: 'Tổng số tiền rút', value: '142', icon: '🆕', color: 'amber' as const, trend: { value: 5, label: 'so với tháng trước' } },
    { label: 'Bị khóa', value: '23', icon: '🚫', color: 'rose' as const, trend: { value: -3, label: 'giảm so với tháng trước' } },
  ]

  const recentActivities = [
    { id: 1, action: 'User mới đăng ký', user: 'Nguyễn Văn A', time: '2 phút trước', type: 'new' },
    { id: 2, action: 'Cập nhật thông tin', user: 'Trần Thị B', time: '15 phút trước', type: 'update' },
    { id: 3, action: 'Tài khoản bị khóa', user: 'Lê Minh C', time: '1 giờ trước', type: 'ban' },
    { id: 4, action: 'User mới đăng ký', user: 'Phạm Hoa D', time: '2 giờ trước', type: 'new' },
    { id: 5, action: 'Đổi mật khẩu', user: 'Hoàng Long E', time: '3 giờ trước', type: 'update' },
  ]

  const typeIcon: Record<string, string> = { new: '🟢', update: '🔵', ban: '🔴' }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Xin chào, {user?.name} 👋</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Hoạt động gần đây</h2>
          <div className="space-y-3">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                <span className="text-base">{typeIcon[act.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200">{act.action}</p>
                  <p className="text-xs text-gray-500">{act.user}</p>
                </div>
                <span className="text-xs text-gray-600 flex-shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Phân bổ Role</h2>
          <div className="space-y-4">
            {[
              { label: 'Client', count: 1198, pct: 93, color: 'bg-indigo-500' },
              { label: 'Admin', count: 86, pct: 7, color: 'bg-amber-500' },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-300">{r.label}</span>
                  <span className="text-gray-500">{r.count}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800">
            <h3 className="text-white text-sm font-semibold mb-3">Trạng thái</h3>
            {[
              { label: 'Active', count: 987, color: 'text-emerald-400' },
              { label: 'Inactive', count: 274, color: 'text-amber-400' },
              { label: 'Banned', count: 23, color: 'text-red-400' },
            ].map((s) => (
              <div key={s.label} className="flex justify-between text-sm py-1.5">
                <span className="text-gray-400">{s.label}</span>
                <span className={`font-medium ${s.color}`}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
