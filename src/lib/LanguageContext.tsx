import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations, type Language, translateAnalysisText } from './translations'
import { useAuth } from './AuthContext'
import { supabase } from './supabase'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (path: string) => string
  translateText: (text: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const LANGUAGE_STORAGE_KEY = 'yornam_language'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [language, setLanguageState] = useState<Language>(() => {
    // 1. Check localStorage first
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (saved === 'en' || saved === 'hi') {
      return saved
    }
    // 2. Check browser default
    if (navigator.language && navigator.language.startsWith('hi')) {
      return 'hi'
    }
    return 'en'
  })

  // Sync with user profile on login
  useEffect(() => {
    if (!user) return

    const loadUserLanguage = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('language')
          .eq('id', user.id)
          .single()

        if (!error && data?.language && (data.language === 'en' || data.language === 'hi')) {
          setLanguageState(data.language)
          localStorage.setItem(LANGUAGE_STORAGE_KEY, data.language)
        }
      } catch {
        // Fallback gracefully
      }
    }

    loadUserLanguage()
  }, [user])

  const setLanguage = async (newLang: Language) => {
    setLanguageState(newLang)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang)
    document.documentElement.lang = newLang

    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ language: newLang })
          .eq('id', user.id)
      } catch {
        // Fallback gracefully
      }
    }
  }

  // Nested path translator: e.g. t('hero.title')
  const t = (path: string): string => {
    const keys = path.split('.')
    let current: unknown = translations[language]

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key]
      } else {
        // Fallback to English if missing in target language
        let fallback: unknown = translations.en
        for (const fbKey of keys) {
          if (fallback && typeof fallback === 'object' && fbKey in fallback) {
            fallback = (fallback as Record<string, unknown>)[fbKey]
          } else {
            return path
          }
        }
        return typeof fallback === 'string' ? fallback : path
      }
    }

    return typeof current === 'string' ? current : path
  }

  const translateText = (text: string): string => {
    return translateAnalysisText(text, language)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateText }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
