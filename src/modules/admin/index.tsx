import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminLayout } from '@/shared/layouts/AdminLayout'
import { RequireAuth, GuestOnly } from '@/shared/guards/RouteGuard'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminTransactionsPage from './pages/AdminTransactionPage'
import AdminTransactionsViewPage from './pages/AdminTransactionViewPage'
import AdminBankAccountsPage from './pages/AdminBankAccountPage'
import AdminTelegramConfigPage from './pages/AdminTelegramConfigPage'
import AdminAccountsPage from './pages/AdminAccountPage'
import AdminTradeOrdersPage from './pages/AdminTradeOrderPage'
import AdminTradeOrdersHistoryPage from './pages/AdminTradeOrdersHistoryPage'
import AdminFinancePackagesPage from './pages/AdminFinancePackagesPage'
import AdminMarginPackagesPage from './pages/AdminMarginPackagesPage'
import AdminWebConfigPage from './pages/AdminWebConfigPage'
import { ROUTES } from '@/shared/constants'

export const AdminRoutes: React.FC = () => (
  <Routes>
    <Route
      path="login"
      element={
        <GuestOnly redirectTo={ROUTES.ADMIN.DASHBOARD}>
          <AdminLoginPage />
        </GuestOnly>
      }
    />
    <Route
      element={
        <RequireAuth requiredRole="admin">
          <AdminLayout />
        </RequireAuth>
      }
    >
      <Route index element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboardPage />} />
      <Route path="users" element={<AdminUsersPage />} />
      <Route path="admin-accounts" element={<AdminAccountsPage />} />
      <Route path="transactions" element={<AdminTransactionsPage />} />
      <Route path="transactions-view" element={<AdminTransactionsViewPage />} />
      <Route path="trade-orders" element={<AdminTradeOrdersPage />} />
      <Route path="trade-orders-history" element={<AdminTradeOrdersHistoryPage />} />
      <Route path="finance-packages" element={<AdminFinancePackagesPage />} />
      <Route path="margin-packages" element={<AdminMarginPackagesPage />} />
      <Route path="bank-accounts" element={<AdminBankAccountsPage />} />
      <Route path="telegram-config" element={<AdminTelegramConfigPage />} />
      <Route path="web-config" element={<AdminWebConfigPage />} />
    </Route>
  </Routes>
)
