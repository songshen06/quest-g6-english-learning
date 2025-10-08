import React, { useState } from 'react'
import { Check, X } from 'lucide-react'
import { QuestStep } from '@/types'
import { useTranslation } from '@/hooks/useTranslation'
import { soundManager } from '@/utils/audioPlayer'
import { useGameStore } from '@/store/useGameStore'

interface SelectStepProps {
  step: QuestStep
  onComplete: () => void
}

export const SelectStep: React.FC<SelectStepProps> = ({ step, onComplete }) => {
  const { t } = useTranslation()
  const { progress } = useGameStore()
  const { soundEnabled } = progress?.settings || { soundEnabled: true }
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const options = step.options || []
  const correctIndex = step.answerIndex ?? 0

  const handleSelectAnswer = (index: number) => {
    if (showResult) return

    setSelectedAnswer(index)
    setIsCorrect(index === correctIndex)
    setShowResult(true)

    // Play sound effect
    if (soundEnabled) {
      if (index === correctIndex) {
        soundManager.playCorrect()
      } else {
        soundManager.playWrong()
      }
    }

    // Auto-advance if correct, otherwise allow retry
    if (index === correctIndex) {
      setTimeout(() => {
        onComplete()
      }, 1500)
    }
  }

  const handleRetry = () => {
    setSelectedAnswer(null)
    setShowResult(false)
    setIsCorrect(false)
  }

  const getButtonClass = (index: number) => {
    const baseClass = "w-full p-6 text-left rounded-xl border-2 transition-all text-lg font-medium mb-4"

    if (!showResult) {
      return `${baseClass} border-gray-200 hover:border-primary-300 hover:bg-primary-50 cursor-pointer`
    }

    if (index === correctIndex) {
      return `${baseClass} border-green-500 bg-green-50 text-green-800`
    }

    if (index === selectedAnswer && !isCorrect) {
      return `${baseClass} border-red-500 bg-red-50 text-red-800`
    }

    return `${baseClass} border-gray-200 opacity-50`
  }

  return (
    <div className="quest-step">
      <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
        {step.text}
      </h3>

      <div className="space-y-4 mb-8">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelectAnswer(index)}
            disabled={showResult}
            className={getButtonClass(index)}
          >
            <div className="flex items-center justify-between">
              <span className="flex-1">{option}</span>

              {showResult && index === correctIndex && (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}

              {showResult && index === selectedAnswer && !isCorrect && (
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {showResult && !isCorrect && (
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">
            {t('common.tryAgain')}
          </p>
          <button
            onClick={handleRetry}
            className="btn btn-outline"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {showResult && isCorrect && (
        <div className="text-center">
          <p className="text-lg text-green-600 font-semibold">
            {t('common.excellent')}
          </p>
        </div>
      )}
    </div>
  )
}