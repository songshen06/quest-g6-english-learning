import React, { useState, useRef } from 'react'
import { Volume2, Play, Mic, MicOff, Check, X } from 'lucide-react'
import { getAssetPath } from '@/utils/assetPath'

interface Pattern {
  q: string
  a: string
}

interface PatternCardProps {
  pattern: Pattern
  index: number
}

export const PatternCard: React.FC<PatternCardProps> = ({ pattern, index }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
      setIsPlaying(true)

      audioRef.current.onended = () => {
        setIsPlaying(false)
      }
    }
  }

  const handleStartRecording = () => {
    setIsRecording(true)
    setHasRecorded(false)
    setShowResult(false)

    // 这里可以集成实际的录音功能
    // 目前只是模拟录音过程
    setTimeout(() => {
      setIsRecording(false)
      setHasRecorded(true)
      // 模拟评分结果
      setTimeout(() => {
        setShowResult(true)
      }, 1000)
    }, 3000)
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setHasRecorded(true)
    setTimeout(() => {
      setShowResult(true)
    }, 1000)
  }

  // 生成音频文件路径（基于英文句子）
  const audioFileName = pattern.q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim() + '.mp3'

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* 音频元素 */}
      <audio
        ref={audioRef}
        src={getAssetPath(`/audio/tts/${audioFileName}`)}
        preload="none"
      />

      <div className="space-y-4">
        {/* 序号 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
            </div>
            <span className="text-sm text-gray-500">句型练习</span>
          </div>
        </div>

        {/* 英文句子 */}
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-lg font-medium text-blue-900 mb-3">{pattern.q}</p>
          <button
            onClick={handlePlayAudio}
            disabled={isPlaying}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isPlaying
                ? 'bg-blue-200 text-blue-700 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>{isPlaying ? '播放中...' : '听发音'}</span>
          </button>
        </div>

        {/* 中文翻译 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700">{pattern.a}</p>
        </div>

        {/* 录音控制区域 */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">跟读练习</span>
            {showResult && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                Math.random() > 0.3 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {Math.random() > 0.3 ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                <span className="text-xs font-medium">
                  {Math.random() > 0.3 ? '发音很好' : '再试一次'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                isRecording
                  ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                  : hasRecorded
                  ? 'bg-gray-500 text-white hover:bg-gray-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-5 h-5" />
                  <span>停止录音</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>{hasRecorded ? '重新录音' : '开始录音'}</span>
                </>
              )}
            </button>

            {hasRecorded && (
              <button
                onClick={handlePlayAudio}
                className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            )}
          </div>

          {isRecording && (
            <div className="mt-3 text-center">
              <div className="inline-flex items-center space-x-2 text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm">正在录音...</span>
              </div>
            </div>
          )}

          {showResult && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>提示：</strong>注意语调和停顿，多练习几次可以提升发音准确性。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}