import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'

interface RegisterForm {
  username: string
  password: string
  confirmPassword: string
  phone: string
  referralCode: string
}

interface FormErrors {
  username?: string
  password?: string
  confirmPassword?: string
  phone?: string
  referralCode?: string
}

const EyeIcon: React.FC<{ open: boolean }> = ({ open }) =>
  open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )

const Field: React.FC<{ label: string; icon: string; error?: string; children: React.ReactNode }> = ({ label, icon, error, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-1.5">
      <span>{icon}</span>{label}<span className="text-red-400 text-xs ml-0.5">*</span>
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><span>⚠</span> {error}</p>}
  </div>
)

const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  if (!password) return null
  const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)]
  const score = checks.filter(Boolean).length
  const labels = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh']
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500']
  const textColors = ['', 'text-red-400', 'text-orange-400', 'text-yellow-400', 'text-emerald-400']
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-slate-700'}`} />
        ))}
      </div>
      <p className={`text-xs ${textColors[score]}`}>Độ mạnh: {labels[score]}</p>
    </div>
  )
}

const ClientRegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterForm>({ username: '', password: '', confirmPassword: '', phone: '', referralCode: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (field: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(err => ({ ...err, [field]: undefined }))
  }

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!form.username.trim()) e.username = 'Vui lòng nhập tên đăng nhập'
    else if (form.username.length < 4) e.username = 'Tên đăng nhập phải có ít nhất 4 ký tự'
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Chỉ được dùng chữ cái, số và dấu gạch dưới'

    if (!form.password) e.password = 'Vui lòng nhập mật khẩu'
    else if (form.password.length < 6) e.password = 'Mật khẩu phải có ít nhất 6 ký tự'

    if (!form.confirmPassword) e.confirmPassword = 'Vui lòng nhập lại mật khẩu'
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Mật khẩu nhập lại không khớp'

    if (!form.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại'
    else if (!/^(0|\+84)[0-9]{9}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Số điện thoại không hợp lệ (VD: 0912345678)'

    if (!form.referralCode.trim()) e.referralCode = 'Vui lòng nhập mã giới thiệu'
    else if (form.referralCode.trim().length < 4) e.referralCode = 'Mã giới thiệu không hợp lệ'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      // TODO: await authService.register({ ...form })
      await new Promise(r => setTimeout(r, 1200))
      setSuccess(true)
    } catch (err) {
      setErrors({ username: err instanceof Error ? err.message : 'Đăng ký thất bại, thử lại sau' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-900/20 rounded-full blur-3xl" />
        </div>
        <div className="relative w-full max-w-sm text-center">
          <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
            <h2 className="text-xl font-bold text-white mb-2">Đăng ký thành công!</h2>
            <p className="text-slate-400 text-sm mb-6">
              Tài khoản <span className="text-violet-400 font-medium">@{form.username}</span> đã được tạo.<br />
              Vui lòng đăng nhập để bắt đầu.
            </p>
            <button
              onClick={() => navigate(ROUTES.CLIENT.LOGIN)}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-900/40"
            >
              Đăng nhập ngay →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-900/50">
            <span className="text-white text-2xl">✦</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Tạo tài khoản</h1>
          <p className="text-slate-400 text-sm mt-1">Điền đầy đủ thông tin để đăng ký</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Tên đăng nhập */}
            <Field label="Tên đăng nhập" icon="👤" error={errors.username}>
              <input
                type="text" value={form.username} onChange={set('username')}
                placeholder="VD: nguyen_van_a" autoComplete="username"
                className={`w-full px-4 py-2.5 bg-slate-800 border rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.username ? 'border-red-500/70 focus:ring-red-500/30' : 'border-slate-600 focus:ring-violet-500/40 focus:border-violet-500'
                }`}
              />
            </Field>

            {/* Mật khẩu */}
            <Field label="Mật khẩu" icon="🔒" error={errors.password}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="Ít nhất 6 ký tự" autoComplete="new-password"
                  className={`w-full px-4 py-2.5 pr-11 bg-slate-800 border rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.password ? 'border-red-500/70 focus:ring-red-500/30' : 'border-slate-600 focus:ring-violet-500/40 focus:border-violet-500'
                  }`}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </Field>

            {/* Nhập lại mật khẩu */}
            <Field label="Nhập lại mật khẩu" icon="🔐" error={errors.confirmPassword}>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')}
                  placeholder="Nhập lại mật khẩu" autoComplete="new-password"
                  className={`w-full px-4 py-2.5 pr-11 bg-slate-800 border rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.confirmPassword ? 'border-red-500/70 focus:ring-red-500/30'
                    : form.confirmPassword && form.password === form.confirmPassword ? 'border-emerald-500/60 focus:ring-emerald-500/30'
                    : 'border-slate-600 focus:ring-violet-500/40 focus:border-violet-500'
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
                  <EyeIcon open={showConfirm} />
                </button>
                {form.confirmPassword && (
                  <span className={`absolute right-10 top-1/2 -translate-y-1/2 text-xs ${form.password === form.confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                    {form.password === form.confirmPassword ? '✓' : '✗'}
                  </span>
                )}
              </div>
            </Field>

            {/* Số điện thoại */}
            <Field label="Số điện thoại" icon="📱" error={errors.phone}>
              <input
                type="tel" value={form.phone} onChange={set('phone')}
                placeholder="VD: 0912345678" autoComplete="tel"
                className={`w-full px-4 py-2.5 bg-slate-800 border rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.phone ? 'border-red-500/70 focus:ring-red-500/30' : 'border-slate-600 focus:ring-violet-500/40 focus:border-violet-500'
                }`}
              />
            </Field>

            {/* Mã giới thiệu */}
            <Field label="Mã giới thiệu" icon="🎁" error={errors.referralCode}>
              <input
                type="text" value={form.referralCode} maxLength={12}
                onChange={e => { setForm(f => ({ ...f, referralCode: e.target.value.toUpperCase() })); setErrors(err => ({ ...err, referralCode: undefined })) }}
                placeholder="VD: ABC12345"
                className={`w-full px-4 py-2.5 bg-slate-800 border rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 transition-all font-mono tracking-widest ${
                  errors.referralCode ? 'border-red-500/70 focus:ring-red-500/30' : 'border-slate-600 focus:ring-violet-500/40 focus:border-violet-500'
                }`}
              />
              <p className="mt-1 text-xs text-slate-600">Nhập mã được cung cấp bởi người giới thiệu</p>
            </Field>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-violet-800 disabled:to-indigo-800 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-900/40 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang đăng ký...</>
                : 'Đăng ký ngay →'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-5">
          Đã có tài khoản?{' '}
          <Link to={ROUTES.CLIENT.LOGIN} className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ClientRegisterPage