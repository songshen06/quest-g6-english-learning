import React, { useState } from 'react'
import { QuestStep } from '@/types'

interface EnToZhStepProps {
  step: QuestStep
  onComplete: () => void
}

export const EnToZhStep: React.FC<EnToZhStepProps> = ({ step, onComplete }) => {
  const [selectedOrder, setSelectedOrder] = useState<string[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const english = step.english || ''
  const scrambledChinese = step.scrambledChinese || []
  const correctChinese = step.correctChinese || []

  const handleWordClick = (word: string) => {
    if (selectedOrder.includes(word)) {
      // Remove word from selected order
      setSelectedOrder(prev => prev.filter(w => w !== word))
    } else {
      // Add word to selected order
      setSelectedOrder(prev => [...prev, word])
    }
  }

  const checkAnswer = () => {
    const correct = selectedOrder.length === correctChinese.length &&
                   selectedOrder.every((word, index) => word === correctChinese[index])

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

  const getWordStatus = (word: string) => {
    const isSelected = selectedOrder.includes(word)
    const selectedIndex = selectedOrder.indexOf(word)

    if (isSelected && showFeedback && isCorrect) {
      return 'correct'
    }
    if (isSelected && showFeedback && !isCorrect) {
      const correctIndex = correctChinese.indexOf(word)
      return selectedIndex === correctIndex ? 'correct' : 'incorrect'
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
          <h3 className="text-lg font-semibold text-gray-700 mb-4">英语句子：</h3>
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
            {scrambledChinese.map((word, index) => {
              const status = getWordStatus(word)

              return (
                <button
                  key={`word-${index}`}
                  onClick={() => handleWordClick(word)}
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
                      #{selectedOrder.indexOf(word) + 1}
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
                {selectedOrder.join('')}
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