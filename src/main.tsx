import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './globals.css'

// 注册 Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/quest-g6-english-learning/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker 注册成功:', registration.scope)

        // 检查更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 发现新版本，准备更新...')
                // 可以在这里添加用户提示
                if (confirm('发现新版本，是否立即更新？')) {
                  window.location.reload()
                }
              }
            })
          }
        })
      })
      .catch((error) => {
        console.error('❌ Service Worker 注册失败:', error)
      })
  })
}

// PWA安装提示已移至 PWAInstallPrompt 组件中处理

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)