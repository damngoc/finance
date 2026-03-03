import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ROUTES } from '@/shared/constants'

type Currency = 'VND' | 'USDT'
type UsdtNetwork = 'TRC20' | 'ERC20' | 'BEP20'

interface VndBankAccount {
  bankName: string
  accountName: string
  accountNumber: string
  qrCode?: string
}

interface UsdtWallet {
  network: UsdtNetwork
  address: string
  note?: string
}

const VND_ACCOUNTS: VndBankAccount[] = [
  {
    bankName: 'Vietcombank',
    accountName: 'NGUYEN VAN ADMIN',
    accountNumber: '1234567890',
    qrCode: 'https://img.vietqr.io/image/VCB-1234567890-compact2.png?amount=0&addInfo=NAP TIEN&accountName=NGUYEN VAN ADMIN',
  },
  {
    bankName: 'Techcombank',
    accountName: 'NGUYEN VAN ADMIN',
    accountNumber: '9876543210',
  },
]

const USDT_WALLETS: UsdtWallet[] = [
  { network: 'TRC20', address: 'TXyz1234567890ABCDefghijklmnopqrstu', note: 'Chỉ gửi USDT trên mạng TRON (TRC20)' },
  { network: 'ERC20', address: '0xAbCd1234567890EfGhIjKlMnOpQrStUvWxYz1234', note: 'Chỉ gửi USDT trên mạng Ethereum (ERC20)' },
  { network: 'BEP20', address: '0xBnb9876543210ABCDefghijklmnopqrstuvwxyz', note: 'Chỉ gửi USDT trên mạng BNB Smart Chain (BEP20)' },
]

const networkConfig: Record<UsdtNetwork, { color: string; bg: string; border: string; icon: string }> = {
  TRC20: { color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    icon: '🔴' },
  ERC20: { color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   icon: '🔵' },
  BEP20: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: '🟡' },
}

// ─── Copy button ──────────────────────────────────────────────────
const CopyButton: React.FC<{ text: string; label?: string }> = ({ text, label = 'Sao chép' }) => {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(text) } catch {
      const el = document.createElement('textarea')
      el.value = text; document.body.appendChild(el); el.select()
      document.execCommand('copy'); document.body.removeChild(el)
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
      copied ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600'
    }`}>
      {copied ? '✓ Đã sao chép' : `📋 ${label}`}
    </button>
  )
}

// ─── VND section ──────────────────────────────────────────────────
const VndSection: React.FC = () => {
  const [selected, setSelected] = useState(0)
  const account = VND_ACCOUNTS[selected]
  return (
    <div className="space-y-4">
      {VND_ACCOUNTS.length > 1 && (
        <div>
          <p className="text-xs font-medium text-slate-400 mb-2">Chọn ngân hàng</p>
          <div className="flex flex-wrap gap-2">
            {VND_ACCOUNTS.map((acc, i) => (
              <button key={i} onClick={() => setSelected(i)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                  selected === i ? 'bg-violet-600 text-white border-violet-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-500'
                }`}>{acc.bankName}</button>
            ))}
          </div>
        </div>
      )}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex items-center gap-2">
          <span className="text-lg">🏦</span>
          <span className="text-white font-semibold text-sm">{account.bankName}</span>
        </div>
        <div className="divide-y divide-slate-700/60">
          {[
            { label: 'Tên ngân hàng',     value: account.bankName },
            { label: 'Tên chủ tài khoản', value: account.accountName },
            { label: 'Số tài khoản',      value: account.accountNumber, mono: true, copyable: true },
          ].map(({ label, value, mono, copyable }) => (
            <div key={label} className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-white-500 mb-0.5">{label}</p>
                <p className={`text-white text-sm font-medium ${mono ? 'font-mono tracking-wider' : ''}`}>{value}</p>
              </div>
              {copyable && <CopyButton text={value} />}
            </div>
          ))}
        </div>
        {account.qrCode && (
          <div className="px-4 py-4 border-t border-slate-700 text-center">
            <p className="text-xs text-white-500 mb-3">QR Code chuyển khoản</p>
            <div className="inline-block p-2 bg-white rounded-xl">
              <img src={account.qrCode} alt="QR Code"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                className="w-40 h-40 object-contain" />
            </div>
            <p className="text-xs text-white-600 mt-2">Quét mã để chuyển khoản nhanh</p>
          </div>
        )}
      </div>
      <div className="flex gap-2.5 px-3.5 py-3 bg-amber-500/8 border border-amber-500/25 rounded-xl">
        <span className="text-amber-400 text-sm flex-shrink-0 mt-0.5">⚠️</span>
        <p className="text-xs text-amber-300/80 leading-relaxed">
          Vui lòng chuyển khoản đúng <strong className="text-amber-300">số tài khoản</strong> và <strong className="text-amber-300">tên ngân hàng</strong>. Ghi chú nội dung là <strong className="text-amber-300">tên đăng nhập</strong> của bạn.
        </p>
      </div>
    </div>
  )
}

// ─── USDT section ─────────────────────────────────────────────────
const UsdtSection: React.FC = () => {
  const [selected, setSelected] = useState<UsdtNetwork>('TRC20')
  const wallet = USDT_WALLETS.find(w => w.network === selected)!
  const cfg = networkConfig[selected]
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-slate-400 mb-2">Chọn mạng lưới</p>
        <div className="grid grid-cols-3 gap-2">
          {USDT_WALLETS.map(w => {
            const c = networkConfig[w.network]
            const active = selected === w.network
            return (
              <button key={w.network} onClick={() => setSelected(w.network)}
                className={`py-2.5 rounded-xl text-xs font-semibold transition-all border flex flex-col items-center gap-1 ${
                  active ? `${c.bg} ${c.color} ${c.border} shadow-sm` : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300 hover:border-slate-600'
                }`}>
                <span className="text-base">{c.icon}</span>{w.network}
              </button>
            )
          })}
        </div>
      </div>
      <div className={`bg-slate-800/60 border rounded-2xl overflow-hidden ${cfg.border}`}>
        <div className={`px-4 py-3 ${cfg.bg} border-b ${cfg.border} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span>{cfg.icon}</span>
            <span className={`font-semibold text-sm ${cfg.color}`}>USDT — {selected}</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>{selected}</span>
        </div>
        <div className="px-4 py-4">
          <p className="text-xs text-slate-500 mb-2">Địa chỉ ví nhận tiền</p>
          <div className={`p-3 bg-slate-900 border ${cfg.border} rounded-xl`}>
            <p className="font-mono text-xs text-white break-all leading-relaxed tracking-wide">{wallet.address}</p>
          </div>
          <div className="flex gap-2 mt-2.5">
            <CopyButton text={wallet.address} label="Sao chép địa chỉ" />
          </div>
        </div>
        {wallet.note && (
          <div className={`px-4 py-3 border-t ${cfg.border} ${cfg.bg}`}>
            <p className={`text-xs ${cfg.color} flex items-start gap-1.5`}>
              <span className="flex-shrink-0 mt-0.5">ℹ️</span>{wallet.note}
            </p>
          </div>
        )}
      </div>
      <div className="flex gap-2.5 px-3.5 py-3 bg-red-500/8 border border-red-500/25 rounded-xl">
        <span className="text-red-400 text-sm flex-shrink-0 mt-0.5">🚨</span>
        <p className="text-xs text-red-300/80 leading-relaxed">
          <strong className="text-red-300">Chỉ gửi USDT</strong> đúng mạng <strong className="text-red-300">{selected}</strong>. Gửi sai mạng sẽ mất tiền vĩnh viễn và không thể hoàn lại.
        </p>
      </div>
    </div>
  )
}

// ─── Amount input ─────────────────────────────────────────────────
const AmountInput: React.FC<{ currency: Currency; value: string; onChange: (v: string) => void; error?: string }> = ({ currency, value, onChange, error }) => {
  const quickAmounts = currency === 'VND'
    ? [100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000]
    : [10, 20, 50, 100, 200, 500]
  const fmt = (n: number) => currency === 'VND' ? new Intl.NumberFormat('vi-VN').format(n) + 'đ' : n + ' USDT'
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">
        Số tiền nạp <span className="text-red-400">*</span>
      </label>
      <div className="relative">
        <input type="number" value={value} onChange={e => onChange(e.target.value)}
          placeholder={currency === 'VND' ? 'VD: 500000' : 'VD: 100'}
          className={`w-full px-4 py-2.5 bg-slate-800 border rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 transition-all pr-16 ${
            error ? 'border-red-500/70 focus:ring-red-500/30' : 'border-slate-600 focus:ring-violet-500/40 focus:border-violet-500'
          }`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">{currency}</span>
      </div>
      {error && <p className="mt-1 text-xs text-red-400">⚠ {error}</p>}
      <div className="flex flex-wrap gap-1.5 mt-2">
        {quickAmounts.map(n => (
          <button key={n} type="button" onClick={() => onChange(String(n))}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
              value === String(n) ? 'bg-violet-600 text-white border-violet-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-500'
            }`}>{fmt(n)}</button>
        ))}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────
const ClientDepositPage: React.FC = () => {
  const navigate = useNavigate()
  const [currency, setCurrency] = useState<Currency>('VND')
  const [amount, setAmount] = useState('')
  const [amountError, setAmountError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const num = parseFloat(amount)
    if (!amount || isNaN(num) || num <= 0) { setAmountError('Vui lòng nhập số tiền hợp lệ'); return false }
    if (currency === 'VND' && num < 50_000) { setAmountError('Số tiền tối thiểu là 50.000đ'); return false }
    if (currency === 'USDT' && num < 5) { setAmountError('Số tiền tối thiểu là 5 USDT'); return false }
    setAmountError(''); return true
  }

  const handleDeposit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      // TODO: await clientDepositService.createRequest({ currency, amount: parseFloat(amount) })
      await new Promise(r => setTimeout(r, 1200))
      toast.success('🎉 Yêu cầu nạp tiền đã được ghi nhận! Chúng tôi sẽ xác nhận sớm nhất.')
      setTimeout(() => navigate(ROUTES.CLIENT.TRANSACTIONS), 800)
    } catch {
      toast.error('Không thể gửi yêu cầu, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  const fmtAmount = () => {
    const num = parseFloat(amount)
    if (!num) return ''
    return currency === 'VND'
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(num)
      : `${num} USDT`
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors text-sm flex-shrink-0">←</button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">💰 Nạp tiền</h1>
          <p className="text-slate-500 text-xs mt-0.5">Chọn phương thức và hoàn tất nạp tiền</p>
        </div>
      </div>

      {/* Step 1: Currency */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bước 1 — Chọn loại tiền</p>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          {[
            { id: 'VND' as Currency, flag: '🇻🇳', label: 'VND', sub: 'Tiền Việt Nam', activeColor: 'border-violet-500 bg-violet-50 shadow-violet-100', checkBg: 'bg-violet-500', textColor: 'text-violet-700' },
            { id: 'USDT' as Currency, flag: '💵', label: 'USDT', sub: 'Stablecoin', activeColor: 'border-teal-500 bg-teal-50 shadow-teal-100', checkBg: 'bg-teal-500', textColor: 'text-teal-700' },
          ].map(opt => (
            <button key={opt.id} onClick={() => setCurrency(opt.id)}
              className={`relative py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                currency === opt.id ? `${opt.activeColor} shadow-sm` : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              {currency === opt.id && (
                <span className={`absolute top-2 right-2 w-5 h-5 ${opt.checkBg} rounded-full flex items-center justify-center text-white text-xs`}>✓</span>
              )}
              <span className="text-3xl">{opt.flag}</span>
              <div className="text-center">
                <p className={`font-bold text-sm ${currency === opt.id ? opt.textColor : 'text-slate-700'}`}>{opt.label}</p>
                <p className="text-xs text-slate-500">{opt.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Payment info */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Bước 2 — {currency === 'VND' ? 'Thông tin chuyển khoản' : 'Địa chỉ ví'}
          </p>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${currency === 'VND' ? 'bg-violet-100 text-violet-600' : 'bg-teal-100 text-teal-600'}`}>
            {currency}
          </span>
        </div>
        <div className="p-4">
          {currency === 'VND' ? <VndSection /> : <UsdtSection />}
        </div>
      </div>

      {/* Step 3: Amount */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bước 3 — Nhập số tiền</p>
        </div>
        <div className="p-4">
          <AmountInput currency={currency} value={amount} onChange={v => { setAmount(v); setAmountError('') }} error={amountError} />
        </div>
      </div>

      {/* Submit */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 space-y-3">
          {amount && parseFloat(amount) > 0 && (
            <div className="flex items-center justify-between px-3.5 py-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-sm text-slate-500">Số tiền nạp</span>
              <span className={`text-base font-bold ${currency === 'VND' ? 'text-violet-600' : 'text-teal-600'}`}>{fmtAmount()}</span>
            </div>
          )}
          <button onClick={handleDeposit} disabled={submitting}
            className={`w-full py-3.5 rounded-2xl font-bold text-white text-base transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-60 ${
              currency === 'VND'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-200'
                : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 shadow-teal-200'
            }`}
          >
            {submitting
              ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang xử lý...</>
              : <>💰 NẠP TIỀN {fmtAmount() ? `— ${fmtAmount()}` : ''}</>
            }
          </button>
          <p className="text-center text-xs text-slate-400">
            Yêu cầu sẽ được xử lý trong vòng <strong className="text-slate-600">5–15 phút</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ClientDepositPage