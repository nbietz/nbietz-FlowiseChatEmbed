import { Locale, supportedLocales, defaultLocale } from './config';

export class LanguageDetector {
  private static findLocaleMatch(searchLocale: string): Locale | undefined {
    // First try exact match
    const exactMatch = supportedLocales.find((locale) => locale.code.toLowerCase() === searchLocale.toLowerCase());
    if (exactMatch) return exactMatch.code;

    // If no exact match, try base language match
    const baseLanguage = searchLocale.toLowerCase().split(/[_-]/)[0];
    const baseMatch = supportedLocales.find((locale) => locale.code.toLowerCase().split(/[_-]/)[0] === baseLanguage);
    return baseMatch?.code;
  }

  static detectFromBrowser(): Locale {
    if (typeof window === 'undefined') return defaultLocale;

    // Get browser languages
    const browserLanguages = navigator.languages || [navigator.language];

    // Try to find a match from browser's preferred languages
    for (const browserLang of browserLanguages) {
      const match = this.findLocaleMatch(browserLang);
      if (match) return match;
    }

    return defaultLocale;
  }

  static detectFromUrl(): Locale | null {
    if (typeof window === 'undefined') return null;

    // Check URL path for language code
    const pathSegments = window.location.pathname.split('/');
    const potentialLocale = pathSegments[1]; // Assuming format: /{locale}/rest/of/path

    if (potentialLocale) {
      const match = this.findLocaleMatch(potentialLocale);
      if (match) return match;
    }

    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');

    if (langParam) {
      const match = this.findLocaleMatch(langParam);
      if (match) return match;
    }

    return null;
  }

  static detect(): Locale {
    // First try URL-based detection
    const urlLocale = this.detectFromUrl();
    if (urlLocale) return urlLocale;

    // Then try browser-based detection
    const browserLocale = this.detectFromBrowser();
    if (browserLocale) return browserLocale;

    // Fallback to default locale
    return defaultLocale;
  }
}
