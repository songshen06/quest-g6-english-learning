import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, Download, CheckCircle } from 'lucide-react'

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineMessage(false)
      setTimeout(() => setShowOfflineMessage(true), 100)
      setTimeout(() => setShowOfflineMessage(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineMessage(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const [cacheStatus, setCacheStatus] = useState<'checking' | 'complete' | 'partial'>('checking')

  useEffect(() => {
    // 检查缓存状态
    const checkCacheStatus = async () => {
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys()
          const audioCache = await caches.match('audio-cache')
          const contentCache = await caches.match('content-cache')
          const imagesCache = await caches.match('images-cache')

          // 估算缓存完整性
          const hasAudio = !!audioCache
          const hasContent = !!contentCache
          const hasImages = !!imagesCache

          if (hasAudio && hasContent && hasImages) {
            setCacheStatus('complete')
          } else if (hasAudio || hasContent || hasImages) {
            setCacheStatus('partial')
          } else {
            setCacheStatus('checking')
          }
        } catch (error) {
          console.error('Cache check failed:', error)
          setCacheStatus('checking')
        }
      }
    }

    checkCacheStatus()

    // 定期检查缓存状态
    const interval = setInterval(checkCacheStatus, 30000) // 30秒检查一次

    return () => clearInterval(interval)
  }, [])

  // 只有离线时才显示详细状态
  if (isOnline && !showOfflineMessage) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 z-50 max-w-sm">
      {/* 连接状态指示器 */}
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
        isOnline
          ? 'bg-green-100 text-green-800 border border-green-200'
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        {isOnline ? (
          <>
            <Wifi className="w-3 h-3" />
            <span>在线</span>
            {showOfflineMessage && <CheckCircle className="w-3 h-3" />}
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span>离线</span>
          </>
        )}
      </div>

      {/* 离线时的详细状态 */}
      {!isOnline && (
        <div className="mt-2 bg-white rounded-lg border-2 border-gray-200 p-3 shadow-lg">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-900">离线学习模式</h4>

            {/* 缓存状态 */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                cacheStatus === 'complete' ? 'bg-green-500' :
                cacheStatus === 'partial' ? 'bg-yellow-500' : 'bg-gray-300'
              }`} />
              <span className="text-xs text-gray-600">
                {cacheStatus === 'complete' ? '缓存完整' :
                 cacheStatus === 'partial' ? '部分缓存' : '缓存检查中...'}
              </span>
            </div>

            {/* 缓存详情 */}
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center justify-between">
                <span>📚 内容文件</span>
                <span>{cacheStatus !== 'checking' ? '✅' : '⏳'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>🎵 音频文件</span>
                <span>{cacheStatus !== 'checking' ? '✅' : '⏳'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>🖼️ 图片资源</span>
                <span>{cacheStatus !== 'checking' ? '✅' : '⏳'}</span>
              </div>
            </div>

            {/* 提示信息 */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-600 leading-relaxed">
                {cacheStatus === 'complete'
                  ? '所有资源已缓存，可以完全离线学习！'
                  : cacheStatus === 'partial'
                  ? '部分资源已缓存，正在下载剩余内容...'
                  : '正在检查缓存状态，请稍候...'
                }
              </p>
            </div>

            {/* 缓存下载按钮 */}
            {isOnline && cacheStatus !== 'complete' && (
              <button
                onClick={() => window.location.reload()}
                className="mt-2 w-full bg-blue-500 text-white text-xs px-3 py-2 rounded hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-3 h-3" />
                <span>完成缓存下载</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default OfflineIndicator