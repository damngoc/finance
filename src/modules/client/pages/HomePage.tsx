import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'

const HomePage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-900/50">
          <span className="text-white text-3xl">✦</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">MyApp</h1>
        <p className="text-slate-400 mb-10">Chọn khu vực bạn muốn truy cập</p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate(ROUTES.ADMIN.LOGIN)}
            className="group p-6 bg-gray-900/80 border border-gray-700 hover:border-indigo-500 rounded-2xl transition-all hover:shadow-lg hover:shadow-indigo-900/20"
          >
            <div className="w-12 h-12 bg-indigo-900/50 group-hover:bg-indigo-600 rounded-xl flex items-center justify-center text-2xl mx-auto mb-3 transition-colors">🛡️</div>
            <p className="text-white font-semibold">Admin</p>
            <p className="text-slate-500 text-xs mt-1">Quản trị hệ thống</p>
          </button>

          <button
            onClick={() => navigate(ROUTES.CLIENT.LOGIN)}
            className="group p-6 bg-gray-900/80 border border-gray-700 hover:border-violet-500 rounded-2xl transition-all hover:shadow-lg hover:shadow-violet-900/20"
          >
            <div className="w-12 h-12 bg-violet-900/50 group-hover:bg-violet-600 rounded-xl flex items-center justify-center text-2xl mx-auto mb-3 transition-colors">✦</div>
            <p className="text-white font-semibold">Client</p>
            <p className="text-slate-500 text-xs mt-1">Trang người dùng</p>
          </button>
        </div>

        <p className="text-slate-600 text-xs mt-8">
          Demo: password = <code className="text-indigo-400">123456</code>
        </p>
      </div>
    </div>
  )
}

export default HomePage
