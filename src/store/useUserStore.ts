import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, UserState, UserSettings, Progress, UserRole } from '@/types'
import { SimpleEncryption, AuthHelper } from '@/utils/encryption'
import { useBookStore } from './useBookStore'
import { useGameStore } from './useGameStore'

const defaultSettings: UserSettings = {
  fontSize: 'normal',
  theme: 'light',
  soundEnabled: true,
  musicEnabled: false,
  animationsEnabled: true,
  simplifiedMode: false,
  lowStimulusMode: false,
  language: 'both'
}

const defaultModuleProgress = (moduleId: string): Progress => ({
  moduleId,
  completedQuests: [],
  totalXP: 0,
  badges: [],
  startDate: new Date().toISOString(),
  lastPlayed: new Date().toISOString(),
  settings: defaultSettings
})

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      users: [],
      isLoggedIn: false,
      showLoginModal: false,
      showUserSwitcher: false,
      showGuestConversion: false,

      // Actions
      register: async (username: string, password: string, displayName?: string, role: UserRole = 'student') => {
        const { users } = get()

        // 检查用户名是否已存在
        if (users.some(user => user.username === username)) {
          console.error('Username already exists')
          return false
        }

        // 生成盐值
        const salt = SimpleEncryption.generateSalt()
        const passwordHash = SimpleEncryption.hashPasswordWithSalt(password, salt)

        // 创建新用户（安全版本）
        const newUser: User = {
          id: AuthHelper.generateUserId(),
          username,
          displayName: displayName || username,
          role,
          passwordHash, // 存储哈希后的密码
          salt, // 存储盐值
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          settings: defaultSettings,
          moduleProgress: {},
          totalXP: 0,
          totalBadges: [],
          globalStats: {
            totalTimeSpent: 0,
            questsCompleted: 0,
            streakDays: 0,
            lastStudyDate: new Date().toISOString()
          }
        }

        set(state => ({
          users: [...state.users, newUser],
          currentUser: newUser,
          isLoggedIn: true
        }))

        console.log('User registered successfully:', username)
        return true
      },

      login: async (username: string, password: string) => {
        const { users } = get()

        // 查找用户
        const user = users.find(u => u.username === username)

        if (!user) {
          console.error('Invalid username or password')
          return false
        }

        // 验证密码（使用安全的密码验证）
        const isPasswordValid = SimpleEncryption.verifyPassword(
          password + user.salt,
          user.passwordHash
        )

        if (!isPasswordValid) {
          console.error('Invalid username or password')
          return false
        }

        // 更新最后登录时间
        const updatedUser = {
          ...user,
          lastLogin: new Date().toISOString(),
          globalStats: {
            ...user.globalStats,
            lastStudyDate: new Date().toISOString()
          }
        }

        set(state => ({
          users: state.users.map(u => u.id === user.id ? updatedUser : u),
          currentUser: updatedUser,
          isLoggedIn: true
        }))

        // 同步BookStore和GameStore数据到新用户
        const bookStore = useBookStore.getState()
        const gameStore = useGameStore.getState()
        bookStore.syncOnUserSwitch(updatedUser.id)
        gameStore.syncOnUserSwitch(updatedUser.id)

        console.log('User logged in successfully:', username)
        return true
      },

      logout: () => {
        set({
          currentUser: null,
          isLoggedIn: false,
          showLoginModal: false,
          showUserSwitcher: false
        })
        console.log('User logged out')
      },

      switchUser: async (userId: string, password?: string) => {
        const { users, currentUser } = get()
        const targetUser = users.find(u => u.id === userId)

        if (!targetUser) {
          console.error('User not found')
          return false
        }

        // 安全验证：只有管理员可以切换到其他用户
        if (currentUser && currentUser.role === 'student') {
          // 普通学生只能切换到自己之前登录过的账户（通过密码验证）
          if (currentUser.id !== userId) {
            console.error('Students can only switch to their own accounts')
            return false
          }
        }

        // 如果切换到管理员账户，需要密码验证
        if ((targetUser.role === 'admin' || targetUser.role === 'superadmin') &&
            currentUser?.id !== userId) {
          if (!password) {
            console.error('Password required to switch to admin account')
            return false
          }

          // 验证密码
          const isPasswordValid = SimpleEncryption.verifyPassword(
            password,
            targetUser.passwordHash,
            targetUser.salt
          )

          if (!isPasswordValid) {
            console.error('Invalid password for admin account')
            return false
          }
        }

        const updatedUser = {
          ...targetUser,
          lastLogin: new Date().toISOString(),
          globalStats: {
            ...targetUser.globalStats,
            lastStudyDate: new Date().toISOString()
          }
        }

        set(state => ({
          users: state.users.map(u => u.id === userId ? updatedUser : u),
          currentUser: updatedUser,
          isLoggedIn: true,
          showUserSwitcher: false
        }))

        console.log('Switched to user:', targetUser.username)
        return true
      },

      updateUser: (updates: Partial<User>) => {
        const { currentUser } = get()
        if (!currentUser) return

        const updatedUser = { ...currentUser, ...updates }

        set(state => ({
          users: state.users.map(u => u.id === currentUser.id ? updatedUser : u),
          currentUser: updatedUser
        }))
      },

      deleteUser: async (userId: string) => {
        const { users, currentUser } = get()

        if (currentUser?.id === userId) {
          console.error('Cannot delete currently logged in user')
          return false
        }

        set(state => ({
          users: state.users.filter(u => u.id !== userId)
        }))

        console.log('User deleted successfully')
        return true
      },

      updateGlobalStats: (stats: Partial<User['globalStats']>) => {
        const { currentUser } = get()
        if (!currentUser) return

        const updatedUser = {
          ...currentUser,
          globalStats: {
            ...currentUser.globalStats,
            ...stats
          }
        }

        set(state => ({
          users: state.users.map(u => u.id === currentUser.id ? updatedUser : u),
          currentUser: updatedUser
        }))
      },

      getModuleProgress: (moduleId: string) => {
        const { currentUser } = get()
        if (!currentUser) return null

        return currentUser.moduleProgress[moduleId] || null
      },

      updateModuleProgress: (moduleId: string, progressUpdates: Partial<Progress>) => {
        const { currentUser } = get()
        if (!currentUser) return

        const currentProgress = currentUser.moduleProgress[moduleId] || defaultModuleProgress(moduleId)
        const updatedProgress = {
          ...currentProgress,
          ...progressUpdates,
          lastPlayed: new Date().toISOString()
        }

        const updatedUser = {
          ...currentUser,
          moduleProgress: {
            ...currentUser.moduleProgress,
            [moduleId]: updatedProgress
          },
          // 更新全局统计
          totalXP: Object.values({
            ...currentUser.moduleProgress,
            [moduleId]: updatedProgress
          }).reduce((sum, progress) => sum + progress.totalXP, 0),
          totalBadges: Array.from(new Set(
            Object.values({
              ...currentUser.moduleProgress,
              [moduleId]: updatedProgress
            }).flatMap(progress => progress.badges)
          )),
          globalStats: {
            ...currentUser.globalStats,
            questsCompleted: Object.values({
              ...currentUser.moduleProgress,
              [moduleId]: updatedProgress
            }).reduce((sum, progress) => sum + progress.completedQuests.length, 0)
          }
        }

        set(state => ({
          users: state.users.map(u => u.id === currentUser.id ? updatedUser : u),
          currentUser: updatedUser
        }))
      },

      setShowLoginModal: (show: boolean) => {
        set({ showLoginModal: show })
      },

      setShowUserSwitcher: (show: boolean) => {
        set({ showUserSwitcher: show })
      },

      setShowGuestConversion: (show: boolean) => {
        set({ showGuestConversion: show })
      },

      updateUserRole: async (userId: string, role: UserRole) => {
        const { users, currentUser } = get()

        // 只有超级管理员可以修改用户角色
        if (currentUser?.role !== 'superadmin') {
          console.error('Only superadmin can update user roles')
          return false
        }

        // 不能修改自己的角色
        if (currentUser.id === userId) {
          console.error('Cannot modify your own role')
          return false
        }

        const user = users.find(u => u.id === userId)
        if (!user) {
          console.error('User not found')
          return false
        }

        const updatedUser = {
          ...user,
          role,
          lastLogin: new Date().toISOString()
        }

        set(state => ({
          users: state.users.map(u => u.id === userId ? updatedUser : u)
        }))

        return true
      },

      // Admin helper functions
      isAdmin: () => {
        const { currentUser } = get()
        return currentUser?.role === 'admin' || currentUser?.role === 'superadmin'
      },

      isSuperAdmin: () => {
        const { currentUser } = get()
        return currentUser?.role === 'superadmin'
      },

      canManageUsers: () => {
        const { currentUser } = get()
        return currentUser?.role === 'admin' || currentUser?.role === 'superadmin'
      },

      hasAdminPrivileges: () => {
        const { currentUser } = get()
        return currentUser?.role === 'admin' || currentUser?.role === 'superadmin'
      }
    }),
    {
      name: 'quest-g6-users',
      partialize: (state) => ({
        users: state.users,
        currentUser: state.currentUser,
        isLoggedIn: state.isLoggedIn
        // 不持久化 UI 状态 (showLoginModal, showUserSwitcher)
      })
    }
  )
)

// 辅助函数：生成默认头像
export const generateAvatar = (username: string): string => {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-red-500']
  const colorIndex = username.charCodeAt(0) % colors.length
  return colors[colorIndex]
}

// 辅助函数：计算学习连续天数
export const calculateStreakDays = (lastStudyDate: string, previousStreak: number): number => {
  const lastStudy = new Date(lastStudyDate)
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - lastStudy.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return previousStreak // 今天已经学习过
  } else if (diffDays === 1) {
    return previousStreak + 1 // 连续学习
  } else {
    return 1 // 中断了，重新开始
  }
}