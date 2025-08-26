/**
 * Internationalization (i18n) Configuration
 * Uses next-intl for multi-language support
 */

import { getRequestConfig } from 'next-intl/server';

export type Locale = 'ko' | 'en';

export const locales: Locale[] = ['ko', 'en'];
export const defaultLocale: Locale = 'ko';

// Define the supported locales
export const localeNames: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
};

// Configure next-intl
export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  const validLocale = locale && locales.includes(locale as Locale) ? locale : defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default,
  };
});