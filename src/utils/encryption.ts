// 简单的加密工具类（仅用于本地存储，不适合生产环境）
export class SimpleEncryption {
  private static secretKey = 'quest-g6-secure-key-2024'

  // 简单的哈希函数（模拟密码哈希）
  static hashPassword(password: string): string {
    // 使用简单的哈希算法（仅用于演示，生产环境请使用 bcrypt 或 argon2）
    let hash = 0
    const str = password + this.secretKey
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16)
  }

  // 验证密码
  static verifyPassword(password: string, hashedPassword: string): boolean {
    return this.hashPassword(password) === hashedPassword
  }

  // 简单的数据加密（用于敏感数据）
  static encrypt(data: any): string {
    try {
      const jsonStr = JSON.stringify(data)
      return btoa(unescape(encodeURIComponent(jsonStr)))
    } catch (error) {
      console.error('Encryption failed:', error)
      return ''
    }
  }

  // 简单的数据解密
  static decrypt(encryptedData: string): any {
    try {
      const jsonStr = decodeURIComponent(escape(atob(encryptedData)))
      return JSON.parse(jsonStr)
    } catch (error) {
      console.error('Decryption failed:', error)
      return null
    }
  }

  // 生成随机盐值
  static generateSalt(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15)
  }

  // 使用盐值哈希密码
  static hashPasswordWithSalt(password: string, salt: string): string {
    return this.hashPassword(password + salt)
  }
}

// 安全的用户数据接口
export interface SecureUser {
  id: string
  username: string
  displayName: string
  passwordHash: string // 存储哈希后的密码
  salt: string // 随机盐值
  avatar?: string
  createdAt: string
  lastLogin: string
  settings: any
  moduleProgress: Record<string, any>
  totalXP: number
  totalBadges: string[]
  globalStats: {
    totalTimeSpent: number
    questsCompleted: number
    streakDays: number
    lastStudyDate: string
  }
}

// 安全的认证辅助函数
export class AuthHelper {
  // 创建新用户（安全版本）
  static createUser(
    username: string,
    password: string,
    displayName?: string
  ): Omit<SecureUser, 'id' | 'createdAt' | 'lastLogin'> {
    const salt = SimpleEncryption.generateSalt()
    const passwordHash = SimpleEncryption.hashPasswordWithSalt(password, salt)

    return {
      username,
      displayName: displayName || username,
      passwordHash,
      salt,
      settings: {
        fontSize: 'normal',
        theme: 'light',
        soundEnabled: true,
        musicEnabled: false,
        animationsEnabled: true,
        simplifiedMode: false,
        lowStimulusMode: false,
        language: 'both'
      },
      moduleProgress: {},
      totalXP: 0,
      totalBadges: [],
      globalStats: {
        totalTimeSpent: 0,
        questsCompleted: 0,
        streakDays: 0,
        lastStudyDate: new Date().toISOString()
      }
    }
  }

  // 验证用户凭据
  static verifyCredentials(
    user: SecureUser,
    username: string,
    password: string
  ): boolean {
    return user.username === username &&
           SimpleEncryption.verifyPassword(password + user.salt, user.passwordHash)
  }

  // 生成安全的用户ID
  static generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}