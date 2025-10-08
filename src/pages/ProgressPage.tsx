import React from 'react'
import { BarChart3, Calendar, Target, Award, Clock, TrendingUp } from 'lucide-react'
import { Navigation } from '@/components/Navigation'
import { useGameStore } from '@/store/useGameStore'
import { useUserStore } from '@/store/useUserStore'
import { useTranslation } from '@/hooks/useTranslation'

export const ProgressPage: React.FC = () => {
  const { t } = useTranslation()
  const { progress } = useGameStore()
  const { currentUser } = useUserStore()

  // 优先使用用户数据，如果没有则回退到游戏store数据
  const userProgress = currentUser ? {
    totalXP: currentUser.totalXP,
    badges: currentUser.totalBadges,
    completedQuests: Object.values(currentUser.moduleProgress)
      .flatMap(module => module.completedQuests),
    streakDays: currentUser.globalStats.streakDays,
    totalTimeSpent: currentUser.globalStats.totalTimeSpent,
    questsCompleted: currentUser.globalStats.questsCompleted
  } : progress

  const stats = [
    {
      icon: Target,
      label: t('progress.totalXP'),
      value: userProgress?.totalXP || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Award,
      label: t('progress.earnedBadges'),
      value: userProgress?.badges.length || 0,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: BarChart3,
      label: t('progress.completedQuests'),
      value: userProgress?.questsCompleted || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Calendar,
      label: t('progress.streak'),
      value: `${userProgress?.streakDays || 0} 天`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  const calculateAccuracy = () => {
    // This would be calculated from actual practice attempts
    return 85 // Example value
  }

  const calculateTimeSpent = () => {
    // This would be calculated from actual time tracking
    return 45 // Example in minutes
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="safe-top bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('progress.title')}
          </h1>
          <p className="text-gray-600 mt-2">
            Track your learning journey and celebrate your progress!
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Progress Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Learning Details
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium text-gray-900">Accuracy Rate</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {calculateAccuracy()}%
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-medium text-gray-900">{t('progress.timeSpent')}</span>
              </div>
              <span className="text-lg font-bold text-blue-600">
                {calculateTimeSpent()} min
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <span className="font-medium text-gray-900">Current Level</span>
              </div>
              <span className="text-lg font-bold text-purple-600">
                Level {Math.floor((userProgress?.totalXP || 0) / 50) + 1}
              </span>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Recent Badges
          </h2>

          {userProgress?.badges.length ? (
            <div className="grid grid-cols-4 gap-4">
              {userProgress.badges.slice(-8).map((badge, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center"
                >
                  <img
                    src={badge}
                    alt={`Badge ${index + 1}`}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const placeholder = target.nextElementSibling as HTMLElement
                      if (placeholder) placeholder.style.display = 'flex'
                    }}
                  />
                  <Award className="w-8 h-8 text-gray-400 hidden" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                Complete quests to earn your first badges!
              </p>
            </div>
          )}
        </div>

        {/* Motivational Message */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            Keep up the great work! 🌟
          </h3>
          <p className="text-blue-800">
            You're making excellent progress. Consistent practice is the key to mastering English!
          </p>
        </div>
      </main>

      {/* Navigation */}
      <Navigation />
    </div>
  )
}