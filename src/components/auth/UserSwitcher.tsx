import React, { useState } from 'react'
import { User, LogOut, Users, Plus, Crown, Trash2, AlertTriangle } from 'lucide-react'
import { useUserStore } from '@/store/useUserStore'
import { generateAvatar } from '@/store/useUserStore'
import { PasswordVerificationModal } from './PasswordVerificationModal'

export const UserSwitcher: React.FC = () => {
  const [deleteConfirmUserId, setDeleteConfirmUserId] = useState<string | null>(null)
  const [passwordVerification, setPasswordVerification] = useState<{
    isOpen: boolean
    targetUserId: string | null
  }>({
    isOpen: false,
    targetUserId: null
  })

  const {
    currentUser,
    users,
    isLoggedIn,
    logout,
    switchUser,
    deleteUser,
    canManageUsers,
    showLoginModal,
    showUserSwitcher,
    setShowLoginModal,
    setShowUserSwitcher
  } = useUserStore()

  const handleUserSwitch = (userId: string) => {
    const targetUser = users.find(u => u.id === userId)
    if (!targetUser) return

    // 如果切换到自己，直接切换
    if (currentUser?.id === userId) {
      switchUser(userId)
      return
    }

    // 检查是否需要密码验证
    const needsPasswordVerification =
      (targetUser.role === 'admin' || targetUser.role === 'superadmin') ||
      (currentUser?.role === 'student' && currentUser.id !== userId)

    if (needsPasswordVerification) {
      setPasswordVerification({
        isOpen: true,
        targetUserId: userId
      })
    } else {
      // 管理员切换到普通学生账户，直接切换
      switchUser(userId)
    }
  }

  const handlePasswordVerification = async (password: string): Promise<boolean> => {
    if (!passwordVerification.targetUserId) return false

    const success = await switchUser(passwordVerification.targetUserId, password)
    if (success) {
      setPasswordVerification({ isOpen: false, targetUserId: null })
      setShowUserSwitcher(false)
    }
    return success
  }

  const cancelPasswordVerification = () => {
    setPasswordVerification({ isOpen: false, targetUserId: null })
  }

  const handleLogout = () => {
    logout()
    setShowUserSwitcher(false)
  }

  const handleDeleteUser = async (userId: string) => {
    const success = await deleteUser(userId)
    if (success) {
      setDeleteConfirmUserId(null)
    }
  }

  const confirmDeleteUser = (userId: string) => {
    setDeleteConfirmUserId(userId)
  }

  const cancelDelete = () => {
    setDeleteConfirmUserId(null)
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
                  <Crown className="w-4 h-4 text-yellow-500" title="当前用户" />
                  {(currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      currentUser.role === 'superadmin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {currentUser.role === 'superadmin' ? '超级管理员' : '管理员'}
                    </span>
                  )}
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

          {/* 其他用户列表 */}
          {(() => {
            // 过滤用户列表：管理员可以看到所有用户，普通用户只能看到其他普通用户
            const visibleUsers = currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin')
              ? users.filter(u => u.id !== currentUser.id) // 管理员可以看到所有其他用户
              : users.filter(u => u.id !== currentUser.id && u.role === 'student') // 普通用户只能看到其他普通用户

            if (visibleUsers.length === 0) return null

            return (
              <div className="p-2 border-b border-gray-200">
                <div className="flex items-center gap-2 px-2 py-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-700">切换用户</p>
                  {currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
                    <span className="text-xs text-gray-500">(管理员可见全部)</span>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  {visibleUsers.map(user => (
                    <div key={user.id} className="group relative">
                      <button
                        onClick={() => handleUserSwitch(user.id)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${generateAvatar(user.username)}`}>
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                          <p className="text-xs text-gray-500">@{user.username} • {user.totalXP} XP</p>
                        </div>
                      </button>

                      {/* 删除用户按钮 - 仅管理员可见 */}
                      {canManageUsers() && (
                        <button
                          onClick={() => confirmDeleteUser(user.id)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          title="删除用户"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

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

      {/* 删除用户确认弹窗 */}
      {deleteConfirmUserId && (() => {
        const userToDelete = users.find(u => u.id === deleteConfirmUserId)
        if (!userToDelete) return null

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-gray-900">确认删除用户</h3>
              </div>

              <p className="text-gray-600 mb-6">
                确定要删除用户 <span className="font-medium">{userToDelete.displayName}</span> 吗？
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-red-700">
                  <strong>警告：</strong>此操作不可撤销，该用户的所有学习进度和设置都将被永久删除。
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDeleteUser(deleteConfirmUserId)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* 密码验证对话框 */}
      {passwordVerification.isOpen && passwordVerification.targetUserId && (() => {
        const targetUser = users.find(u => u.id === passwordVerification.targetUserId)
        if (!targetUser) return null

        return (
          <PasswordVerificationModal
            isOpen={passwordVerification.isOpen}
            onClose={cancelPasswordVerification}
            onConfirm={handlePasswordVerification}
            targetUserName={targetUser.displayName}
            targetUserRole={targetUser.role}
          />
        )
      })()}
    </div>
  )
}