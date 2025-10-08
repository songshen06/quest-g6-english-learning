import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useUserStore } from '@/store/useUserStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/'
}) => {
  const { isLoggedIn } = useUserStore()
  const location = useLocation()

  // 如果需要认证但用户未登录，重定向到首页
  if (requireAuth && !isLoggedIn) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  return <>{children}</>
}

// 用于包装需要用户数据的页面组件
export const withUserRequired = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => (
    <ProtectedRoute requireAuth={true}>
      <Component {...props} />
    </ProtectedRoute>
  )
}