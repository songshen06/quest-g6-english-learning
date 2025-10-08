import React, { useState } from 'react'
import { Lock, Key, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

interface PasswordVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (password: string) => Promise<boolean>
  targetUserName: string
  targetUserRole: string
}

export const PasswordVerificationModal: React.FC<PasswordVerificationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  targetUserName,
  targetUserRole
}) => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('请输入密码')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const success = await onConfirm(password)
      if (success) {
        setPassword('')
        setShowPassword(false)
        onClose()
      } else {
        setError('密码错误，请重试')
      }
    } catch (err) {
      setError('验证失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setPassword('')
    setShowPassword(false)
    setError('')
    onClose()
  }

  const getRoleDisplayColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'text-purple-600 bg-purple-100'
      case 'admin':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'superadmin':
        return '超级管理员'
      case 'admin':
        return '管理员'
      default:
        return '学生'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">身份验证</h2>
              <p className="text-gray-600">需要密码验证才能切换账户</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{targetUserName}</p>
                <p className="text-sm text-gray-600">切换到此账户</p>
              </div>
              <span className={`px-3 py-1 text-xs rounded-full font-medium ${getRoleDisplayColor(targetUserRole)}`}>
                {getRoleDisplayName(targetUserRole)}
              </span>
            </div>
          </div>

          {targetUserRole === 'admin' || targetUserRole === 'superadmin' ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-900 mb-1">管理员账户</h3>
                  <p className="text-sm text-amber-700">
                    切换到管理员账户需要输入正确的密码进行验证。
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">账户验证</h3>
                  <p className="text-sm text-blue-700">
                    请输入密码以验证您的身份并切换到此账户。
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密码验证
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="请输入密码"
                  autoFocus
                />
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading || !password.trim()}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    验证中...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    验证并切换
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}