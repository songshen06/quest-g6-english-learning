import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Clock, Star, ChevronRight } from 'lucide-react'
import { Navigation } from '@/components/Navigation'
import { useGameStore } from '@/store/useGameStore'
import { useUserStore } from '@/store/useUserStore'

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
  module10TravelSafety
} from '@/content'

const allModulesData = [
  module01HowLong,
  module02ChinatownTombs,
  module03StampsHobbies,
  module04Festivals,
  module05PenFriends,
  module06SchoolAnswers,
  module07Animals,
  module08HabitsTidy,
  module09PeaceUN,
  module10TravelSafety
]

// Debug: Log raw module data
console.log('Raw module data:', allModulesData)

export const ModulesPage: React.FC = () => {
  const navigate = useNavigate()
  const { progress } = useGameStore()
  const { getModuleProgress } = useUserStore()

  // Function to extract module metadata from JSON data
  const extractModuleMetadata = (moduleData: any, index: number) => {
    const moduleNumber = String(index + 1).padStart(2, '0')
    const moduleId = moduleData.moduleId
    const title = moduleData.title
    const duration = `${moduleData.durationMinutes} minutes`

    // Extract topics from words and phrases
    const topics: string[] = []
    if (moduleData.words && moduleData.words.length > 0) {
      const sampleWords = moduleData.words.slice(0, 3).map((w: any) => w.en)
      topics.push(...sampleWords)
    }

    // Determine icon based on module content
    const iconMap: { [key: string]: string } = {
      'grade6-upper-mod-01': '📏', // How long - measurement
      'grade6-upper-mod-02': '🏮', // Chinatown and Tombs - Chinese culture
      'grade6-upper-mod-03': '📧', // Stamps and Hobbies - communication
      'grade6-upper-mod-04': '🎉', // Festivals - celebration
      'grade6-upper-mod-05': '✏️', // Pen Friends - writing
      'grade6-upper-mod-06': '🏫', // School - education
      'grade6-upper-mod-07': '🐾', // Animals - nature
      'grade6-upper-mod-08': '🧹', // Habits - daily life
      'grade6-upper-mod-09': '🕊️', // Peace - harmony
      'grade6-upper-mod-10': '✈️'  // Travel Safety - journey
    }

    // Generate description based on content
    let description = 'Learn and practice English'
    if (moduleData.words && moduleData.words.length > 0) {
      const firstWord = moduleData.words[0].en
      description = `Learn vocabulary including "${firstWord}" and more`
    }

    // Calculate progress based on completed quests from user data
    const totalQuests = moduleData.quests ? moduleData.quests.length : 1
    const moduleProgress = getModuleProgress(moduleId)
    const progressValue = moduleProgress ? (moduleProgress.completedQuests.length / totalQuests) * 100 : 0
    const totalXP = moduleProgress?.totalXP || 0

    return {
      id: moduleNumber,
      moduleId,
      title,
      description,
      duration,
      difficulty: 'Beginner',
      topics,
      icon: iconMap[moduleId] || '📚',
      progress: progressValue,
      totalXP
    }
  }

  // Generate available modules from JSON data
  const availableModules = allModulesData.map((moduleData, index) => extractModuleMetadata(moduleData, index))

  // Debug: Log the modules to console
  console.log('Available modules:', availableModules)
  console.log('Number of modules:', availableModules.length)

  // Fallback: If no modules loaded, show a simple test module
  if (availableModules.length === 0) {
    console.log('No modules loaded, showing fallback data')
    const fallbackModules = [
      {
        id: '01',
        moduleId: 'grade6-upper-mod-01',
        title: 'Test Module',
        description: 'This is a test module to verify the page renders correctly',
        duration: '5 minutes',
        difficulty: 'Beginner' as const,
        topics: ['Test', 'Fallback'],
        icon: '🧪',
        progress: 0
      }
    ]
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="safe-top bg-white shadow-sm">
          <div className="max-w-md mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Learning Modules (Fallback)</h1>
            <p className="text-gray-600 mt-2">Fallback mode - showing test data</p>
          </div>
        </header>
        <main className="flex-1 max-w-md mx-auto w-full px-4 py-8 space-y-4">
          {fallbackModules.map((module) => (
            <div
              key={module.moduleId}
              onClick={() => handleSelectModule(module.moduleId)}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{module.icon}</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{module.title}</h2>
                    <p className="text-sm text-gray-500">{module.difficulty} • {module.duration}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">{module.description}</p>
            </div>
          ))}
        </main>
        <Navigation />
      </div>
    )
  }

  const handleSelectModule = (moduleId: string) => {
    console.log('Navigating to module:', moduleId)
    navigate(`/module/${moduleId}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="safe-top bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Learning Modules
          </h1>
          <p className="text-gray-600 mt-2">
            Choose a module to start your learning adventure
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-8 space-y-4">
        {availableModules.map((module) => (
          <div
            key={module.moduleId}
            onClick={() => handleSelectModule(module.moduleId)}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{module.icon}</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {module.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {module.difficulty} • {module.duration}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <p className="text-gray-600 mb-4">
              {module.description}
            </p>

            {/* Topics */}
            <div className="flex flex-wrap gap-2 mb-4">
              {module.topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium text-primary-600">
                  {Math.round(module.progress)}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${module.progress}%` }}
                />
              </div>
            </div>

            {/* Status */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {module.progress === 100 ? 'Completed' : module.progress > 0 ? 'In Progress' : 'Not Started'}
                </span>
              </div>
              {module.progress > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {module.totalXP} XP
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Empty State for Future */}
        {availableModules.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No modules available yet
            </h3>
            <p className="text-gray-500">
              New learning modules will be added soon!
            </p>
          </div>
        )}
      </main>

      {/* Navigation */}
      <Navigation />
    </div>
  )
}