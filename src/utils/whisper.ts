/**
 * Whisper TTS 和 ASR 集成模块
 *
 * 功能特性：
 * - 文本转语音 (TTS) - 使用Whisper的音频生成能力
 * - 自动语音识别 (ASR) - 将语音转换为文本
 * - 与现有音频系统集成
 * - 支持多种音频格式和质量设置
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

export interface WhisperTTSOptions {
  /** 语音模型，默认 'medium' */
  model?: string
  /** 音频质量 (low, medium, high) */
  quality?: 'low' | 'medium' | 'high'
  /** 语速 (0.25-4.0) */
  speed?: number
  /** 输出格式 */
  format?: 'mp3' | 'wav' | 'm4a'
  /** 临时目录 */
  tempDir?: string
}

export interface WhisperASROptions {
  /** 语言代码 (如 'en', 'zh', 'auto') */
  language?: string
  /** 识别模型 (tiny, base, small, medium, large) */
  model?: string
  /** 是否启用时间戳 */
  timestamps?: boolean
  /** 翻译到英文 (仅当音频非英文时) */
  translate?: boolean
}

export interface WhisperSegment {
  /** 开始时间 (秒) */
  start: number
  /** 结束时间 (秒) */
  end: number
  /** 识别文本 */
  text: string
}

export interface WhisperASRResult {
  /** 完整识别文本 */
  text: string
  /** 语言代码 */
  language: string
  /** 分段结果 */
  segments: WhisperSegment[]
}

export class WhisperIntegration {
  private tempDir: string
  private whisperPath: string

  constructor(options: { tempDir?: string } = {}) {
    this.tempDir = options.tempDir || path.join(process.cwd(), 'temp', 'whisper')
    this.whisperPath = '/Library/Frameworks/Python.framework/Versions/3.10/bin/whisper'

    // 确保临时目录存在
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true })
    }
  }

  /**
   * 文本转语音 (TTS)
   * 注意：Whisper主要用于ASR，TTS功能我们使用系统TTS作为替代
   */
  async textToSpeech(
    text: string,
    outputPath: string,
    options: WhisperTTSOptions = {}
  ): Promise<string> {
    const {
      quality = 'medium',
      speed = 1.0,
      format = 'mp3'
    } = options

    console.log(`🎙️ 生成TTS音频: "${text.substring(0, 50)}..."`)

    try {
      // 使用macOS系统TTS (say命令) 作为高质量的TTS解决方案
      const tempFile = path.join(this.tempDir, `tts_${Date.now()}.${format}`)

      // 根据语言设置不同的语音
      const voice = this.detectVoiceForText(text)

      // 构建say命令
      const sayCommand = [
        'say',
        `-v ${voice}`,
        `-r ${Math.round(200 * speed)}`, // 调整语速
        `-o "${tempFile}"`,
        `--file-format=${format}`,
        `"${text}"`
      ].join(' ')

      execSync(sayCommand, { timeout: 30000 })

      // 如果需要，移动到最终输出路径
      if (tempFile !== outputPath) {
        fs.copyFileSync(tempFile, outputPath)
        fs.unlinkSync(tempFile)
      }

      console.log(`✅ TTS音频生成完成: ${outputPath}`)
      return outputPath

    } catch (error) {
      console.error('❌ TTS生成失败:', error)
      throw new Error(`TTS生成失败: ${error.message}`)
    }
  }

  /**
   * 自动语音识别 (ASR)
   */
  async speechToText(
    audioPath: string,
    options: WhisperASROptions = {}
  ): Promise<WhisperASRResult> {
    const {
      language = 'auto',
      model = 'medium',
      timestamps = true,
      translate = false
    } = options

    if (!fs.existsSync(audioPath)) {
      throw new Error(`音频文件不存在: ${audioPath}`)
    }

    console.log(`🎯 开始ASR识别: ${path.basename(audioPath)}`)

    try {
      // 构建Whisper命令
      const whisperCommand = [
        `"${this.whisperPath}"`,
        `"${audioPath}"`,
        `--model ${model}`,
        language !== 'auto' ? `--language ${language}` : '',
        timestamps ? '--word_timestamps True' : '',
        translate ? '--translate' : '',
        '--output_format json',
        `--output_dir "${this.tempDir}"`
      ].filter(Boolean).join(' ')

      console.log(`执行命令: ${whisperCommand}`)

      const result = execSync(whisperCommand, {
        encoding: 'utf8',
        timeout: 120000 // 2分钟超时
      })

      // 读取生成的JSON结果文件
      const jsonPath = path.join(this.tempDir, path.basename(audioPath, path.extname(audioPath)) + '.json')

      if (!fs.existsSync(jsonPath)) {
        throw new Error('Whisper未生成结果文件')
      }

      const whisperResult = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

      // 转换为标准格式
      const formattedResult: WhisperASRResult = {
        text: whisperResult.text || '',
        language: whisperResult.language || language,
        segments: (whisperResult.segments || []).map((seg: any) => ({
          start: seg.start || 0,
          end: seg.end || 0,
          text: seg.text || ''
        }))
      }

      // 清理临时文件
      try {
        fs.unlinkSync(jsonPath)
      } catch (e) {
        // 忽略清理错误
      }

      console.log(`✅ ASR识别完成: "${formattedResult.text.substring(0, 50)}..."`)
      return formattedResult

    } catch (error) {
      console.error('❌ ASR识别失败:', error)
      throw new Error(`ASR识别失败: ${error.message}`)
    }
  }

  /**
   * 批量处理音频文件
   */
  async batchSpeechToText(
    audioFiles: string[],
    options: WhisperASROptions = {}
  ): Promise<{ audioPath: string; result: WhisperASRResult }[]> {
    const results = []

    console.log(`🔄 开始批量ASR处理，共${audioFiles.length}个文件`)

    for (let i = 0; i < audioFiles.length; i++) {
      const audioPath = audioFiles[i]
      console.log(`\n[${i + 1}/${audioFiles.length}] 处理: ${path.basename(audioPath)}`)

      try {
        const result = await this.speechToText(audioPath, options)
        results.push({ audioPath, result })
      } catch (error) {
        console.error(`❌ 文件处理失败: ${audioPath}`, error.message)
        results.push({
          audioPath,
          result: {
            text: '',
            language: 'unknown',
            segments: []
          }
        })
      }
    }

    console.log(`\n✅ 批量处理完成，成功处理${results.filter(r => r.result.text).length}个文件`)
    return results
  }

  /**
   * 检测文本对应的语音
   */
  private detectVoiceForText(text: string): string {
    // 检测是否包含中文字符
    const hasChinese = /[\u4e00-\u9fff]/.test(text)

    if (hasChinese) {
      // 中文语音
      return 'Ting-Ting' // macOS系统中文语音
    } else {
      // 英文语音
      return 'Samantha' // macOS系统英文语音
    }
  }

  /**
   * 获取可用的Whisper模型列表
   */
  getAvailableModels(): string[] {
    return [
      'tiny',    // 39M, 最快，准确度较低
      'base',    // 74M, 平衡
      'small',   // 244M, 较好准确度
      'medium',  // 769M, 很好准确度
      'large',   // 1550M, 最高准确度
      'large-v2',
      'large-v3'
    ]
  }

  /**
   * 获取支持的语言列表
   */
  getSupportedLanguages(): { code: string; name: string }[] {
    return [
      { code: 'auto', name: '自动检测' },
      { code: 'en', name: 'English' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' }
    ]
  }

  /**
   * 验证Whisper安装
   */
  async validateWhisperInstallation(): Promise<boolean> {
    try {
      const version = execSync(`"${this.whisperPath}" --version`, {
        encoding: 'utf8',
        timeout: 10000
      })
      console.log(`✅ Whisper已安装: ${version.trim()}`)
      return true
    } catch (error) {
      console.error('❌ Whisper未安装或无法访问:', error.message)
      return false
    }
  }

  /**
   * 清理临时文件
   */
  cleanup(): void {
    try {
      if (fs.existsSync(this.tempDir)) {
        const files = fs.readdirSync(this.tempDir)
        files.forEach(file => {
          const filePath = path.join(this.tempDir, file)
          try {
            fs.unlinkSync(filePath)
          } catch (e) {
            // 忽略单个文件删除错误
          }
        })
      }
    } catch (error) {
      console.warn('清理临时文件时出错:', error.message)
    }
  }
}

// 创建全局实例
export const whisper = new WhisperIntegration()

// 便捷函数
export const generateSpeech = (
  text: string,
  outputPath: string,
  options?: WhisperTTSOptions
) => whisper.textToSpeech(text, outputPath, options)

export const recognizeSpeech = (
  audioPath: string,
  options?: WhisperASROptions
) => whisper.speechToText(audioPath, options)

export const batchRecognizeSpeech = (
  audioFiles: string[],
  options?: WhisperASROptions
) => whisper.batchSpeechToText(audioFiles, options)

// 默认导出
export default whisper