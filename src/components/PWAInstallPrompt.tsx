import React, { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

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
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // 检查是否已经安装
    const checkInstalled = () => {
      const isIosApp = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isStandaloneApp = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS = (window.navigator as any).standalone === true

      setIsInstalled(isStandaloneApp || isInWebAppiOS)
      setIsStandalone(isStandaloneApp || isInWebAppiOS)
      setIsIOS(isIosApp)
      console.log('📱 PWA状态检查:', { isIosApp, isStandaloneApp, isInWebAppiOS })
    }

    // 监听 beforeinstallprompt 事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
      console.log('📱 PWA可以安装了 - beforeinstallprompt事件触发')
    }

    // 监听安装成功事件
    const handleAppInstalled = () => {
      console.log('🎉 PWA安装成功！')
      setDeferredPrompt(null)
      setShowPrompt(false)
      setIsInstalled(true)
      checkInstalled()
    }

    // 初始检查
    checkInstalled()

    // 监听事件
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // 延迟检查，确保页面完全加载后再显示
    const timer = setTimeout(() => {
      if (!isInstalled && !isIOS) {
        console.log('🔍 3秒后检查PWA安装提示状态')
        console.log('📱 PWA状态:', {
          hasDeferredPrompt: !!deferredPrompt,
          isInstalled,
          isIOS,
          hostname: window.location.hostname,
          userAgent: navigator.userAgent.substring(0, 50)
        })

        // 在生产环境中，即使没有deferredPrompt也显示手动安装提示
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          setShowPrompt(true)
          console.log('📱 显示手动安装提示 (GitHub Pages 环境)')
        }
      }
    }, 3000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      clearTimeout(timer)
    }
  }, [deferredPrompt, isInstalled, isIOS])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // 如果没有deferredPrompt，显示详细的手动安装说明
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
      const isEdge = /Edg/.test(navigator.userAgent)
      const isFirefox = /Firefox/.test(navigator.userAgent)

      let instructions = ''

      if (isChrome || isEdge) {
        instructions = `在 Chrome/Edge 浏览器中安装：

方法1 - 查找地址栏图标：
• 查看地址栏右侧是否有 ⊕ 安装图标
• 点击安装图标并确认

方法2 - 通过菜单：
• 点击右上角三个点菜单
• 选择"安装应用"或"添加到主屏幕"
• 确认安装

如果看不到安装选项，请确保：
• 使用最新版本的 Chrome 或 Edge
• 页面已完全加载
• 网络连接正常`
      } else if (isFirefox) {
        instructions = `在 Firefox 浏览器中：

• 点击地址栏右侧的 "+" 图标
• 或者通过菜单选择"安装此站点为应用"`
      } else {
        instructions = `请在浏览器菜单中查找"添加到主屏幕"或"安装应用"选项

如果使用移动设备：
• Android: 浏览器菜单 → 添加到主屏幕
• iOS: Safari 分享按钮 → 添加到主屏幕`
      }

      alert(instructions)
      return
    }

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
      alert('安装失败，请尝试手动安装。查看浏览器菜单中的"安装应用"选项。')
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // 可以选择在一段时间后重新显示
    setTimeout(() => {
      if (!isInstalled) {
        setShowPrompt(true)
      }
    }, 300000) // 5分钟后重新显示
  }

  // 如果已经安装，不显示提示
  if (isInstalled || isStandalone) {
    return null
  }

  // iOS设备显示不同的提示
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                安装到主屏幕
              </h4>
              <p className="text-xs text-gray-600 mb-2">
                在Safari中，点击分享按钮，然后选择"添加到主屏幕"
              </p>
              <button
                onClick={handleDismiss}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                知道了
              </button>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
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
                  {deferredPrompt ? '立即安装' : '查看说明'}
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