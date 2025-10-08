import React, { useState } from 'react'
import { Volume2 } from 'lucide-react'
import { QuestStep } from '@/types'
import { audioPlayer } from '@/utils/audioPlayer'
import { useGameStore } from '@/store/useGameStore'
import { getAssetPath } from '@/utils/assetPath'

interface ZhToEnStepProps {
  step: QuestStep
  onComplete: () => void
}

export const ZhToEnStep: React.FC<ZhToEnStepProps> = ({ step, onComplete }) => {
  const [selectedOrder, setSelectedOrder] = useState<string[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const { progress } = useGameStore()
  const { soundEnabled } = progress?.settings || { soundEnabled: true }

  const chinese = step.chinese || ''
  const scrambledEnglish = step.scrambledEnglish || []
  const correctEnglish = step.correctEnglish || []

  const handleWordClick = (word: string) => {
    if (selectedOrder.includes(word)) {
      // Remove word from selected order
      setSelectedOrder(prev => prev.filter(w => w !== word))
    } else {
      // Add word to selected order
      setSelectedOrder(prev => [...prev, word])
    }
  }

  // Create a mapping of English words to their audio paths
  // Only return audio path if the file likely exists (based on common words we know exist)
  const getAudioPath = (englishWord: string): string | null => {
    // Convert the word to lowercase and replace spaces with hyphens
    const wordId = englishWord.toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '')     // Remove special characters except hyphens
      .replace(/-+/g, '-')            // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '')          // Remove leading/trailing hyphens

    // List of common audio files that we know exist in the project
    const knownAudioFiles = [
      'how-long', 'near', 'along', 'more-than', 'kilometre', 'metre',
      'chinatown', 'town', 'subject', 'everywhere', 'lion-dance', 'tomb',
      'stamp', 'book', 'collect', 'hobby', 'sun', 'island', 'coconut',
      'thanksgiving', 'nearly', 'spring-festival', 'sure', 'december', 'light',
      'pleased', 'pretty', 'french', 'phone', 'write-her', 'of-course',
      'world', 'difficult', 'answer', 'miss', 'bamboo', 'deaf', 'frightened',
      'roar', 'fox', 'coin', 'tidy', 'messy', 'never', 'always', 'often', 'sometimes',
      'peace', 'make-peace', 'member-state', 'famous', 'aunt', 'forgot', 'way', 'cross',
      'empire-state', 'climb-stairs', 'look-at', 'send-email', 'big-surprise',
      'lots-lots', 'different-from', 'see-lion-dance', 'look-photo',
      'ming-tombs', 'stone-animals', 'red-gate', 'write-story', 'meet-farmer',
      'put-into', 'stamp-uk', 'send-emails', 'chinese-stamps', 'collect-stamps',
      'picture-of', 'hainan-island', 'finger-mountain', 'coconut-tree', 'at-all',
      'twelve-hours', 'almost-deaf', 'give-it-me', 'hear-music', 'in-day', 'at-night',
      'learn-lesson', 'ten-hours', 'sixteen-hours', 'tidy-room', 'find-coin',
      'tidy-bed', 'read-stories', 'go-library', 'clean-blackboard', 'go-bus',
      'hurry-up', 'eat-bananas', 'go-swimming', 'ride-bike', 'read-english-books',
      'clean-shoes', 'be-mean', 'cook-dinner', 'important-building', 'in-world',
      'un-building', 'one-of', 'changjiang-river', 'huangshan-mountain', 'south-of',
      'take-away', 'have-picnic', 'dont-worry', 'drink-water', 'fun-to',
      'go-straight', 'dont-cross', 'turn-right', 'cross-road', 'turn-left', 'its',
      // High priority basic words (essential for learning)
      'a', 'are', 'big', 'do', 'have', 'in', 'into', 'long', 'make', 'me', 'my',
      'new', 'of', 'on', 'the', 'to', 'watch', 'we', 'what', 'you', 'your',
      // Medium priority descriptive words
      'dinner', 'photo', 'room', 'worry',
      // Low priority context-specific words
      'course', 'doing', 'dont', 'dvd', 'forty', 'im', 'li', 'meet', 'putting',
      'questions', 'road', 'show', 'special', 'stamps',
      // Previously added words
      'spoke', 'wrote', 'when', 'gave', 'almost', 'art-teacher', 'in-english', 'in-french', 'learn-english',
      // Individual words from "It's more than two thousand years old."
      'more', 'than', 'two', 'thousand', 'years', 'old',
      // Phrases
      'the-empire-state-building', 'four-hundred-metres-high', 'childrens-day', 'favourite-festival',
      'special-dinner', 'have-a-lot-of-fun', 'write-a-poem', 'be-important-to-sb',
      'very-important-festival', 'in-many-countries', 'on-the-25th-of-december', 'festival',
      'how-long-great-wall', 'chinatown-yesterday', 'lion-dance-street', 'chinatown-visit',
      'stamp-quest', 'thanksgiving-quest'
    ]

    // Only return audio path if the word is in our known list
    if (knownAudioFiles.includes(wordId)) {
      return getAssetPath(`/audio/tts/${wordId}.mp3`)
    }

    return null
  }

  const handlePlayAudio = async (e: React.MouseEvent, englishWord: string) => {
    e.stopPropagation() // Prevent triggering word selection
    if (!soundEnabled) return

    const audioPath = getAudioPath(englishWord)
    if (!audioPath) return

    try {
      await audioPlayer.play(audioPath)
    } catch (error) {
      console.error('Failed to play audio:', error)
    }
  }

  const checkAnswer = () => {
    const correct = selectedOrder.length === correctEnglish.length &&
                   selectedOrder.every((word, index) => word === correctEnglish[index])

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
      const correctIndex = correctEnglish.indexOf(word)
      return selectedIndex === correctIndex ? 'correct' : 'incorrect'
    }

    return isSelected ? 'selected' : 'available'
  }

  return (
    <div className="quest-step">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {step.text || "将中文句子翻译成正确的英文单词顺序"}
        </h2>

        {/* Chinese sentence */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">中文句子：</h3>
          <div className="bg-blue-50 p-6 rounded-lg max-w-3xl mx-auto">
            <p className="text-2xl font-medium text-blue-900">
              {chinese}
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

        {/* Scrambled English words */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">点击英文单词选择正确顺序：</h3>
          <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto">
            {scrambledEnglish.map((word, index) => {
              const status = getWordStatus(word)
              const audioPath = getAudioPath(word)

              return (
                <div
                  key={`word-${index}`}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 font-medium text-lg transition-all ${
                    status === 'correct'
                      ? 'bg-green-100 border-green-300 text-green-800'
                      : status === 'incorrect'
                      ? 'bg-red-100 border-red-300 text-red-800'
                      : status === 'selected'
                      ? 'bg-blue-100 border-blue-400 text-blue-800'
                      : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <button
                    onClick={() => handleWordClick(word)}
                    disabled={status === 'correct'}
                    className="flex-1 text-left"
                  >
                    {word}
                    {status === 'selected' && (
                      <span className="ml-2 text-sm text-blue-600">
                        #{selectedOrder.indexOf(word) + 1}
                      </span>
                    )}
                  </button>

                  {/* Audio play button */}
                  {audioPath && soundEnabled && (
                    <button
                      onClick={(e) => handlePlayAudio(e, word)}
                      className="ml-2 p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
                      aria-label="播放发音"
                    >
                      <Volume2 className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                </div>
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
                {selectedOrder.join(' ')}
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
                {correctEnglish.join(' ')}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={checkAnswer}
            disabled={selectedOrder.length !== correctEnglish.length}
            className={`btn btn-lg ${
              selectedOrder.length === correctEnglish.length
                ? 'btn-primary'
                : 'btn-disabled'
            }`}
          >
            检查翻译 ({selectedOrder.length}/{correctEnglish.length})
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