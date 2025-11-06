import React, { useEffect } from 'react'
import { ListenStep } from './quest-steps/ListenStep'
import { SelectStep } from './quest-steps/SelectStep'
import { SpeakStep } from './quest-steps/SpeakStep'
import { RevealStep } from './quest-steps/RevealStep'
import { ShowStep } from './quest-steps/ShowStep'
import { FillBlankStep } from './quest-steps/FillBlankStep'
import { WordMatchingStep } from './quest-steps/WordMatchingStep'
import { SentenceSortingStep } from './quest-steps/SentenceSortingStep'
import { EnToZhStep } from './quest-steps/EnToZhStep'
import { ZhToEnStep } from './quest-steps/ZhToEnStep'
import { Quest, QuestStep } from '@/types'
import { useTranslation } from '@/hooks/useTranslation'
import { useGameStore } from '@/store/useGameStore'

interface QuestRunnerProps {
  quest: Quest
  onQuestComplete?: () => void
}

export const QuestRunner: React.FC<QuestRunnerProps> = ({ quest, onQuestComplete }) => {
  const { t } = useTranslation()
  const { completeStep, completeQuest, currentStepIndex, setCurrentStepIndex } = useGameStore()

  const currentStep = quest.steps[currentStepIndex]

  const handleStepComplete = () => {
    // Check if this is the last step before completing it
    const isLastStep = currentStepIndex >= quest.steps.length - 1

    // Notify store of step completion
    completeStep()

    // Force a state update check after a brief delay to handle async issues
    setTimeout(() => {
      const { currentStepIndex: newIndex } = useGameStore.getState()

      // If step didn't advance and this isn't the last step, force the update
      if (newIndex === currentStepIndex && !isLastStep) {
        setCurrentStepIndex(currentStepIndex + 1)
      }
    }, 100)

    // Check if this was the last step
    if (isLastStep) {
      // Notify store of quest completion
      completeQuest()
      onQuestComplete?.()
    }
  }

  const renderStep = (step: QuestStep) => {
    const stepProps = {
      step,
      onComplete: handleStepComplete
    }

    switch (step.type) {
      case 'listen':
        return <ListenStep {...stepProps} />
      case 'select':
        return <SelectStep {...stepProps} />
      case 'speak':
        return <SpeakStep {...stepProps} />
      case 'reveal':
        return <RevealStep {...stepProps} />
      case 'show':
        return <ShowStep {...stepProps} />
      case 'fillblank':
        return <FillBlankStep {...stepProps} />
      case 'wordmatching':
        return <WordMatchingStep {...stepProps} />
      case 'sentencesorting':
        return <SentenceSortingStep {...stepProps} />
      case 'entozh':
        return <EnToZhStep {...stepProps} />
      case 'zhtoen':
        return <ZhToEnStep {...stepProps} />
      case 'drag':
        return (
          <div className="quest-step text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {step.text}
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Drag functionality coming soon! For now, click Next to continue.
            </p>
            <button
              onClick={handleStepComplete}
              className="btn btn-primary btn-lg"
            >
              {t('common.next')}
            </button>
          </div>
        )
      case 'action':
        return (
          <div className="quest-step text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {t('quest.doAction')}
            </h3>
            <div className="text-3xl font-bold text-primary-600 mb-8 p-8 bg-primary-50 rounded-xl">
              {step.text}
            </div>
            <div className="space-y-4">
              <p className="text-lg text-gray-600">
                Do this action and then click Continue
              </p>
              <button
                onClick={handleStepComplete}
                className="btn btn-adhd btn-primary"
              >
                {t('common.next')}
              </button>
            </div>
          </div>
        )
      default:
        return (
          <div className="quest-step text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Unknown Step Type
            </h3>
            <button
              onClick={handleStepComplete}
              className="btn btn-primary btn-lg"
            >
              {t('common.next')}
            </button>
          </div>
        )
    }
  }

  const progressPercentage = ((currentStepIndex + 1) / quest.steps.length) * 100

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Quest Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {quest.title}
        </h1>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              {t('common.progress')} {currentStepIndex + 1} / {quest.steps.length}
              {currentStep?.text?.includes('第') && ` - ${currentStep.text}`}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2">
          {quest.steps.map((step, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStepIndex
                  ? 'bg-primary-600 ring-2 ring-primary-300'
                  : index < currentStepIndex
                  ? 'bg-primary-600'
                  : 'bg-gray-300'
              }`}
              title={step.text || `步骤 ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Current Step */}
      <div className="mb-8">
        {currentStep && renderStep(currentStep)}
      </div>

      {/* Quick Navigation (for development/testing) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-semibold mb-2">Dev Controls:</h4>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
              disabled={currentStepIndex === 0}
              className="btn btn-outline text-sm"
            >
              Previous Step
            </button>
            <button
              onClick={handleStepComplete}
              className="btn btn-outline text-sm"
            >
              Complete Step
            </button>
            <button
              onClick={onQuestComplete}
              className="btn btn-outline text-sm"
            >
              Complete Quest
            </button>
          </div>
        </div>
      )}
    </div>
  )
}