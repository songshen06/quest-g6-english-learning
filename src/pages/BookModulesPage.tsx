import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Clock, Star, ChevronRight, Book, ArrowLeft } from 'lucide-react'
import { Navigation } from '@/components/Navigation'
import { BookSelection } from '@/components/BookSelection'
import { useBookStore } from '@/store/useBookStore'
import { useUserStore } from '@/store/useUserStore'
import { useTranslation } from '@/hooks/useTranslation'

// Import from unified content management
import {
  module01HowLong,
  module02ChinatownTombs,
  module03StampsHobbies,
  module04Festivals,
  module05PenFriends,
  module06SchoolAnswers,
  module07Animals,
  module08HabitsTidy,
  module09PeaceUN,
  module10TravelSafety,
  grade5LowerModule01DriverPlayer,
  grade5LowerModule02TraditionalFood,
  grade5LowerModule03LibraryBorrow,
  grade5LowerModule04LettersSeasons,
  grade5LowerModule05ShoppingCarrying,
  grade5LowerModule06TravelPlans,
  grade5LowerModule07JobsTime,
  grade5LowerModule08MakeAKite,
  grade5LowerModule09TheatreHistory,
  grade5LowerModule10TravelPrep,
  grade6LowerModule01FuturePlans,
  grade6LowerModule02TravelDreams
} from '@/content'

const allModulesData = [
  grade5LowerModule01DriverPlayer,
  grade5LowerModule02TraditionalFood,
  grade5LowerModule03LibraryBorrow,
  grade5LowerModule04LettersSeasons,
  grade5LowerModule05ShoppingCarrying,
  grade5LowerModule06TravelPlans,
  grade5LowerModule07JobsTime,
  grade5LowerModule08MakeAKite,
  grade5LowerModule09TheatreHistory,
  grade5LowerModule10TravelPrep,
  module01HowLong,
  module02ChinatownTombs,
  module03StampsHobbies,
  module04Festivals,
  module05PenFriends,
  module06SchoolAnswers,
  module07Animals,
  module08HabitsTidy,
  module09PeaceUN,
  module10TravelSafety,
  grade6LowerModule01FuturePlans,
  grade6LowerModule02TravelDreams
]

export const BookModulesPage: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [showBookSelection, setShowBookSelection] = useState(false)

  const {
    currentBook,
    currentBookId,
    getUserBookProgress,
    getBookProgress,
    getChapterProgress,
    canAccessModule,
    syncCompletedModules
  } = useBookStore()

  const { currentUser } = useUserStore()

  
  // 如果没有当前书籍，显示书籍选择
  if (!currentBook) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <header className="safe-top bg-white shadow-sm">
          <div className="max-w-md mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">{t('nav.modules')}</h1>
            <p className="text-gray-600 mt-2">选择要学习的书籍</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-md mx-auto w-full px-4 py-8">
          <BookSelection />
        </main>

        <Navigation />
      </div>
    )
  }

  // 创建模块映射以便快速查找
  const moduleMap = new Map()
  allModulesData.forEach(m => {
    // 存储原始moduleId
    moduleMap.set(m.moduleId, m)
    // 存储短格式moduleId (mod-01)
    const shortId = m.moduleId.replace(/^grade\d+-[a-z]+-mod-/, '')
    moduleMap.set(shortId, m)
  })

  // 获取当前书籍的模块数据
  const currentBookModules = currentBook.chapters.flatMap(chapter =>
    chapter.moduleIds.map(moduleId => {
      // 尝试多种匹配方式
      let moduleData = moduleMap.get(moduleId) // 直接匹配

      // 如果直接匹配失败，尝试匹配短格式
      if (!moduleData) {
        const shortId = moduleId.replace(/^grade\d+-[a-z]+-/, '')
        moduleData = allModulesData.find(m => m.moduleId === shortId)
      }

      console.log(`Finding module ${moduleId}:`, moduleData ? 'Found' : 'Not found')
      return moduleData ? { ...moduleData, chapterId: chapter.id, chapter } : null
    }).filter(Boolean)
  )

  console.log('Current book:', currentBook.title)
  console.log('Current book chapters:', currentBook.chapters.length)
  console.log('Available modules in system:', allModulesData.length)
  console.log('Current book modules:', currentBookModules.length, 'modules found')

  const bookProgress = getBookProgress(currentBookId!)
  const userBookProgress = getUserBookProgress(currentBookId!)

  
  const handleModuleClick = (moduleId: string) => {
    console.log('Module clicked:', moduleId, 'Can access:', canAccessModule(moduleId))
    if (canAccessModule(moduleId)) {
      console.log('Navigating to:', `/module/${moduleId}`)
      navigate(`/module/${moduleId}`)
    } else {
      console.log('Module access denied:', moduleId)
    }
  }

  const handleBookSwitch = () => {
    setShowBookSelection(true)
  }

  if (showBookSelection) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <header className="safe-top bg-white shadow-sm">
          <div className="max-w-md mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBookSelection(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">选择书籍</h1>
                <p className="text-gray-600 mt-1">切换到其他教材</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-md mx-auto w-full px-4 py-8">
          <BookSelection onClose={() => setShowBookSelection(false)} />
        </main>

        <Navigation />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="safe-top bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{currentBook.title}</h1>
              <p className="text-gray-600 mt-1">{currentBook.subtitle}</p>
            </div>
            <button
              onClick={handleBookSwitch}
              className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
              title="切换书籍"
            >
              <Book className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* 进度概览 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">学习进度</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {bookProgress.progress}%
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  已完成 {bookProgress.completedModules} / {bookProgress.totalModules} 个单元
                </p>
              </div>
              <div className="text-4xl">
                {bookProgress.progress === 100 ? '🏆' :
                 bookProgress.progress >= 75 ? '⭐' :
                 bookProgress.progress >= 50 ? '🌟' :
                 bookProgress.progress >= 25 ? '✨' : '📚'}
              </div>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${bookProgress.progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-8 space-y-6">
        {/* 按章节分组显示模块 */}
        {currentBook.chapters.map(chapter => {
          const chapterModules = chapter.moduleIds.map(moduleId => {
            // 使用智能查找逻辑
            let moduleData = moduleMap.get(moduleId) // 直接匹配

            // 如果直接匹配失败，尝试匹配短格式
            if (!moduleData) {
              const shortId = moduleId.replace(/^grade\d+-[a-z]+-/, '')
              moduleData = allModulesData.find(m => m.moduleId === shortId)
            }

            console.log(`Chapter ${chapter.id} - Module ${moduleId}:`, moduleData ? 'Found' : 'Not found')
            const progress = getChapterProgress(currentBookId!, chapter.id)
            // 重要：保持原始的 moduleId（来自书籍数据），而不是 moduleData.moduleId
            return moduleData ? { ...moduleData, originalModuleId: moduleId, chapterProgress: progress } : null
          }).filter(Boolean)

          const chapterProgress = getChapterProgress(currentBookId!, chapter.id)

          if (chapterModules.length === 0) return null

          return (
            <div key={chapter.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* 章节标题 */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{chapter.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{chapter.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {chapterProgress.progress}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {chapterProgress.completed ? '已完成' : '进行中'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 模块列表 */}
              <div className="divide-y divide-gray-100">
                {chapterModules.map((moduleData: any, index) => {
                  const isCompleted = userBookProgress?.completedModules.includes(moduleData.originalModuleId)
                  const canAccess = canAccessModule(moduleData.originalModuleId)

  
                  return (
                    <div
                      key={moduleData.originalModuleId}
                      onClick={() => handleModuleClick(moduleData.originalModuleId)}
                      className={`
                        p-4 flex items-center justify-between transition-colors
                        ${canAccess ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-60 cursor-not-allowed'}
                        ${isCompleted ? 'bg-green-50' : ''}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold
                          ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}
                        `}>
                          {isCompleted ? '✓' : index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {moduleData.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {moduleData.durationMinutes} 分钟
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isCompleted && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            已完成
                          </span>
                        )}
                        {!canAccess && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            需要完成前置内容
                          </span>
                        )}
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* 学习建议 */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            💡 学习建议
          </h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• 建议按章节顺序学习，循序渐进</li>
            <li>• 每个单元完成后会有小测验，确保掌握知识点</li>
            <li>• 完成整个章节后可以获得额外奖励</li>
            <li>• 每天坚持学习15-30分钟效果最佳</li>
          </ul>
        </div>
      </main>

      {/* Navigation */}
      <Navigation />
    </div>
  )
}