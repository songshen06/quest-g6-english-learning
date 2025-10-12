import React from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { QuestStep } from '@/types'

interface FillBlankStepProps {
  step: QuestStep
  onComplete: () => void
}

export const FillBlankStep: React.FC<FillBlankStepProps> = ({ step, onComplete }) => {
  const [userAnswer, setUserAnswer] = React.useState('')
  const [showResult, setShowResult] = React.useState(false)
  const [isCorrect, setIsCorrect] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userAnswer.trim()) return

    const correctAnswer = Array.isArray(step.answer) ? step.answer[0] : step.answer
    const correct = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
    setIsCorrect(correct)
    setShowResult(true)

    // Auto-advance after showing result
    setTimeout(() => {
      onComplete()
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult) {
      handleSubmit(e as any)
    }
  }

  // Extract the blank part from the text
  const renderTextWithBlank = () => {
    const parts = step.text.split('______')
    return (
      <div className="text-xl text-gray-800 mb-6">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={showResult}
                className={`mx-2 px-3 py-1 border-2 rounded-lg text-center font-semibold ${
                  showResult
                    ? isCorrect
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-red-500 bg-red-50 text-red-800'
                    : 'border-primary-300 bg-white text-primary-800 focus:border-primary-500 focus:outline-none'
                }`}
                style={{ minWidth: '120px' }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    )
  }

  return (
    <div className="quest-step max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          填空练习
        </h2>

        {renderTextWithBlank()}

        {!showResult && (
          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={!userAnswer.trim()}
              className="btn btn-primary btn-lg px-8 py-3"
            >
              提交答案
            </button>
          </div>
        )}

        {showResult && (
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold ${
              isCorrect
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {isCorrect ? (
                <>
                  <CheckCircle className="w-6 h-6" />
                  <span>正确！</span>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6" />
                  <span>答案: {Array.isArray(step.answer) ? step.answer[0] : step.answer}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}