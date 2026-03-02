import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { adminWebConfigService, WebConfig } from '../services/adminWebConfigService'
import { Spinner } from '@/shared/components'

const MAX_BANNERS = 5

// ─── Banner Slideshow Preview ─────────────────────────────────────
const BannerSlideshow: React.FC<{ banners: string[] }> = ({ banners }) => {
  const [current, setCurrent] = useState(0)
  const validBanners = banners.filter(Boolean)

  useEffect(() => {
    if (validBanners.length <= 1) return
    const t = setInterval(() => setCurrent(c => (c + 1) % validBanners.length), 3000)
    return () => clearInterval(t)
  }, [validBanners.length])

  useEffect(() => { setCurrent(0) }, [banners])

  if (validBanners.length === 0) {
    return (
      <div className="w-full h-40 bg-gray-800 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-700">
        <span className="text-3xl mb-2">🖼️</span>
        <p className="text-gray-500 text-sm">Chưa có banner</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-gray-800">
      {validBanners.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Banner ${i + 1}`}
          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x200/1f2937/6b7280?text=Banner+' + (i + 1) }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {validBanners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${i === current ? 'bg-white w-5' : 'bg-white/50 w-2'}`}
          />
        ))}
      </div>
      {/* Counter */}
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 rounded-full text-white text-xs">
        {current + 1}/{validBanners.length}
      </div>
    </div>
  )
}

// ─── Marquee Preview ──────────────────────────────────────────────
const MarqueePreview: React.FC<{ text: string }> = ({ text }) => {
  if (!text.trim()) {
    return (
      <div className="w-full py-2 px-4 bg-gray-800 rounded-lg text-gray-600 text-sm text-center border border-dashed border-gray-700">
        Chưa có thông báo
      </div>
    )
  }
  return (
    <div className="w-full overflow-hidden bg-gray-800 rounded-lg py-2 border border-gray-700">
      <div className="whitespace-nowrap animate-marquee text-yellow-400 text-sm font-medium">
        {text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}
      </div>
    </div>
  )
}

// ─── Image URL Input ──────────────────────────────────────────────
const ImageUrlInput: React.FC<{
  label: string
  value: string
  onChange: (v: string) => void
  onRemove?: () => void
  placeholder?: string
  index?: number
}> = ({ label, value, onChange, onRemove, placeholder, index }) => {
  const [preview, setPreview] = useState(value)

  useEffect(() => {
    const t = setTimeout(() => setPreview(value), 400)
    return () => clearTimeout(t)
  }, [value])

  return (
    <div className="flex gap-3 items-start">
      <div className="w-16 h-11 rounded-lg bg-gray-800 border border-gray-700 flex-shrink-0 overflow-hidden">
        {preview ? (
          <img
            src={preview}
            alt=""
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
            {index !== undefined ? index + 1 : '?'}
          </div>
        )}
      </div>
      <div className="flex-1">
        <label className="block text-xs text-gray-500 mb-1">{label}</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || 'Nhập URL ảnh...'}
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors"
          />
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="px-2.5 py-2 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-red-600 rounded-xl text-xs transition-all"
            >
              🗑
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Section Card ─────────────────────────────────────────────────
const SectionCard: React.FC<{
  icon: string
  title: string
  subtitle: string
  children: React.ReactNode
  onSave: () => Promise<void>
  saving: boolean
  hasChanges: boolean
}> = ({ icon, title, subtitle, children, onSave, saving, hasChanges }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600/15 flex items-center justify-center text-xl flex-shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="text-white font-semibold text-sm">{title}</h2>
          <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>
        </div>
      </div>
      <button
        onClick={onSave}
        disabled={saving || !hasChanges}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          hasChanges
            ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
        } disabled:opacity-60`}
      >
        {saving
          ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang lưu...</>
          : hasChanges ? '💾 Lưu thay đổi' : '✓ Đã lưu'
        }
      </button>
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
)

// ─── Main page ────────────────────────────────────────────────────
const AdminWebConfigPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [original, setOriginal] = useState<WebConfig | null>(null)

  const [logo, setLogo] = useState('')
  const [savingLogo, setSavingLogo] = useState(false)

  const [banners, setBanners] = useState<string[]>(['', '', '', '', ''])
  const [savingBanners, setSavingBanners] = useState(false)

  const [marqueeText, setMarqueeText] = useState('')
  const [savingMarquee, setSavingMarquee] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const cfg = await adminWebConfigService.getConfig()
      setOriginal(cfg)
      setLogo(cfg.logo)
      const padded = [...cfg.banners]
      while (padded.length < MAX_BANNERS) padded.push('')
      setBanners(padded.slice(0, MAX_BANNERS))
      setMarqueeText(cfg.marqueeText)
    } catch {
      toast.error('Không thể tải cấu hình')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const logoChanged = logo !== (original?.logo ?? '')
  const bannersChanged = JSON.stringify(banners) !== JSON.stringify(
    original ? [...original.banners, ...Array(MAX_BANNERS).fill('')].slice(0, MAX_BANNERS) : []
  )
  const marqueeChanged = marqueeText !== (original?.marqueeText ?? '')

  const handleSaveLogo = async () => {
    setSavingLogo(true)
    try {
      await adminWebConfigService.saveLogo(logo)
      setOriginal(prev => prev ? { ...prev, logo } : null)
      toast.success('Đã lưu logo')
    } catch { toast.error('Lưu logo thất bại') }
    finally { setSavingLogo(false) }
  }

  const handleSaveBanners = async () => {
    const valid = banners.filter(Boolean)
    if (valid.length === 0) { toast.error('Vui lòng nhập ít nhất 1 URL banner'); return }
    setSavingBanners(true)
    try {
      await adminWebConfigService.saveBanners(valid)
      setOriginal(prev => prev ? { ...prev, banners: valid } : null)
      toast.success(`Đã lưu ${valid.length} banner`)
    } catch { toast.error('Lưu banner thất bại') }
    finally { setSavingBanners(false) }
  }

  const handleSaveMarquee = async () => {
    setSavingMarquee(true)
    try {
      await adminWebConfigService.saveMarquee(marqueeText)
      setOriginal(prev => prev ? { ...prev, marqueeText } : null)
      toast.success('Đã lưu thông báo')
    } catch { toast.error('Lưu thông báo thất bại') }
    finally { setSavingMarquee(false) }
  }

  const updateBanner = (i: number, v: string) =>
    setBanners(prev => prev.map((b, idx) => idx === i ? v : b))

  const removeBanner = (i: number) =>
    setBanners(prev => {
      const next = prev.filter((_, idx) => idx !== i)
      while (next.length < MAX_BANNERS) next.push('')
      return next
    })

  const activeBanners = banners.filter(Boolean)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner size="lg" className="text-indigo-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">⚙️ Cấu hình Web</h1>
        <p className="text-gray-400 text-sm mt-1">Quản lý logo, banner và thông báo hiển thị cho người dùng</p>
      </div>

      {/* ── Logo ── */}
      <SectionCard
        icon="🖼️" title="Logo" subtitle="Logo hiển thị trên đầu trang và sidebar"
        onSave={handleSaveLogo} saving={savingLogo} hasChanges={logoChanged}
      >
        <div className="flex gap-5 items-start">
          <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gray-800 border-2 border-dashed border-gray-700 flex items-center justify-center overflow-hidden">
            {logo ? (
              <img src={logo} alt="Logo preview"
                onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/96x96/1f2937/6b7280?text=Logo' }}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <div className="text-center">
                <div className="text-3xl mb-1">🖼️</div>
                <p className="text-gray-600 text-xs">Preview</p>
              </div>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-400 mb-1.5">URL hình ảnh logo</label>
            <input
              type="text" value={logo} onChange={e => setLogo(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors"
            />
            <p className="mt-2 text-xs text-gray-600">Hỗ trợ PNG, JPG, SVG, WebP. Khuyến nghị <span className="text-gray-500">200×200px</span></p>
            {logo && (
              <button onClick={() => setLogo('')} className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors">
                ✕ Xóa logo
              </button>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ── Banners ── */}
      <SectionCard
        icon="🎞️" title="Banner Slideshow"
        subtitle={`Tối đa ${MAX_BANNERS} banner • Tự động chuyển mỗi 3 giây`}
        onSave={handleSaveBanners} saving={savingBanners} hasChanges={bannersChanged}
      >
        <div className="space-y-5">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2.5">
              Preview ({activeBanners.length}/{MAX_BANNERS} banner)
            </p>
            <BannerSlideshow banners={banners} />
          </div>
          <div className="border-t border-gray-800" />
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Danh sách Banner URL</p>
            <div className="space-y-3">
              {banners.map((url, i) => (
                <ImageUrlInput
                  key={i} index={i}
                  label={`Banner ${i + 1}${i === 0 ? ' (Đầu tiên)' : ''}`}
                  value={url}
                  onChange={v => updateBanner(i, v)}
                  onRemove={activeBanners.length > 1 ? () => removeBanner(i) : undefined}
                  placeholder={`https://example.com/banner-${i + 1}.jpg`}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-600">💡 Để trống các ô không dùng. Chỉ ô có URL mới hiển thị.</p>
          </div>
        </div>
      </SectionCard>

      {/* ── Marquee ── */}
      <SectionCard
        icon="📢" title="Thông báo chạy"
        subtitle="Dòng chữ chạy ngang phía dưới banner trên trang chủ"
        onSave={handleSaveMarquee} saving={savingMarquee} hasChanges={marqueeChanged}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Nội dung thông báo</label>
            <div className="relative">
              <textarea
                value={marqueeText}
                onChange={e => setMarqueeText(e.target.value)}
                placeholder="VD: 🎉 Chào mừng bạn đến với nền tảng! 💹 Giao dịch an toàn..."
                rows={3}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors resize-none"
              />
              <span className="absolute bottom-2 right-3 text-gray-600 text-xs">{marqueeText.length} ký tự</span>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-xs text-gray-600">💡 Dùng emoji để thu hút sự chú ý. Văn bản cuộn từ phải sang trái.</p>
              {marqueeText && (
                <button onClick={() => setMarqueeText('')} className="text-xs text-red-400 hover:text-red-300 transition-colors flex-shrink-0 ml-3">✕ Xóa</button>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Preview</p>
            <div className="bg-gray-950 rounded-xl p-3 border border-gray-800">
              <div className="text-xs text-gray-600 mb-2 pl-1">📱 Trang chủ — phía dưới banner</div>
              <div className="bg-gray-900 rounded-lg overflow-hidden mb-2">
                <div className="h-16 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">[ Banner Slideshow ]</span>
                </div>
              </div>
              <MarqueePreview text={marqueeText} />
            </div>
          </div>
        </div>
      </SectionCard>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 18s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default AdminWebConfigPage