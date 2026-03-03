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
    TRADE_ORDERS: '/admin/trade-orders',
    TRADE_ORDERS_HISTORY: '/admin/trade-orders-history',
    FINANCE_PACKAGES: '/admin/finance-packages',
    MARGIN_PACKAGES: '/admin/margin-packages',
    WEB_CONFIG: '/admin/web-config',
  },

  // Client
  CLIENT: {
    ROOT: '/app',
    LOGIN: '/app/login',
    REGISTER: '/app/register',
    DASHBOARD: '/app/dashboard',
    PROFILE: '/app/profile',
    TRANSACTIONS: '/app/transactions',
    SETTINGS: '/app/settings',
    DEPOSIT: '/app/deposit',
    WITHDRAW: '/app/withdraw',
    BANK_LINK: '/app/bank-link',
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
