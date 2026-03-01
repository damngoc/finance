import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  adminTelegramConfigService,
  TelegramFeatureConfig,
  TelegramFeatureKey,
} from '../services/adminTelegramConfigService'
import { Spinner } from '@/shared/components'

// ─── Inline edit modal ────────────────────────────────────────────
interface EditModalProps {
  config: TelegramFeatureConfig | null
  onClose: () => void
  onSave: (key: TelegramFeatureKey, token: string, groupId: string) => Promise<void>
  isSaving: boolean
}

const EditModal: React.FC<EditModalProps> = ({ config, onClose, onSave, isSaving }) => {
  const [token, setToken] = useState('')
  const [groupId, setGroupId] = useState('')
  const [errors, setErrors] = useState<{ token?: string; groupId?: string }>({})

  useEffect(() => {
    if (config) {
      setToken(config.token)
      setGroupId(config.groupId)
      setErrors({})
    }
  }, [config])

  if (!config) return null

  const validate = () => {
    const e: { token?: string; groupId?: string } = {}
    if (!token.trim()) e.token = 'Vui lòng nhập Token'
    if (!groupId.trim()) e.groupId = 'Vui lòng nhập ID nhóm'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await onSave(config.key, token.trim(), groupId.trim())
  }

  const isEmpty = !config.token && !config.groupId

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl flex-shrink-0">
            {config.icon}
          </div>
          <div>
            <h2 className="text-white font-semibold">{config.label}</h2>
            <p className="text-gray-500 text-xs mt-0.5">{config.description}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-gray-300 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Token */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Token Telegram <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={token}
              onChange={e => { setToken(e.target.value); setErrors(v => ({ ...v, token: undefined })) }}
              placeholder="1234567890:ABCDefghIJKLmno..."
              className={`w-full px-4 py-2.5 bg-gray-800 border rounded-xl text-gray-200 text-sm font-mono placeholder-gray-600 focus:outline-none focus:ring-2 transition-colors ${
                errors.token
                  ? 'border-red-500 focus:ring-red-500/30'
                  : 'border-gray-700 focus:ring-blue-500/30 focus:border-blue-500'
              }`}
            />
            {errors.token && <p className="mt-1.5 text-xs text-red-400">⚠ {errors.token}</p>}
          </div>

          {/* Group ID */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              ID Nhóm <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={groupId}
              onChange={e => { setGroupId(e.target.value); setErrors(v => ({ ...v, groupId: undefined })) }}
              placeholder="-1001234567890"
              className={`w-full px-4 py-2.5 bg-gray-800 border rounded-xl text-gray-200 text-sm font-mono placeholder-gray-600 focus:outline-none focus:ring-2 transition-colors ${
                errors.groupId
                  ? 'border-red-500 focus:ring-red-500/30'
                  : 'border-gray-700 focus:ring-blue-500/30 focus:border-blue-500'
              }`}
            />
            {errors.groupId && <p className="mt-1.5 text-xs text-red-400">⚠ {errors.groupId}</p>}
            <p className="mt-1.5 text-xs text-gray-600">
              ID nhóm thường bắt đầu bằng dấu trừ (-), ví dụ: -1001234567890
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang lưu...</>
              ) : (
                isEmpty ? '+ Cấu hình' : '💾 Cập nhật'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────
const StatusBadge: React.FC<{ configured: boolean }> = ({ configured }) =>
  configured ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
      ✓ Đã cấu hình
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-medium">
      ⚠ Chưa cấu hình
    </span>
  )

// ─── Main page ────────────────────────────────────────────────────
const AdminTelegramConfigPage: React.FC = () => {
  const [configs, setConfigs] = useState<TelegramFeatureConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<TelegramFeatureConfig | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchConfigs = async () => {
    setLoading(true)
    try {
      setConfigs(await adminTelegramConfigService.getAll())
    } catch {
      toast.error('Tải cấu hình thất bại')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchConfigs() }, [])

  const handleSave = async (key: TelegramFeatureKey, token: string, groupId: string) => {
    setSaving(true)
    try {
      const updated = await adminTelegramConfigService.update({ key, token, groupId })
      setConfigs(prev => prev.map(c => c.key === key ? updated : c))
      toast.success(`Đã lưu cấu hình "${updated.label}"`)
      setEditTarget(null)
    } catch {
      toast.error('Lưu cấu hình thất bại')
    } finally {
      setSaving(false)
    }
  }

  const configuredCount = configs.filter(c => c.token && c.groupId).length
  const totalCount = configs.length

  const maskToken = (token: string) => {
    if (!token) return '—'
    if (token.length <= 10) return token
    return `${token.slice(0, 6)}...${token.slice(-4)}`
  }

  const maskGroupId = (id: string) => id || '—'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Cấu hình Telegram</h1>
          <p className="text-gray-400 text-sm mt-1">
            {configuredCount}/{totalCount} chức năng đã cấu hình
            {configuredCount < totalCount && (
              <span className="ml-2 text-amber-400">• {totalCount - configuredCount} chưa cấu hình</span>
            )}
          </p>
        </div>
        {/* Telegram branding */}
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <span className="text-blue-400 text-lg">✈️</span>
          <span className="text-blue-400 text-sm font-medium">Telegram Bot</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2">
        {configs.map(c => (
          <div
            key={c.key}
            title={c.label}
            className={`flex-1 h-1.5 rounded-full transition-colors ${
              c.token && c.groupId ? 'bg-blue-500' : 'bg-gray-800'
            }`}
          />
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-blue-400" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {configs.map(cfg => {
            const isConfigured = !!(cfg.token && cfg.groupId)
            return (
              <div
                key={cfg.key}
                className={`bg-gray-900 border rounded-2xl p-5 flex flex-col gap-4 transition-colors ${
                  isConfigured
                    ? 'border-gray-800 hover:border-gray-700'
                    : 'border-dashed border-gray-800 hover:border-amber-600/30'
                }`}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                      isConfigured ? 'bg-blue-500/15' : 'bg-gray-800'
                    }`}>
                      {cfg.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{cfg.label}</p>
                      <p className="text-gray-600 text-xs mt-0.5 truncate">{cfg.description}</p>
                    </div>
                  </div>
                  <StatusBadge configured={isConfigured} />
                </div>

                {/* Card body - token & groupId preview */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-500 flex-shrink-0">Token</span>
                    <span className={`font-mono truncate text-right ${isConfigured ? 'text-gray-300' : 'text-gray-700'}`}>
                      {maskToken(cfg.token)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-500 flex-shrink-0">ID Nhóm</span>
                    <span className={`font-mono truncate text-right ${isConfigured ? 'text-gray-300' : 'text-gray-700'}`}>
                      {maskGroupId(cfg.groupId)}
                    </span>
                  </div>
                </div>

                {/* Card action */}
                <div className="pt-1 border-t border-gray-800">
                  <button
                    onClick={() => setEditTarget(cfg)}
                    className={`w-full py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isConfigured
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
                        : 'bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-600'
                    }`}
                  >
                    {isConfigured ? '✏ Chỉnh sửa' : '+ Cấu hình ngay'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit Modal */}
      <EditModal
        config={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleSave}
        isSaving={saving}
      />
    </div>
  )
}

export default AdminTelegramConfigPage