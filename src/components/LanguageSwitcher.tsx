import { Component, createSignal, For } from 'solid-js';
import { Locale, supportedLocales } from '../i18n/config';
import { TranslationsManager } from '../i18n/translations';

interface LanguageSwitcherProps {
  onLanguageChange?: (locale: Locale) => void;
}

export const LanguageSwitcher: Component<LanguageSwitcherProps> = (props: LanguageSwitcherProps) => {
  const translationsManager = TranslationsManager.getInstance();
  const [currentLocale, setCurrentLocale] = createSignal(translationsManager.getCurrentLocale());

  const handleLanguageChange = async (locale: Locale) => {
    await translationsManager.loadTranslations(locale);
    translationsManager.setLocale(locale);
    setCurrentLocale(locale);
    props.onLanguageChange?.(locale);
  };

  const handleSelectChange = (e: Event) => {
    const target = e.currentTarget as HTMLSelectElement;
    handleLanguageChange(target.value as Locale);
  };

  return (
    <div class="language-switcher">
      <select value={currentLocale()} onChange={handleSelectChange} class="language-select">
        <For each={supportedLocales}>{(locale) => <option value={locale.code}>{locale.name}</option>}</For>
      </select>
    </div>
  );
};
