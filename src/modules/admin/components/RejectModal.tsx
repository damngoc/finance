import React, { useState, useEffect } from 'react'
import { Transaction } from '@/shared/types'

interface RejectModalProps {
  transaction: Transaction | null
  onClose: () => void
  onConfirm: (reason: string) => void
  isLoading?: boolean
}

const RejectModal: React.FC<RejectModalProps> = ({
  transaction, onClose, onConfirm, isLoading,
}) => {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (transaction) {
      setReason('')
      setError('')
    }
  }, [transaction])

  if (!transaction) return null

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do từ chối')
      return
    }
    onConfirm(reason.trim())
  }

  const formatAmount = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-xl flex-shrink-0">
            🚫
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Từ chối giao dịch</h2>
            <p className="text-gray-400 text-xs">Lý do từ chối là bắt buộc</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-gray-300 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 mb-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Username</span>
            <span className="text-white font-medium">@{transaction.username}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Loại</span>
            <span className={`font-medium ${transaction.type === 'deposit' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {transaction.type === 'deposit' ? '⬆ Nạp tiền' : '⬇ Rút tiền'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Số tiền</span>
            <span className="text-white font-semibold">{formatAmount(transaction.amount)}</span>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Lý do từ chối <span className="text-red-400">*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => { setReason(e.target.value); setError('') }}
            rows={3}
            placeholder="Ví dụ: Thông tin tài khoản không khớp, số tiền vượt hạn mức..."
            className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white text-sm placeholder-gray-600 resize-none focus:outline-none focus:ring-2 transition-colors ${
              error
                ? 'border-red-500 focus:ring-red-500/30'
                : 'border-gray-700 focus:ring-indigo-500/30 focus:border-indigo-500'
            }`}
          />
          {error && (
            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              ⚠ {error}
            </p>
          )}
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
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang xử lý...
              </>
            ) : (
              '✕ Xác nhận từ chối'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RejectModal