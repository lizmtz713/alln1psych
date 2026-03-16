/**
 * InGauge Internationalization (i18n)
 * 
 * Supports English and Spanish with culturally-adapted content.
 * Spanish is transcreated, not just translated.
 * On first launch, language is set from device locale so Spanish speakers get Spanish by default.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { en } from './en';
import { es } from './es';

export type Language = 'en' | 'es';

export type TranslationKey = keyof typeof en;

interface I18nState {
  language: Language;
  /** When true, we no longer auto-set from device locale. */
  userHasChosenLanguage: boolean;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const translations: Record<Language, typeof en> = {
  en,
  es,
};

/** Detect device language for Spanish; used to set default before user has chosen. */
export function getDeviceLanguage(): Language {
  try {
    const getLocales = typeof Localization.getLocales === 'function' ? Localization.getLocales : null;
    const locales = getLocales?.() ?? [];
    const first = Array.isArray(locales) && locales.length > 0 ? locales[0] : null;
    const code = first?.languageCode ?? '';
    return typeof code === 'string' && code.startsWith('es') ? 'es' : 'en';
  } catch {
    return 'en';
  }
}

export const useI18n = create<I18nState>()(
  persist(
    (set, get) => ({
      language: 'en',
      userHasChosenLanguage: false,

      setLanguage: (lang) => set({ language: lang, userHasChosenLanguage: true }),
      
      t: (key, params) => {
        const { language } = get();
        let text = translations[language][key] || translations.en[key] || key;
        
        // Replace parameters like {name} with actual values
        if (params) {
          Object.entries(params).forEach(([param, value]) => {
            text = text.replace(new RegExp(`{${param}}`, 'g'), String(value));
          });
        }
        
        return text;
      },
    }),
    {
      name: 'i18n-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ language: state.language, userHasChosenLanguage: state.userHasChosenLanguage }),
    }
  )
);

// Convenience hook for components
export function useTranslation() {
  const language = useI18n((s) => s.language);
  const setLanguage = useI18n((s) => s.setLanguage);
  const t = useI18n((s) => s.t);
  
  return { language, setLanguage, t };
}

// Get current language outside of React
export function getCurrentLanguage(): Language {
  return useI18n.getState().language;
}

// Translate outside of React
export function translate(key: TranslationKey, params?: Record<string, string | number>): string {
  return useI18n.getState().t(key, params);
}
