import React, { useState } from 'react'
import { User, LogOut, Plus, Crown } from 'lucide-react'
import { useUserStore } from '@/store/useUserStore'
import { generateAvatar } from '@/store/useUserStore'

export const UserSwitcher: React.FC = () => {
  const {
    currentUser,
    users,
    isLoggedIn,
    logout,
    switchUser,
    showLoginModal,
    showUserSwitcher,
    setShowLoginModal,
    setShowUserSwitcher
  } = useUserStore()

  const handleUserSwitch = (userId: string) => {
    // 简化的用户切换逻辑 - 只能切换到自己的账户
    if (userId === currentUser?.id) {
      switchUser(userId)
      setShowUserSwitcher(false)
    }
  }

  const handleLogout = () => {
    logout()
    setShowUserSwitcher(false)
  }

  if (!isLoggedIn || !currentUser) return null

  return (
    <div className="relative">
      {/* 用户头像和名称 */}
      <button
        onClick={() => setShowUserSwitcher(!showUserSwitcher)}
        className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${generateAvatar(currentUser.username)}`}>
          {currentUser.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-gray-900">{currentUser.displayName}</p>
          <p className="text-xs text-gray-500">{currentUser.totalXP} XP</p>
        </div>
      </button>

      {/* 下拉菜单 */}
      {showUserSwitcher && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* 当前用户信息 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${generateAvatar(currentUser.username)}`}>
                {currentUser.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{currentUser.displayName}</p>
                  <Crown className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="text-sm text-gray-600">@{currentUser.username}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-gray-500">{currentUser.totalXP} XP</span>
                  <span className="text-xs text-gray-500">{currentUser.totalBadges.length} 徽章</span>
                  <span className="text-xs text-gray-500">{currentUser.globalStats.streakDays} 天连续</span>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="p-2 space-y-1">
            <button
              onClick={() => {
                setShowUserSwitcher(false)
                setShowLoginModal(true)
              }}
              className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              <Plus className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">添加新用户</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-2 hover:bg-red-50 rounded-lg transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600">退出登录</span>
            </button>
          </div>
        </div>
      )}

      {/* 点击外部关闭下拉菜单 */}
      {showUserSwitcher && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserSwitcher(false)}
        />
      )}
    </div>
  )
}