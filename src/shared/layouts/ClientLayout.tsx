import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { Avatar } from '@/shared/components'
import { ROUTES } from '@/shared/constants'

const navItems = [
  { path: ROUTES.CLIENT.DASHBOARD, icon: '🏠', label: 'Dashboard' },
  { path: ROUTES.CLIENT.PROFILE, icon: '👤', label: 'Hồ sơ' },
  { path: ROUTES.CLIENT.TRANSACTIONS, icon: '💳', label: 'Nạp / Rút tiền' },
  { path: ROUTES.CLIENT.SETTINGS, icon: '⚙️', label: 'Cài đặt' },
]

export const ClientLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.HOME)
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">✦</span>
              </div>
              <span className="font-bold text-slate-800 text-sm">MyApp</span>
            </div>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* User */}
            <div className="flex items-center gap-3">
              <Avatar name={user?.name || 'User'} size="sm" />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-800">{user?.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-slate-500 hover:text-red-500 transition-colors ml-2"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
