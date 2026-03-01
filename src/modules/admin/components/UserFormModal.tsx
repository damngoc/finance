import React, { useState, useEffect } from 'react'
import { User, CreateUserDto, UpdateUserDto } from '@/shared/types'

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (dto: CreateUserDto | UpdateUserDto) => Promise<void>
  isLoading?: boolean
  editUser?: User | null
}

type FormState = {
  username: string
  registerIp: string
  password: string
  lastLoginIp: string
  bankAccountName: string
  bankAccountNumber: string
  bankName: string
  status: User['status']
}

const EMPTY: FormState = {
  username: '',
  registerIp: '',
  password: '',
  lastLoginIp: '',
  bankAccountName: '',
  bankAccountNumber: '',
  bankName: '',
  status: 'active',
}

const Field: React.FC<{
  label: string
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  type?: string
  readOnly?: boolean
  mono?: boolean
  error?: string
  required?: boolean
}> = ({ label, value, onChange, placeholder, type = 'text', readOnly, mono, error, required }) => (
  <div>
    <label className="block text-xs font-medium text-gray-400 mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 ${
        readOnly
          ? 'bg-gray-800/50 border border-gray-800 text-gray-500 cursor-default select-none'
          : error
            ? 'bg-gray-800 border border-red-500 text-gray-200 focus:ring-red-500/30'
            : 'bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-600 focus:ring-indigo-500/30 focus:border-indigo-500'
      } ${mono ? 'font-mono' : ''}`}
    />
    {error && <p className="mt-1 text-xs text-red-400">⚠ {error}</p>}
  </div>
)

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen, onClose, onSubmit, isLoading, editUser,
}) => {
  const isEdit = !!editUser
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  useEffect(() => {
    if (!isOpen) return
    if (editUser) {
      setForm({
        username: editUser.username,
        registerIp: editUser.registerIp ?? '',
        password: '',
        lastLoginIp: editUser.lastLoginIp ?? '',
        bankAccountName: editUser.bankAccountName ?? '',
        bankAccountNumber: editUser.bankAccountNumber ?? '',
        bankName: editUser.bankName ?? '',
        status: editUser.status,
      })
    } else {
      setForm(EMPTY)
    }
    setErrors({})
  }, [isOpen, editUser])

  const set = (field: keyof FormState, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!isEdit) {
      if (!form.username.trim()) e.username = 'Vui lòng nhập username'
      else if (form.username.length < 3) e.username = 'Username tối thiểu 3 ký tự'
      else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Chỉ chứa chữ, số và dấu _'
      if (!form.password.trim()) e.password = 'Vui lòng nhập mật khẩu'
      else if (form.password.length < 6) e.password = 'Mật khẩu tối thiểu 6 ký tự'
    } else {
      if (form.password && form.password.length < 6)
        e.password = 'Mật khẩu mới tối thiểu 6 ký tự'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    if (isEdit) {
      const dto: UpdateUserDto = {
        lastLoginIp: form.lastLoginIp,
        bankAccountName: form.bankAccountName,
        bankAccountNumber: form.bankAccountNumber,
        bankName: form.bankName,
        status: form.status,
        ...(form.password ? { password: form.password } : {}),
      }
      await onSubmit(dto)
    } else {
      const dto: CreateUserDto = {
        username: form.username,
        password: form.password,
        registerIp: form.registerIp || '0.0.0.0',
        lastLoginIp: form.lastLoginIp || '0.0.0.0',
        bankAccountName: form.bankAccountName,
        bankAccountNumber: form.bankAccountNumber,
        bankName: form.bankName,
        name: form.bankAccountName || form.username,
        email: `${form.username}@example.com`,
        role: 'client',
      }
      await onSubmit(dto)
    }
  }

  if (!isOpen) return null

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <div className={`w-9 h-9 flex items-center justify-center flex-shrink-0 ${
            isEdit
              ? 'rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold'
              : 'rounded-xl bg-indigo-600/20 text-xl'
          }`}>
            {isEdit ? editUser!.username[0].toUpperCase() : '👤'}
          </div>
          <div>
            <h2 className="text-white font-semibold">
              {isEdit ? 'Chỉnh sửa User' : 'Thêm User mới'}
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">
              {isEdit ? `@${editUser!.username}` : 'Điền thông tin bên dưới'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-gray-300 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto px-6 py-5 space-y-5">

            {/* ── Thông tin tài khoản ── */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Thông tin tài khoản
              </p>
              <div className="grid grid-cols-2 gap-3">
                {isEdit ? (
                  <Field label="Username" value={editUser!.username} readOnly />
                ) : (
                  <Field
                    label="Username"
                    value={form.username}
                    onChange={v => set('username', v)}
                    placeholder="user_abc"
                    error={errors.username}
                    required
                  />
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    {isEdit ? 'Mật khẩu mới' : 'Mật khẩu'}{' '}
                    {!isEdit && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder={isEdit ? 'Để trống = không đổi' : 'Tối thiểu 6 ký tự'}
                    className={`w-full px-3 py-2 rounded-xl text-sm bg-gray-800 border transition-colors focus:outline-none focus:ring-2 placeholder-gray-600 text-gray-200 ${
                      errors.password
                        ? 'border-red-500 focus:ring-red-500/30'
                        : 'border-gray-700 focus:ring-indigo-500/30 focus:border-indigo-500'
                    }`}
                  />
                  {errors.password && <p className="mt-1 text-xs text-red-400">⚠ {errors.password}</p>}
                </div>
              </div>
            </div>

            {/* ── Thông tin hệ thống ── */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Thông tin hệ thống
              </p>
              <div className="grid grid-cols-2 gap-3">
                {isEdit ? (
                  <>
                    <Field label="Ngày đăng ký" value={formatDate(editUser!.createdAt)} readOnly />
                    <Field label="IP đăng ký" value={editUser!.registerIp} readOnly mono />
                  </>
                ) : (
                  <Field
                    label="IP đăng ký"
                    value={form.registerIp}
                    onChange={v => set('registerIp', v)}
                    placeholder="0.0.0.0"
                    mono
                  />
                )}
                <Field
                  label="IP đăng nhập gần nhất"
                  value={form.lastLoginIp}
                  onChange={v => set('lastLoginIp', v)}
                  placeholder="0.0.0.0"
                  mono
                />
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Trạng thái</label>
                  <select
                    value={form.status}
                    onChange={e => set('status', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  >
                    <option value="active">● Hoạt động</option>
                    <option value="inactive">○ Không hoạt động</option>
                    <option value="banned">✕ Bị khóa</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── Thông tin ngân hàng ── */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Thông tin ngân hàng
              </p>
              <div className="space-y-3">
                <Field
                  label="Họ và tên chủ tài khoản"
                  value={form.bankAccountName}
                  onChange={v => set('bankAccountName', v)}
                  placeholder="Nguyễn Văn A"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Số tài khoản"
                    value={form.bankAccountNumber}
                    onChange={v => set('bankAccountNumber', v)}
                    placeholder="1234567890"
                    mono
                  />
                  <Field
                    label="Tên ngân hàng"
                    value={form.bankName}
                    onChange={v => set('bankName', v)}
                    placeholder="Vietcombank"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-800 flex-shrink-0">
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
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang lưu...</>
                : isEdit ? '💾 Cập nhật' : '+ Tạo User'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserFormModal