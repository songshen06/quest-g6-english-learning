import React, { useState, useEffect } from 'react'
import { Shield, Key, User, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useUserStore } from '@/store/useUserStore'
import { DEFAULT_ADMIN_ACCOUNT, DEFAULT_SUPERADMIN_ACCOUNT, needsAdminInitialization, validateAdminAccount } from '@/utils/admin'
import { ensureSuperAdminExists, shouldProvideSuperAdminAccess } from '@/utils/superAdminAuth'

export const AdminInitialization: React.FC = () => {
  const [showAdminSetup, setShowAdminSetup] = useState(false)
  const [adminData, setAdminData] = useState({
    username: DEFAULT_ADMIN_ACCOUNT.username,
    password: '',
    confirmPassword: '',
    displayName: DEFAULT_ADMIN_ACCOUNT.displayName
  })
  const [superAdminData, setSuperAdminData] = useState({
    username: DEFAULT_SUPERADMIN_ACCOUNT.username,
    password: '',
    confirmPassword: '',
    displayName: DEFAULT_SUPERADMIN_ACCOUNT.displayName
  })
  const [errors, setErrors] = useState<{ admin?: string; superadmin?: string }>({})
  const [isCreating, setIsCreating] = useState(false)
  const [isAutoCreating, setIsAutoCreating] = useState(false)
  const [autoAccess, setAutoAccess] = useState<any>(null)

  const { users, register } = useUserStore()

  // 自动检测和创建超级管理员
  useEffect(() => {
    const autoSetupSuperAdmin = async () => {
      // 检查是否有自动管理员权限
      const access = shouldProvideSuperAdminAccess()
      if (access.access) {
        setAutoAccess(access)
        setIsAutoCreating(true)

        try {
          // 自动创建超级管理员账户
          const success = await ensureSuperAdminExists({ users, register })
          if (success) {
            console.log('✅ 超级管理员账户自动创建成功')
          }
        } catch (error) {
          console.error('自动创建超级管理员失败:', error)
        } finally {
          setIsAutoCreating(false)
        }
      }
    }

    autoSetupSuperAdmin()
  }, [users, register])

  // 检查是否需要初始化管理员
  if (!needsAdminInitialization(users)) {
    return null
  }

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    // 验证管理员账户
    if (adminData.password) {
      const adminValidation = validateAdminAccount(adminData.username, adminData.password)
      if (!adminValidation.valid) {
        newErrors.admin = adminValidation.message
      } else if (adminData.password !== adminData.confirmPassword) {
        newErrors.admin = '两次输入的密码不一致'
      }
    }

    // 验证超级管理员账户
    if (superAdminData.password) {
      const superAdminValidation = validateAdminAccount(superAdminData.username, superAdminData.password)
      if (!superAdminValidation.valid) {
        newErrors.superadmin = superAdminValidation.message
      } else if (superAdminData.password !== superAdminData.confirmPassword) {
        newErrors.superadmin = '两次输入的密码不一致'
      }
    }

    // 至少需要创建一个管理员账户
    if (!adminData.password && !superAdminData.password) {
      newErrors.admin = '至少需要创建一个管理员账户'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateAdmins = async () => {
    if (!validateForm()) return

    setIsCreating(true)
    try {
      // 创建管理员账户
      if (adminData.password) {
        const success = await register(
          adminData.username,
          adminData.password,
          adminData.displayName,
          'admin'
        )
        if (!success) {
          setErrors(prev => ({ ...prev, admin: '创建管理员账户失败' }))
          return
        }
      }

      // 创建超级管理员账户
      if (superAdminData.password) {
        const success = await register(
          superAdminData.username,
          superAdminData.password,
          superAdminData.displayName,
          'superadmin'
        )
        if (!success) {
          setErrors(prev => ({ ...prev, superadmin: '创建超级管理员账户失败' }))
          return
        }
      }

      // 成功创建后关闭设置界面
      setShowAdminSetup(false)
      // 不需要重新加载页面，Zustand会自动处理状态更新
    } catch (error) {
      console.error('创建管理员账户时出错:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">初始化管理员账户</h2>
              <p className="text-gray-600">设置系统管理员以管理用户和系统设置</p>
            </div>
          </div>

          {/* 自动权限检测状态 */}
          {autoAccess?.access && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Key className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-900 mb-1">检测到管理员权限</h3>
                  <p className="text-sm text-green-700">
                    通过 {autoAccess.method} 检测到管理员权限，正在自动创建超级管理员账户...
                  </p>
                </div>
              </div>
            </div>
          )}

          {isAutoCreating && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                <div>
                  <h3 className="font-medium text-yellow-900 mb-1">自动创建中</h3>
                  <p className="text-sm text-yellow-700">
                    正在自动创建超级管理员账户，请稍候...
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">重要提示</h3>
                <p className="text-sm text-blue-700">
                  系统中还没有管理员账户。请至少创建一个管理员账户来管理用户和系统设置。
                  建议同时创建超级管理员账户以便进行更高级的管理操作。
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* 管理员账户设置 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">管理员账户</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">基础管理权限</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                  <input
                    type="text"
                    value={adminData.username}
                    onChange={(e) => setAdminData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="输入管理员用户名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">显示名称</label>
                  <input
                    type="text"
                    value={adminData.displayName}
                    onChange={(e) => setAdminData(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="输入显示名称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                  <input
                    type="password"
                    value={adminData.password}
                    onChange={(e) => setAdminData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="输入密码（至少6位）"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
                  <input
                    type="password"
                    value={adminData.confirmPassword}
                    onChange={(e) => setAdminData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="再次输入密码"
                  />
                </div>

                {errors.admin && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.admin}
                  </div>
                )}
              </div>
            </div>

            {/* 超级管理员账户设置 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">超级管理员账户</h3>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">最高权限</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                  <input
                    type="text"
                    value={superAdminData.username}
                    onChange={(e) => setSuperAdminData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="输入超级管理员用户名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">显示名称</label>
                  <input
                    type="text"
                    value={superAdminData.displayName}
                    onChange={(e) => setSuperAdminData(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="输入显示名称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                  <input
                    type="password"
                    value={superAdminData.password}
                    onChange={(e) => setSuperAdminData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="输入密码（至少6位）"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
                  <input
                    type="password"
                    value={superAdminData.confirmPassword}
                    onChange={(e) => setSuperAdminData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="再次输入密码"
                  />
                </div>

                {errors.superadmin && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.superadmin}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={handleCreateAdmins}
              disabled={isCreating || (!adminData.password && !superAdminData.password)}
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              {isCreating ? '创建中...' : '创建管理员账户'}
            </button>
            <button
              onClick={() => setShowAdminSetup(false)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              稍后设置
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}