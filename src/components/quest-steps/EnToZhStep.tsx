import React, { useState, useEffect } from 'react'
import { QuestStep } from '@/types'
import { audioPlayer } from '@/utils/audioPlayer'

interface EnToZhStepProps {
  step: QuestStep
  onComplete: () => void
}

interface WordItem {
  id: string
  text: string
  index: number
}

export const EnToZhStep: React.FC<EnToZhStepProps> = ({ step, onComplete }) => {
  const [selectedOrder, setSelectedOrder] = useState<WordItem[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const english = step.english || ''
  const scrambledChinese = step.scrambledChinese || []
  const correctChinese = step.correctChinese || []

  // Create word items with unique IDs
  const wordItems: WordItem[] = scrambledChinese.map((word, index) => ({
    id: `word-${index}`,
    text: word,
    index
  }))

  // Reset state when step changes
  useEffect(() => {
    setSelectedOrder([])
    setShowFeedback(false)
    setIsCorrect(false)
  }, [step])

  const handlePlayAudio = async () => {
    if (step.audio) {
      try {
        setIsPlayingAudio(true)
        await audioPlayer.play(step.audio)
      } catch (error) {
        console.error('Failed to play audio:', error)
      } finally {
        setIsPlayingAudio(false)
      }
    }
  }

  const handleWordClick = (wordItem: WordItem) => {
    const isSelected = selectedOrder.some(item => item.id === wordItem.id)
    if (isSelected) {
      // Remove word from selected order
      setSelectedOrder(prev => prev.filter(item => item.id !== wordItem.id))
    } else {
      // Add word to selected order
      setSelectedOrder(prev => [...prev, wordItem])
    }
  }

  const checkAnswer = () => {
    const correct = selectedOrder.length === correctChinese.length &&
                   selectedOrder.every((wordItem, index) => wordItem.text === correctChinese[index])

    setIsCorrect(correct)
    setShowFeedback(true)

    setTimeout(() => {
      if (correct) {
        onComplete()
      }
    }, 2000)
  }

  const resetOrder = () => {
    setSelectedOrder([])
    setShowFeedback(false)
  }

  const getWordStatus = (wordItem: WordItem) => {
    const selectedItem = selectedOrder.find(item => item.id === wordItem.id)
    const isSelected = !!selectedItem
    const selectedIndex = selectedOrder.findIndex(item => item.id === wordItem.id)

    if (isSelected && showFeedback && isCorrect) {
      return 'correct'
    }
    if (isSelected && showFeedback && !isCorrect) {
      const correctIndex = correctChinese.findIndex((word, index) =>
        word === wordItem.text && index === selectedIndex
      )
      return correctIndex !== -1 ? 'correct' : 'incorrect'
    }

    return isSelected ? 'selected' : 'available'
  }

  return (
    <div className="quest-step">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {step.text || "将英语句子翻译成正确的中文顺序"}
        </h2>

        {/* English sentence */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">英语句子：</h3>
            {step.audio && (
              <button
                onClick={handlePlayAudio}
                disabled={isPlayingAudio}
                className="ml-3 p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="播放英文句子"
              >
                {isPlayingAudio ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>
            )}
          </div>
          <div className="bg-blue-50 p-6 rounded-lg max-w-3xl mx-auto">
            <p className="text-2xl font-medium text-blue-900">
              {english}
            </p>
          </div>
        </div>

        {showFeedback && (
          <div className={`mb-6 p-4 rounded-lg ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isCorrect ? (
              <p className="text-lg font-semibold">🎉 翻译正确！</p>
            ) : (
              <p className="text-lg font-semibold">❌ 翻译不正确，请重试</p>
            )}
          </div>
        )}

        {/* Scrambled Chinese words */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">点击中文词选择正确顺序：</h3>
          <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto">
            {wordItems.map((wordItem) => {
              const status = getWordStatus(wordItem)

              return (
                <button
                  key={wordItem.id}
                  onClick={() => handleWordClick(wordItem)}
                  disabled={status === 'correct'}
                  className={`px-4 py-3 rounded-lg border-2 font-medium text-lg transition-all ${
                    status === 'correct'
                      ? 'bg-green-100 border-green-300 text-green-800 cursor-not-allowed'
                      : status === 'incorrect'
                      ? 'bg-red-100 border-red-300 text-red-800'
                      : status === 'selected'
                      ? 'bg-blue-100 border-blue-400 text-blue-800'
                      : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {wordItem.text}
                  {status === 'selected' && (
                    <span className="ml-2 text-sm text-blue-600">
                      #{selectedOrder.findIndex(item => item.id === wordItem.id) + 1}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected translation display */}
        {selectedOrder.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">你的翻译：</h3>
            <div className="bg-gray-50 p-4 rounded-lg max-w-2xl mx-auto">
              <p className="text-xl font-medium">
                {selectedOrder.map(item => item.text).join('')}
              </p>
            </div>
          </div>
        )}

        {/* Correct translation display (show when incorrect) */}
        {showFeedback && !isCorrect && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">正确翻译：</h3>
            <div className="bg-green-50 p-4 rounded-lg max-w-2xl mx-auto">
              <p className="text-xl font-medium text-green-800">
                {correctChinese.join('')}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={checkAnswer}
            disabled={selectedOrder.length !== correctChinese.length}
            className={`btn btn-lg ${
              selectedOrder.length === correctChinese.length
                ? 'btn-primary'
                : 'btn-disabled'
            }`}
          >
            检查翻译 ({selectedOrder.length}/{correctChinese.length})
          </button>

          {selectedOrder.length > 0 && (
            <button
              onClick={resetOrder}
              className="btn btn-outline btn-lg ml-4"
            >
              清空选择
            </button>
          )}
        </div>
      </div>
    </div>
  )
}