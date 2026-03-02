import React, { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { Avatar } from '@/shared/components'
import { ROUTES } from '@/shared/constants'

const navItems = [
  { path: ROUTES.ADMIN.DASHBOARD, icon: '📊', label: 'Thống kê tổng' },
  { path: ROUTES.ADMIN.USERS, icon: '👥', label: 'Quản lý Users' },
  { path: ROUTES.ADMIN.ADMIN_ACCOUNTS, icon: '🛡️', label: 'Quản lý Admin' },
  { path: ROUTES.ADMIN.TRANSACTIONS, icon: '💰', label: 'Nạp/Rút cần xử lý' },
  { path: ROUTES.ADMIN.TRANSACTIONS_VIEW, icon: '📋', label: 'Nạp/Rút đã xử lý' },
  { path: ROUTES.ADMIN.TRADE_ORDERS,      icon: '📈', label: 'Mua/Bán cần xử lý' },
  { path: ROUTES.ADMIN.TRADE_ORDERS_HISTORY, icon: '📜', label: 'Mua/Bán đã xử lý' },
  { path: ROUTES.ADMIN.FINANCE_PACKAGES, icon: '💼', label: 'Gói tài chính' },
  { path: ROUTES.ADMIN.MARGIN_PACKAGES, icon: '🔒', label: 'Gói ký quỹ' },
  { path: ROUTES.ADMIN.BANK_ACCOUNTS, icon: '🏦', label: 'Cấu hình Bank' },
  { path: ROUTES.ADMIN.TELEGRAM_CONFIG, icon: '✈️', label: 'Cấu hình Telegram' },
  { path: ROUTES.ADMIN.WEB_CONFIG, icon: '🌐', label: 'Cấu hình Web' },
]

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate(ROUTES.ADMIN.LOGIN)
  }

  return (
    <div className="flex h-screen bg-gray-950 font-sans">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          {!collapsed && (
            <span className="text-white font-semibold text-sm truncate">Admin Panel</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-gray-500 hover:text-gray-300 transition-colors"
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-gray-800 p-3">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name || 'Admin'} size="sm" />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">{user?.name}</p>
                <p className="text-gray-500 text-xs truncate">{user?.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="text-gray-500 hover:text-red-400 transition-colors text-sm flex-shrink-0"
            >
              ⏻
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div />
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1.5 rounded-full">
              🔴 Admin
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-950 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
