import React from 'react'
import { X, Star, Trophy, Sparkles } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { useTranslation } from '@/hooks/useTranslation'
import { soundManager } from '@/utils/audioPlayer'
import { useNavigate } from 'react-router-dom'

export const RewardModal: React.FC = () => {
  const { t } = useTranslation()
  const { showReward, currentReward, setShowReward, progress, currentModule } = useGameStore()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (showReward && progress?.settings.soundEnabled) {
      soundManager.playComplete()
    }
  }, [showReward, progress?.settings.soundEnabled])

  const handleClose = () => {
    setShowReward(false)
  }

  const handleCollect = () => {
    setShowReward(false)
    // Navigate to module page with quests tab
    if (currentModule) {
      navigate(`/module/${currentModule.moduleId}?tab=quests`)
    }
  }

  if (!showReward || !currentReward) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 relative animate-bounce-in">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center">
          {/* Celebration Icons */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                <Trophy className="w-10 h-10 text-yellow-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('quest.questComplete')}!
          </h2>

          <p className="text-lg text-gray-600 mb-8">
            {t('common.excellent')} {t('quest.wellDone')}
          </p>

          {/* Reward Details */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-600" />
              <span className="text-lg font-semibold text-gray-900">
                {t('quest.rewardEarned')}
              </span>
              <Sparkles className="w-6 h-6 text-yellow-600" />
            </div>

            <div className="flex items-center justify-center gap-8">
              {/* XP Reward */}
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  +{currentReward.xp}
                </div>
                <div className="text-sm text-gray-600">{t('common.xp')}</div>
              </div>

              {/* Badge Reward */}
              {currentReward.badge && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <img
                      src={currentReward.badge}
                      alt="Badge"
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const placeholder = target.nextElementSibling as HTMLElement
                        if (placeholder) placeholder.style.display = 'flex'
                      }}
                    />
                    <Trophy className="w-8 h-8 text-yellow-600 hidden" />
                  </div>
                  <div className="text-sm text-gray-600 mt-2">Badge</div>
                </div>
              )}
            </div>
          </div>

          {/* Collect Button */}
          <button
            onClick={handleCollect}
            className="btn btn-adhd btn-primary w-full"
          >
            Continue to Next Quest 🎉
          </button>

          {/* Continue Text */}
          <p className="text-sm text-gray-500 mt-4">
            Click to continue to next quest
          </p>
        </div>
      </div>
    </div>
  )
}