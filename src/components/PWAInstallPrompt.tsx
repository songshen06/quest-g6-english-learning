import React, { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // 检查是否已经安装
    const checkInstalled = () => {
      setIsInstalled(window.matchMedia('(display-mode: standalone)').matches)
    }

    // 监听 beforeinstallprompt 事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
      console.log('📱 PWA安装提示已准备好')
    }

    // 监听安装成功事件
    const handleAppInstalled = () => {
      console.log('🎉 PWA安装成功！')
      setDeferredPrompt(null)
      setShowPrompt(false)
      setIsInstalled(true)
    }

    checkInstalled()
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('✅ 用户接受了PWA安装')
      } else {
        console.log('❌ 用户拒绝了PWA安装')
      }

      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('❌ PWA安装失败:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // 可以选择在一段时间后重新显示
    setTimeout(() => {
      if (deferredPrompt && !isInstalled) {
        setShowPrompt(true)
      }
    }, 60000) // 1分钟后重新显示
  }

  // 如果已经安装或不支持PWA，不显示提示
  if (isInstalled || (!deferredPrompt && !showPrompt)) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {showPrompt && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 mb-4 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Download className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                安装 Quest G6 应用
              </h4>
              <p className="text-xs text-gray-600 mb-3">
                将应用添加到桌面，离线也能学习，体验更佳！
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className="flex-1 bg-primary-600 text-white text-xs font-medium px-3 py-2 rounded hover:bg-primary-700 transition-colors"
                >
                  立即安装
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 transition-colors"
                >
                  暂不安装
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PWAInstallPrompt