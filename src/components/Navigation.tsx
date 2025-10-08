import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, TrendingUp, Settings, ChevronRight } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useGameStore } from '@/store/useGameStore'
import { useUserStore } from '@/store/useUserStore'

export const Navigation: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const { progress } = useGameStore()
  const { isLoggedIn } = useUserStore()

  const navigationItems = [
    {
      path: '/',
      label: t('nav.home'),
      icon: Home
    },
    {
      path: '/modules',
      label: t('nav.modules'),
      icon: BookOpen,
      requireAuth: true
    },
    {
      path: '/progress',
      label: t('nav.progress'),
      icon: TrendingUp,
      requireAuth: true
    },
    {
      path: '/settings',
      label: t('nav.settings'),
      icon: Settings,
      requireAuth: true
    }
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-bottom">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            const requiresAuth = (item as any).requireAuth
            const isDisabled = requiresAuth && !isLoggedIn

            if (requiresAuth && !isLoggedIn) {
              // 显示禁用状态的导航项
              return (
                <div
                  key={item.path}
                  className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg opacity-50 cursor-not-allowed ${
                    !progress?.settings?.animationsEnabled ? 'transition-none' : ''
                  }`}
                  title="请先登录"
                >
                  <div className="relative">
                    <Icon className="w-6 h-6 text-gray-400" />
                  </div>
                  <span className="text-xs mt-1 font-medium text-gray-400">{item.label}</span>
                </div>
              )
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
                  active
                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                } ${!progress?.settings?.animationsEnabled ? 'transition-none' : ''}`}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" />
                  {active && (
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary-600 rounded-full" />
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}