export interface Word {
  id: string
  en: string
  zh: string
  audio?: string
}

export interface Phrase {
  id: string
  en: string
  zh: string
  icon?: string
  audio?: string
}

export interface Pattern {
  q: string
  a: string
}

export interface QuestStep {
  type: 'listen' | 'select' | 'speak' | 'reveal' | 'show' | 'drag' | 'action' | 'fillblank' |
        'wordmatching' | 'sentencesorting' | 'entozh' | 'zhtoen' | string
  text: string
  audio?: string
  image?: string
  options?: string[] | {en: string, zh: string, audio?: string}[]
  answerIndex?: number
  answer?: string | string[]
  recordable?: boolean
  target?: string
  // Word matching properties
  pairs?: {en: string, zh: string, audio?: string}[]
  // Sentence sorting properties
  scrambled?: string[]
  correct?: string[]
  // Translation properties
  english?: string
  chinese?: string
  scrambledChinese?: string[]
  correctChinese?: string[]
  scrambledEnglish?: string[]
  correctEnglish?: string[]
}

export interface Quest {
  id: string
  title: string
  steps: QuestStep[]
  reward: {
    badge?: string
    xp: number
  }
}

export interface Practice {
  type: 'fillblank' | 'translate' | string
  text?: string
  answer?: string | string[]
  cn?: string
  en?: string[]
}

export interface Module {
  moduleId: string
  title: string
  durationMinutes: number
  words: Word[]
  phrases: Phrase[]
  patterns: Pattern[]
  quests: Quest[]
  practice: Practice[]
  funFacts: string[]
}

export interface Progress {
  moduleId: string
  completedQuests: string[]
  currentQuest?: string
  totalXP: number
  badges: string[]
  startDate: string
  lastPlayed: string
  settings: UserSettings
  questsCompleted?: number
  streakDays?: number
  totalTimeSpent?: number
}

export interface UserSettings {
  fontSize: 'normal' | 'large' | 'extra-large'
  theme: 'light' | 'dark' | 'high-contrast'
  soundEnabled: boolean
  musicEnabled: boolean
  animationsEnabled: boolean
  simplifiedMode: boolean
  lowStimulusMode: boolean
  language: 'en' | 'zh' | 'both'
}

export interface AudioPlayer {
  play: (src: string) => Promise<void>
  stop: () => void
  isPlaying: boolean
}

// User role types - simplified to student only
export type UserRole = 'student'

// User management types
export interface User {
  id: string
  username: string
  displayName: string
  avatar?: string
  role: UserRole
  passwordHash: string // 存储哈希后的密码
  salt: string // 随机盐值
  createdAt: string
  lastLogin: string
  settings: UserSettings
  moduleProgress: Record<string, Progress>
  totalXP: number
  totalBadges: string[]
  globalStats: {
    totalTimeSpent: number // 分钟
    questsCompleted: number
    streakDays: number
    lastStudyDate: string
    totalXP?: number
    badges?: string[]
  }
}

export interface UserState {
  // Authentication state
  currentUser: User | null
  users: User[]
  isLoggedIn: boolean

  // UI state
  showLoginModal: boolean
  showUserSwitcher: boolean
  showGuestConversion: boolean

  // Actions
  register: (username: string, password: string, displayName?: string) => Promise<boolean>
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  switchUser: (userId: string) => Promise<boolean>
  updateUser: (updates: Partial<User>) => void
  deleteUser: (userId: string) => Promise<boolean>
  updateGlobalStats: (stats: Partial<User['globalStats']>) => void
  getModuleProgress: (moduleId: string) => Progress | null
  updateModuleProgress: (moduleId: string, progress: Partial<Progress>) => void
  setShowLoginModal: (show: boolean) => void
  setShowUserSwitcher: (show: boolean) => void
  setShowGuestConversion: (show: boolean) => void
}