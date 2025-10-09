/**
 * 超级管理员认证工具
 * 确保应用所有者能够始终保持超级管理员权限
 */

import { DEFAULT_SUPERADMIN_ACCOUNT } from './admin'

// 超级管理员密钥配置
const SUPER_ADMIN_CONFIG = {
  // 固定超级管理员账户（应用所有者专用）
  fixedAccount: {
    username: 'superadmin',
    displayName: '超级管理员',
    masterPassword: 'quest_g6_super_admin_2025', // 只有你知道的主密码
    backupPassword: 'admin_master_key_2025'       // 备用密码
  },

  // URL参数密钥（临时提升权限）
  urlKeys: [
    'quest_g6_admin_2025',
    'super_admin_key_2025',
    'master_admin_access'
  ],

  // 时间窗口密钥（定期更换）
  timeKeys: {
    hourly: () => {
      const hour = new Date().getHours()
      return `admin_${hour}_${new Date().getFullYear()}${new Date().getMonth() + 1}${new Date().getDate()}`
    },
    daily: () => {
      return `daily_admin_${new Date().getFullYear()}${new Date().getMonth() + 1}${new Date().getDate()}`
    }
  }
}

/**
 * 检查URL参数是否包含管理员密钥
 */
export const checkURLAdminKey = (): string | null => {
  if (typeof window === 'undefined') return null

  const urlParams = new URLSearchParams(window.location.search)
  const adminKey = urlParams.get('admin_key')

  if (!adminKey) return null

  // 检查是否是有效的URL密钥
  if (SUPER_ADMIN_CONFIG.urlKeys.includes(adminKey)) {
    return adminKey
  }

  // 检查是否是时间窗口密钥
  const hourlyKey = SUPER_ADMIN_CONFIG.timeKeys.hourly()
  const dailyKey = SUPER_ADMIN_CONFIG.timeKeys.daily()

  if (adminKey === hourlyKey || adminKey === dailyKey) {
    return adminKey
  }

  return null
}

/**
 * 验证超级管理员密码
 */
export const verifySuperAdminPassword = (password: string): boolean => {
  return password === SUPER_ADMIN_CONFIG.fixedAccount.masterPassword ||
         password === SUPER_ADMIN_CONFIG.fixedAccount.backupPassword
}

/**
 * 检查当前环境是否应该提供超级管理员权限
 */
export const shouldProvideSuperAdminAccess = (): { access: boolean; method: string; key?: string } => {
  // 1. 检查URL参数
  const urlKey = checkURLAdminKey()
  if (urlKey) {
    return {
      access: true,
      method: 'URL参数',
      key: urlKey
    }
  }

  // 2. 检查本地存储的超级管理员权限
  try {
    const storedAdminAuth = localStorage.getItem('quest-g6-super-admin-auth')
    if (storedAdminAuth) {
      const auth = JSON.parse(storedAdminAuth)
      const now = Date.now()

      // 检查权限是否过期（24小时）
      if (auth.expiry > now) {
        return {
          access: true,
          method: '已缓存权限',
          key: auth.key
        }
      }
    }
  } catch (error) {
    console.error('检查本地管理员权限时出错:', error)
  }

  return {
    access: false,
    method: '无权限'
  }
}

/**
 * 保存超级管理员权限到本地存储
 */
export const saveSuperAdminAccess = (key: string, method: string, hours: number = 24): void => {
  try {
    const auth = {
      key,
      method,
      timestamp: Date.now(),
      expiry: Date.now() + (hours * 60 * 60 * 1000)
    }

    localStorage.setItem('quest-g6-super-admin-auth', JSON.stringify(auth))
    console.log(`✅ 超级管理员权限已保存 (${method}, 有效期${hours}小时)`)
  } catch (error) {
    console.error('保存超级管理员权限时出错:', error)
  }
}

/**
 * 清除超级管理员权限
 */
export const clearSuperAdminAccess = (): void => {
  try {
    localStorage.removeItem('quest-g6-super-admin-auth')
    console.log('🗑️ 超级管理员权限已清除')
  } catch (error) {
    console.error('清除超级管理员权限时出错:', error)
  }
}

/**
 * 获取超级管理员快速访问链接
 */
export const getSuperAdminAccessLinks = (): { title: string; url: string; description: string }[] => {
  const baseUrl = window.location.origin + window.location.pathname.replace(/\/$/, '')
  const hourlyKey = SUPER_ADMIN_CONFIG.timeKeys.hourly()
  const dailyKey = SUPER_ADMIN_CONFIG.timeKeys.daily()

  return [
    {
      title: '主密码登录',
      url: `${baseUrl}`,
      description: '使用主密码 "quest_g6_super_admin_2025" 直接登录'
    },
    {
      title: '小时密钥链接',
      url: `${baseUrl}?admin_key=${hourlyKey}`,
      description: `有效1小时: ${hourlyKey}`
    },
    {
      title: '每日密钥链接',
      url: `${baseUrl}?admin_key=${dailyKey}`,
      description: `有效24小时: ${dailyKey}`
    },
    {
      title: '固定密钥链接',
      url: `${baseUrl}?admin_key=quest_g6_admin_2025`,
      description: '永久有效的固定密钥'
    }
  ]
}

/**
 * 确保超级管理员账户存在
 */
export const ensureSuperAdminExists = async (userStore: any): Promise<boolean> => {
  const { users, register, login } = userStore

  // 检查是否已存在超级管理员
  const existingSuperAdmin = users.find((user: any) => user.role === 'superadmin')
  if (existingSuperAdmin) {
    console.log('✅ 超级管理员账户已存在:', existingSuperAdmin.username)
    return true
  }

  // 创建固定超级管理员账户
  const success = await register(
    SUPER_ADMIN_CONFIG.fixedAccount.username,
    SUPER_ADMIN_CONFIG.fixedAccount.masterPassword,
    SUPER_ADMIN_CONFIG.fixedAccount.displayName,
    'superadmin'
  )

  if (success) {
    console.log('✅ 超级管理员账户创建成功')
    return true
  } else {
    console.error('❌ 超级管理员账户创建失败')
    return false
  }
}

/**
 * 快速登录超级管理员
 */
export const quickSuperAdminLogin = async (userStore: any, password?: string): Promise<boolean> => {
  const { login } = userStore

  // 检查是否有自动权限
  const autoAccess = shouldProvideSuperAdminAccess()
  if (autoAccess.access) {
    console.log(`🔑 检测到自动管理员权限: ${autoAccess.method}`)

    // 先确保超级管理员账户存在
    await ensureSuperAdminExists(userStore)

    // 使用固定密码登录
    const loginSuccess = await login(
      SUPER_ADMIN_CONFIG.fixedAccount.username,
      SUPER_ADMIN_CONFIG.fixedAccount.masterPassword
    )

    if (loginSuccess) {
      // 如果是URL密钥权限，保存到本地
      if (autoAccess.key) {
        saveSuperAdminAccess(autoAccess.key, autoAccess.method)
      }
      return true
    }
  }

  // 如果提供了密码，尝试验证
  if (password) {
    if (verifySuperAdminPassword(password)) {
      // 确保账户存在
      await ensureSuperAdminExists(userStore)

      // 登录
      const loginSuccess = await login(
        SUPER_ADMIN_CONFIG.fixedAccount.username,
        SUPER_ADMIN_CONFIG.fixedAccount.masterPassword
      )

      if (loginSuccess) {
        saveSuperAdminAccess('manual_password', '手动密码', 24)
        return true
      }
    }
  }

  return false
}

/**
 * 获取当前时间的管理员密钥（用于调试）
 */
export const getCurrentAdminKeys = (): { hourly: string; daily: string } => {
  return {
    hourly: SUPER_ADMIN_CONFIG.timeKeys.hourly(),
    daily: SUPER_ADMIN_CONFIG.timeKeys.daily()
  }
}