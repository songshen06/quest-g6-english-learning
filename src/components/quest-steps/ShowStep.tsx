import React, { useState, useEffect } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { QuestStep } from '@/types'
import { useTranslation } from '@/hooks/useTranslation'

interface ShowStepProps {
  step: QuestStep
  onComplete: () => void
}

export const ShowStep: React.FC<ShowStepProps> = ({ step, onComplete }) => {
  const { t } = useTranslation()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    // Auto-advance after 3 seconds for simple show steps
    const timer = setTimeout(() => {
      onComplete()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="quest-step text-center">
      <h3 className="text-2xl font-bold text-gray-900 mb-8">
        {step.text}
      </h3>

      <div className="mb-8">
        {step.image ? (
          <div className="relative inline-block">
            {!imageLoaded && !imageError && (
              <div className="w-64 h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="animate-pulse">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              </div>
            )}

            {!imageError ? (
              <img
                src={step.image}
                alt={step.text}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className={`max-w-full max-h-64 rounded-xl shadow-lg ${
                  imageLoaded ? 'block' : 'hidden'
                }`}
              />
            ) : (
              <div className="w-64 h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400" />
                <p className="text-gray-500 mt-4">Image not available</p>
              </div>
            )}
          </div>
        ) : (
          <div className="w-64 h-64 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}

        <div className="mt-6">
          <p className="text-gray-500 text-lg">
            {t('common.loading')}...
          </p>
        </div>
      </div>
    </div>
  )
}