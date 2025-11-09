import { AudioPlayer } from '@/types'
import { getAssetPath } from './assetPath'

class SimpleAudioPlayer implements AudioPlayer {
  private audio: HTMLAudioElement | null = null
  private _isPlaying = false
  private audioCache = new Map<string, HTMLAudioElement>() // Audio cache for mobile performance

  get isPlaying(): boolean {
    return this._isPlaying
  }

  async play(src: string): Promise<void> {
    try {
      // Stop any currently playing audio
      this.stop()

      // Ensure the src includes the base path
      const fullSrc = getAssetPath(src)

      // Check cache first for mobile performance
      let cachedAudio = this.audioCache.get(fullSrc)

      if (!cachedAudio) {
        // Create new audio element with preloading and mobile optimizations
        cachedAudio = new Audio(fullSrc)

        // Mobile-specific optimizations
        cachedAudio.preload = 'auto'
        cachedAudio.crossOrigin = 'anonymous'

        // Cache the audio for future use (limit cache size)
        if (this.audioCache.size >= 20) { // Limit cache to 20 audio files
          const firstKey = this.audioCache.keys().next().value
          this.audioCache.delete(firstKey)
        }
        this.audioCache.set(fullSrc, cachedAudio)
      }

      // Clone the cached audio for independent playback
      this.audio = cachedAudio.cloneNode() as HTMLAudioElement

      // Set audio loading optimizations
      if (this.audio.readyState < 3) { // HAVE_FUTURE_DATA
        this.audio.addEventListener('canplaythrough', () => {
          // Audio is ready to play without buffering
        }, { once: true })
      }

      // Set up event listeners
      this.audio.addEventListener('ended', () => {
        this._isPlaying = false
      })

      this.audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e)
        console.error('Audio src:', src)
        console.error('Audio error code:', this.audio?.error?.code)
        console.error('Audio error message:', this.audio?.error?.message)
        this._isPlaying = false
      })

      // Set up additional error handling
      this.audio.addEventListener('abort', () => {
        console.warn('Audio playback aborted')
        this._isPlaying = false
      })

      this.audio.addEventListener('stalled', () => {
        console.warn('Audio playback stalled')
      })

      // Play the audio with mobile-specific handling
      this._isPlaying = true

      // For mobile, try to play with a small delay to ensure loading
      if (this.audio.readyState >= 3) { // HAVE_FUTURE_DATA
        await this.audio.play()
      } else {
        // Wait for audio to be ready, then play
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Audio loading timeout'))
          }, 5000) // 5 second timeout

          const onCanPlay = async () => {
            clearTimeout(timeout)
            try {
              await this.audio!.play()
              resolve(void 0)
            } catch (error) {
              reject(error)
            }
          }

          if (this.audio!.readyState >= 3) {
            onCanPlay()
          } else {
            this.audio!.addEventListener('canplaythrough', onCanPlay, { once: true })
          }
        })
      }
    } catch (error) {
      console.error('Failed to play audio:', error)
      console.error('Audio src:', src)

      // Check for specific browser autoplay policy errors
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          console.warn('Audio playback blocked by browser autoplay policy. User interaction required.')
        } else if (error.name === 'NotSupportedError') {
          console.error('Audio format not supported:', src)
        } else if (error.name === 'NotFoundError') {
          console.error('Audio file not found:', src)
        }
      }

      this._isPlaying = false
      throw error
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.audio.removeEventListener('ended', () => {})
      this.audio.removeEventListener('error', () => {})
      this.audio = null
    }
    this._isPlaying = false
  }

  // Clear cache method for memory management
  clearCache(): void {
    this.audioCache.clear()
  }
}

export const audioPlayer = new SimpleAudioPlayer()

// Sound effect manager
export class SoundManager {
  private enabled = true
  private soundEffects: Map<string, HTMLAudioElement> = new Map()

  constructor() {
    // Preload common sound effects with base path
    this.preloadSound('/audio/sfx/correct.mp3', 'correct')
    this.preloadSound('/audio/sfx/wrong.mp3', 'wrong')
    this.preloadSound('/audio/sfx/unlock.mp3', 'unlock')
    this.preloadSound('/audio/sfx/complete.mp3', 'complete')
  }

  private async preloadSound(src: string, id: string): Promise<void> {
    try {
      // Ensure the src includes the base path
      const fullSrc = getAssetPath(src)
      const audio = new Audio(fullSrc)

      // Mobile optimizations for preloading
      audio.preload = 'auto'
      audio.crossOrigin = 'anonymous'

      // Wait for audio to be ready before marking as preloaded
      if (audio.readyState < 3) {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            resolve() // Don't block on preload timeout
          }, 3000)

          const onCanPlay = () => {
            clearTimeout(timeout)
            resolve()
          }

          audio.addEventListener('canplaythrough', onCanPlay, { once: true })

          // Fallback if already ready
          if (audio.readyState >= 3) {
            onCanPlay()
          }
        })
      }

      this.soundEffects.set(id, audio)
    } catch (error) {
      console.warn(`Failed to preload sound: ${id}`, error)
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  async playSound(id: string): Promise<void> {
    if (!this.enabled) return

    const audio = this.soundEffects.get(id)
    if (!audio) return

    try {
      // Create a new instance to allow overlapping sounds
      const sound = audio.cloneNode() as HTMLAudioElement
      await sound.play()
    } catch (error) {
      console.warn(`Failed to play sound: ${id}`, error)
    }
  }

  playCorrect(): void {
    this.playSound('correct')
  }

  playWrong(): void {
    this.playSound('wrong')
  }

  playUnlock(): void {
    this.playSound('unlock')
  }

  playComplete(): void {
    this.playSound('complete')
  }
}

export const soundManager = new SoundManager()