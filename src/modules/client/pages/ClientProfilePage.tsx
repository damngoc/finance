import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { Avatar, Badge, Button, Input } from '@/shared/components'
import { clientBankLinkService, BankLinkInfo } from '../services/clientBankLinkService'
import { ROUTES } from '@/shared/constants'

const ClientProfilePage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bankInfo, setBankInfo] = useState<BankLinkInfo | null>(null)
  const [bankLoading, setBankLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    clientBankLinkService.getMyBankInfo(user.id)
      .then(info => setBankInfo(info))
      .catch(() => setBankInfo(null))
      .finally(() => setBankLoading(false))
  }, [user])

  const isLinked = !!(bankInfo?.bankName && bankInfo?.bankAccountNumber)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">👤 Hồ sơ cá nhân</h1>
        <p className="text-sm text-slate-500 mt-0.5">Quản lý thông tin tài khoản của bạn</p>
      </div>

      {/* ── Thông tin cá nhân ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-base flex-shrink-0">👤</div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Thông tin cá nhân</h2>
            <p className="text-xs text-slate-400 mt-0.5">Cập nhật họ tên, email, số điện thoại</p>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100">
            <Avatar name={user?.name || ''} size="lg" />
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-slate-800 text-base truncate">{user?.name}</h2>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              <div className="mt-1">
                <Badge variant="blue">{user?.role}</Badge>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="flex-shrink-0">Đổi ảnh</Button>
          </div>

          <form className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <Input label="Họ tên" defaultValue={user?.name} />
              <Input label="Email" type="email" defaultValue={user?.email} />
              <Input label="Số điện thoại" type="tel" placeholder="09xxxxxxxx" />
            </div>
            <div className="flex justify-end pt-1">
              <Button>Lưu thay đổi</Button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Thông tin ngân hàng ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-base flex-shrink-0">🏦</div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Tài khoản ngân hàng</h2>
              <p className="text-xs text-slate-400 mt-0.5">Dùng để nhận tiền khi rút</p>
            </div>
          </div>
          <button
            onClick={() => navigate(ROUTES.CLIENT.BANK_LINK)}
            className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors px-2.5 py-1.5 bg-violet-50 hover:bg-violet-100 rounded-xl"
          >
            ✏️ {isLinked ? 'Thay đổi' : 'Liên kết'}
          </button>
        </div>

        {bankLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : isLinked ? (
          <>
            {/* Status badge */}
            <div className="px-5 pt-4 pb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Đã liên kết
              </span>
            </div>

            <div className="divide-y divide-slate-100 px-5 pb-5">
              {[
                { label: 'Ngân hàng',         icon: '🏛️', value: bankInfo!.bankName },
                { label: 'Tên chủ tài khoản', icon: '👤', value: bankInfo!.bankAccountName },
                { label: 'Số tài khoản',      icon: '💳', value: bankInfo!.bankAccountNumber, mono: true },
              ].map(row => (
                <div key={row.label} className="py-3 flex items-center gap-3">
                  <span className="text-base flex-shrink-0">{row.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400">{row.label}</p>
                    <p className={`text-sm font-semibold text-slate-800 mt-0.5 ${row.mono ? 'font-mono tracking-wider' : ''}`}>
                      {row.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-5 text-center space-y-3">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-2xl">🏦</div>
            <div>
              <p className="text-sm font-medium text-slate-700">Chưa liên kết ngân hàng</p>
              <p className="text-xs text-slate-400 mt-0.5">Liên kết để có thể rút tiền về tài khoản của bạn</p>
            </div>
            <button
              onClick={() => navigate(ROUTES.CLIENT.BANK_LINK)}
              className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-violet-200"
            >
              🔗 Liên kết ngay
            </button>
          </div>
        )}
      </div>

      {/* ── Đổi mật khẩu ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-base flex-shrink-0">🔒</div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Đổi mật khẩu</h2>
            <p className="text-xs text-slate-400 mt-0.5">Bảo mật tài khoản của bạn</p>
          </div>
        </div>

        <div className="p-5">
          <form className="space-y-3">
            <Input label="Mật khẩu hiện tại" type="password" placeholder="••••••••" />
            <Input label="Mật khẩu mới" type="password" placeholder="••••••••" />
            <Input label="Xác nhận mật khẩu mới" type="password" placeholder="••••••••" />
            <div className="flex justify-end pt-1">
              <Button>Cập nhật mật khẩu</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ClientProfilePage