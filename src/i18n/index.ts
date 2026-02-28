/**
 * InGauge Internationalization (i18n)
 * 
 * Supports English and Spanish with culturally-adapted content.
 * Spanish is transcreated, not just translated.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en } from './en';
import { es } from './es';

export type Language = 'en' | 'es';

export type TranslationKey = keyof typeof en;

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const translations: Record<Language, typeof en> = {
  en,
  es,
};

export const useI18n = create<I18nState>()(
  persist(
    (set, get) => ({
      language: 'en',
      
      setLanguage: (lang) => set({ language: lang }),
      
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
      partialize: (state) => ({ language: state.language }),
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
