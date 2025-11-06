import React, { useState, useEffect } from 'react'
import { Volume2 } from 'lucide-react'
import { QuestStep } from '@/types'
import { audioPlayer } from '@/utils/audioPlayer'
import { useGameStore } from '@/store/useGameStore'
import { getAssetPath } from '@/utils/assetPath'

interface WordMatchingStepProps {
  step: QuestStep
  onComplete: () => void
}

export const WordMatchingStep: React.FC<WordMatchingStepProps> = ({ step, onComplete }) => {
  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null)
  const [selectedPairs, setSelectedPairs] = useState<{[key: string]: string}>({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const { progress } = useGameStore()
  const { soundEnabled } = progress?.settings || { soundEnabled: true }

  const pairs = step.pairs || []
  const options = step.options || []

  // Get only the pairs to match (remove options for distraction)
  const englishWords = pairs.map(p => p.en)

  // Shuffle Chinese words only once when component mounts or step changes
  const [shuffledChineseWords, setShuffledChineseWords] = useState<string[]>(() =>
    [...pairs.map(p => p.zh)].sort(() => Math.random() - 0.5)
  )

  // Reset state when step data changes
  useEffect(() => {
    setSelectedEnglish(null)
    setSelectedPairs({})
    setShowFeedback(false)
    setIsCorrect(false)
    // Reshuffle Chinese words for new step
    setShuffledChineseWords([...pairs.map(p => p.zh)].sort(() => Math.random() - 0.5))
  }, [pairs])

  // Create a mapping of English words to their audio paths
  const getAudioPath = (englishWord: string): string | null => {
    // First try to get audio from pairs data
    const pair = pairs.find(p => p.en === englishWord)
    if (pair?.audio) {
      return pair.audio
    }

    // If no audio in pairs, construct the path based on the word
    const wordId = englishWord.toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '')     // Remove special characters except hyphens
      .replace(/-+/g, '-')            // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '')          // Remove leading/trailing hyphens

    return getAssetPath(`/audio/tts/${wordId}.mp3`)
  }

  const handlePlayAudio = async (e: React.MouseEvent, englishWord: string) => {
    e.stopPropagation()
    if (!soundEnabled) return

    const audioPath = getAudioPath(englishWord)
    if (!audioPath) return

    try {
      await audioPlayer.play(audioPath)
    } catch (error) {
      console.error('Failed to play audio:', error)
    }
  }

  const handleEnglishSelect = (english: string) => {
    if (selectedEnglish === english) {
      setSelectedEnglish(null)
    } else {
      setSelectedEnglish(english)
    }
  }

  const handleChineseSelect = (chinese: string) => {
    if (!selectedEnglish) return

    // Check if this Chinese word is already paired
    const existingPair = Object.keys(selectedPairs).find(en => selectedPairs[en] === chinese)
    if (existingPair) {
      // Remove existing pair
      const newPairs = { ...selectedPairs }
      delete newPairs[existingPair]
      setSelectedPairs(newPairs)
    }

    // Add new pair
    const newPairs = { ...selectedPairs }
    newPairs[selectedEnglish] = chinese
    setSelectedPairs(newPairs)
    setSelectedEnglish(null)
  }

  const removePair = (english: string) => {
    const newPairs = { ...selectedPairs }
    delete newPairs[english]
    setSelectedPairs(newPairs)
  }

  const checkAnswer = () => {
    const correctPairs = pairs.length
    let matchedPairs = 0

    pairs.forEach(pair => {
      if (selectedPairs[pair.en] === pair.zh) {
        matchedPairs++
      }
    })

    const correct = matchedPairs === correctPairs
    setIsCorrect(correct)
    setShowFeedback(true)

    // Only proceed to next step if correct
    setTimeout(() => {
      if (correct) {
        onComplete()
      }
    }, 2000)
  }

  const resetExercise = () => {
    setSelectedPairs({})
    setSelectedEnglish(null)
    setShowFeedback(false)
  }

  return (
    <div className="quest-step">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {step.text || "将英语单词与中文翻译配对"}
        </h2>
        <p className="text-gray-600 mb-6">先点击左侧的英文单词，然后点击右侧对应的中文翻译</p>

        {showFeedback && (
          <div className={`mb-6 p-6 rounded-lg border-2 ${
            isCorrect
              ? 'bg-green-100 text-green-800 border-green-300'
              : 'bg-red-100 text-red-800 border-red-300'
          }`}>
            {isCorrect ? (
              <div className="text-center">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-xl font-bold mb-2">完美！所有配对正确！</p>
                <p className="text-sm">
                  {step.text?.includes('第1部分')
                    ? '第一部分完成！准备进入第二部分...'
                    : step.text?.includes('第2部分')
                    ? '第二部分完成！准备进入下一个练习...'
                    : '准备进入下一个练习...'
                  }
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-3xl mb-2">🤔</div>
                <p className="text-lg font-semibold mb-2">还有一些配对不正确</p>
                <p className="text-sm">请检查你的配对并重新尝试</p>
              </div>
            )}
          </div>
        )}

        {/* Current matched pairs display */}
        {Object.keys(selectedPairs).length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">已配对的单词：</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.entries(selectedPairs).map(([english, chinese]) => (
                <div key={english} className="bg-white px-3 py-2 rounded-md border border-blue-200 flex items-center gap-2">
                  <span className="font-medium text-blue-800">{english}</span>
                  <span className="text-blue-600">↔</span>
                  <span className="font-medium text-blue-800">{chinese}</span>
                  <button
                    onClick={() => removePair(english)}
                    className="ml-2 text-red-500 hover:text-red-700 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* English words on the left */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">English Words</h3>
            {englishWords.map((english, index) => {
              const isPaired = selectedPairs[english]
              const isSelected = selectedEnglish === english
              const audioPath = getAudioPath(english)

              return (
                <div
                  key={`en-${index}`}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-100 border-blue-400 shadow-md'
                      : isPaired
                      ? 'bg-gray-100 border-gray-300 opacity-60'
                      : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  onClick={() => !isPaired && handleEnglishSelect(english)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-lg font-medium">{english}</p>
                      {isSelected && (
                        <p className="text-sm text-blue-600 mt-1">请选择对应的中文翻译</p>
                      )}
                      {isPaired && (
                        <p className="text-sm text-green-600 mt-1">✓ 已配对</p>
                      )}
                    </div>

                    {/* Audio play button */}
                    {audioPath && soundEnabled && (
                      <button
                        onClick={(e) => handlePlayAudio(e, english)}
                        className="ml-3 p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="播放发音"
                      >
                        <Volume2 className="w-4 h-4 text-blue-600" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Chinese words on the right - shuffled once */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">中文翻译</h3>
            {shuffledChineseWords.map((chinese, index) => {
              const isPaired = Object.values(selectedPairs).includes(chinese)

              return (
                <div
                  key={`zh-${index}`}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isPaired
                      ? 'bg-gray-100 border-gray-300 opacity-60'
                      : selectedEnglish
                      ? 'bg-white border-green-400 hover:bg-green-50 hover:border-green-500'
                      : 'bg-white border-gray-300'
                  }`}
                  onClick={() => !isPaired && handleChineseSelect(chinese)}
                >
                  <p className="text-lg font-medium">{chinese}</p>
                  {selectedEnglish && !isPaired && (
                    <p className="text-sm text-green-600 mt-1">点击配对 "{selectedEnglish}"</p>
                  )}
                  {isPaired && (
                    <p className="text-sm text-green-600 mt-1">✓ 已配对</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={checkAnswer}
            disabled={Object.keys(selectedPairs).length < pairs.length}
            className={`btn btn-lg ${
              Object.keys(selectedPairs).length >= pairs.length
                ? 'btn-primary'
                : 'btn-disabled'
            }`}
          >
            检查答案 ({Object.keys(selectedPairs).length}/{pairs.length})
          </button>

          <button
            onClick={resetExercise}
            className="btn btn-outline btn-lg ml-4"
          >
            重新开始
          </button>

          {!selectedEnglish && Object.keys(selectedPairs).length < pairs.length && (
            <p className="text-sm text-gray-500 mt-4">
              💡 提示：先点击左侧的英文单词，然后点击右侧对应的中文翻译
            </p>
          )}
        </div>
      </div>
    </div>
  )
}