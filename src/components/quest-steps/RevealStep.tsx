import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { QuestStep } from '@/types'
import { useTranslation } from '@/hooks/useTranslation'

interface RevealStepProps {
  step: QuestStep
  onComplete: () => void
}

export const RevealStep: React.FC<RevealStepProps> = ({ step, onComplete }) => {
  const { t } = useTranslation()
  const [isRevealed, setIsRevealed] = useState(false)

  const handleReveal = () => {
    setIsRevealed(true)
  }

  const handleContinue = () => {
    onComplete()
  }

  return (
    <div className="quest-step text-center">
      <h3 className="text-2xl font-bold text-gray-900 mb-8">
        {t('quest.listenCarefully')}
      </h3>

      <div className="mb-8">
        {!isRevealed ? (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <EyeOff className="w-10 h-10 text-gray-400" />
            </div>

            <div className="p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <p className="text-gray-500 text-lg mb-4">
                Ready to see the answer?
              </p>
              <button
                onClick={handleReveal}
                className="btn btn-primary btn-lg flex items-center gap-2 mx-auto"
              >
                <Eye className="w-5 h-5" />
                Reveal Answer
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Eye className="w-10 h-10 text-green-600" />
            </div>

            <div className="p-8 bg-green-50 rounded-xl border-2 border-green-200">
              <p className="text-2xl font-bold text-green-800 mb-4">
                Here's the answer:
              </p>
              <div className="text-2xl text-gray-900 font-medium">
                {step.text}
              </div>
            </div>

            <button
              onClick={handleContinue}
              className="btn btn-adhd btn-primary"
            >
              {t('common.next')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}