import { Component } from 'solid-js';
import { LanguageProvider } from './i18n/LanguageContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { t } from './i18n/translations';

const App: Component = () => {
  return (
    <LanguageProvider>
      <div class="app-container">
        <header class="app-header">
          <h1>{t('common.welcome')}</h1>
          <LanguageSwitcher />
        </header>
        <main>
          <div class="disclaimer">
            <h2>{t('common.disclaimer.title')}</h2>
            <p>{t('common.disclaimer.message')}</p>
            <div class="disclaimer-buttons">
              <button class="accept-button">{t('common.disclaimer.accept')}</button>
              <button class="deny-button">{t('common.disclaimer.deny')}</button>
            </div>
          </div>
          <div class="chat-container">
            <div class="chat-messages">
              <p class="welcome-message">{t('chat.welcomeMessage')}</p>
            </div>
            <div class="chat-input">
              <input type="text" placeholder={t('chat.inputPlaceholder')} class="message-input" />
              <button class="send-button">{t('chat.send')}</button>
            </div>
          </div>
        </main>
        <footer>
          <p>{t('chat.poweredBy', { company: 'FlowiseAI' })}</p>
        </footer>
      </div>
    </LanguageProvider>
  );
};

export default App;
