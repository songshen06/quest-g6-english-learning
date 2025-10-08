import React, { useState } from 'react'
import { Mic, MicOff, Check } from 'lucide-react'
import { QuestStep } from '@/types'
import { useTranslation } from '@/hooks/useTranslation'
import { soundManager } from '@/utils/audioPlayer'
import { useGameStore } from '@/store/useGameStore'

interface SpeakStepProps {
  step: QuestStep
  onComplete: () => void
}

export const SpeakStep: React.FC<SpeakStepProps> = ({ step, onComplete }) => {
  const { t } = useTranslation()
  const { progress } = useGameStore()
  const { soundEnabled } = progress?.settings || { soundEnabled: true }
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleStartRecording = () => {
    setIsRecording(true)
    // In a real app, this would start actual recording
    // For now, simulate recording for 3 seconds
    setTimeout(() => {
      setIsRecording(false)
      setHasRecorded(true)
      setShowSuccess(true)

      if (soundEnabled) {
        soundManager.playCorrect()
      }

      // Auto-advance after showing success
      setTimeout(() => {
        onComplete()
      }, 1500)
    }, 3000)
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <div className="quest-step text-center">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          {t('quest.sayThis')}
        </h3>

        <div className="text-3xl font-bold text-primary-600 mb-8 p-8 bg-primary-50 rounded-xl border-2 border-primary-200">
          "{step.text}"
        </div>

        {!hasRecorded && (
          <div className="space-y-6">
            <button
              onClick={handleStartRecording}
              disabled={isRecording}
              className={`btn btn-adhd ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'btn-primary'
              } flex items-center gap-3 mx-auto`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-6 h-6" />
                  Recording...
                </>
              ) : (
                <>
                  <Mic className="w-6 h-6" />
                  {t('common.speak')}
                </>
              )}
            </button>

            <p className="text-gray-500 text-lg">
              Click the button and say the phrase clearly
            </p>
          </div>
        )}

        {showSuccess && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-xl text-green-600 font-semibold">
              Great job! Your pronunciation sounds good.
            </p>
          </div>
        )}

        {/* Always show skip option for accessibility */}
        <div className="mt-8">
          <button
            onClick={handleSkip}
            className="btn btn-outline"
          >
            {t('common.skip')}
          </button>
        </div>
      </div>
    </div>
  )
}