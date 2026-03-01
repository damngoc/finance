import React from 'react'

// ─── Spinner ──────────────────────────────────────────────────────
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sz = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-[3px]' }[size]
  return (
    <div className={`${sz} ${className} rounded-full border-gray-200 border-t-current animate-spin`} />
  )
}

// ─── Loading Screen ───────────────────────────────────────────────
export const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Đang tải...' }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
    <Spinner size="lg" className="text-indigo-600" />
    <p className="text-sm text-gray-500">{message}</p>
  </div>
)

// ─── Error Alert ──────────────────────────────────────────────────
export const ErrorAlert: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
    <span className="text-sm flex-1">{message}</span>
    {onRetry && (
      <button onClick={onRetry} className="text-sm font-semibold underline hover:no-underline">
        Thử lại
      </button>
    )}
  </div>
)

// ─── Badge ────────────────────────────────────────────────────────
type BadgeVariant = 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'purple'
export const Badge: React.FC<{ children: React.ReactNode; variant?: BadgeVariant }> = ({
  children,
  variant = 'gray',
}) => {
  const styles: Record<BadgeVariant, string> = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-amber-100 text-amber-700',
    gray: 'bg-gray-100 text-gray-600',
    purple: 'bg-purple-100 text-purple-700',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────
export const Avatar: React.FC<{ name: string; size?: 'sm' | 'md' | 'lg'; src?: string }> = ({
  name,
  size = 'md',
  src,
}) => {
  const sz = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }[size]
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return src ? (
    <img src={src} alt={name} className={`${sz} rounded-full object-cover`} />
  ) : (
    <div className={`${sz} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold`}>
      {initials}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────
export const EmptyState: React.FC<{
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}> = ({ icon = '📭', title, description, action }) => (
  <div className="text-center py-16">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
    {action}
  </div>
)

// ─── Stat Card ────────────────────────────────────────────────────
export const StatCard: React.FC<{
  label: string
  value: string | number
  icon: string
  trend?: { value: number; label: string }
  color?: 'indigo' | 'emerald' | 'amber' | 'rose'
}> = ({ label, value, icon, trend, color = 'indigo' }) => {
  const bg = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  }[color]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${bg}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend.value >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
      {trend && <div className="text-xs text-gray-400 mt-1">{trend.label}</div>}
    </div>
  )
}

// ─── Button ───────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: BtnVariant
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
  }
> = ({ variant = 'primary', size = 'md', isLoading, children, className = '', disabled, ...props }) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants: Record<BtnVariant, string> = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  }
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" className="mr-2 text-current" />}
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────────────
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }
>(({ label, error, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
    <input
      ref={ref}
      className={`w-full px-3.5 py-2.5 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
        error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
      } ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
))
Input.displayName = 'Input'

// ─── Select ───────────────────────────────────────────────────────
export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }
>(({ label, error, className = '', children, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
    <select
      ref={ref}
      className={`w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
))
Select.displayName = 'Select'

// ─── Modal ────────────────────────────────────────────────────────
export const Modal: React.FC<{
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null
  const maxW = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[size]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-xl w-full ${maxW} p-6`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
