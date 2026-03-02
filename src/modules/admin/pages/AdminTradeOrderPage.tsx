import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  adminTradeOrderService,
  TradeOrder,
  TradeOrderStatus,
} from '../services/adminTradeOrderService'
import { useApi } from '@/shared/hooks/useApi'
import { Spinner, ErrorAlert, EmptyState } from '@/shared/components'

// ─── Countdown cell ───────────────────────────────────────────────
const CountdownCell: React.FC<{ seconds: number; status: TradeOrderStatus }> = ({ seconds, status }) => {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (status !== 'pending' || remaining <= 0) return
    const t = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000)
    return () => clearInterval(t)
  }, [status, remaining])

  if (status !== 'pending') {
    return <span className="text-gray-600 text-xs">—</span>
  }

  const pct = seconds > 0 ? (remaining / seconds) * 100 : 0
  const color = remaining <= 5 ? 'text-red-400' : remaining <= 10 ? 'text-amber-400' : 'text-emerald-400'

  return (
    <div className="flex flex-col gap-1 min-w-[56px]">
      <span className={`font-mono font-bold text-sm ${color}`}>{remaining}s</span>
      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            remaining <= 5 ? 'bg-red-500' : remaining <= 10 ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Format money ─────────────────────────────────────────────────
const formatMoney = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

// ─── Confirm modal ────────────────────────────────────────────────
type ResolveType = 'win' | 'lose'

interface ConfirmModalProps {
  order: TradeOrder | null
  type: ResolveType | null
  onClose: () => void
  onConfirm: () => Promise<void>
  isLoading: boolean
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ order, type, onClose, onConfirm, isLoading }) => {
  if (!order || !type) return null

  const isWin = type === 'win'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="text-center mb-5">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 ${
            isWin ? 'bg-emerald-500/10' : 'bg-red-500/10'
          }`}>
            {isWin ? '🏆' : '💔'}
          </div>
          <h3 className="text-white font-semibold text-lg">
            Xác nhận {isWin ? 'THẮNG' : 'THUA'}
          </h3>
          <p className="text-gray-400 text-sm mt-2">
            Lệnh của <strong className="text-white">@{order.username}</strong>
          </p>

          {/* Order details */}
          <div className="mt-4 bg-gray-800/60 rounded-xl p-3 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Mã gói</span>
              <span className="text-gray-300 font-mono font-bold">{order.packageCode}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Số tiền đặt</span>
              <span className="text-gray-300">{formatMoney(order.betAmount)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">% Lợi nhuận</span>
              <span className="text-emerald-400">+{order.profitPercent}%</span>
            </div>
            <div className="flex justify-between text-xs font-semibold pt-1 border-t border-gray-700">
              <span className="text-gray-400">{isWin ? 'Nhận về' : 'Mất'}</span>
              <span className={isWin ? 'text-emerald-400' : 'text-red-400'}>
                {isWin ? formatMoney(order.profitAmount) : formatMoney(order.betAmount)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
              isWin ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
            }`}
          >
            {isLoading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang xử lý...</>
              : isWin ? '🏆 Xác nhận Thắng' : '💔 Xác nhận Thua'
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────
const AdminTradeOrdersPage: React.FC = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<TradeOrderStatus | 'all'>('all')

  const [confirmOrder, setConfirmOrder] = useState<TradeOrder | null>(null)
  const [confirmType, setConfirmType] = useState<ResolveType | null>(null)
  const [resolving, setResolving] = useState(false)

  const { data, loading, error, refetch } = useApi(
    () => adminTradeOrderService.getAll({ page, limit: 10, search, status: statusFilter }),
    [page, search, statusFilter]
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const openConfirm = (order: TradeOrder, type: ResolveType) => {
    setConfirmOrder(order)
    setConfirmType(type)
  }

  const closeConfirm = () => {
    setConfirmOrder(null)
    setConfirmType(null)
  }

  const handleResolve = async () => {
    if (!confirmOrder || !confirmType) return
    setResolving(true)
    try {
      if (confirmType === 'win') {
        await adminTradeOrderService.resolveWin(confirmOrder.id)
        toast.success(`Đã xác nhận THẮNG cho @${confirmOrder.username}`)
      } else {
        await adminTradeOrderService.resolveLose(confirmOrder.id)
        toast.success(`Đã xác nhận THUA cho @${confirmOrder.username}`)
      }
      closeConfirm()
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xử lý thất bại')
    } finally {
      setResolving(false)
    }
  }

  const STATUS_TABS: { value: TradeOrderStatus | 'all'; label: string; color: string }[] = [
    { value: 'all',     label: 'Tất cả',    color: 'text-gray-400' },
    { value: 'pending', label: 'Chờ xử lý', color: 'text-amber-400' },
    { value: 'win',     label: 'Thắng',     color: 'text-emerald-400' },
    { value: 'lose',    label: 'Thua',      color: 'text-red-400' },
  ]

  const pendingCount = data?.data.filter(o => o.status === 'pending').length ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            📈 Mua/Bán cần xử lý
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {data ? `${data.total} lệnh` : 'Đang tải...'}
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-medium">
                ⏳ {pendingCount} chờ xử lý
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition-colors"
        >
          ↻ Làm mới
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status tabs */}
        <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 gap-1">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === tab.value
                  ? 'bg-gray-700 text-white'
                  : `${tab.color} hover:text-white hover:bg-gray-800`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-xs">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">🔍</span>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Username, mã gói..."
              className="w-full pl-8 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button type="submit" className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm transition-colors">
            Tìm
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-xl text-sm transition-colors"
            >
              ✕
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-indigo-400" />
          </div>
        )}
        {error && <div className="p-6"><ErrorAlert message={error} onRetry={refetch} /></div>}
        {!loading && !error && data?.data.length === 0 && (
          <EmptyState icon="📈" title="Không có lệnh nào" description="Thử thay đổi bộ lọc hoặc tìm kiếm khác" />
        )}

        {!loading && !error && data && data.data.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    {['STT', 'Username', 'Mã gói', 'Tên gói', 'Số giây', 'Tiền đặt', '% LN', 'Tiền LN', 'Trạng thái', 'Action'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3.5 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {data.data.map((order, idx) => (
                    <tr key={order.id} className="hover:bg-gray-800/40 transition-colors group">

                      {/* STT */}
                      <td className="px-4 py-3.5 text-gray-600 text-xs">
                        {(page - 1) * 10 + idx + 1}
                      </td>

                      {/* Username */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {order.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-gray-200 text-sm font-medium">{order.username}</p>
                            <p className="text-gray-600 text-xs">{order.direction === 'buy' ? '▲ Mua' : '▼ Bán'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Mã gói */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-mono font-bold">
                          {order.packageCode}
                        </span>
                      </td>

                      {/* Tên gói */}
                      <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                        {order.packageName}
                      </td>

                      {/* Số giây countdown */}
                      <td className="px-4 py-3.5">
                        <CountdownCell seconds={order.seconds} status={order.status} />
                      </td>

                      {/* Tiền đặt */}
                      <td className="px-4 py-3.5">
                        <span className="text-gray-200 text-sm font-medium whitespace-nowrap">
                          {formatMoney(order.betAmount)}
                        </span>
                      </td>

                      {/* % Lợi nhuận */}
                      <td className="px-4 py-3.5">
                        <span className="text-emerald-400 font-semibold text-sm">
                          +{order.profitPercent}%
                        </span>
                      </td>

                      {/* Tiền lợi nhuận */}
                      <td className="px-4 py-3.5">
                        <span className="text-emerald-300 font-medium text-sm whitespace-nowrap">
                          {formatMoney(order.profitAmount)}
                        </span>
                      </td>

                      {/* Trạng thái */}
                      <td className="px-4 py-3.5">
                        {order.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-medium">
                            ⏳ Chờ xử lý
                          </span>
                        )}
                        {order.status === 'win' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                            🏆 Thắng
                          </span>
                        )}
                        {order.status === 'lose' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-medium">
                            💔 Thua
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5">
                        {order.status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openConfirm(order, 'win')}
                              className="px-3 py-1.5 bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/25 hover:border-emerald-600 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                            >
                              🏆 Thắng
                            </button>
                            <button
                              onClick={() => openConfirm(order, 'lose')}
                              className="px-3 py-1.5 bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/25 hover:border-red-600 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                            >
                              💔 Thua
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-700 text-xs">Đã xử lý</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
              <span className="text-xs text-gray-500">
                Trang {data.page}/{data.totalPages} — {data.total} lệnh
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Trước
                </button>
                {Array.from({ length: Math.min(data.totalPages, 5) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, data.totalPages - 4)) + i
                  return p <= data.totalPages ? (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                        p === page ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ) : null
                })}
                <button
                  disabled={page >= data.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Sau →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        order={confirmOrder}
        type={confirmType}
        onClose={closeConfirm}
        onConfirm={handleResolve}
        isLoading={resolving}
      />
    </div>
  )
}

export default AdminTradeOrdersPage