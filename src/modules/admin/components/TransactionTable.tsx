import React from 'react'
import { Transaction } from '@/shared/types'
import { Badge } from '@/shared/components'

interface TransactionTableProps {
  transactions: Transaction[]
  onApprove: (tx: Transaction) => void
  onReject: (tx: Transaction) => void
  processingId: number | null
}

const formatAmount = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions, onApprove, onReject, processingId,
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-800">
          {['#', 'Username', 'Số tiền', 'Loại', 'Trạng thái', 'Thời gian', 'Thao tác'].map(h => (
            <th
              key={h}
              className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-800/60">
        {transactions.map(tx => {
          const isPending = tx.status === 'pending'
          const isProcessing = processingId === tx.id

          return (
            <tr key={tx.id} className="hover:bg-gray-800/40 transition-colors">
              <td className="px-4 py-3.5 text-gray-600 text-xs">#{tx.id}</td>

              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {tx.username[0].toUpperCase()}
                  </div>
                  <span className="text-gray-200 font-medium">@{tx.username}</span>
                </div>
              </td>

              <td className="px-4 py-3.5">
                <span className={`font-semibold ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {tx.type === 'deposit' ? '+' : '-'}{formatAmount(tx.amount)}
                </span>
              </td>

              <td className="px-4 py-3.5">
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

              <td className="px-4 py-3.5">
                {tx.status === 'pending' && <Badge variant="yellow">Chờ duyệt</Badge>}
                {tx.status === 'approved' && <Badge variant="green">Đã duyệt</Badge>}
                {tx.status === 'rejected' && (
                  <div>
                    <Badge variant="red">Từ chối</Badge>
                    {tx.rejectedReason && (
                      <p
                        className="text-xs text-gray-600 mt-0.5 max-w-[120px] truncate"
                        title={tx.rejectedReason}
                      >
                        {tx.rejectedReason}
                      </p>
                    )}
                  </div>
                )}
              </td>

              <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                {formatDate(tx.createdAt)}
              </td>

              <td className="px-4 py-3.5">
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onApprove(tx)}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing
                        ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                        : '✓'
                      }
                      Duyệt
                    </button>
                    <button
                      onClick={() => onReject(tx)}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 hover:border-red-600 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✕ Từ chối
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-700 text-xs">—</span>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
)

export default TransactionTable