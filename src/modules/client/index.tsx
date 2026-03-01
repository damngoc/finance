import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ClientLayout } from '@/shared/layouts/ClientLayout'
import { RequireAuth, GuestOnly } from '@/shared/guards/RouteGuard'
import ClientDashboardPage from './pages/ClientDashboardPage'
import ClientProfilePage from './pages/ClientProfilePage'
import ClientLoginPage from './pages/ClientLoginPage'
import ClientTransactionsPage from './pages/ClientTransactionPage'
import { ROUTES } from '@/shared/constants'

const ClientSettingsPage = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
    ⚙️ Trang cài đặt (coming soon)
  </div>
)

export const ClientRoutes: React.FC = () => (
  <Routes>
    <Route
      path="login"
      element={
        <GuestOnly redirectTo={ROUTES.CLIENT.DASHBOARD}>
          <ClientLoginPage />
        </GuestOnly>
      }
    />
    <Route
      element={
        <RequireAuth requiredRole="client">
          <ClientLayout />
        </RequireAuth>
      }
    >
      <Route index element={<Navigate to="/app/dashboard" replace />} />
      <Route path="dashboard" element={<ClientDashboardPage />} />
      <Route path="profile" element={<ClientProfilePage />} />
      <Route path="transactions" element={<ClientTransactionsPage />} />
      <Route path="settings" element={<ClientSettingsPage />} />
    </Route>
  </Routes>
)
