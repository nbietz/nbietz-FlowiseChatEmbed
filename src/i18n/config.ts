export type Locale = 'en' | 'es' | 'es-MX' | 'fr' | 'de' | 'zh' | 'hi' | 'ar' | 'ja' | 'ru' | 'tr' | 'he' | 'it' | 'pt-BR' | 'pt' | 'ko' | 'id' | 'pl' | 'vi' | string;

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
  { code: 'it', name: 'Italiano' },
  { code: 'pt-BR', name: 'Português (Brasil)' },
  { code: 'pt', name: 'Português' },
  { code: 'ko', name: '한국어' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'pl', name: 'Polski' },
  { code: 'vi', name: 'Tiếng Việt' }
];

export const fallbackLocale: Locale = 'en';
