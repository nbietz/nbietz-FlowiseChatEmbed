export type Locale = 'en' | 'es' | 'es-MX' | 'fr' | 'de' | 'zh' | 'hi' | 'ar' | 'ja' | 'ru' | 'tr' | 'he' | string;

export interface LocaleConfig {
  code: Locale;
  name: string;
  dir?: 'ltr' | 'rtl';
  dateFormat?: string;
}

export const defaultLocale: Locale = 'en';

export const supportedLocales: LocaleConfig[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'es-MX', name: 'Español (México)' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
  { code: 'hi', name: 'हिन्दी', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'ja', name: '日本語' },
  { code: 'ru', name: 'Русский' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'he', name: 'עברית', dir: 'rtl' },
];

export const fallbackLocale: Locale = 'en';
