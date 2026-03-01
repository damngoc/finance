import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { adminTransactionService } from '../services/adminTransactionService'
import { useApi } from '@/shared/hooks/useApi'
import { Spinner, ErrorAlert, EmptyState } from '@/shared/components'
import TransactionTable from '../components/TransactionTable'
import RejectModal from '../components/RejectModal'
import { Transaction, TransactionType } from '@/shared/types'

type FilterType = 'all' | TransactionType

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all',      label: 'Tất cả' },
  { value: 'deposit',  label: '⬆ Nạp tiền' },
  { value: 'withdraw', label: '⬇ Rút tiền' },
]

const AdminTransactionsPage: React.FC = () => {
  const [page, setPage]               = useState(1)
  const [search, setSearch]           = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filterType, setFilterType]   = useState<FilterType>('all')
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [rejectTarget, setRejectTarget] = useState<Transaction | null>(null)
  const [rejectLoading, setRejectLoading] = useState(false)

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

  const handleApprove = async (tx: Transaction) => {
    setProcessingId(tx.id)
    try {
      await adminTransactionService.approve({ id: tx.id })
      toast.success(`Đã duyệt lệnh ${tx.type === 'deposit' ? 'nạp' : 'rút'} tiền của @${tx.username}`)
      refetch()
    } catch {
      toast.error('Duyệt thất bại, vui lòng thử lại')
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return
    setRejectLoading(true)
    try {
      await adminTransactionService.reject({ id: rejectTarget.id, reason })
      toast.error(`Đã từ chối lệnh của @${rejectTarget.username}`)
      setRejectTarget(null)
      refetch()
    } catch {
      toast.error('Từ chối thất bại, vui lòng thử lại')
    } finally {
      setRejectLoading(false)
    }
  }

  const pendingCount = data?.data.filter(t => t.status === 'pending').length ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý Nạp / Rút tiền</h1>
          <p className="text-gray-400 text-sm mt-1">
            {data ? `${data.total} giao dịch` : 'Đang tải...'}
            {pendingCount > 0 && (
              <span className="ml-2 text-amber-400">• {pendingCount} chờ duyệt</span>
            )}
          </p>
        </div>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Type pills */}
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

        {/* Search */}
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
        {error && (
          <div className="p-6">
            <ErrorAlert message={error} onRetry={refetch} />
          </div>
        )}
        {!loading && !error && data?.data.length === 0 && (
          <EmptyState
            icon="💳"
            title="Không tìm thấy giao dịch"
            description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
          />
        )}
        {!loading && !error && data && data.data.length > 0 && (
          <>
            <TransactionTable
              transactions={data.data}
              onApprove={handleApprove}
              onReject={setRejectTarget}
              processingId={processingId}
            />

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
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
                        p === page
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
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

      {/* Reject Modal */}
      <RejectModal
        transaction={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
        isLoading={rejectLoading}
      />
    </div>
  )
}

export default AdminTransactionsPage