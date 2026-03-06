import React, { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { clientSupportService, SupportConfig } from '../services/clientSupportService'
// import { ROUTES } from '@/shared/constants'

// ─── Copy button ──────────────────────────────────────────────────
const CopyBtn: React.FC<{ text: string; label?: string; small?: boolean }> = ({ text, label = 'Sao chép', small }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    toast.success('Đã sao chép!', { duration: 1500 })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 font-medium rounded-xl transition-all flex-shrink-0 ${
        small ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm'
      } ${
        copied
          ? 'bg-emerald-100 text-emerald-600 border border-emerald-300'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
      }`}
    >
      {copied ? '✓ Đã sao chép' : `📋 ${label}`}
    </button>
  )
}

// ─── Pulse indicator ──────────────────────────────────────────────
const OnlinePulse: React.FC = () => (
  <span className="relative flex h-2.5 w-2.5">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
  </span>
)

// ─── Main page ────────────────────────────────────────────────────
const ClientSupportPage: React.FC = () => {
  // const navigate = useNavigate()
  const [config, setConfig] = useState<SupportConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    clientSupportService.getConfig()
      .then(setConfig)
      .catch(() => toast.error('Không thể tải thông tin hỗ trợ'))
      .finally(() => setLoading(false))
  }, [])

  const handleOpenTelegram = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded-xl animate-pulse w-40" />
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!config) return null

  const telegramDisplayLink = config.telegramLink.replace('https://', '')

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">🎧 Hỗ trợ khách hàng</h1>
        <p className="text-slate-500 text-xs mt-0.5">Liên hệ CSKH qua Telegram</p>
      </div>

      {/* Hero card */}
      <div className="relative bg-gradient-to-br from-[#229ED9] to-[#1a7ab5] rounded-2xl p-5 overflow-hidden shadow-lg shadow-blue-200">
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-white/10 rounded-full" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            {/* Telegram icon */}
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-9 h-9 fill-[#229ED9]">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-bold text-lg leading-tight">CSKH MyApp</p>
                <OnlinePulse />
              </div>
              <p className="text-blue-100 text-xs mt-0.5">Hỗ trợ 24/7 qua Telegram</p>
            </div>
          </div>

          {/* Link display */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-blue-100 text-[10px] mb-0.5">Link trực tiếp</p>
              <p className="text-white font-mono text-sm font-semibold truncate">
                {telegramDisplayLink}
              </p>
            </div>
            <CopyBtn text={config.telegramLink} label="Copy" small />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleOpenTelegram(config.telegramLink)}
          className="flex flex-col items-center gap-2 p-4 bg-[#229ED9] hover:bg-[#1a7ab5] text-white rounded-2xl transition-all shadow-md shadow-blue-200 active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          <span className="text-sm font-semibold">Nhắn tin ngay</span>
        </button>

        <button
          onClick={() => { navigator.clipboard.writeText(config.telegramLink); toast.success('Đã sao chép link!') }}
          className="flex flex-col items-center gap-2 p-4 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl border border-slate-200 transition-all active:scale-95"
        >
          <span className="text-3xl">🔗</span>
          <span className="text-sm font-semibold">Sao chép link</span>
        </button>
      </div>

      {/* Contact info card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thông tin liên hệ</p>
        </div>
        <div className="divide-y divide-slate-100">

          {/* Username */}
          <div className="px-4 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 text-base">💬</div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400">Username Telegram</p>
                <p className="text-sm font-semibold text-slate-800 font-mono">@{config.telegramUsername}</p>
              </div>
            </div>
            <CopyBtn text={`@${config.telegramUsername}`} small />
          </div>

          {/* Link */}
          <div className="px-4 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 text-base">🔗</div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400">Link trực tiếp</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{telegramDisplayLink}</p>
              </div>
            </div>
            <CopyBtn text={config.telegramLink} small />
          </div>

          {/* Working hours */}
          <div className="px-4 py-3.5 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 text-base">🕐</div>
            <div>
              <p className="text-xs text-slate-400">Giờ hỗ trợ</p>
              <p className="text-sm font-semibold text-slate-800">{config.workingHours}</p>
            </div>
          </div>

          {/* Group link if exists */}
          {config.telegramGroupLink && (
            <div className="px-4 py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0 text-base">👥</div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Nhóm cộng đồng</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {config.telegramGroupLink.replace('https://', '')}
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <CopyBtn text={config.telegramGroupLink} small />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Group join button */}
      {config.telegramGroupLink && (
        <button
          onClick={() => handleOpenTelegram(config.telegramGroupLink!)}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-2xl transition-all font-semibold text-sm active:scale-95"
        >
          <span className="text-xl">👥</span>
          Tham gia nhóm cộng đồng
        </button>
      )}

      {/* Note */}
      {config.note && (
        <div className="flex gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
          <span className="text-amber-500 flex-shrink-0 mt-0.5">💡</span>
          <p className="text-xs text-amber-700 leading-relaxed">{config.note}</p>
        </div>
      )}

      {/* FAQ quick links */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Câu hỏi thường gặp</p>
        </div>
        {[
          { q: 'Nạp tiền bao lâu được duyệt?', a: 'Thường trong 5–15 phút trong giờ hành chính' },
          { q: 'Rút tiền mất bao lâu?', a: 'Từ 5–30 phút sau khi admin xác nhận' },
          { q: 'Quên mật khẩu phải làm gì?', a: 'Liên hệ CSKH qua Telegram để được hỗ trợ đặt lại' },
        ].map((item, i) => (
          <div key={i} className="px-4 py-3.5 border-b border-slate-100 last:border-0">
            <p className="text-sm font-medium text-slate-700 mb-1">❓ {item.q}</p>
            <p className="text-xs text-slate-500 pl-5">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ClientSupportPage