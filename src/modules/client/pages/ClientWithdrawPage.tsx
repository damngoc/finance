import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@/shared/hooks/useAuth'
import { clientBankLinkService, BankLinkInfo } from '../services/clientBankLinkService'
import { clientWithdrawService } from '../services/clientWithdrawService'
import { ROUTES } from '@/shared/constants'

const QUICK_AMOUNTS = [100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000]

const fmtVnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

// ─── Bank info card ───────────────────────────────────────────────
const BankCard: React.FC<{ info: BankLinkInfo }> = ({ info }) => (
  <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl overflow-hidden">
    <div className="px-4 py-3 bg-violet-600 flex items-center gap-2">
      <span className="text-white text-base">🏦</span>
      <span className="text-white font-semibold text-sm">{info.bankName}</span>
      <span className="ml-auto text-violet-200 text-xs bg-violet-700/50 px-2 py-0.5 rounded-full">Tài khoản nhận</span>
    </div>
    <div className="divide-y divide-violet-100">
      {[
        { label: 'Ngân hàng', value: info.bankName },
        { label: 'Tên chủ tài khoản', value: info.bankAccountName },
        { label: 'Số tài khoản', value: info.bankAccountNumber, mono: true },
      ].map(row => (
        <div key={row.label} className="px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs text-slate-500">{row.label}</span>
          <span className={`text-sm font-semibold text-slate-800 ${row.mono ? 'font-mono tracking-wider' : ''}`}>{row.value}</span>
        </div>
      ))}
    </div>
  </div>
)

// ─── Not linked screen ────────────────────────────────────────────
const NotLinkedScreen: React.FC = () => {
  const navigate = useNavigate()
  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors text-sm flex-shrink-0">←</button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">💸 Rút tiền</h1>
          <p className="text-slate-500 text-xs mt-0.5">Rút tiền về tài khoản ngân hàng</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-5">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-4xl">🏦</div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">Chưa liên kết ngân hàng</h2>
          <p className="text-slate-500 text-sm leading-relaxed">Bạn cần liên kết tài khoản ngân hàng trước khi thực hiện rút tiền.</p>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors">Quay lại</button>
          <button onClick={() => navigate(ROUTES.CLIENT.BANK_LINK)} className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-violet-200">
            🔗 Liên kết ngay →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Success screen ───────────────────────────────────────────────
const SuccessScreen: React.FC<{ amount: number; onDone: () => void }> = ({ amount, onDone }) => (
  <div className="max-w-lg mx-auto">
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-5">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-4xl animate-bounce">✅</div>
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">Yêu cầu đã gửi!</h2>
        <p className="text-slate-500 text-sm">Yêu cầu rút</p>
        <p className="text-3xl font-bold text-violet-600 my-2">{fmtVnd(amount)}</p>
        <p className="text-slate-500 text-sm">đang được xử lý. Thời gian dự kiến <strong className="text-slate-700">5–30 phút</strong>.</p>
      </div>
      <div className="px-4 py-3 bg-slate-50 rounded-xl text-left space-y-1.5 border border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">!</span>
          Trạng thái: <span className="text-amber-600 font-semibold">Đang xử lý</span>
        </div>
        <p className="text-xs text-slate-400 pl-6">Admin sẽ duyệt và tiền về tài khoản của bạn</p>
      </div>
      <button onClick={onDone} className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-violet-200">
        📋 Xem lịch sử giao dịch
      </button>
    </div>
  </div>
)

// ─── Main page ────────────────────────────────────────────────────
const ClientWithdrawPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loadingInit, setLoadingInit] = useState(true)
  const [bankInfo, setBankInfo] = useState<BankLinkInfo | null>(null)
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState('')
  const [amountError, setAmountError] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    setLoadingInit(true)
    Promise.all([
      clientBankLinkService.getMyBankInfo(user.id),
      clientWithdrawService.getBalance(user.id),
    ])
      .then(([info, bal]) => {
        setBankInfo(info.bankName && info.bankAccountNumber ? info : null)
        setBalance(bal)
      })
      .catch(() => toast.error('Không thể tải thông tin'))
      .finally(() => setLoadingInit(false))
  }, [user])

  const numAmount = parseFloat(amount) || 0

  const validate = (): boolean => {
    if (!amount || numAmount <= 0) { setAmountError('Vui lòng nhập số tiền cần rút'); return false }
    if (numAmount < 50_000) { setAmountError('Số tiền rút tối thiểu là 50.000đ'); return false }
    if (numAmount > balance) { setAmountError(`Số dư không đủ (tối đa ${fmtVnd(balance)})`); return false }
    setAmountError(''); return true
  }

  const handleCancel = () => { setAmount(''); setAmountError(''); toast('Đã hủy', { icon: '↩️' }) }

  const handleWithdraw = async () => {
    if (!validate() || !user) return
    setSaving(true)
    try {
      await clientWithdrawService.createWithdraw(user.id, user.name || user.email, { amount: numAmount })
      setSuccess(numAmount)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Rút tiền thất bại')
    } finally {
      setSaving(false)
    }
  }

  if (loadingInit) {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <div className="h-10 bg-slate-200 rounded-xl animate-pulse w-40" />
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!bankInfo) return <NotLinkedScreen />
  if (success !== null) return <SuccessScreen amount={success} onDone={() => navigate(ROUTES.CLIENT.TRANSACTIONS)} />

  const remaining = balance - numAmount
  const percent = balance > 0 ? Math.min(100, (numAmount / balance) * 100) : 0

  return (
    <div className="max-w-lg mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors text-sm flex-shrink-0">←</button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">💸 Rút tiền</h1>
          <p className="text-slate-500 text-xs mt-0.5">Rút tiền về tài khoản ngân hàng đã liên kết</p>
        </div>
      </div>

      {/* Balance card */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-5 shadow-lg shadow-violet-200">
        <p className="text-violet-200 text-xs font-medium uppercase tracking-wider mb-1">Số dư khả dụng</p>
        <p className="text-white text-3xl font-bold">{fmtVnd(balance)}</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-violet-800/60 rounded-full overflow-hidden">
            <div className="h-full bg-white/70 rounded-full transition-all duration-500" style={{ width: `${100 - percent}%` }} />
          </div>
          <span className="text-violet-200 text-xs flex-shrink-0">
            {numAmount > 0 ? `còn ${fmtVnd(Math.max(0, remaining))}` : 'Khả dụng 100%'}
          </span>
        </div>
      </div>

      {/* Bank card */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tài khoản nhận tiền</p>
          <button onClick={() => navigate(ROUTES.CLIENT.BANK_LINK)} className="text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors">✏️ Thay đổi</button>
        </div>
        <BankCard info={bankInfo} />
      </div>

      {/* Amount form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nhập số tiền rút</p>
        </div>
        <div className="p-5 space-y-4">

          <div>
            <div className="relative">
              <input
                type="number" value={amount} onChange={e => { setAmount(e.target.value); setAmountError('') }}
                placeholder="VD: 500000" min={50000} max={balance}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-800 text-base font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all pr-16 ${
                  amountError ? 'border-red-400 focus:ring-red-400/30' : 'border-slate-200 focus:ring-violet-400/30 focus:border-violet-400'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">VNĐ</span>
            </div>
            {amountError && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>⚠</span> {amountError}</p>}
            <button type="button" onClick={() => { setAmount(String(balance)); setAmountError('') }}
              className="mt-1.5 text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors">
              Rút tối đa ({fmtVnd(balance)})
            </button>
          </div>

          {/* Quick amounts */}
          <div>
            <p className="text-xs text-slate-400 mb-2">Chọn nhanh</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.filter(n => n <= balance).map(n => (
                <button key={n} type="button" onClick={() => { setAmount(String(n)); setAmountError('') }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                    amount === String(n) ? 'bg-violet-600 text-white border-violet-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-700'
                  }`}>
                  {new Intl.NumberFormat('vi-VN').format(n)}đ
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          {numAmount > 0 && numAmount <= balance && (
            <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Số tiền rút</span>
                <span className="font-bold text-slate-800">{fmtVnd(numAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số dư sau rút</span>
                <span className={`font-semibold ${remaining >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmtVnd(Math.max(0, remaining))}</span>
              </div>
              <div className="border-t border-slate-200 pt-1.5 flex justify-between">
                <span className="text-slate-500">Thời gian xử lý</span>
                <span className="text-slate-700 font-medium">5–30 phút</span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={handleCancel} disabled={saving || !amount}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Hủy
            </button>
            <button type="button" onClick={handleWithdraw} disabled={saving || !amount || numAmount <= 0}
              className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-violet-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {saving
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang xử lý...</>
                : '💸 Rút tiền'
              }
            </button>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="flex gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
        <span className="text-amber-500 text-sm flex-shrink-0 mt-0.5">⚠️</span>
        <p className="text-xs text-amber-700 leading-relaxed">
          Yêu cầu rút tiền sẽ được admin <strong>duyệt thủ công</strong>. Tiền sẽ chuyển về đúng tài khoản ngân hàng đã liên kết.
        </p>
      </div>
    </div>
  )
}

export default ClientWithdrawPage