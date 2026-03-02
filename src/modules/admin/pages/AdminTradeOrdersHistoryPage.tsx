import React, { useState } from 'react'
import {
  adminTradeOrderService,
  TradeOrder,
  TradeOrderStatus,
} from '../services/adminTradeOrderService'
import { useApi } from '@/shared/hooks/useApi'
import { Spinner, ErrorAlert, EmptyState } from '@/shared/components'

const formatMoney = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

const AdminTradeOrdersHistoryPage: React.FC = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<'win' | 'lose' | 'all'>('all')

  const { data, loading, error, refetch } = useApi(
    () => adminTradeOrderService.getAll({ page, limit: 10, search, status: statusFilter as TradeOrderStatus | 'all' }),
    [page, search, statusFilter]
  )

  // Chỉ hiện lệnh đã xử lý (win/lose), lọc bỏ pending
  const resolvedData = data
    ? { ...data, data: data.data.filter(o => o.status === 'win' || o.status === 'lose') }
    : null

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const STATUS_TABS: { value: 'all' | 'win' | 'lose'; label: string; activeClass: string; inactiveColor: string }[] = [
    { value: 'all',  label: 'Tất cả',   activeClass: 'bg-gray-700 text-white',    inactiveColor: 'text-gray-400' },
    { value: 'win',  label: '🏆 Thắng', activeClass: 'bg-emerald-600 text-white', inactiveColor: 'text-emerald-400' },
    { value: 'lose', label: '💔 Thua',  activeClass: 'bg-red-600 text-white',     inactiveColor: 'text-red-400' },
  ]

  const winCount  = resolvedData?.data.filter(o => o.status === 'win').length  ?? 0
  const loseCount = resolvedData?.data.filter(o => o.status === 'lose').length ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">📜 Mua/Bán đã xử lý</h1>
          <p className="text-gray-400 text-sm mt-1 flex items-center gap-2 flex-wrap">
            {resolvedData ? `${resolvedData.data.length} lệnh` : 'Đang tải...'}
            {winCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                🏆 {winCount} thắng
              </span>
            )}
            {loseCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-medium">
                💔 {loseCount} thua
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status tabs */}
        <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 gap-1">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === tab.value
                  ? tab.activeClass
                  : `${tab.inactiveColor} hover:text-white hover:bg-gray-800`
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
        {!loading && !error && (!resolvedData || resolvedData.data.length === 0) && (
          <EmptyState
            icon="📜"
            title="Chưa có lệnh nào được xử lý"
            description="Các lệnh sau khi xác nhận Thắng/Thua sẽ hiển thị tại đây"
          />
        )}

        {!loading && !error && resolvedData && resolvedData.data.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    {['STT', 'Username', 'Mã gói', 'Tên gói', 'Số giây', 'Tiền đặt', '% LN', 'Tiền LN', 'Trạng thái', 'Thời gian'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3.5 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {resolvedData.data.map((order, idx) => (
                    <tr
                      key={order.id}
                      className={`transition-colors hover:bg-gray-800/30 ${
                        order.status === 'win' ? 'border-l-2 border-l-emerald-600/40' : 'border-l-2 border-l-red-600/40'
                      }`}
                    >
                      {/* STT */}
                      <td className="px-4 py-3.5 text-gray-600 text-xs">
                        {(page - 1) * 10 + idx + 1}
                      </td>

                      {/* Username */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                            order.status === 'win'
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                              : 'bg-gradient-to-br from-red-500 to-rose-600'
                          }`}>
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

                      {/* Số giây */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs text-gray-500">{order.seconds}s</span>
                      </td>

                      {/* Tiền đặt */}
                      <td className="px-4 py-3.5">
                        <span className="text-gray-200 text-sm font-medium whitespace-nowrap">
                          {formatMoney(order.betAmount)}
                        </span>
                      </td>

                      {/* % Lợi nhuận */}
                      <td className="px-4 py-3.5">
                        <span className="text-emerald-400 font-semibold text-sm">+{order.profitPercent}%</span>
                      </td>

                      {/* Tiền lợi nhuận */}
                      <td className="px-4 py-3.5">
                        <span className={`font-semibold text-sm whitespace-nowrap ${
                          order.status === 'win' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {order.status === 'win'
                            ? `+${formatMoney(order.profitAmount)}`
                            : `-${formatMoney(order.betAmount)}`
                          }
                        </span>
                      </td>

                      {/* Trạng thái */}
                      <td className="px-4 py-3.5">
                        {order.status === 'win' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
                            🏆 Thắng
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-semibold">
                            💔 Thua
                          </span>
                        )}
                      </td>

                      {/* Thời gian */}
                      <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
              <span className="text-xs text-gray-500">
                Trang {data?.page}/{data?.totalPages} — {resolvedData.data.length} lệnh
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Trước
                </button>
                {Array.from({ length: Math.min(data?.totalPages ?? 1, 5) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, (data?.totalPages ?? 1) - 4)) + i
                  return p <= (data?.totalPages ?? 1) ? (
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
                  disabled={page >= (data?.totalPages ?? 1)}
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
    </div>
  )
}

export default AdminTradeOrdersHistoryPage