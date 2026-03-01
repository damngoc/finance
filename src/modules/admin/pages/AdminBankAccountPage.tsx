import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { adminBankAccountService, BankAccount, CreateBankAccountDto } from '../services/adminBankAccountService'
import BankAccountFormModal from '../components/BankAccountFormModal'
import { Spinner } from '@/shared/components'

const MAX_ACCOUNTS = 3

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

const CurrencyBadge: React.FC<{ account: BankAccount }> = ({ account }) => {
  if (account.currency === 'VND') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-semibold">
      🏧 VND
    </span>
  )
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
      account.network === 'TRC20'
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    }`}>
      {account.network === 'TRC20' ? '⚡' : '🔷'} USDT {account.network}
    </span>
  )
}

const AdminBankAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editAccount, setEditAccount] = useState<BankAccount | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<BankAccount | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchAccounts = async () => {
    setLoading(true)
    try {
      setAccounts(await adminBankAccountService.getAll())
    } catch {
      toast.error('Tải danh sách thất bại')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAccounts() }, [])

  const handleOpenAdd = () => {
    if (accounts.length >= MAX_ACCOUNTS) {
      toast.error(`Chỉ được thêm tối đa ${MAX_ACCOUNTS} tài khoản`)
      return
    }
    setEditAccount(null)
    setModalOpen(true)
  }

  const handleSubmit = async (dto: CreateBankAccountDto) => {
    setSaving(true)
    try {
      if (editAccount) {
        await adminBankAccountService.update(editAccount.id, dto)
        toast.success('Cập nhật tài khoản thành công')
      } else {
        await adminBankAccountService.create(dto)
        toast.success('Thêm tài khoản thành công')
      }
      setModalOpen(false)
      setEditAccount(null)
      fetchAccounts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (acc: BankAccount) => {
    setDeleting(true)
    try {
      await adminBankAccountService.delete(acc.id)
      toast.success(`Đã xóa tài khoản "${acc.accountName}"`)
      setDeleteConfirm(null)
      fetchAccounts()
    } catch {
      toast.error('Xóa thất bại, vui lòng thử lại')
    } finally {
      setDeleting(false)
    }
  }

  const atMax = accounts.length >= MAX_ACCOUNTS

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tài khoản Ngân hàng</h1>
          <p className="text-gray-400 text-sm mt-1">
            {accounts.length}/{MAX_ACCOUNTS} tài khoản
            {atMax && <span className="ml-2 text-amber-400">• Đã đạt giới hạn</span>}
          </p>
        </div>
        <button onClick={handleOpenAdd} disabled={atMax}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          + Thêm tài khoản
        </button>
      </div>

      {/* Slot progress bar */}
      <div className="flex gap-3">
        {Array.from({ length: MAX_ACCOUNTS }, (_, i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i < accounts.length ? 'bg-indigo-500' : 'bg-gray-800'}`} />
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" className="text-indigo-400" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map(acc => (
            <div key={acc.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-white font-semibold truncate">{acc.accountName}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{formatDate(acc.createdAt)}</p>
                </div>
                <CurrencyBadge account={acc} />
              </div>

              <div className="space-y-2 text-sm">
                {acc.currency === 'VND' ? (
                  <>
                    <InfoRow label="Ngân hàng" value={acc.bankName} />
                    <InfoRow label="Số tài khoản" value={acc.accountNumber} mono />
                  </>
                ) : (
                  <InfoRow label="Địa chỉ ví" value={`${acc.walletAddress.slice(0, 10)}...${acc.walletAddress.slice(-6)}`} fullValue={acc.walletAddress} mono />
                )}
              </div>

              <div className="flex gap-2 pt-1 border-t border-gray-800">
                {/* <button onClick={() => { setEditAccount(acc); setModalOpen(true) }}
                  className="flex-1 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-colors">
                  ✏ Sửa
                </button> */}
                <button onClick={() => setDeleteConfirm(acc)}
                  className="flex-1 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-red-600 rounded-lg text-xs font-medium transition-all">
                  🗑 Xóa
                </button>
              </div>
            </div>
          ))}

          {/* Empty slot cards */}
          {Array.from({ length: MAX_ACCOUNTS - accounts.length }, (_, i) => (
            <button key={`empty-${i}`} onClick={handleOpenAdd}
              className="bg-gray-900/50 border border-dashed border-gray-800 hover:border-indigo-600/50 hover:bg-gray-900 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-indigo-400 transition-all min-h-[160px]">
              <span className="text-2xl">+</span>
              <span className="text-xs font-medium">Thêm tài khoản</span>
            </button>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <BankAccountFormModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditAccount(null) }}
        onSubmit={handleSubmit} isLoading={saving} editAccount={editAccount} />

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">🗑</div>
              <h3 className="text-white font-semibold text-lg">Xác nhận xóa</h3>
              <p className="text-gray-400 text-sm mt-2">
                Bạn có chắc muốn xóa <strong className="text-white">"{deleteConfirm.accountName}"</strong>?
                <br />Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} disabled={deleting}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                Hủy
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {deleting
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang xóa...</>
                  : '🗑 Xác nhận xóa'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const InfoRow: React.FC<{ label: string; value: string; fullValue?: string; mono?: boolean }> = ({ label, value, fullValue, mono }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-gray-500 flex-shrink-0">{label}</span>
    <span className={`truncate text-right ${mono ? 'font-mono text-gray-300 text-xs' : 'text-gray-200'}`} title={fullValue || value}>
      {value}
    </span>
  </div>
)

export default AdminBankAccountsPage