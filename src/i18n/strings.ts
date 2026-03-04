/**
 * Quick i18n strings for UI — use with userStore.locale.
 * Usage: const t = getStrings(locale); <Text>{t.continue}</Text>
 * For AI: inject lang instruction when locale === 'es' in system prompt.
 */

import { en } from './en';
import { es } from './es';
import type { AppLocale } from '../stores/userStore';

export type Strings = typeof en;

export const strings: Record<AppLocale, Strings> = {
  en,
  es,
};

/** Get UI strings for the given locale. Defaults to English. */
export function getStrings(locale: AppLocale | null | undefined): Strings {
  return locale === 'es' ? strings.es : strings.en;
}
