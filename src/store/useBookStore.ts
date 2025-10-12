import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Book, BookProgress, Chapter, UserBookProgress } from '@/types/books'
import { booksData, getActiveBooks, getNextRecommendedBook } from '@/data/books'
import { moduleData as contentModuleData } from '@/content'
import { useUserStore } from './useUserStore'

interface BookState {
  // 当前选中的书籍
  currentBookId: string | null
  currentBook: Book | null

  // 用户书籍进度
  userBookProgress: UserBookProgress

  // 书籍数据
  allBooks: Book[]
  activeBooks: Book[]
  availableBooks: Book[]

  // Actions
  setCurrentBook: (bookId: string) => void
  unlockBook: (bookId: string) => void
  updateBookProgress: (bookId: string, progress: Partial<BookProgress>) => void
  completeModule: (bookId: string, moduleId: string, xp: number, timeSpent: number) => void
  completeChapter: (bookId: string, chapterId: string) => void
  getUserBookProgress: (bookId: string) => BookProgress | null
  isBookUnlocked: (bookId: string) => boolean
  canAccessModule: (moduleId: string) => boolean
  getChapterProgress: (bookId: string, chapterId: string) => { completed: boolean; progress: number }
  getBookProgress: (bookId: string) => { completedModules: number; totalModules: number; progress: number }
  // 新增：用户切换时的数据同步
  syncOnUserSwitch: (userId: string) => void
  saveUserData: (userId: string) => void
}

const createDefaultBookProgress = (bookId: string): BookProgress => ({
  bookId,
  completedModules: [],
  completedChapters: [],
  totalXP: 0,
  timeSpent: 0,
  lastAccessed: new Date().toISOString()
})

const createDefaultUserBookProgress = (): UserBookProgress => ({
  bookProgress: {},
  currentBookId: 'grade6-upper', // 默认六年级上册
  unlockedBooks: [
    'grade1-upper', 'grade1-lower',
    'grade2-upper', 'grade2-lower',
    'grade3-upper', 'grade3-lower',
    'grade4-upper', 'grade4-lower',
    'grade5-upper', 'grade5-lower',
    'grade6-upper', 'grade6-lower'
  ] // 解锁所有书籍
})

export const useBookStore = create<BookState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentBookId: 'grade6-upper',
      currentBook: booksData.find(book => book.id === 'grade6-upper') || null,

      userBookProgress: createDefaultUserBookProgress(),

      allBooks: booksData,
      activeBooks: getActiveBooks(),
      availableBooks: booksData.filter(book => book.isActive),

      // Actions
      setCurrentBook: (bookId: string) => {
        const book = booksData.find(b => b.id === bookId)
        if (book) {
          set(state => ({
            currentBookId: bookId,
            currentBook: book,
            userBookProgress: {
              ...state.userBookProgress,
              currentBookId: bookId
            }
          }))
        }
      },

      unlockBook: (bookId: string) => {
        set(state => ({
          userBookProgress: {
            ...state.userBookProgress,
            unlockedBooks: [...new Set([...state.userBookProgress.unlockedBooks, bookId])]
          }
        }))
      },

      updateBookProgress: (bookId: string, progressUpdates: Partial<BookProgress>) => {
        set(state => {
          const currentProgress = state.userBookProgress.bookProgress[bookId] ||
                               createDefaultBookProgress(bookId)

          const updatedProgress = {
            ...currentProgress,
            ...progressUpdates,
            lastAccessed: new Date().toISOString()
          }

          const newState = {
            userBookProgress: {
              ...state.userBookProgress,
              bookProgress: {
                ...state.userBookProgress.bookProgress,
                [bookId]: updatedProgress
              }
            }
          }

          // 自动保存用户数据
          setTimeout(() => {
            const userStore = useUserStore.getState()
            if (userStore.currentUser) {
              get().saveUserData(userStore.currentUser.id)
            }
          }, 0)

          return newState
        })
      },

      completeModule: (bookId: string, moduleId: string, xp: number, timeSpent: number) => {
        set(state => {
          const currentProgress = state.userBookProgress.bookProgress[bookId] ||
                               createDefaultBookProgress(bookId)

          // 如果模块已完成，不重复添加
          if (currentProgress.completedModules.includes(moduleId)) {
            return state
          }

          const updatedProgress = {
            ...currentProgress,
            completedModules: [...currentProgress.completedModules, moduleId],
            totalXP: currentProgress.totalXP + xp,
            timeSpent: currentProgress.timeSpent + timeSpent,
            lastAccessed: new Date().toISOString()
          }

          const newState = {
            userBookProgress: {
              ...state.userBookProgress,
              bookProgress: {
                ...state.userBookProgress.bookProgress,
                [bookId]: updatedProgress
              }
            }
          }

          // 自动保存用户数据
          setTimeout(() => {
            const userStore = useUserStore.getState()
            if (userStore.currentUser) {
              get().saveUserData(userStore.currentUser.id)
            }
          }, 0)

          return newState
        })
      },

      completeChapter: (bookId: string, chapterId: string) => {
        set(state => {
          const currentProgress = state.userBookProgress.bookProgress[bookId] ||
                               createDefaultBookProgress(bookId)

          if (currentProgress.completedChapters.includes(chapterId)) {
            return state
          }

          const updatedProgress = {
            ...currentProgress,
            completedChapters: [...currentProgress.completedChapters, chapterId],
            lastAccessed: new Date().toISOString()
          }

          return {
            userBookProgress: {
              ...state.userBookProgress,
              bookProgress: {
                ...state.userBookProgress.bookProgress,
                [bookId]: updatedProgress
              }
            }
          }
        })
      },

      getUserBookProgress: (bookId: string) => {
        const state = get()
        return state.userBookProgress.bookProgress[bookId] || null
      },

      isBookUnlocked: (bookId: string) => {
        const state = get()
        return state.userBookProgress.unlockedBooks.includes(bookId)
      },

      canAccessModule: (moduleId: string) => {
        const state = get()
        if (!state.currentBook) return false

        // 检查模块是否属于当前书籍
        const belongsToCurrentBook = state.currentBook.chapters.some(chapter =>
          chapter.moduleIds.includes(moduleId)
        )

        // 只要模块属于当前书籍就可以访问，不需要前置条件
        return belongsToCurrentBook
      },

      getChapterProgress: (bookId: string, chapterId: string) => {
        const state = get()
        const book = booksData.find(b => b.id === bookId)
        if (!book) return { completed: false, progress: 0 }

        const chapter = book.chapters.find(ch => ch.id === chapterId)
        if (!chapter) return { completed: false, progress: 0 }

        const progress = state.getUserBookProgress(bookId)
        if (!progress) return { completed: false, progress: 0 }

        const completedModules = chapter.moduleIds.filter(moduleId =>
          progress.completedModules.includes(moduleId)
        )

        const progressPercentage = chapter.moduleIds.length > 0
          ? (completedModules.length / chapter.moduleIds.length) * 100
          : 0

        return {
          completed: progress.completedChapters.includes(chapterId),
          progress: Math.round(progressPercentage)
        }
      },

      getBookProgress: (bookId: string) => {
        const state = get()
        const book = booksData.find(b => b.id === bookId)
        if (!book) return { completedModules: 0, totalModules: 0, progress: 0 }

        const progress = state.getUserBookProgress(bookId)
        if (!progress) return { completedModules: 0, totalModules: 0, progress: 0 }

        return {
          completedModules: progress.completedModules.length,
          totalModules: book.totalModules,
          progress: Math.round((progress.completedModules.length / book.totalModules) * 100)
        }
      },

      // 新增：用户切换时的数据同步
      syncOnUserSwitch: (userId: string) => {
        console.log(`📚 BookStore: Syncing data for user ${userId}`)

        // 从用户专用的localStorage键加载数据
        const userSpecificKey = `quest-g6-books-${userId}`
        const storedData = localStorage.getItem(userSpecificKey)

        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData)
            set(state => ({
              userBookProgress: parsedData.state?.userBookProgress || createDefaultUserBookProgress(),
              currentBookId: parsedData.state?.currentBookId || 'grade6-upper',
              currentBook: booksData.find(book => book.id === (parsedData.state?.currentBookId || 'grade6-upper')) || null
            }))
            console.log(`✅ BookStore: Loaded data for user ${userId}`)
          } catch (error) {
            console.error(`❌ BookStore: Failed to load data for user ${userId}:`, error)
            // 加载失败时使用默认数据
            set({
              userBookProgress: createDefaultUserBookProgress(),
              currentBookId: 'grade6-upper',
              currentBook: booksData.find(book => book.id === 'grade6-upper') || null
            })
          }
        } else {
          // 没有存储数据时使用默认数据
          set({
            userBookProgress: createDefaultUserBookProgress(),
            currentBookId: 'grade6-upper',
            currentBook: booksData.find(book => book.id === 'grade6-upper') || null
          })
          console.log(`✅ BookStore: Using default data for new user ${userId}`)
        }
      },

      // 新增：保存用户数据到专用键
      saveUserData: (userId: string) => {
        const state = get()
        const userSpecificKey = `quest-g6-books-${userId}`
        const dataToSave = {
          state: {
            userBookProgress: state.userBookProgress,
            currentBookId: state.currentBookId
          }
        }
        localStorage.setItem(userSpecificKey, JSON.stringify(dataToSave))
        console.log(`💾 BookStore: Saved data for user ${userId}`)
      }
    }),
    {
      name: 'quest-g6-books',
      partialize: (state) => ({
        userBookProgress: state.userBookProgress,
        currentBookId: state.currentBookId
      })
    }
  )
)

// 辅助函数：获取推荐书籍
export const getRecommendedBooks = (currentGrade: number, currentBookId?: string) => {
  const allBooks = booksData

  if (currentBookId) {
    const nextBook = getNextRecommendedBook(currentBookId)
    return nextBook ? [nextBook] : []
  }

  // 根据年级推荐
  return allBooks.filter(book =>
    book.grade === currentGrade &&
    book.isActive &&
    (book.semester === 'upper' || currentGrade === 1) // 新生从上册开始
  ).slice(0, 2)
}

// 辅助函数：检查书籍是否可以解锁
export const canUnlockBook = (bookId: string, userProgress: UserBookProgress) => {
  const book = booksData.find(b => b.id === bookId)
  if (!book || !book.isActive) return false

  // 如果已经解锁
  if (userProgress.unlockedBooks.includes(bookId)) return true

  // 如果是默认书籍
  if (bookId === 'grade6-upper') return true

  // 检查前置条件
  if (book.semester === 'lower') {
    // 下册需要完成上册
    const upperBookId = `grade${book.grade}-upper`
    const upperProgress = userProgress.bookProgress[upperBookId]
    return upperProgress && upperProgress.completedModules.length >= book.totalModules * 0.8
  }

  if (book.grade > 1) {
    // 需要完成前一年级
    const previousGrade = book.grade - 1
    const lowerBookId = `grade${previousGrade}-lower`
    const lowerProgress = userProgress.bookProgress[lowerBookId]
    return lowerProgress && lowerProgress.completedModules.length >= 6 // 至少完成6个模块
  }

  return false
}