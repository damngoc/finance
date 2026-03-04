import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@/shared/hooks/useAuth'
import { clientBankLinkService, BankLinkInfo } from '../services/clientBankLinkService'

const POPULAR_BANKS = [
  'Vietcombank', 'Techcombank', 'BIDV', 'VPBank', 'MB Bank',
  'ACB', 'Sacombank', 'VietinBank', 'HDBank', 'TPBank',
  'MSB', 'OCB', 'SeABank', 'Agribank', 'SHB',
]

const Field: React.FC<{ label: string; icon: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }> = ({ label, icon, required, error, hint, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
      <span>{icon}</span>{label}
      {required && <span className="text-red-400 text-xs">*</span>}
    </label>
    {children}
    {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span>⚠</span> {error}</p>}
  </div>
)

const ClientBankLinkPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<BankLinkInfo>({ bankName: '', bankAccountName: '', bankAccountNumber: '' })
  const [original, setOriginal] = useState<BankLinkInfo | null>(null)
  const [errors, setErrors] = useState<Partial<BankLinkInfo>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showBankList, setShowBankList] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    clientBankLinkService.getMyBankInfo(user.id)
      .then(info => { setForm(info); setOriginal(info) })
      .catch(() => toast.error('Không thể tải thông tin ngân hàng'))
      .finally(() => setLoading(false))
  }, [user])

  const set = (field: keyof BankLinkInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(err => ({ ...err, [field]: undefined }))
  }

  const hasChanges = original
    ? form.bankName !== original.bankName ||
      form.bankAccountName !== original.bankAccountName ||
      form.bankAccountNumber !== original.bankAccountNumber
    : false

  const validate = (): boolean => {
    const e: Partial<BankLinkInfo> = {}
    if (!form.bankName.trim()) e.bankName = 'Vui lòng nhập tên ngân hàng'
    if (!form.bankAccountName.trim()) e.bankAccountName = 'Vui lòng nhập tên chủ tài khoản'
    else if (form.bankAccountName.trim().length < 3) e.bankAccountName = 'Tên chủ tài khoản quá ngắn'
    if (!form.bankAccountNumber.trim()) e.bankAccountNumber = 'Vui lòng nhập số tài khoản'
    else if (!/^\d{6,20}$/.test(form.bankAccountNumber.replace(/\s/g, '')))
      e.bankAccountNumber = 'Số tài khoản phải có 6–20 chữ số'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCancel = () => {
    if (original) setForm(original)
    setErrors({})
    toast('Đã hủy thay đổi', { icon: '↩️' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !user) return
    setSaving(true)
    try {
      const updated: BankLinkInfo = {
        bankName: form.bankName.trim(),
        bankAccountName: form.bankAccountName.trim().toUpperCase(),
        bankAccountNumber: form.bankAccountNumber.trim(),
      }
      await clientBankLinkService.updateMyBankInfo(user.id, updated)
      setForm(updated)
      setOriginal(updated)
      toast.success('✅ Đã cập nhật thông tin ngân hàng!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <div className="h-10 bg-slate-200 rounded-xl animate-pulse w-48" />
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-slate-200 rounded animate-pulse w-32" />
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const isLinked = !!(original?.bankName && original?.bankAccountNumber)

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors text-sm flex-shrink-0">←</button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">🏦 Liên kết ngân hàng</h1>
          <p className="text-slate-500 text-xs mt-0.5">Cập nhật tài khoản ngân hàng để rút tiền</p>
        </div>
      </div>

      {/* Status banner */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${isLinked ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
        <span className="text-xl flex-shrink-0">{isLinked ? '✅' : '⚠️'}</span>
        <div>
          <p className={`text-sm font-semibold ${isLinked ? 'text-emerald-700' : 'text-amber-700'}`}>
            {isLinked ? 'Đã liên kết ngân hàng' : 'Chưa liên kết ngân hàng'}
          </p>
          <p className={`text-xs mt-0.5 ${isLinked ? 'text-emerald-600' : 'text-amber-600'}`}>
            {isLinked ? `${original!.bankName} • ${original!.bankAccountNumber}` : 'Vui lòng liên kết để có thể rút tiền'}
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-base flex-shrink-0">🏦</div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Thông tin tài khoản</h2>
            <p className="text-xs text-slate-400 mt-0.5">Tất cả các trường đều bắt buộc</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4" noValidate>

          {/* Tên ngân hàng */}
          <Field label="Tên ngân hàng" icon="🏛️" required error={errors.bankName}>
            <div className="relative">
              <input
                type="text" value={form.bankName} onChange={set('bankName')}
                onFocus={() => setShowBankList(true)}
                onBlur={() => setTimeout(() => setShowBankList(false), 150)}
                placeholder="VD: Vietcombank" autoComplete="off"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.bankName ? 'border-red-400 focus:ring-red-400/30' : 'border-slate-200 focus:ring-violet-400/30 focus:border-violet-400'
                }`}
              />
              {showBankList && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                  {POPULAR_BANKS.filter(b => b.toLowerCase().includes(form.bankName.toLowerCase())).map(bank => (
                    <button key={bank} type="button"
                      onMouseDown={() => { setForm(f => ({ ...f, bankName: bank })); setErrors(err => ({ ...err, bankName: undefined })); setShowBankList(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >🏛️ {bank}</button>
                  ))}
                  {POPULAR_BANKS.filter(b => b.toLowerCase().includes(form.bankName.toLowerCase())).length === 0 && (
                    <p className="px-4 py-3 text-sm text-slate-400 text-center">Không tìm thấy ngân hàng</p>
                  )}
                </div>
              )}
            </div>
          </Field>

          {/* Tên chủ tài khoản */}
          <Field label="Tên chủ tài khoản" icon="👤" required error={errors.bankAccountName} hint="Nhập đúng tên như trên thẻ ngân hàng (IN HOA)">
            <input
              type="text" value={form.bankAccountName}
              onChange={e => { setForm(f => ({ ...f, bankAccountName: e.target.value.toUpperCase() })); setErrors(err => ({ ...err, bankAccountName: undefined })) }}
              placeholder="VD: NGUYEN VAN AN"
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all font-medium tracking-wide ${
                errors.bankAccountName ? 'border-red-400 focus:ring-red-400/30' : 'border-slate-200 focus:ring-violet-400/30 focus:border-violet-400'
              }`}
            />
          </Field>

          {/* Số tài khoản */}
          <Field label="Số tài khoản" icon="💳" required error={errors.bankAccountNumber} hint="Nhập đúng số tài khoản, không nhập số thẻ">
            <input
              type="text" inputMode="numeric" value={form.bankAccountNumber} maxLength={20}
              onChange={e => { const v = e.target.value.replace(/\D/g, ''); setForm(f => ({ ...f, bankAccountNumber: v })); setErrors(err => ({ ...err, bankAccountNumber: undefined })) }}
              placeholder="VD: 1234567890"
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all font-mono tracking-widest ${
                errors.bankAccountNumber ? 'border-red-400 focus:ring-red-400/30' : 'border-slate-200 focus:ring-violet-400/30 focus:border-violet-400'
              }`}
            />
          </Field>

          {/* Preview */}
          {form.bankName && form.bankAccountName && form.bankAccountNumber && (
            <div className="p-4 bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-xl">
              <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-2">Xem trước</p>
              <div className="space-y-1.5">
                {[
                  { label: 'Ngân hàng', value: form.bankName },
                  { label: 'Chủ TK',   value: form.bankAccountName },
                  { label: 'Số TK',    value: form.bankAccountNumber, mono: true },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{row.label}</span>
                    <span className={`text-xs font-semibold text-slate-800 ${row.mono ? 'font-mono tracking-wider' : ''}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={handleCancel} disabled={saving || !hasChanges}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Hủy
            </button>
            <button type="submit" disabled={saving || !hasChanges}
              className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-violet-200 flex items-center justify-center gap-2">
              {saving
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang lưu...</>
                : '💾 Cập nhật'
              }
            </button>
          </div>

          {!hasChanges && original && (
            <p className="text-center text-xs text-slate-400">Chỉnh sửa thông tin để kích hoạt nút Cập nhật</p>
          )}
        </form>
      </div>

      {/* Info note */}
      <div className="flex gap-2.5 px-4 py-3 bg-blue-50 border border-blue-200 rounded-2xl">
        <span className="text-blue-500 text-sm flex-shrink-0 mt-0.5">ℹ️</span>
        <p className="text-xs text-blue-700 leading-relaxed">
          Thông tin ngân hàng được dùng để <strong>xác nhận rút tiền</strong>. Đảm bảo thông tin chính xác để tránh mất tiền khi rút.
        </p>
      </div>
    </div>
  )
}

export default ClientBankLinkPage