import { User } from '@/types'
import { SimpleEncryption } from './encryption'

export class GuestConversion {
  // 将访客用户转换为正式用户
  static convertGuestToRegularUser(
    guestUser: User,
    newUsername: string,
    newPassword: string,
    newDisplayName?: string
  ): Omit<User, 'id' | 'createdAt' | 'lastLogin'> {
    const salt = SimpleEncryption.generateSalt()
    const passwordHash = SimpleEncryption.hashPasswordWithSalt(newPassword, salt)

    return {
      username: newUsername,
      displayName: newDisplayName || newUsername,
      passwordHash, // 新的哈希密码
      salt, // 新的盐值
      avatar: guestUser.avatar,
      settings: guestUser.settings,
      moduleProgress: guestUser.moduleProgress, // 保留学习进度
      totalXP: guestUser.totalXP, // 保留总XP
      totalBadges: guestUser.totalBadges, // 保留徽章
      globalStats: guestUser.globalStats // 保留全局统计
    }
  }

  // 生成新用户ID（非访客格式）
  static generateRegularUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 检查是否为访客用户
  static isGuestUser(user: User): boolean {
    return user.displayName.includes('访客用户') || user.username.startsWith('guest_')
  }

  // 为访客用户生成建议的用户名
  static suggestUsername(baseName?: string): string {
    const base = baseName || 'learner'
    const timestamp = Date.now().toString().slice(-6)
    return `${base}_${timestamp}`
  }

  // 验证用户名是否适合转换
  static validateUsernameForConversion(username: string, existingUsers: User[]): {
    isValid: boolean
    error?: string
  } {
    if (!username || username.trim().length < 3) {
      return {
        isValid: false,
        error: '用户名至少需要3个字符'
      }
    }

    if (username.startsWith('guest_')) {
      return {
        isValid: false,
        error: '用户名不能以 guest_ 开头'
      }
    }

    if (username.includes('访客用户')) {
      return {
        isValid: false,
        error: '用户名不能包含"访客用户"'
      }
    }

    if (existingUsers.some(user => user.username === username)) {
      return {
        isValid: false,
        error: '用户名已存在'
      }
    }

    return { isValid: true }
  }
}