export const ROUTES = {
  // Public
  HOME: '/',

  // Admin
  ADMIN: {
    ROOT: '/admin',
    LOGIN: '/admin/login',
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    USER_CREATE: '/admin/users/create',
    USER_EDIT: (id: number | string) => `/admin/users/${id}/edit`,
    USER_DETAIL: (id: number | string) => `/admin/users/${id}`,
    TRANSACTIONS: '/admin/transactions',
    TRANSACTIONS_VIEW: '/admin/transactions-view',
    BANK_ACCOUNTS: '/admin/bank-accounts',
    TELEGRAM_CONFIG: '/admin/telegram-config',
    ADMIN_ACCOUNTS: '/admin/admin-accounts',
  },

  // Client
  CLIENT: {
    ROOT: '/app',
    LOGIN: '/app/login',
    DASHBOARD: '/app/dashboard',
    PROFILE: '/app/profile',
    TRANSACTIONS: '/app/transactions',
    SETTINGS: '/app/settings',
  },
} as const

export const LOCAL_STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'current_user',
} as const

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
} as const
