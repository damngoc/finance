import React, { useState, useEffect } from 'react'
import {
  AdminAccount,
  CreateAdminAccountDto,
  UpdateAdminAccountDto,
  AdminAccountStatus,
} from '../services/adminAccountService'

interface AdminAccountFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (dto: CreateAdminAccountDto | UpdateAdminAccountDto) => Promise<void>
  isLoading?: boolean
  editAccount?: AdminAccount | null
}

type FormState = {
  username: string
  email: string
  password: string
  status: AdminAccountStatus
}

const EMPTY: FormState = { username: '', email: '', password: '', status: 'active' }

const AdminAccountFormModal: React.FC<AdminAccountFormModalProps> = ({
  isOpen, onClose, onSubmit, isLoading, editAccount,
}) => {
  const isEdit = !!editAccount
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  useEffect(() => {
    if (!isOpen) return
    if (editAccount) {
      setForm({
        username: editAccount.username,
        email: editAccount.email,
        password: '',
        status: editAccount.status,
      })
    } else {
      setForm(EMPTY)
    }
    setErrors({})
  }, [isOpen, editAccount])

  const set = (field: keyof FormState, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.username.trim()) e.username = 'Vui lòng nhập username'
    else if (form.username.length < 3) e.username = 'Username tối thiểu 3 ký tự'
    if (!form.email.trim()) e.email = 'Vui lòng nhập email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ'
    if (!isEdit && !form.password.trim()) e.password = 'Vui lòng nhập mật khẩu'
    else if (form.password && form.password.length < 6) e.password = 'Mật khẩu tối thiểu 6 ký tự'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    if (isEdit) {
      const dto: UpdateAdminAccountDto = {
        username: form.username,
        email: form.email,
        status: form.status,
        ...(form.password ? { password: form.password } : {}),
      }
      await onSubmit(dto)
    } else {
      const dto: CreateAdminAccountDto = {
        username: form.username,
        email: form.email,
        password: form.password,
      }
      await onSubmit(dto)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 flex items-center justify-center text-xl flex-shrink-0">
            🛡️
          </div>
          <div>
            <h2 className="text-white font-semibold">
              {isEdit ? `Chỉnh sửa: ${editAccount?.username}` : 'Thêm tài khoản Admin'}
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">
              {isEdit ? 'Cập nhật thông tin tài khoản' : 'Tạo tài khoản quản trị mới'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-gray-300 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Username <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.username}
              onChange={e => set('username', e.target.value)}
              placeholder="admin_username"
              className={`w-full px-4 py-2.5 bg-gray-800 border rounded-xl text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 transition-colors ${
                errors.username ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-700 focus:ring-purple-500/30 focus:border-purple-500'
              }`}
            />
            {errors.username && <p className="mt-1.5 text-xs text-red-400">⚠ {errors.username}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="admin@example.com"
              className={`w-full px-4 py-2.5 bg-gray-800 border rounded-xl text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 transition-colors ${
                errors.email ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-700 focus:ring-purple-500/30 focus:border-purple-500'
              }`}
            />
            {errors.email && <p className="mt-1.5 text-xs text-red-400">⚠ {errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Mật khẩu {isEdit ? <span className="text-gray-500 font-normal">(để trống = không đổi)</span> : <span className="text-red-400">*</span>}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder={isEdit ? 'Nhập mật khẩu mới nếu muốn đổi' : 'Tối thiểu 6 ký tự'}
              className={`w-full px-4 py-2.5 bg-gray-800 border rounded-xl text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 transition-colors ${
                errors.password ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-700 focus:ring-purple-500/30 focus:border-purple-500'
              }`}
            />
            {errors.password && <p className="mt-1.5 text-xs text-red-400">⚠ {errors.password}</p>}
          </div>

          {/* Status - chỉ show khi edit */}
          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Trạng thái</label>
              <div className="grid grid-cols-2 gap-2">
                {(['active', 'inactive'] as AdminAccountStatus[]).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set('status', s)}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      form.status === s
                        ? s === 'active'
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                    }`}
                  >
                    {s === 'active' ? '✓ Hoạt động' : '○ Vô hiệu'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang lưu...</>
              ) : (
                isEdit ? '💾 Cập nhật' : '+ Tạo tài khoản'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminAccountFormModal