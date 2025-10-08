import { UserRole } from '@/types'

/**
 * 管理员工具函数
 */

// 创建默认管理员账户的配置
export const DEFAULT_ADMIN_ACCOUNT = {
  username: 'admin',
  displayName: '系统管理员',
  role: 'admin' as UserRole,
  // 注意：在生产环境中，这个密码应该通过安全的方式设置
  // 这里仅用于开发和演示目的
  defaultPassword: 'admin123'
}

export const DEFAULT_SUPERADMIN_ACCOUNT = {
  username: 'superadmin',
  displayName: '超级管理员',
  role: 'superadmin' as UserRole,
  defaultPassword: 'super123'
}

/**
 * 检查是否需要初始化默认管理员账户
 */
export const needsAdminInitialization = (users: any[]): boolean => {
  return !users.some(user => user.role === 'admin' || user.role === 'superadmin')
}

/**
 * 验证管理员账户的安全要求
 */
export const validateAdminAccount = (username: string, password: string): { valid: boolean; message: string } => {
  if (!username || !password) {
    return { valid: false, message: '用户名和密码不能为空' }
  }

  if (username.length < 3) {
    return { valid: false, message: '用户名至少需要3个字符' }
  }

  if (password.length < 6) {
    return { valid: false, message: '密码至少需要6个字符' }
  }

  // 检查是否为默认密码
  if (password === DEFAULT_ADMIN_ACCOUNT.defaultPassword || password === DEFAULT_SUPERADMIN_ACCOUNT.defaultPassword) {
    return { valid: false, message: '请修改默认密码以确保安全' }
  }

  return { valid: true, message: '验证通过' }
}

/**
 * 获取角色显示名称
 */
export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return '管理员'
    case 'superadmin':
      return '超级管理员'
    default:
      return '学生'
  }
}

/**
 * 获取角色权限说明
 */
export const getRolePermissions = (role: UserRole): string[] => {
  switch (role) {
    case 'admin':
      return [
        '可以查看和删除普通用户',
        '可以管理用户学习进度',
        '可以查看系统统计信息'
      ]
    case 'superadmin':
      return [
        '拥有管理员的所有权限',
        '可以修改用户角色',
        '可以删除管理员账户',
        '拥有系统最高权限'
      ]
    default:
      return ['可以学习课程内容', '可以管理自己的学习进度']
  }
}