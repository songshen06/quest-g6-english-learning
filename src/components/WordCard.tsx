import React from 'react'
import { Volume2 } from 'lucide-react'
import { Word } from '@/types'
import { useTranslation } from '@/hooks/useTranslation'
import { audioPlayer } from '@/utils/audioPlayer'
import { useGameStore } from '@/store/useGameStore'

interface WordCardProps {
  word: Word
  showTranslation?: boolean
  className?: string
  onClick?: () => void
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  showTranslation = true,
  className = '',
  onClick
}) => {
  const { t, showBothLanguages } = useTranslation()
  const { progress } = useGameStore()
  const { soundEnabled } = progress?.settings || { soundEnabled: true }

  const handlePlayAudio = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!soundEnabled || !word.audio) return

    try {
      await audioPlayer.play(word.audio)
    } catch (error) {
      console.error('Failed to play audio for word:', word.en)
      console.error('Audio path:', word.audio)

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          console.warn('Please interact with the page first to enable audio playback.')
        } else if (error.name === 'NotSupportedError') {
          console.error('Audio format not supported by browser.')
        } else if (error.name === 'NotFoundError') {
          console.error('Audio file not found. Check file path:', word.audio)
        }
      }
    }
  }

  const shouldShowTranslation = showTranslation || showBothLanguages

  return (
    <div
      onClick={onClick}
      className={`skill-card bg-white hover:bg-primary-50 border-2 hover:border-primary-300 ${shouldShowTranslation ? 'p-focus' : 'p-6'} ${className} cursor-pointer group`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {word.en}
          </div>

          {shouldShowTranslation && (
            <div className="text-lg text-gray-600 secondary-info">
              {word.zh}
            </div>
          )}
        </div>

        {word.audio && soundEnabled && (
          <button
            onClick={handlePlayAudio}
            className="ml-4 p-3 rounded-full bg-primary-100 hover:bg-primary-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={t('common.listen')}
          >
            <Volume2 className="w-5 h-5 text-primary-600" />
          </button>
        )}
      </div>
    </div>
  )
}