// ─── Auth ─────────────────────────────────────────────────────────
export type UserRole = 'super_admin' | 'admin' | 'client'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthState {
  user: AuthUser | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
}

// ─── User (Admin quản lý) ─────────────────────────────────────────
export interface User {
  id: number
  username: string
  password?: string
  status: 'active' | 'inactive' | 'banned'
  createdAt: string
  registerIp: string
  lastLoginIp: string
  bankAccountName: string
  bankAccountNumber: string
  bankName: string
}

export interface CreateUserDto {
  username: string
  password: string
  name: string
  email: string
  role: UserRole
  registerIp?: string
  lastLoginIp?: string
  bankAccountName?: string
  bankAccountNumber?: string
  bankName?: string
}

export interface UpdateUserDto {
  password?: string
  lastLoginIp?: string
  bankAccountName?: string
  bankAccountNumber?: string
  bankName?: string
  status?: User['status']
  name?: string
  email?: string
  role?: UserRole
  phone?: string
}

// ─── API ──────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
}

// ─── Transaction ──────────────────────────────────────────────────
export type TransactionType = 'deposit' | 'withdraw'
export type TransactionStatus = 'pending' | 'approved' | 'rejected'

export interface Transaction {
  id: number
  username: string
  amount: number
  type: TransactionType
  status: TransactionStatus
  createdAt: string
  rejectedReason?: string
}

export interface TransactionFilterParams extends PaginationParams {
  type?: TransactionType | 'all'
}

export interface ApproveTransactionDto {
  id: number
}

export interface RejectTransactionDto {
  id: number
  reason: string
}

// ─── Dashboard ────────────────────────────────────────────────────
export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  totalRevenue: number
}

export interface ChartDataPoint {
  label: string
  value: number
}
