import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Clock, Star, Lock, CheckCircle } from 'lucide-react'
import { WordCard } from '@/components/WordCard'
import { PhraseCard } from '@/components/PhraseCard'
import { PatternCard } from '@/components/PatternCard'
import { Navigation } from '@/components/Navigation'
import { useGameStore } from '@/store/useGameStore'
import { useTranslation } from '@/hooks/useTranslation'
import { Module } from '@/types'

// Import from unified content management
import { moduleData } from '@/content'

export const ModulePage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { progress, loadModule } = useGameStore()
  const { t } = useTranslation()
  const [currentModuleData, setCurrentModuleData] = useState<Module | null>(null)
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'phrases' | 'patterns' | 'quests'>('vocabulary')

  useEffect(() => {
    if (moduleId) {
      const module = moduleData[moduleId]

      if (module) {
        console.log('Module loaded:', module)
        setCurrentModuleData(module)
        loadModule(module)
      } else {
        console.error('Module not found:', moduleId)
        navigate('/modules')
      }
    }
  }, [moduleId, loadModule, navigate])

  // Handle URL tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['vocabulary', 'phrases', 'patterns', 'quests'].includes(tabParam)) {
      setActiveTab(tabParam as 'vocabulary' | 'phrases' | 'patterns' | 'quests')
    }
  }, [searchParams])

  if (!currentModuleData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-lg">{t('common.loading')}...</p>
        </div>
      </div>
    )
  }

  const completedQuests = progress?.completedQuests || []
  const isQuestCompleted = (questId: string) => completedQuests.includes(questId)
  const questProgress = (currentModuleData.quests.filter(q => isQuestCompleted(q.id)).length / currentModuleData.quests.length) * 100

  const handleStartQuest = (questId: string) => {
    console.log('Starting quest:', questId)
    // 导航到任务页面，使用完整的moduleId
    navigate(`/quest/${moduleId}/${questId}`)
  }

  const handleStartFirstQuest = () => {
    console.log('Starting first quest')
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vocabulary':
        return (
          <div className="space-y-4">
            {currentModuleData.words && currentModuleData.words.length > 0 ? (
              currentModuleData.words.map((word, index) => (
                <WordCard key={index} word={word} />
              ))
            ) : (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center">
                <p className="text-gray-500">暂无词汇内容</p>
              </div>
            )}
          </div>
        )
      case 'phrases':
        return (
          <div className="space-y-4">
            {currentModuleData.phrases && currentModuleData.phrases.length > 0 ? (
              currentModuleData.phrases.map((phrase, index) => (
                <PhraseCard key={index} phrase={phrase} />
              ))
            ) : (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center">
                <p className="text-gray-500">暂无短语内容</p>
              </div>
            )}
          </div>
        )
      case 'patterns':
        return (
          <div className="space-y-4">
            {currentModuleData.patterns && currentModuleData.patterns.length > 0 ? (
              currentModuleData.patterns.map((pattern, index) => (
                <PatternCard key={index} pattern={pattern} index={index} />
              ))
            ) : (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center">
                <p className="text-gray-500">暂无句型内容</p>
              </div>
            )}
          </div>
        )
      case 'quests':
        return (
          <div className="space-y-4">
            {currentModuleData.quests.map((quest, index) => {
              const isCompleted = isQuestCompleted(quest.id)
              // Remove sequential quest locking - all quests are accessible for learning convenience
              const isLocked = false

              return (
                <div
                  key={quest.id}
                  className={`bg-white rounded-xl border-2 p-6 ${
                    isCompleted
                      ? 'border-green-300 bg-green-50'
                      : isLocked
                      ? 'border-gray-200 opacity-60'
                      : 'border-primary-300 hover:border-primary-400 cursor-pointer'
                  }`}
                  onClick={() => !isLocked && handleStartQuest(quest.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{quest.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{quest.steps[0]?.text || '练习任务'}</p>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-500">{quest.steps.length} 步骤</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-500">{quest.reward?.xp || 10} XP</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      {isCompleted ? (
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      ) : isLocked ? (
                        <Lock className="w-8 h-8 text-gray-400" />
                      ) : (
                        <button className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors">
                          开始
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/modules')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{currentModuleData.title}</h1>
            <p className="text-sm text-gray-600">Module Content</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-1 mb-6">
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: 'vocabulary', label: '词汇', icon: '📚' },
              { id: 'phrases', label: '短语', icon: '💬' },
              { id: 'patterns', label: '句型', icon: '🗣️' },
              { id: 'quests', label: '任务', icon: '🎯' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-2 rounded-lg transition-all duration-200 flex flex-col items-center justify-center space-y-1 ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </main>

      {/* Navigation */}
      <Navigation />
    </div>
  )
}

export default ModulePage