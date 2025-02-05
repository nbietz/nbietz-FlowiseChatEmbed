import { Locale, defaultLocale, fallbackLocale } from './config';

export type TranslationKey = string;

export interface Translations {
  [key: TranslationKey]: string | { [key: string]: any };
}

export class TranslationsManager {
  private static instance: TranslationsManager;
  private translations: Map<Locale, Translations> = new Map();
  private currentLocale: Locale = defaultLocale;

  private constructor() {
    console.log('[TranslationsManager] Initialized with default locale:', defaultLocale);
  }

  static getInstance(): TranslationsManager {
    if (!TranslationsManager.instance) {
      TranslationsManager.instance = new TranslationsManager();
    }
    return TranslationsManager.instance;
  }

  setLocale(locale: Locale) {
    console.log('[TranslationsManager] Setting locale:', locale);
    this.currentLocale = locale;
  }

  getCurrentLocale(): Locale {
    console.log('[TranslationsManager] Getting current locale:', this.currentLocale);
    return this.currentLocale;
  }

  async loadTranslations(locale: Locale) {
    console.log('[TranslationsManager] Loading translations for locale:', locale);
    try {
      // Use fetch instead of dynamic import for JSON files
      const response = await fetch(`/locales/${locale}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const translations = await response.json();
      console.log('[TranslationsManager] Loaded translations:', translations);
      this.translations.set(locale, translations);
    } catch (error) {
      console.warn(`[TranslationsManager] Failed to load translations for locale: ${locale}`, error);
      // If loading fails, try to load fallback locale
      if (locale !== fallbackLocale) {
        await this.loadTranslations(fallbackLocale);
      }
    }
  }

  translate(key: TranslationKey, params: { [key: string]: string | number } = {}): string {
    console.log('[TranslationsManager] Translating key:', key, 'with params:', params);
    const translations = this.translations.get(this.currentLocale) || this.translations.get(fallbackLocale);
    
    if (!translations) {
      console.warn(`[TranslationsManager] No translations found for locale: ${this.currentLocale}`);
      return key;
    }

    let translation = this.getNestedTranslation(translations, key);

    if (!translation) {
      console.warn(`[TranslationsManager] Translation key not found: ${key}`);
      return key;
    }

    // Replace parameters in translation string if it's a string
    if (typeof translation === 'string') {
      Object.entries(params).forEach(([param, value]) => {
        if (translation) {
          translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
        }
      });
      console.log('[TranslationsManager] Translated result:', translation);
      return translation;
    }

    console.warn(`[TranslationsManager] Translation value is not a string: ${key}`);
    return key;
  }

  private getNestedTranslation(obj: any, path: string): string | undefined {
    const result = path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : undefined;
    }, obj);
    console.log('[TranslationsManager] Getting nested translation for path:', path, 'result:', result);
    return result;
  }
}

// Create a convenient shorthand function for translations
export const t = (key: TranslationKey, params?: { [key: string]: string | number }): string => {
  return TranslationsManager.getInstance().translate(key, params);
}; 