import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { UserRole } from '@/shared/types'
import { ROUTES } from '@/shared/constants'

interface GuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

/**
 * RequireAuth — bảo vệ route, redirect về login nếu chưa đăng nhập
 */
export const RequireAuth: React.FC<GuardProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    const loginPath =
      requiredRole === 'admin' ? ROUTES.ADMIN.LOGIN : ROUTES.CLIENT.LOGIN
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Đăng nhập rồi nhưng sai role
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <>{children}</>
}

/**
 * GuestOnly — chỉ cho vào khi chưa đăng nhập (vd: trang login)
 */
export const GuestOnly: React.FC<{ children: React.ReactNode; redirectTo: string }> = ({
  children,
  redirectTo,
}) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to={redirectTo} replace /> : <>{children}</>
}
