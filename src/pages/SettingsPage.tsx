import React from 'react'
import { Navigation } from '@/components/Navigation'
import { useGameStore } from '@/store/useGameStore'
import { useUserStore } from '@/store/useUserStore'
import { useTranslation } from '@/hooks/useTranslation'
import { UserSettings } from '@/types'
import {
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Music,
  Music2,
  Palette,
  Type,
  Zap,
  Eye,
  Brain,
  Moon,
  Sun,
  Contrast
} from 'lucide-react'

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation()
  const { progress, updateSettings } = useGameStore()
  const { currentUser, isLoggedIn } = useUserStore()

  // 优先使用用户设置，如果没有则使用progress设置，最后使用默认设置
  const settings = currentUser?.settings || progress?.settings || {
    fontSize: 'normal',
    theme: 'light',
    soundEnabled: true,
    musicEnabled: false,
    animationsEnabled: true,
    simplifiedMode: false,
    lowStimulusMode: false,
    language: 'both'
  }

  const handleSettingChange = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    if (!isLoggedIn) return // 未登录时不允许更改设置
    updateSettings({ [key]: value })
  }

  const toggleSetting = <K extends keyof UserSettings>(
    key: K,
    currentValue: boolean
  ) => {
    if (!isLoggedIn) return // 未登录时不允许更改设置
    updateSettings({ [key]: !currentValue } as any)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Login Prompt for non-logged users */}
      {!isLoggedIn && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 font-medium">Sign in to save your settings</p>
                <p className="text-blue-700 text-sm">Create an account to customize your learning experience</p>
              </div>
              <button
                onClick={() => useUserStore.getState().setShowLoginModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="safe-top bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('settings.title')}
          </h1>
          <p className="text-gray-600 mt-2">
            {isLoggedIn
              ? "Customize your learning experience"
              : "Preview settings (sign in to make changes)"
            }
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-8 space-y-6">
        {/* Appearance Settings */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Theme Setting */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                {t('settings.theme')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', icon: Sun, label: t('settings.light') },
                  { value: 'dark', icon: Moon, label: t('settings.dark') },
                  { value: 'high-contrast', icon: Contrast, label: t('settings.highContrast') }
                ].map((theme) => {
                  const Icon = theme.icon
                  return (
                    <button
                      key={theme.value}
                      onClick={() => handleSettingChange('theme', theme.value as any)}
                      disabled={!isLoggedIn}
                      className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 ${
                        settings.theme === theme.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!isLoggedIn ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{theme.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Font Size Setting */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                {t('settings.fontSize')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'normal', label: t('settings.normal'), size: 'text-base' },
                  { value: 'large', label: t('settings.large'), size: 'text-lg' },
                  { value: 'extra-large', label: t('settings.extraLarge'), size: 'text-xl' }
                ].map((font) => (
                  <button
                    key={font.value}
                    onClick={() => handleSettingChange('fontSize', font.value as any)}
                    disabled={!isLoggedIn}
                    className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 ${
                      settings.fontSize === font.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${!isLoggedIn ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <Type className={`w-5 h-5 ${font.size}`} />
                    <span className="text-xs font-medium">{font.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility Settings */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Accessibility & ADHD Support
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Simplified Mode */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900">
                    {t('settings.simplifiedMode')}
                  </div>
                  <div className="text-sm text-gray-500">
                    Reduce distractions and show only essential information
                  </div>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('simplifiedMode', settings.simplifiedMode)}
                disabled={!isLoggedIn}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.simplifiedMode ? 'bg-primary-600' : 'bg-gray-200'
                } ${!isLoggedIn ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.simplifiedMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Low Stimulus Mode */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900">
                    {t('settings.lowStimulusMode')}
                  </div>
                  <div className="text-sm text-gray-500">
                    Disable animations and reduce visual stimulation
                  </div>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('lowStimulusMode', settings.lowStimulusMode)}
                disabled={!isLoggedIn}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.lowStimulusMode ? 'bg-primary-600' : 'bg-gray-200'
                } ${!isLoggedIn ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.lowStimulusMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Audio Settings */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Audio
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Sound Effects */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                {settings.soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-gray-400" />
                ) : (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <div className="font-medium text-gray-900">
                    {t('settings.sound')}
                  </div>
                  <div className="text-sm text-gray-500">
                    Sound effects for correct answers and interactions
                  </div>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('soundEnabled', settings.soundEnabled)}
                disabled={!isLoggedIn}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.soundEnabled ? 'bg-primary-600' : 'bg-gray-200'
                } ${!isLoggedIn ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Background Music */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                {settings.musicEnabled ? (
                  <Music className="w-5 h-5 text-gray-400" />
                ) : (
                  <Music2 className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <div className="font-medium text-gray-900">
                    {t('settings.music')}
                  </div>
                  <div className="text-sm text-gray-500">
                    Background music during learning sessions
                  </div>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('musicEnabled', settings.musicEnabled)}
                disabled={!isLoggedIn}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.musicEnabled ? 'bg-primary-600' : 'bg-gray-200'
                } ${!isLoggedIn ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.musicEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Language Display */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Type className="w-5 h-5" />
              {t('settings.language')}
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-3">
              {[
                { value: 'both', label: t('settings.both'), desc: 'Show both English and Chinese' },
                { value: 'en', label: t('settings.englishOnly'), desc: 'English only' },
                { value: 'zh', label: t('settings.chineseOnly'), desc: '中文 only' }
              ].map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => handleSettingChange('language', lang.value as any)}
                  disabled={!isLoggedIn}
                  className={`p-4 rounded-lg border-2 transition-colors text-left ${
                    settings.language === lang.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!isLoggedIn ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="font-medium text-gray-900">{lang.label}</div>
                  <div className="text-sm text-gray-500">{lang.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">
            💡 ADHD-Friendly Tips
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm">Use Large or Extra Large font size for better readability</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm">Enable Low Stimulus Mode to reduce distractions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm">Try Simplified Mode for focused learning sessions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm">Keep sessions short (10-15 minutes) for better focus</span>
            </li>
          </ul>
        </div>
      </main>

      {/* Navigation */}
      <Navigation />
    </div>
  )
}