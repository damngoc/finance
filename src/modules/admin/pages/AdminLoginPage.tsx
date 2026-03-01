import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { Button, Input, ErrorAlert } from '@/shared/components'
import { ROUTES } from '@/shared/constants'
import { UserRole } from '@/shared/types'

type LoginRole = Extract<UserRole, 'admin' | 'super_admin'>

// const ROLE_OPTIONS: { value: LoginRole; label: string; icon: string; desc: string }[] = [
//   { value: 'admin',       icon: '🔑', label: 'Admin',       desc: 'Quản lý thông thường' },
//   { value: 'super_admin', icon: '👑', label: 'Super Admin', desc: 'Toàn quyền hệ thống'  },
// ]

const AdminLoginPage: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: 'admin@example.com', password: '' })
  const [role] = useState<LoginRole>('admin')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form, role)
      navigate(ROUTES.ADMIN.DASHBOARD)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-900/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Back */}
        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
        >
          ← Quay lại
        </button>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-900/50">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Đăng nhập để tiếp tục</p>
        </div>

        {/* Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
          {error && <div className="mb-4"><ErrorAlert message={error} /></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-black text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Mật khẩu</label>
              <Input
                type="password"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-black text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" isLoading={loading} className="w-full mt-2">
              Đăng nhập
            </Button>
          </form>

          <p className="text-center text-xs text-gray-600 mt-4">
            Hint: password = <code className="text-indigo-400">123456</code>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage
