import React, { useState } from 'react'
import toast from 'react-hot-toast'
import {
  adminAccountService,
  AdminAccount,
  CreateAdminAccountDto,
  UpdateAdminAccountDto,
} from '../services/adminAccountService'
import AdminAccountFormModal from '../components/AdminAccountFormModal'
import { useApi } from '@/shared/hooks/useApi'
import { useAuth } from '@/shared/hooks/useAuth'
import { Spinner, ErrorAlert, EmptyState } from '@/shared/components'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

const StatusBadge: React.FC<{ status: AdminAccount['status'] }> = ({ status }) =>
  status === 'active' ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
      ● Hoạt động
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-700/50 text-gray-500 border border-gray-700 rounded-full text-xs font-medium">
      ○ Vô hiệu
    </span>
  )

const AdminAccountsPage: React.FC = () => {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editAccount, setEditAccount] = useState<AdminAccount | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<AdminAccount | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { data, loading, error, refetch } = useApi(
    () => adminAccountService.getAll({ page, limit: 10, search }),
    [page, search]
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleOpenAdd = () => {
    if (!isSuperAdmin) {
      toast.error('Chỉ Super Admin mới có quyền thao tác')
      return
    }
    setEditAccount(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (acc: AdminAccount) => {
    if (!isSuperAdmin) {
      toast.error('Chỉ Super Admin mới có quyền thao tác')
      return
    }
    setEditAccount(acc)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditAccount(null)
  }

  const handleSubmit = async (dto: CreateAdminAccountDto | UpdateAdminAccountDto) => {
    setSaving(true)
    try {
      if (editAccount) {
        await adminAccountService.update(editAccount.id, dto as UpdateAdminAccountDto)
        toast.success(`Đã cập nhật tài khoản "${editAccount.username}"`)
      } else {
        const created = await adminAccountService.create(dto as CreateAdminAccountDto)
        toast.success(`Đã tạo tài khoản "${created.username}"`)
      }
      handleCloseModal()
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (acc: AdminAccount) => {
    if (!isSuperAdmin) {
      toast.error('Chỉ Super Admin mới có quyền thao tác')
      return
    }
    setDeleting(true)
    try {
      await adminAccountService.delete(acc.id)
      toast.success(`Đã xóa tài khoản "${acc.username}"`)
      setDeleteConfirm(null)
      refetch()
    } catch {
      toast.error('Xóa thất bại, vui lòng thử lại')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tài khoản Admin</h1>
          <p className="text-gray-400 text-sm mt-1">
            {data ? `${data.total} tài khoản` : 'Đang tải...'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Current role indicator */}
          {isSuperAdmin ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400 text-xs font-semibold">
              👑 Super Admin
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-500 text-xs font-medium">
              🔒 Chỉ xem
            </span>
          )}

          <button
            onClick={handleOpenAdd}
            disabled={!isSuperAdmin}
            title={!isSuperAdmin ? 'Chỉ Super Admin mới có quyền thêm tài khoản' : ''}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Thêm Admin
          </button>
        </div>
      </div>

      {/* Super admin notice for regular admin */}
      {!isSuperAdmin && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
          <span className="text-amber-400 text-lg flex-shrink-0 mt-0.5">⚠</span>
          <div>
            <p className="text-amber-400 text-sm font-medium">Quyền hạn bị giới hạn</p>
            <p className="text-amber-400/70 text-xs mt-0.5">
              Bạn đang đăng nhập với quyền Admin. Chỉ có <strong>Super Admin</strong> mới có thể thêm, sửa hoặc xóa tài khoản Admin.
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Tìm theo username, email..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors"
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

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-purple-400" />
          </div>
        )}
        {error && <div className="p-6"><ErrorAlert message={error} onRetry={refetch} /></div>}
        {!loading && !error && data?.data.length === 0 && (
          <EmptyState icon="🛡️" title="Không tìm thấy tài khoản" description="Thử từ khóa khác hoặc thêm tài khoản admin mới" />
        )}

        {!loading && !error && data && data.data.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    {['#', 'Username', 'Email', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3.5 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {data.data.map(acc => (
                    <tr key={acc.id} className="hover:bg-gray-800/40 transition-colors group">
                      {/* ID */}
                      <td className="px-4 py-3.5 text-gray-600 text-xs">#{acc.id}</td>

                      {/* Username */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {acc.username[0].toUpperCase()}
                          </div>
                          <span className="text-gray-200 font-medium">{acc.username}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 text-gray-400 text-sm">{acc.email}</td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={acc.status} />
                      </td>

                      {/* Created at */}
                      <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(acc.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        {isSuperAdmin ? (
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEdit(acc)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              ✏ Sửa
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(acc)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-red-600 rounded-lg text-xs font-medium transition-all"
                            >
                              🗑 Xóa
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-700 text-xs flex items-center gap-1">
                            🔒 <span>Không có quyền</span>
                          </span>
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
                Trang {data.page}/{data.totalPages} — {data.total} tài khoản
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
                        p === page ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
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

      {/* Form Modal */}
      <AdminAccountFormModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={saving}
        editAccount={editAccount}
      />

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">🗑</div>
              <h3 className="text-white font-semibold text-lg">Xác nhận xóa</h3>
              <p className="text-gray-400 text-sm mt-2">
                Bạn có chắc muốn xóa tài khoản{' '}
                <strong className="text-white">"{deleteConfirm.username}"</strong>?
                <br />Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
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

export default AdminAccountsPage