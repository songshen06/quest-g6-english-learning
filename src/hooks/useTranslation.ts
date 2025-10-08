import { useGameStore } from '@/store/useGameStore'
import { useUserStore } from '@/store/useUserStore'
import { translations } from '@/i18n/translations'

export const useTranslation = () => {
  const { progress } = useGameStore()
  const { currentUser } = useUserStore()

  // 优先使用用户设置，如果没有则使用progress设置，最后使用默认设置
  const currentLanguage = currentUser?.settings?.language || progress?.settings?.language || 'both'

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations.en

    // Default to English
    if (currentLanguage === 'en') {
      value = translations.en
    } else if (currentLanguage === 'zh') {
      value = translations.zh
    } else {
      // For 'both', default to English but you could implement
      // logic to show both languages here
      value = translations.en
    }

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }

  const showBothLanguages = currentLanguage === 'both'

  return { t, currentLanguage, showBothLanguages }
}