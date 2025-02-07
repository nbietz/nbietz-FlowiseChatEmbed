import { Locale, defaultLocale, fallbackLocale } from './config';

export type TranslationKey = string;

export interface Translations {
  [key: TranslationKey]: string | { [key: string]: any };
}

// Import all translations directly
import en from './locales/en.json';
import es from './locales/es.json';
import esMX from './locales/es-MX.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import zh from './locales/zh.json';
import hi from './locales/hi.json';
import ar from './locales/ar.json';
import ja from './locales/ja.json';
import ru from './locales/ru.json';
import tr from './locales/tr.json';
import he from './locales/he.json';
import it from './locales/it.json';
import ptBR from './locales/pt-BR.json';
import pt from './locales/pt.json';
import ko from './locales/ko.json';
import id from './locales/id.json';
import pl from './locales/pl.json';
import vi from './locales/vi.json';

// Create a map of all translations
const bundledTranslations: Record<Locale, Translations> = {
  en,
  es,
  'es-MX': esMX,
  fr,
  de,
  zh,
  hi,
  ar,
  ja,
  ru,
  tr,
  he,
  it,
  'pt-BR': ptBR,
  pt,
  ko,
  id,
  pl,
  vi,
};

export class TranslationsManager {
  private static instance: TranslationsManager;
  private translations: Map<Locale, Translations> = new Map();
  private currentLocale: Locale = defaultLocale;

  private constructor() {
    console.log('[TranslationsManager] Initialized with default locale:', defaultLocale);
    // Initialize with bundled translations
    Object.entries(bundledTranslations).forEach(([locale, translations]) => {
      this.translations.set(locale as Locale, translations);
    });
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
    // No need to fetch - translations are already loaded
    if (!this.translations.has(locale) && locale !== fallbackLocale) {
      console.warn(`[TranslationsManager] No translations found for locale: ${locale}, falling back to ${fallbackLocale}`);
      return;
    }
  }

  translate(key: TranslationKey, params: { [key: string]: string | number } = {}): string {
    console.log('[TranslationsManager] Translating key:', key, 'with params:', params);
    const translations = this.translations.get(this.currentLocale) || this.translations.get(fallbackLocale);

    if (!translations) {
      console.warn(`[TranslationsManager] No translations found for locale: ${this.currentLocale}`);
      return key;
    }

    const translation = this.getNestedTranslation(translations, key);

    // Only return the key if the translation is undefined (not found)
    // This allows empty strings to be valid translations
    if (translation === undefined) {
      console.warn(`[TranslationsManager] Translation key not found: ${key}`);
      return key;
    }

    // Replace parameters in translation string if it's a string
    if (typeof translation === 'string') {
      let result = translation;
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
      });
      console.log('[TranslationsManager] Translated result:', result);
      return result;
    }

    console.warn(`[TranslationsManager] Translation value is not a string: ${key}`);
    return key;
  }

  private getNestedTranslation(obj: any, path: string): string | undefined {
    const result = path.split('.').reduce((prev, curr) => {
      // Check if prev exists and has the property (even if it's an empty string)
      return prev === undefined || prev === null ? undefined : prev[curr];
    }, obj);
    console.log('[TranslationsManager] Getting nested translation for path:', path, 'result:', result);
    return result;
  }
}

// Create a convenient shorthand function for translations
export const t = (key: TranslationKey, params?: { [key: string]: string | number }): string => {
  return TranslationsManager.getInstance().translate(key, params);
};
