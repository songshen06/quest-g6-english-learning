import React from 'react'
import { Navigation } from '@/components/Navigation'
import { useGameStore } from '@/store/useGameStore'
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
  const settings = progress?.settings

  const handleSettingChange = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    updateSettings({ [key]: value })
  }

  const toggleSetting = <K extends keyof UserSettings>(
    key: K,
    currentValue: boolean
  ) => {
    updateSettings({ [key]: !currentValue } as any)
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-lg">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="safe-top bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('settings.title')}
          </h1>
          <p className="text-gray-600 mt-2">
            Customize your learning experience
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
                      className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 ${
                        settings.theme === theme.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
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
                    className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 ${
                      settings.fontSize === font.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
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
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.simplifiedMode ? 'bg-primary-600' : 'bg-gray-200'
                }`}
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
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.lowStimulusMode ? 'bg-primary-600' : 'bg-gray-200'
                }`}
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
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.soundEnabled ? 'bg-primary-600' : 'bg-gray-200'
                }`}
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
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.musicEnabled ? 'bg-primary-600' : 'bg-gray-200'
                }`}
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
                  className={`p-4 rounded-lg border-2 transition-colors text-left ${
                    settings.language === lang.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
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