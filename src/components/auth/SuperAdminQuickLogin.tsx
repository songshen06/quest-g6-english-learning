import React, { useState, useEffect } from 'react'
import { Shield, Key, Eye, EyeOff, Copy, Check, ExternalLink, Clock, Calendar } from 'lucide-react'
import { useUserStore } from '@/store/useUserStore'
import {
  getSuperAdminAccessLinks,
  getCurrentAdminKeys,
  shouldProvideSuperAdminAccess
} from '@/utils/superAdminAuth'

export const SuperAdminQuickLogin: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [showKeys, setShowKeys] = useState(false)

  const { isLoggedIn, currentUser, checkSuperAdminAccess, superAdminLogin, clearSuperAdminAuth } = useUserStore()

  // 检查自动权限
  useEffect(() => {
    const checkAutoAccess = async () => {
      if (!isLoggedIn || currentUser?.role !== 'superadmin') {
        await checkSuperAdminAccess()
      }
    }
    checkAutoAccess()
  }, [isLoggedIn, currentUser?.role, checkSuperAdminAccess])

  const handleQuickLogin = async () => {
    if (!password) return

    setIsLoading(true)
    try {
      const success = await superAdminLogin(password)
      if (success) {
        setPassword('')
        console.log('✅ 超级管理员登录成功')
      } else {
        console.error('❌ 超级管理员登录失败')
      }
    } catch (error) {
      console.error('登录过程中出错:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(label)
      setTimeout(() => setCopiedText(null), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  const currentKeys = getCurrentAdminKeys()
  const accessLinks = getSuperAdminAccessLinks()
  const autoAccess = shouldProvideSuperAdminAccess()

  // 如果已经是超级管理员，显示管理面板
  if (isLoggedIn && currentUser?.role === 'superadmin') {
    return (
      <div className="fixed bottom-4 left-4 z-40">
        <div className="bg-purple-600 text-white p-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">超级管理员已登录</span>
            <button
              onClick={clearSuperAdminAuth}
              className="ml-2 text-xs bg-purple-700 px-2 py-1 rounded hover:bg-purple-800"
            >
              清除权限
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
        {/* 标题 */}
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">超级管理员登录</h3>
        </div>

        {/* 自动权限提示 */}
        {autoAccess.access && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
            <div className="flex items-center gap-2 text-green-700 text-sm">
              <Key className="w-4 h-4" />
              <span>检测到自动权限: {autoAccess.method}</span>
            </div>
          </div>
        )}

        {/* 密码登录 */}
        <div className="space-y-3 mb-3">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入超级管理员密码"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
              onKeyPress={(e) => e.key === 'Enter' && handleQuickLogin()}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={handleQuickLogin}
            disabled={!password || isLoading}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                登录中...
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                登录
              </>
            )}
          </button>
        </div>

        {/* 快速访问链接 */}
        <div className="border-t pt-3">
          <button
            onClick={() => setShowKeys(!showKeys)}
            className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-900"
          >
            <span>快速访问方式</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          {showKeys && (
            <div className="mt-3 space-y-2">
              {/* 主密码 */}
              <div className="bg-gray-50 p-2 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">主密码</span>
                  <button
                    onClick={() => copyToClipboard('quest_g6_super_admin_2025', 'master_password')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {copiedText === 'master_password' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <code className="text-xs text-gray-600">quest_g6_super_admin_2025</code>
              </div>

              {/* 时间密钥 */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>当前时间密钥</span>
                </div>

                <div className="bg-blue-50 p-2 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-blue-700">小时密钥</span>
                    <button
                      onClick={() => copyToClipboard(currentKeys.hourly, 'hourly_key')}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      {copiedText === 'hourly_key' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <code className="text-xs text-blue-600 break-all">{currentKeys.hourly}</code>
                </div>

                <div className="bg-green-50 p-2 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-green-700">每日密钥</span>
                    <button
                      onClick={() => copyToClipboard(currentKeys.daily, 'daily_key')}
                      className="text-green-400 hover:text-green-600"
                    >
                      {copiedText === 'daily_key' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <code className="text-xs text-green-600 break-all">{currentKeys.daily}</code>
                </div>
              </div>

              {/* 使用说明 */}
              <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-700">
                <div className="flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3" />
                  <span>使用方法</span>
                </div>
                <p>1. 复制任意密钥</p>
                <p>2. 在URL后添加 ?admin_key=密钥</p>
                <p>3. 刷新页面自动登录</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}