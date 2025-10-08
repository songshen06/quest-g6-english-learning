// 书籍系统类型定义
export interface Book {
  id: string
  title: string
  subtitle: string
  grade: number // 1-6
  semester: 'upper' | 'lower' // 上册: upper, 下册: lower
  cover: string
  description: string
  totalModules: number
  difficulty: 'beginner' | 'elementary' | 'intermediate'
  tags: string[]
  isActive: boolean
  publishedAt: string
  chapters: Chapter[]
}

export interface Chapter {
  id: string
  bookId: string
  number: number // 章节号
  title: string
  description: string
  moduleIds: string[] // 该章节包含的模块ID
  estimatedMinutes: number
  isLocked: boolean
}

export interface BookProgress {
  bookId: string
  completedModules: string[]
  completedChapters: string[]
  currentModule?: string
  totalXP: number
  timeSpent: number
  lastAccessed: string
}

// 书籍配置
export interface BookConfig {
  books: Book[]
  defaultBookId: string
  currentBookId: string
}

// 扩展现有的 User 类型
export interface UserBookProgress {
  bookProgress: Record<string, BookProgress> // bookId -> BookProgress
  currentBookId: string | null
  unlockedBooks: string[] // 已解锁的书籍ID
}

// 模块映射到书籍
export interface ModuleBookMapping {
  moduleId: string
  bookId: string
  chapterId: string
  order: number // 在章节中的顺序
}