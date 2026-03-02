import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  adminFinancePackageService,
  FinancePackage,
  CreateFinancePackageDto,
} from '../services/adminFinancePackageService'
import { Spinner } from '@/shared/components'

// ─── Add modal ────────────────────────────────────────────────────
const DURATION_PRESETS = [
  { label: '15 giây', seconds: 15 },
  { label: '25 giây', seconds: 25 },
  { label: '30 giây', seconds: 30 },
  { label: '45 giây', seconds: 45 },
  { label: '60 giây', seconds: 60 },
  { label: '2 phút',  seconds: 120 },
  { label: '5 phút',  seconds: 300 },
  { label: '10 phút', seconds: 600 },
  { label: 'Tùy chỉnh', seconds: 0 },
]

interface AddModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (dto: CreateFinancePackageDto) => Promise<void>
  isLoading: boolean
}

const AddModal: React.FC<AddModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [name, setName] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<string>('15 giây')
  const [customSeconds, setCustomSeconds] = useState('')
  const [profitPercent, setProfitPercent] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isOpen) return
    setName('')
    setSelectedPreset('15 giây')
    setCustomSeconds('')
    setProfitPercent('')
    setErrors({})
  }, [isOpen])

  const isCustom = selectedPreset === 'Tùy chỉnh'
  const preset = DURATION_PRESETS.find(p => p.label === selectedPreset)
  const resolvedSeconds = isCustom ? parseInt(customSeconds) || 0 : preset?.seconds || 0
  const resolvedDuration = isCustom
    ? customSeconds ? `${customSeconds} giây` : ''
    : selectedPreset

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Vui lòng nhập tên gói'
    if (isCustom && (!customSeconds || parseInt(customSeconds) <= 0))
      e.duration = 'Vui lòng nhập số giây hợp lệ'
    if (!profitPercent) e.profit = 'Vui lòng nhập % lợi nhuận'
    else if (parseFloat(profitPercent) <= 0 || parseFloat(profitPercent) > 999)
      e.profit = '% lợi nhuận phải từ 0.1 đến 999'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({
      name: name.trim(),
      duration: resolvedDuration,
      durationSeconds: resolvedSeconds,
      profitPercent: parseFloat(profitPercent),
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 flex items-center justify-center text-xl flex-shrink-0">
            💼
          </div>
          <div>
            <h2 className="text-white font-semibold">Thêm gói tài chính</h2>
            <p className="text-gray-500 text-xs mt-0.5">Điền thông tin gói mới</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-gray-300 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Tên gói */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Tên gói <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(v => ({ ...v, name: '' })) }}
              placeholder="VD: Gói 15 giây"
              className={`w-full px-3 py-2 rounded-xl text-sm bg-gray-800 border transition-colors focus:outline-none focus:ring-2 text-gray-200 placeholder-gray-600 ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500/30'
                  : 'border-gray-700 focus:ring-indigo-500/30 focus:border-indigo-500'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">⚠ {errors.name}</p>}
          </div>

          {/* Thời gian */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Thời gian <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {DURATION_PRESETS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => { setSelectedPreset(p.label); setErrors(v => ({ ...v, duration: '' })) }}
                  className={`py-2 rounded-xl text-xs font-medium transition-all border ${
                    selectedPreset === p.label
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {isCustom && (
              <div className="relative mt-2">
                <input
                  type="number"
                  value={customSeconds}
                  onChange={e => { setCustomSeconds(e.target.value); setErrors(v => ({ ...v, duration: '' })) }}
                  placeholder="Nhập số giây..."
                  min={1}
                  className={`w-full px-3 py-2 rounded-xl text-sm bg-gray-800 border transition-colors focus:outline-none focus:ring-2 text-gray-200 placeholder-gray-600 ${
                    errors.duration
                      ? 'border-red-500 focus:ring-red-500/30'
                      : 'border-gray-700 focus:ring-indigo-500/30 focus:border-indigo-500'
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">giây</span>
              </div>
            )}
            {errors.duration && <p className="mt-1 text-xs text-red-400">⚠ {errors.duration}</p>}
          </div>

          {/* % Lợi nhuận */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              % Lợi nhuận <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={profitPercent}
                onChange={e => { setProfitPercent(e.target.value); setErrors(v => ({ ...v, profit: '' })) }}
                placeholder="VD: 85"
                min={0.1}
                max={999}
                step={0.1}
                className={`w-full px-3 py-2 pr-10 rounded-xl text-sm bg-gray-800 border transition-colors focus:outline-none focus:ring-2 text-gray-200 placeholder-gray-600 ${
                  errors.profit
                    ? 'border-red-500 focus:ring-red-500/30'
                    : 'border-gray-700 focus:ring-indigo-500/30 focus:border-indigo-500'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">%</span>
            </div>
            {errors.profit && <p className="mt-1 text-xs text-red-400">⚠ {errors.profit}</p>}
            {/* Live preview */}
            {profitPercent && parseFloat(profitPercent) > 0 && (
              <div className="mt-2 px-3 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <p className="text-xs text-gray-400">
                  Đặt <span className="text-white font-medium">1.000.000đ</span> → nhận về{' '}
                  <span className="text-emerald-400 font-semibold">
                    {new Intl.NumberFormat('vi-VN').format(
                      1000000 + Math.round(1000000 * parseFloat(profitPercent) / 100)
                    )}đ
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang lưu...</>
                : '+ Tạo gói'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete confirm modal ─────────────────────────────────────────
interface DeleteModalProps {
  pkg: FinancePackage | null
  onClose: () => void
  onConfirm: () => Promise<void>
  isLoading: boolean
}

const DeleteModal: React.FC<DeleteModalProps> = ({ pkg, onClose, onConfirm, isLoading }) => {
  if (!pkg) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">🗑</div>
          <h3 className="text-white font-semibold text-lg">Xác nhận xóa</h3>
          <p className="text-gray-400 text-sm mt-2">
            Bạn có chắc muốn xóa gói{' '}
            <strong className="text-white">{pkg.name}</strong>?<br />
            Hành động này không thể hoàn tác.
          </p>
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
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang xóa...</>
              : '🗑 Xác nhận xóa'
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────
const AdminFinancePackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<FinancePackage[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<FinancePackage | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const loadPackages = async () => {
    setLoading(true)
    try {
      const data = await adminFinancePackageService.getAll()
      setPackages(data)
    } catch {
      toast.error('Không thể tải danh sách gói')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPackages() }, [])

  const handleCreate = async (dto: CreateFinancePackageDto) => {
    setSaving(true)
    try {
      const created = await adminFinancePackageService.create(dto)
      toast.success(`Đã tạo gói "${created.name}"`)
      setAddOpen(false)
      loadPackages()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Tạo gói thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminFinancePackageService.delete(deleteTarget.id)
      toast.success(`Đã xóa gói "${deleteTarget.name}"`)
      setDeleteTarget(null)
      loadPackages()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xóa gói thất bại')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    })

  const profitColor = (pct: number) => {
    if (pct >= 95) return 'text-purple-400'
    if (pct >= 90) return 'text-emerald-400'
    if (pct >= 85) return 'text-blue-400'
    return 'text-gray-300'
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">💼 Quản lý Gói Tài chính</h1>
          <p className="text-gray-400 text-sm mt-1">
            {loading ? 'Đang tải...' : `${packages.length} gói`}
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors"
        >
          + Thêm gói
        </button>
      </div>

      {/* Table card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

        {loading && (
          <div className="flex justify-center py-20">
            <Spinner size="lg" className="text-indigo-400" />
          </div>
        )}

        {!loading && packages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">💼</div>
            <h3 className="text-gray-300 font-semibold text-lg">Chưa có gói tài chính</h3>
            <p className="text-gray-600 text-sm mt-1 mb-5">Bắt đầu bằng cách thêm gói đầu tiên</p>
            <button
              onClick={() => setAddOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors"
            >
              + Thêm gói đầu tiên
            </button>
          </div>
        )}

        {!loading && packages.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['STT', 'Tên Gói', 'Thời gian', '% Lợi nhuận', 'Ngày tạo', 'Thao tác'].map(h => (
                    <th
                      key={h}
                      className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-4 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {packages.map((pkg, idx) => (
                  <tr key={pkg.id} className="hover:bg-gray-800/40 transition-colors group">

                    {/* STT */}
                    <td className="px-5 py-4 text-gray-600 text-xs font-mono">
                      {String(idx + 1).padStart(2, '0')}
                    </td>

                    {/* Tên gói */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center text-base flex-shrink-0">
                          💼
                        </div>
                        <div>
                          <p className="text-gray-200 font-medium">{pkg.name}</p>
                          <p className="text-gray-600 text-xs mt-0.5">ID: #{pkg.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Thời gian */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-mono font-bold">
                          {pkg.durationSeconds}s
                        </span>
                        <span className="text-gray-500 text-xs">{pkg.duration}</span>
                      </div>
                    </td>

                    {/* % Lợi nhuận */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${profitColor(pkg.profitPercent)}`}>
                          {pkg.profitPercent}%
                        </span>
                        <div className="flex-1 max-w-[80px]">
                          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pkg.profitPercent >= 95 ? 'bg-purple-500' :
                                pkg.profitPercent >= 90 ? 'bg-emerald-500' :
                                'bg-blue-500'
                              }`}
                              style={{ width: `${Math.min(100, pkg.profitPercent)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Ngày tạo */}
                    <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                      {formatDate(pkg.createdAt)}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setDeleteTarget(pkg)}
                        className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-red-600 rounded-lg text-xs font-medium transition-all"
                      >
                        🗑 Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary footer */}
            <div className="px-5 py-3 border-t border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-600">{packages.length} gói tài chính</span>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>
                  LN thấp nhất:{' '}
                  <span className="text-blue-400 font-medium">
                    {Math.min(...packages.map(p => p.profitPercent))}%
                  </span>
                </span>
                <span>
                  LN cao nhất:{' '}
                  <span className="text-purple-400 font-medium">
                    {Math.max(...packages.map(p => p.profitPercent))}%
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add modal */}
      <AddModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleCreate}
        isLoading={saving}
      />

      {/* Delete modal */}
      <DeleteModal
        pkg={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  )
}

export default AdminFinancePackagesPage