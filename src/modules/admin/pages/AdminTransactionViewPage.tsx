import React, { useState } from 'react'
import { adminTransactionService } from '../services/adminTransactionService'
import { useApi } from '@/shared/hooks/useApi'
import { Spinner, ErrorAlert, EmptyState } from '@/shared/components'
import { Transaction, TransactionType } from '@/shared/types'

type FilterType = 'all' | TransactionType

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all',      label: 'Tất cả' },
  { value: 'deposit',  label: '⬆ Nạp tiền' },
  { value: 'withdraw', label: '⬇ Rút tiền' },
]

const formatAmount = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

const StatusBadge: React.FC<{ status: Transaction['status'] }> = ({ status }) => {
  if (status === 'approved') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      ✓ Đã duyệt
    </span>
  )
  if (status === 'rejected') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
      ✕ Từ chối
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
      ⏳ Chờ duyệt
    </span>
  )
}

const AdminTransactionsViewPage: React.FC = () => {
  const [page, setPage]               = useState(1)
  const [search, setSearch]           = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filterType, setFilterType]   = useState<FilterType>('all')

  const { data, loading, error, refetch } = useApi(
    () => adminTransactionService.getAll({ page, limit: 10, search, type: filterType }),
    [page, search, filterType]
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleFilterChange = (type: FilterType) => {
    setFilterType(type)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Xem Nạp / Rút tiền</h1>
        <p className="text-gray-400 text-sm mt-1">
          {data ? `${data.total} giao dịch` : 'Đang tải...'}
        </p>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-xl p-1">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange(opt.value)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterType === opt.value
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Tìm theo username..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Tìm
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}
              className="px-3 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-xl text-sm transition-colors"
            >
              ✕
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" className="text-indigo-400" />
          </div>
        )}
        {error && <div className="p-6"><ErrorAlert message={error} onRetry={refetch} /></div>}
        {!loading && !error && data?.data.length === 0 && (
          <EmptyState icon="📋" title="Không tìm thấy giao dịch" description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm" />
        )}
        {!loading && !error && data && data.data.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    {['Username', 'Số tiền', 'Loại', 'Trạng thái', 'Thời gian'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {data.data.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {tx.username[0].toUpperCase()}
                          </div>
                          <span className="text-gray-200 font-medium">@{tx.username}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`font-semibold ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {tx.type === 'deposit' ? '+' : '−'}{formatAmount(tx.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {tx.type === 'deposit' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-medium border border-emerald-500/20">
                            ⬆ Nạp tiền
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-medium border border-amber-500/20">
                            ⬇ Rút tiền
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <StatusBadge status={tx.status} />
                          {tx.status === 'rejected' && tx.rejectedReason && (
                            <p className="text-xs text-gray-600 mt-1 max-w-[140px] truncate" title={tx.rejectedReason}>
                              {tx.rejectedReason}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800">
              <span className="text-xs text-gray-500">
                Trang {data.page}/{data.totalPages} — {data.total} kết quả
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
    </div>
  )
}

export default AdminTransactionsViewPage