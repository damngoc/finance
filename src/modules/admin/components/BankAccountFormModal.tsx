import React, { useState, useEffect } from 'react'
import {
  BankAccount, BankAccountCurrency, UsdtNetwork, CreateBankAccountDto,
} from '../services/adminBankAccountService'

interface BankAccountFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (dto: CreateBankAccountDto) => Promise<void>
  isLoading?: boolean
  editAccount?: BankAccount | null
}

type FormState = {
  currency: BankAccountCurrency
  accountName: string
  accountNumber: string
  bankName: string
  network: UsdtNetwork | ''
  walletAddress: string
}

const EMPTY: FormState = {
  currency: 'VND', accountName: '', accountNumber: '',
  bankName: '', network: '', walletAddress: '',
}

const BankAccountFormModal: React.FC<BankAccountFormModalProps> = ({
  isOpen, onClose, onSubmit, isLoading, editAccount,
}) => {
  const isEdit = !!editAccount
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  useEffect(() => {
    if (!isOpen) return
    if (editAccount) {
      if (editAccount.currency === 'VND') {
        setForm({ currency: 'VND', accountName: editAccount.accountName, accountNumber: editAccount.accountNumber, bankName: editAccount.bankName, network: '', walletAddress: '' })
      } else {
        setForm({ currency: 'USDT', accountName: editAccount.accountName, accountNumber: '', bankName: '', network: editAccount.network, walletAddress: editAccount.walletAddress })
      }
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
    if (form.currency === 'VND') {
      if (!form.accountName.trim()) e.accountName = 'Vui lòng nhập tên chủ tài khoản'
      if (!form.accountNumber.trim()) e.accountNumber = 'Vui lòng nhập số tài khoản'
      if (!form.bankName.trim()) e.bankName = 'Vui lòng nhập tên ngân hàng'
    } else {
      if (!form.network) e.network = 'Vui lòng chọn mạng'
      if (!form.walletAddress.trim()) e.walletAddress = 'Vui lòng nhập địa chỉ ví'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const dto: CreateBankAccountDto = form.currency === 'VND'
      ? { currency: 'VND', accountName: form.accountName, accountNumber: form.accountNumber, bankName: form.bankName }
      : { currency: 'USDT', network: form.network as UsdtNetwork, walletAddress: form.walletAddress, accountName: form.accountName }
    await onSubmit(dto)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">

        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 flex items-center justify-center text-xl flex-shrink-0">🏦</div>
          <div>
            <h2 className="text-white font-semibold">{isEdit ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản ngân hàng'}</h2>
            <p className="text-gray-500 text-xs mt-0.5">{isEdit ? `Đang sửa: ${editAccount?.accountName}` : 'Điền thông tin bên dưới'}</p>
          </div>
          <button onClick={onClose} className="ml-auto text-gray-500 hover:text-gray-300 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Currency selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Loại giao dịch</label>
            <div className="grid grid-cols-2 gap-2">
              {(['VND', 'USDT'] as BankAccountCurrency[]).map(c => (
                <button key={c} type="button" onClick={() => set('currency', c)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    form.currency === c
                      ? c === 'VND' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                  }`}>
                  {c === 'VND' ? '🏧 VND' : '💎 USDT'}
                </button>
              ))}
            </div>
          </div>

          {/* VND fields */}
          {form.currency === 'VND' && (
            <>
              <Field label="Tên chủ tài khoản" placeholder="Nguyễn Văn A" value={form.accountName} error={errors.accountName} onChange={v => set('accountName', v)} />
              <Field label="Số tài khoản" placeholder="1234567890" value={form.accountNumber} error={errors.accountNumber} onChange={v => set('accountNumber', v)} />
              <Field label="Tên ngân hàng" placeholder="Vietcombank, Techcombank..." value={form.bankName} error={errors.bankName} onChange={v => set('bankName', v)} />
            </>
          )}

          {/* USDT fields */}
          {form.currency === 'USDT' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mạng <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {(['TRC20', 'ERC20'] as UsdtNetwork[]).map(n => (
                    <button key={n} type="button" onClick={() => set('network', n)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        form.network === n
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                      }`}>
                      {n === 'TRC20' ? '⚡ TRC20' : '🔷 ERC20'}
                    </button>
                  ))}
                </div>
                {errors.network && <p className="mt-1.5 text-xs text-red-400">⚠ {errors.network}</p>}
              </div>
              {form.network && (
                <>
                  <Field label={`Địa chỉ ví ${form.network}`} placeholder={form.network === 'TRC20' ? 'TXyz...' : '0x...'} value={form.walletAddress} error={errors.walletAddress} onChange={v => set('walletAddress', v)} mono />
                </>
              )}
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={isLoading}
              className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
              Hủy
            </button>
            <button type="submit" disabled={isLoading || (form.currency === 'USDT' && !form.network)}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isLoading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang lưu...</>
                : isEdit ? '💾 Cập nhật' : '+ Thêm tài khoản'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Field: React.FC<{ label: string; placeholder: string; value: string; error?: string; onChange: (v: string) => void; mono?: boolean }> = ({ label, placeholder, value, error, onChange, mono }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1.5">{label} <span className="text-red-400">*</span></label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className={`w-full px-4 py-2.5 bg-gray-800 border rounded-xl text-sm placeholder-gray-600 focus:outline-none focus:ring-2 transition-colors ${mono ? 'font-mono text-emerald-300' : 'text-gray-200'} ${error ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-700 focus:ring-indigo-500/30 focus:border-indigo-500'}`}
    />
    {error && <p className="mt-1.5 text-xs text-red-400">⚠ {error}</p>}
  </div>
)

export default BankAccountFormModal