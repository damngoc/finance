import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { ROUTES } from '@/shared/constants'

const navItems = [
  { path: ROUTES.CLIENT.DASHBOARD,    icon: '🏠', label: 'Trang chủ' },
  { path: ROUTES.CLIENT.DEPOSIT,      icon: '💰', label: 'Nạp tiền' },
  { path: ROUTES.CLIENT.WITHDRAW,     icon: '💸', label: 'Rút tiền' },
  { path: ROUTES.CLIENT.TRANSACTIONS, icon: '📋', label: 'Lịch sử' },
  { path: ROUTES.CLIENT.PROFILE,      icon: '👤', label: 'Hồ sơ' },
]

export const ClientLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate(ROUTES.HOME) }

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col items-center">
      {/* Mobile phone frame — max-w-lg, tất cả page con hiển thị trong khung này */}
      <div className="w-full max-w-lg min-h-screen bg-slate-50 flex flex-col relative shadow-2xl">

        {/* Top mini header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">✦</span>
            </div>
            <span className="font-bold text-slate-800 text-sm">MyApp</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center">
              <span className="text-violet-700 text-xs font-bold">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs font-medium text-slate-700 max-w-[80px] truncate">
              {user?.name?.split(' ').pop()}
            </span>
            <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-red-500 transition-colors ml-1">⏻</button>
          </div>
        </header>

        {/* Page content — scrollable, padding-bottom cho footer nav */}
        <main className="flex-1 overflow-y-auto pb-24">
          <div className="px-4 py-5">
            <Outlet />
          </div>
        </main>

        {/* Bottom navigation — gắn cứng ở footer */}
        <nav className="sticky bottom-0 bg-white border-t border-slate-200 z-20 flex-shrink-0">
          <div className="flex">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all relative ${
                    isActive ? 'text-violet-600' : 'text-slate-400 hover:text-slate-600'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`text-xl leading-none transition-transform ${isActive ? 'scale-110' : ''}`}>
                      {item.icon}
                    </span>
                    <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-violet-600' : 'text-slate-400'}`}>
                      {item.label}
                    </span>
                    {isActive && <span className="absolute bottom-0 w-8 h-0.5 bg-violet-600 rounded-full" />}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}