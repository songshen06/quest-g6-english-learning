import React, { useState, useEffect } from 'react'
import { Volume2, Play, RotateCcw } from 'lucide-react'
import { QuestStep } from '@/types'
import { useTranslation } from '@/hooks/useTranslation'
import { audioPlayer } from '@/utils/audioPlayer'
import { useGameStore } from '@/store/useGameStore'

interface ListenStepProps {
  step: QuestStep
  onComplete: () => void
}

export const ListenStep: React.FC<ListenStepProps> = ({ step, onComplete }) => {
  const { t } = useTranslation()
  const { progress } = useGameStore()
  const { soundEnabled } = progress?.settings || { soundEnabled: true }
  const [hasPlayed, setHasPlayed] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showText, setShowText] = useState(false)

  const handlePlayAudio = async () => {
    if (!soundEnabled || !step.audio) return

    setIsPlaying(true)
    setHasPlayed(true)

    try {
      await audioPlayer.play(step.audio)

      // Auto-advance after audio completes (with a small delay)
      setTimeout(() => {
        setIsPlaying(false)
        if (hasPlayed) {
          onComplete()
        }
      }, 1000)
    } catch (error) {
      console.error('Failed to play audio:', error)
      setIsPlaying(false)
    }
  }

  const handleReplay = async () => {
    await handlePlayAudio()
  }

  useEffect(() => {
    // Auto-play on mount if sound is enabled
    if (soundEnabled && step.audio) {
      handlePlayAudio()
    } else {
      // If no sound, show manual completion button
      setHasPlayed(true)
    }
  }, [])

  return (
    <div className="quest-step text-center">
      <div className="mb-8">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          {isPlaying ? (
            <div className="animate-pulse">
              <Volume2 className="w-10 h-10 text-primary-600" />
            </div>
          ) : (
            <Volume2 className="w-10 h-10 text-primary-600" />
          )}
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {t('quest.listenCarefully')}
        </h3>

        <div className="text-xl text-gray-700 mb-8 p-6 bg-white rounded-xl border-2 border-gray-200">
          {showText ? (
            <span>{step.text}</span>
          ) : (
            <span className="text-gray-400">{t('quest.transcriptHidden') || 'Transcript hidden'}</span>
          )}
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex justify-center gap-4">
            {hasPlayed && (
              <button
                onClick={onComplete}
                className="btn btn-adhd btn-primary"
              >
                {t('common.next')}
              </button>
            )}

            {step.audio && (
              <button
                onClick={handleReplay}
                disabled={!soundEnabled || isPlaying}
                title={!soundEnabled ? 'Sound is off. Enable it in Settings → Audio.' : ''}
                className={`btn btn-outline flex items-center gap-2 ${!soundEnabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {hasPlayed ? (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    {t('common.retry')}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    {t('common.play')}
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setShowText(prev => !prev)}
              className="btn btn-outline"
            >
              {showText ? (t('quest.hideText') || 'Hide text') : (t('quest.showText') || 'Show text')}
            </button>
          </div>

          {!soundEnabled && (
            <div className="text-sm text-gray-500">
              Sound is disabled. Turn it on in Settings → Audio.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}