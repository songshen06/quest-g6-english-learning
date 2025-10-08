import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useGameStore } from '@/store/useGameStore'
import { useUserStore } from '@/store/useUserStore'
import { useBookStore } from '@/store/useBookStore'
import { HomePage } from '@/pages/HomePage'
import { ModulesPage } from '@/pages/ModulesPage'
import { BookModulesPage } from '@/pages/BookModulesPage'
import { ModulePage } from '@/pages/ModulePage'
import { QuestPage } from '@/pages/QuestPage'
import { ProgressPage } from '@/pages/ProgressPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { RewardModal } from '@/components/RewardModal'
import { LoginModal } from '@/components/auth/LoginModal'
import { UserSwitcher } from '@/components/auth/UserSwitcher'
import { AdminInitialization } from '@/components/auth/AdminInitialization'
import { GuestBanner } from '@/components/auth/GuestBanner'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import './globals.css'

function App() {
  const { progress } = useGameStore()
  const { isLoggedIn, showLoginModal, currentUser } = useUserStore()
  const { setCurrentBook, currentBookId, syncOnUserSwitch } = useBookStore()
  const { syncOnUserSwitch: syncGameStore } = useGameStore()

  // 确保BookStore初始化
  useEffect(() => {
    if (currentBookId) {
      setCurrentBook(currentBookId)
    }
  }, [currentBookId, setCurrentBook])

  // 当用户改变时，同步所有Store的数据
  useEffect(() => {
    if (currentUser) {
      console.log(`🔄 App: User changed to ${currentUser.username}, syncing stores`)
      syncOnUserSwitch(currentUser.id)
      syncGameStore(currentUser.id)
    }
  }, [currentUser?.id, syncOnUserSwitch, syncGameStore])

  const getThemeClasses = () => {
    // 只使用当前用户的设置
    const theme = currentUser?.settings?.theme || 'light'

    switch (theme) {
      case 'dark':
        return 'bg-gray-900 text-white'
      case 'high-contrast':
        return 'bg-black text-white contrast-more'
      default:
        return 'bg-white text-gray-900'
    }
  }

  const getFontSizeClasses = () => {
    // 优先使用用户的设置，如果没有用户则使用进度设置
    const fontSize = currentUser?.settings.fontSize || progress?.settings.fontSize || 'normal'

    switch (fontSize) {
      case 'large':
        return 'text-lg'
      case 'extra-large':
        return 'text-xl'
      default:
        return 'text-base'
    }
  }

  return (
    <div className={`min-h-screen ${getThemeClasses()} ${getFontSizeClasses()} ${!currentUser?.settings.animationsEnabled && !progress?.settings.animationsEnabled ? 'transition-none' : ''} transition-colors duration-200`}>
      <Router>
        {/* 访客横幅 */}
        <GuestBanner />

        {/* 用户切换器（仅在有用户时显示） */}
        <div className="fixed top-4 right-4 z-40">
          {isLoggedIn && <UserSwitcher />}
        </div>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/modules" element={
            <ProtectedRoute requireAuth={true}>
              <BookModulesPage />
            </ProtectedRoute>
          } />
          <Route path="/module/:moduleId" element={
            <ProtectedRoute requireAuth={true}>
              <ModulePage />
            </ProtectedRoute>
          } />
          <Route path="/quest/:moduleId/:questId" element={
            <ProtectedRoute requireAuth={true}>
              <QuestPage />
            </ProtectedRoute>
          } />
          <Route path="/progress" element={
            <ProtectedRoute requireAuth={true}>
              <ProgressPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute requireAuth={true}>
              <SettingsPage />
            </ProtectedRoute>
          } />
        </Routes>

        {/* Global modals */}
        <RewardModal />
        <LoginModal isOpen={showLoginModal} onClose={() => useUserStore.getState().setShowLoginModal(false)} />
        <AdminInitialization />
      </Router>
    </div>
  )
}

export default App