import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Module, Progress, UserSettings, Quest } from '@/types'
import { useUserStore } from './useUserStore'
import { useBookStore } from './useBookStore'

interface GameState {
  // Module state
  currentModule: Module | null
  modules: Module[]

  // Progress state
  progress: Progress | null
  currentQuest: Quest | null
  currentStepIndex: number

  // UI state
  isLoading: boolean
  showReward: boolean
  currentReward: { badge?: string; xp: number } | null

  // Actions
  loadModule: (module: Module) => Promise<void>
  startQuest: (questId: string) => void
  completeStep: () => void
  completeQuest: () => void
  setCurrentStepIndex: (index: number) => void
  updateProgress: (updates: Partial<Progress>) => void
  updateSettings: (settings: Partial<UserSettings>) => void
  setShowReward: (show: boolean, reward?: { badge?: string; xp: number }) => void
  resetProgress: () => void
  // 新增：用户切换时的数据同步
  syncOnUserSwitch: (userId: string) => void
  saveUserData: (userId: string) => void
}

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

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentModule: null,
      modules: [],
      progress: null,
      currentQuest: null,
      currentStepIndex: 0,
      isLoading: false,
      showReward: false,
      currentReward: null,

      // Actions
      loadModule: async (module: Module) => {
        set({ isLoading: true })
        try {
          // Simulate loading time
          await new Promise(resolve => setTimeout(resolve, 500))

          const { progress } = get()
          let moduleProgress: Progress | null = progress

          // 获取当前用户的进度
          const currentUser = useUserStore.getState().currentUser
          if (currentUser) {
            const userProgress = useUserStore.getState().getModuleProgress(module.moduleId)
            if (userProgress) {
              moduleProgress = userProgress
            }
          }

          // Create progress for this module if it doesn't exist
          if (!moduleProgress || moduleProgress.moduleId !== module.moduleId) {
            moduleProgress = {
              moduleId: module.moduleId,
              completedQuests: [],
              totalXP: 0,
              badges: [],
              startDate: new Date().toISOString(),
              lastPlayed: new Date().toISOString(),
              settings: progress?.settings || defaultSettings
            }

            // 保存到用户数据
            if (currentUser) {
              useUserStore.getState().updateModuleProgress(module.moduleId, moduleProgress)
            }
          }

          set({
            currentModule: module,
            progress: moduleProgress,
            isLoading: false
          })
        } catch (error) {
          console.error('Failed to load module:', error)
          set({ isLoading: false })
        }
      },

      startQuest: (questId: string) => {
        const { currentModule } = get()
        if (!currentModule) return

        const quest = currentModule.quests.find(q => q.id === questId)
        if (!quest) return

        set({
          currentQuest: quest,
          currentStepIndex: 0
        })
      },

      completeStep: () => {
        const { currentQuest, currentStepIndex } = get()
        if (!currentQuest) return

        const nextStepIndex = currentStepIndex + 1

        if (nextStepIndex >= currentQuest.steps.length) {
          // Quest completed
          get().completeQuest()
        } else {
          set({ currentStepIndex: nextStepIndex })
        }
      },

      completeQuest: () => {
        const { currentQuest, progress, currentModule } = get()
        if (!currentQuest || !progress) return

        const updatedProgress = {
          ...progress,
          completedQuests: [...progress.completedQuests, currentQuest.id],
          totalXP: progress.totalXP + (currentQuest.reward.xp || 0),
          badges: currentQuest.reward.badge
            ? [...progress.badges, currentQuest.reward.badge]
            : progress.badges,
          lastPlayed: new Date().toISOString()
        }

        // 更新用户进度
        const currentUser = useUserStore.getState().currentUser
        if (currentUser) {
          useUserStore.getState().updateModuleProgress(progress.moduleId, updatedProgress)
        }

        // 检查模块是否全部完成，如果是则更新书籍进度
        if (currentModule && updatedProgress.completedQuests.length === currentModule.quests.length) {
          // 模块全部完成，更新书籍进度
          const bookStore = useBookStore.getState()
          const currentBookId = bookStore.currentBookId

          if (currentBookId) {
            // 检查模块是否属于当前书籍
            const belongsToCurrentBook = bookStore.currentBook?.chapters.some(chapter =>
              chapter.moduleIds.includes(progress.moduleId)
            )

            if (belongsToCurrentBook) {
              console.log('Module completed, updating book progress for book:', currentBookId)
              bookStore.completeModule(currentBookId, progress.moduleId, currentQuest.reward.xp || 0, 10) // 假设花费10分钟
            }
          }
        }

        const newState = {
          progress: updatedProgress,
          currentQuest: null,
          currentStepIndex: 0,
          showReward: true,
          currentReward: currentQuest.reward
        }

        set(newState)

        // 自动保存用户数据
        setTimeout(() => {
          const userStore = useUserStore.getState()
          if (userStore.currentUser) {
            get().saveUserData(userStore.currentUser.id)
          }
        }, 0)
      },

      updateProgress: (updates: Partial<Progress>) => {
        const { progress } = get()
        if (!progress) return

        const updatedProgress = { ...progress, ...updates, lastPlayed: new Date().toISOString() }

        // 更新用户进度
        const currentUser = useUserStore.getState().currentUser
        if (currentUser) {
          useUserStore.getState().updateModuleProgress(progress.moduleId, updatedProgress)
        }

        set({ progress: updatedProgress })
      },

      updateSettings: (settings: Partial<UserSettings>) => {
        const { progress } = get()
        if (!progress) return

        set({
          progress: {
            ...progress,
            settings: { ...progress.settings, ...settings },
            lastPlayed: new Date().toISOString()
          }
        })
      },

      setShowReward: (show: boolean, reward?: { badge?: string; xp: number }) => {
        set({
          showReward: show,
          currentReward: reward || null
        })
      },

      setCurrentStepIndex: (index: number) => {
        set({ currentStepIndex: index })
      },

      resetProgress: () => {
        const { currentModule } = get()
        if (!currentModule) return

        set({
          progress: {
            moduleId: currentModule.moduleId,
            completedQuests: [],
            totalXP: 0,
            badges: [],
            startDate: new Date().toISOString(),
            lastPlayed: new Date().toISOString(),
            settings: defaultSettings
          },
          currentQuest: null,
          currentStepIndex: 0,
          showReward: false,
          currentReward: null
        })
      },

      // 新增：用户切换时的数据同步
      syncOnUserSwitch: (userId: string) => {
        console.log(`🎮 GameStore: Syncing data for user ${userId}`)

        // 从用户专用的localStorage键加载数据
        const userSpecificKey = `quest-g6-storage-${userId}`
        const storedData = localStorage.getItem(userSpecificKey)

        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData)
            set({
              progress: parsedData.state?.progress || null,
              currentQuest: null,
              currentStepIndex: 0,
              showReward: false,
              currentReward: null
            })
            console.log(`✅ GameStore: Loaded data for user ${userId}`)
          } catch (error) {
            console.error(`❌ GameStore: Failed to load data for user ${userId}:`, error)
            // 加载失败时使用默认数据
            set({
              progress: null,
              currentQuest: null,
              currentStepIndex: 0,
              showReward: false,
              currentReward: null
            })
          }
        } else {
          // 没有存储数据时使用默认数据
          set({
            progress: null,
            currentQuest: null,
            currentStepIndex: 0,
            showReward: false,
            currentReward: null
          })
          console.log(`✅ GameStore: Using default data for new user ${userId}`)
        }
      },

      // 新增：保存用户数据到专用键
      saveUserData: (userId: string) => {
        const state = get()
        const userSpecificKey = `quest-g6-storage-${userId}`
        const dataToSave = {
          state: {
            progress: state.progress
          }
        }
        localStorage.setItem(userSpecificKey, JSON.stringify(dataToSave))
        console.log(`💾 GameStore: Saved data for user ${userId}`)
      }
    }),
    {
      name: 'quest-g6-storage',
      partialize: (state) => ({
        progress: state.progress,
        // Don't persist currentModule, currentQuest, etc.
      })
    }
  )
)