import React from 'react'
import { Volume2, ImageIcon } from 'lucide-react'
import { Phrase } from '@/types'
import { useTranslation } from '@/hooks/useTranslation'
import { audioPlayer } from '@/utils/audioPlayer'
import { useGameStore } from '@/store/useGameStore'

interface PhraseCardProps {
  phrase: Phrase
  showTranslation?: boolean
  showIcon?: boolean
  className?: string
  onClick?: () => void
}

export const PhraseCard: React.FC<PhraseCardProps> = ({
  phrase,
  showTranslation = true,
  showIcon = true,
  className = '',
  onClick
}) => {
  const { t, showBothLanguages } = useTranslation()
  const { progress } = useGameStore()
  const { soundEnabled } = progress?.settings || { soundEnabled: true }

  const handlePlayAudio = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!soundEnabled || !phrase.audio) return

    try {
      await audioPlayer.play(phrase.audio)
    } catch (error) {
      console.error('Failed to play audio for phrase:', phrase.en)
      console.error('Audio path:', phrase.audio)

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          console.warn('Please interact with the page first to enable audio playback.')
        } else if (error.name === 'NotSupportedError') {
          console.error('Audio format not supported by browser.')
        } else if (error.name === 'NotFoundError') {
          console.error('Audio file not found. Check file path:', phrase.audio)
        }
      }
    }
  }

  const shouldShowTranslation = showTranslation || showBothLanguages

  return (
    <div
      onClick={onClick}
      className={`skill-card bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 hover:border-blue-300 ${shouldShowTranslation ? 'p-focus' : 'p-6'} ${className} cursor-pointer group`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {showIcon && phrase.icon && (
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <img
                  src={phrase.icon}
                  alt={phrase.en}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const placeholder = target.nextElementSibling as HTMLElement
                    if (placeholder) placeholder.style.display = 'flex'
                  }}
                />
                <ImageIcon className="w-6 h-6 text-gray-400 hidden" />
              </div>
            )}
            <div className="text-xl font-semibold text-gray-900 leading-tight">
              {phrase.en}
            </div>
          </div>

          {shouldShowTranslation && (
            <div className="text-lg text-gray-600 secondary-info ml-15">
              {phrase.zh}
            </div>
          )}
        </div>

        {phrase.audio && soundEnabled && (
          <button
            onClick={handlePlayAudio}
            className="ml-4 p-3 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
            aria-label={t('common.listen')}
          >
            <Volume2 className="w-5 h-5 text-blue-600" />
          </button>
        )}
      </div>
    </div>
  )
}