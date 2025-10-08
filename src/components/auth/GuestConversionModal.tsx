import React, { useState } from 'react'
import { X, Save, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useUserStore } from '@/store/useUserStore'
import { GuestConversion } from '@/utils/guestConversion'

interface GuestConversionModalProps {
  isOpen: boolean
  onClose: () => void
}

export const GuestConversionModal: React.FC<GuestConversionModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, users, updateUser } = useUserStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // 生成建议用户名
  React.useEffect(() => {
    if (currentUser && isOpen) {
      const suggestedName = GuestConversion.suggestUsername()
      setUsername(suggestedName)
      setDisplayName(currentUser.displayName.replace('访客用户', '').trim() || suggestedName)
    }
  }, [currentUser, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!currentUser) {
        throw new Error('当前用户不存在')
      }

      // 验证用户名
      const validation = GuestConversion.validateUsernameForConversion(username, users)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      // 验证密码
      if (password.length < 4) {
        throw new Error('密码至少需要4个字符')
      }

      // 转换访客用户
      const conversionData = GuestConversion.convertGuestToRegularUser(
        currentUser,
        username.trim(),
        password,
        displayName.trim() || undefined
      )

      // 更新用户信息
      const updatedUser = {
        ...currentUser,
        ...conversionData
      }

      updateUser(updatedUser)
      setIsSuccess(true)

      // 2秒后关闭
      setTimeout(() => {
        onClose()
        setIsSuccess(false)
        setPassword('')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : '转换失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !currentUser) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                保存学习进度
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                将访客账户转换为正式账号
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Save className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                转换成功！
              </h3>
              <p className="text-gray-600">
                你的学习进度已安全保存
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 访客信息提示 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      当前访客进度
                    </p>
                    <div className="text-xs text-blue-700 mt-1 space-y-1">
                      <p>• 学习进度：{Object.keys(currentUser.moduleProgress).length} 个模块</p>
                      <p>• 总经验值：{currentUser.totalXP} XP</p>
                      <p>• 获得徽章：{currentUser.totalBadges.length} 个</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 用户名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名 *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="请输入用户名"
                    required
                    minLength={3}
                  />
                </div>
              </div>

              {/* 显示名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  显示名称（可选）
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入显示名称"
                />
              </div>

              {/* 密码 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码 *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="请输入密码"
                    required
                    minLength={4}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* 错误信息 */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  '处理中...'
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    保存学习进度
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}