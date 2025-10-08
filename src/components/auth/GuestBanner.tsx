import React from 'react'
import { UserPlus, Save, X } from 'lucide-react'
import { useUserStore } from '@/store/useUserStore'
import { GuestConversionModal } from './GuestConversionModal'

export const GuestBanner: React.FC = () => {
  const { currentUser, isLoggedIn, showGuestConversion, setShowGuestConversion } = useUserStore()

  // 如果没有用户或不是访客用户，不显示横幅
  if (!isLoggedIn || !currentUser?.displayName.includes('访客用户')) {
    return null
  }

  return (
    <>
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <UserPlus className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-900">
                你正在以访客身份学习
              </p>
              <p className="text-xs text-yellow-700">
                学习进度将保存在本地，建议注册账号以便长期使用
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuestConversion(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Save className="w-3 h-3" />
              保存进度
            </button>
          </div>
        </div>
      </div>

      <GuestConversionModal
        isOpen={showGuestConversion}
        onClose={() => setShowGuestConversion(false)}
      />
    </>
  )
}