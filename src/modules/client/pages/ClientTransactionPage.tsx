import React, { useState } from 'react'
import { clientTransactionService } from '../services/clientTransactionService'
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
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
      ✓ Đã duyệt
    </span>
  )
  if (status === 'rejected') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
      ✕ Từ chối
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
      ⏳ Chờ duyệt
    </span>
  )
}

const ClientTransactionsPage: React.FC = () => {
  const [page, setPage]               = useState(1)
  const [search, setSearch]           = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filterType, setFilterType]   = useState<FilterType>('all')

  const { data, loading, error, refetch } = useApi(
    () => clientTransactionService.getMyTransactions({ page, limit: 10, search, type: filterType }),
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
        <h1 className="text-2xl font-bold text-slate-800">Lịch sử Nạp / Rút tiền</h1>
        <p className="text-sm text-slate-500 mt-1">
          {data ? `${data.total} giao dịch` : 'Đang tải...'}
        </p>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange(opt.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterType === opt.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Tìm theo username..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Tìm
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}
              className="px-3 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-sm transition-colors"
            >
              ✕
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" className="text-indigo-500" />
          </div>
        )}
        {error && <div className="p-6"><ErrorAlert message={error} onRetry={refetch} /></div>}
        {!loading && !error && data?.data.length === 0 && (
          <EmptyState icon="💳" title="Không có giao dịch nào" description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm" />
        )}
        {!loading && !error && data && data.data.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    {['Username', 'Số tiền', 'Loại', 'Trạng thái', 'Thời gian'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.data.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {tx.username[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-700">@{tx.username}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`font-bold text-base ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {tx.type === 'deposit' ? '+' : '−'}{formatAmount(tx.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {tx.type === 'deposit' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
                            ⬆ Nạp tiền
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold">
                            ⬇ Rút tiền
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <StatusBadge status={tx.status} />
                          {tx.status === 'rejected' && tx.rejectedReason && (
                            <p className="text-xs text-slate-400 mt-1 max-w-[160px] truncate" title={tx.rejectedReason}>
                              {tx.rejectedReason}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs text-slate-400">
                Trang {data.page}/{data.totalPages} — {data.total} giao dịch
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  ← Trước
                </button>
                {Array.from({ length: Math.min(data.totalPages, 5) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, data.totalPages - 4)) + i
                  return p <= data.totalPages ? (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm transition-all ${
                        p === page
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-500 hover:bg-white hover:text-slate-800 border border-transparent hover:border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ) : null
                })}
                <button
                  disabled={page >= data.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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

export default ClientTransactionsPage