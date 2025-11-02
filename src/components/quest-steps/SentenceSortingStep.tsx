import React, { useState, useEffect } from 'react'
import { QuestStep } from '@/types'
import { getAssetPath } from '@/utils/assetPath'

interface SentenceSortingStepProps {
  step: QuestStep
  onComplete: () => void
}

export const SentenceSortingStep: React.FC<SentenceSortingStepProps> = ({ step, onComplete }) => {
  const [selectedOrder, setSelectedOrder] = useState<string[]>([])
  const [selectedWordIndexes, setSelectedWordIndexes] = useState<number[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false)

  const scrambled = step.scrambled || []
  const correct = step.correct || []

  // Reset state when step data changes
  useEffect(() => {
    setSelectedOrder([])
    setSelectedWordIndexes([])
    setShowFeedback(false)
    setIsCorrect(false)
    setHasPlayedAudio(false)
  }, [scrambled, correct])

  useEffect(() => {
    if (step.audio && !hasPlayedAudio) {
      // Auto-play audio when component loads
      const audio = new Audio(getAssetPath(step.audio))
      audio.play().catch(() => {
        // Auto-play was prevented, user will need to click play button
      })
      setHasPlayedAudio(true)
    }
  }, [step.audio, hasPlayedAudio])

  const handleWordClick = (word: string, index: number) => {
    const selectedIndex = selectedWordIndexes.indexOf(index)

    if (selectedIndex !== -1) {
      // Remove this specific word instance
      setSelectedOrder(prev => {
        const newOrder = [...prev]
        newOrder.splice(selectedIndex, 1)
        return newOrder
      })
      setSelectedWordIndexes(prev => {
        const newIndexes = [...prev]
        newIndexes.splice(selectedIndex, 1)
        return newIndexes
      })
    } else {
      // Add word to selected order
      setSelectedOrder(prev => [...prev, word])
      setSelectedWordIndexes(prev => [...prev, index])
    }
  }

  const playAudio = () => {
    if (step.audio) {
      const audio = new Audio(getAssetPath(step.audio))
      audio.play()
    }
  }

  const checkAnswer = () => {
    const isAnswerCorrect = selectedOrder.length === correct.length &&
                   selectedOrder.every((word, index) => word === correct[index])

    setIsCorrect(isAnswerCorrect)
    setShowFeedback(true)

    setTimeout(() => {
      if (isAnswerCorrect) {
        onComplete()
      }
    }, 2000)
  }

  const resetOrder = () => {
    setSelectedOrder([])
    setShowFeedback(false)
  }

  const getWordStatus = (word: string, wordIndex: number) => {
    // Check if this specific word instance is selected using the word index tracking
    const isSelected = selectedWordIndexes.includes(wordIndex)
    const selectedIndex = selectedWordIndexes.indexOf(wordIndex)

    if (isSelected && showFeedback && isCorrect) {
      return 'correct'
    }
    if (isSelected && showFeedback && !isCorrect) {
      // Find the correct position for this word instance
      let correctIndex = -1
      let wordCount = 0
      for (let i = 0; i < correct.length; i++) {
        if (correct[i] === word) {
          if (wordCount === wordIndex) {
            correctIndex = i
            break
          }
          wordCount++
        }
      }
      return selectedIndex === correctIndex ? 'correct' : 'incorrect'
    }

    return isSelected ? 'selected' : 'available'
  }

  return (
    <div className="quest-step">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {step.text || "听句子并按正确顺序排列单词"}
        </h2>

        {step.audio && (
          <button
            onClick={playAudio}
            className="mb-6 btn btn-outline btn-lg"
          >
            🔊 播放句子
          </button>
        )}

        {showFeedback && (
          <div className={`mb-6 p-6 rounded-lg border-2 ${
            isCorrect
              ? 'bg-green-100 text-green-800 border-green-300'
              : 'bg-red-100 text-red-800 border-red-300'
          }`}>
            {isCorrect ? (
              <div className="text-center">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-xl font-bold mb-2">完美！排序正确！</p>
                <p className="text-sm">准备进入下一个练习...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-3xl mb-2">🤔</div>
                <p className="text-lg font-semibold mb-2">顺序不正确，请重试</p>
                <p className="text-sm">仔细听音频，检查单词顺序</p>
              </div>
            )}
          </div>
        )}

        {/* Scrambled words */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">点击单词选择正确顺序：</h3>
          <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto">
            {scrambled.map((word, index) => {
              const status = getWordStatus(word, index)

              return (
                <button
                  key={`word-${index}`}
                  onClick={() => handleWordClick(word, index)}
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
                  {word}
                  {status === 'selected' && (
                    <span className="ml-2 text-sm text-blue-600">
                      #{selectedWordIndexes.indexOf(index) + 1}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected order display */}
        {selectedOrder.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">你的答案：</h3>
            <div className="bg-gray-50 p-4 rounded-lg max-w-2xl mx-auto">
              <p className="text-xl font-medium">
                {selectedOrder.join(' ')}
              </p>
            </div>
          </div>
        )}

        {/* Correct answer display (show when incorrect) */}
        {showFeedback && !isCorrect && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">正确答案：</h3>
            <div className="bg-green-50 p-4 rounded-lg max-w-2xl mx-auto">
              <p className="text-xl font-medium text-green-800">
                {correct.join(' ')}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={checkAnswer}
            disabled={selectedOrder.length !== correct.length}
            className={`btn btn-lg ${
              selectedOrder.length === correct.length
                ? 'btn-primary'
                : 'btn-disabled'
            }`}
          >
            检查答案 ({selectedOrder.length}/{correct.length})
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