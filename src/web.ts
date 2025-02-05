import { registerWebComponents } from './register';
import { parseChatbot, injectChatbotInWindow } from './window';
import { TranslationsManager } from './i18n/translations';
import { LanguageDetector } from './i18n/languageDetector';
import type { BotProps } from './window';

registerWebComponents();

export default class Chatbot {
  static async init(config: BotProps) {
    console.log('[Chatbot] Starting initialization with translations');

    // Initialize translations
    const translationsManager = TranslationsManager.getInstance();
    const detectedLocale = LanguageDetector.detect();
    await translationsManager.loadTranslations(detectedLocale);
    translationsManager.setLocale(detectedLocale);

    // Update config with translated strings
    const updatedConfig: BotProps = {
      ...config,
      theme: {
        ...config.theme,
        chatWindow: {
          ...config.theme?.chatWindow,
          welcomeMessage: translationsManager.translate('chat.welcomeMessage'),
          textInput: {
            ...config.theme?.chatWindow?.textInput,
            placeholder: translationsManager.translate('chat.inputPlaceholder'),
          },
        },
        footer: {
          ...config.theme?.footer,
          text: translationsManager.translate('chat.poweredBy', { company: config.theme?.footer?.company || 'FlowiseAI' }),
        },
        disclaimer: {
          ...config.theme?.disclaimer,
          title: translationsManager.translate('common.disclaimer.title'),
          message: translationsManager.translate('common.disclaimer.message'),
        },
      },
    };

    console.log('[Chatbot] Updated config with translations:', updatedConfig);

    // Initialize the chatbot with translated config
    const chatbot = parseChatbot();
    chatbot.init(updatedConfig);
    injectChatbotInWindow(chatbot);

    return chatbot;
  }
}

// Initialize chatbot if window object exists
if (typeof window !== 'undefined') {
  const defaultConfig: BotProps = {
    chatflowid: 'agent1',
    apiHost: 'http://localhost:3001',
  };

  Chatbot.init(defaultConfig).catch((error) => {
    console.error('[Chatbot] Initialization failed:', error);
  });
}
