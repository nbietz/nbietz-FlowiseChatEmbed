import { createContext, useContext, ParentComponent, createSignal, onMount } from 'solid-js';
import { Locale, defaultLocale } from './config';
import { TranslationsManager } from './translations';
import { LanguageDetector } from './languageDetector';

interface LanguageContextValue {
  currentLocale: () => Locale;
  setLocale: (locale: Locale) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue>();

export const LanguageProvider: ParentComponent = (props) => {
  const translationsManager = TranslationsManager.getInstance();
  const [currentLocale, setCurrentLocale] = createSignal<Locale>(defaultLocale);

  const setLocale = async (locale: Locale) => {
    await translationsManager.loadTranslations(locale);
    translationsManager.setLocale(locale);
    setCurrentLocale(locale);
    // Optionally update URL
    const url = new URL(window.location.href);
    url.searchParams.set('lang', locale);
    window.history.replaceState({}, '', url.toString());
  };

  onMount(async () => {
    const detectedLocale = LanguageDetector.detect();
    await setLocale(detectedLocale);
  });

  const value: LanguageContextValue = {
    currentLocale,
    setLocale,
  };

  return <LanguageContext.Provider value={value}>{props.children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
