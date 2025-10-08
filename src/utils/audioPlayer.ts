import { AudioPlayer } from '@/types'

class SimpleAudioPlayer implements AudioPlayer {
  private audio: HTMLAudioElement | null = null
  private _isPlaying = false

  get isPlaying(): boolean {
    return this._isPlaying
  }

  async play(src: string): Promise<void> {
    try {
      // Stop any currently playing audio
      this.stop()

      // Create new audio element
      this.audio = new Audio(src)

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

      // Play the audio
      this._isPlaying = true
      await this.audio.play()
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
}

export const audioPlayer = new SimpleAudioPlayer()

// Sound effect manager
export class SoundManager {
  private enabled = true
  private soundEffects: Map<string, HTMLAudioElement> = new Map()

  constructor() {
    // Preload common sound effects
    this.preloadSound('/audio/sfx/correct.mp3', 'correct')
    this.preloadSound('/audio/sfx/wrong.mp3', 'wrong')
    this.preloadSound('/audio/sfx/unlock.mp3', 'unlock')
    this.preloadSound('/audio/sfx/complete.mp3', 'complete')
  }

  private async preloadSound(src: string, id: string): Promise<void> {
    try {
      const audio = new Audio(src)
      audio.load()
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