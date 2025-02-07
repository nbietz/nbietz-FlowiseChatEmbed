import { registerWebComponents } from './register';
import { parseChatbot, injectChatbotInWindow } from './window';
import { TranslationsManager } from './i18n/translations';
import { LanguageDetector } from './i18n/languageDetector';
import type { BotProps } from './window';

registerWebComponents();

export default class Chatbot {
  static async init(config: BotProps) {
    console.log('[Chatbot] Starting initialization');

    // Validate required parameters
    if (!config.chatflowid) {
      throw new Error('[Chatbot] chatflowid is required but was not provided');
    }
    if (!config.apiHost) {
      throw new Error('[Chatbot] apiHost is required but was not provided');
    }

    console.log('[Chatbot] Initializing with translations');

    // Initialize translations
    const translationsManager = TranslationsManager.getInstance();
    const detectedLocale = LanguageDetector.detect();
    await translationsManager.loadTranslations(detectedLocale);
    translationsManager.setLocale(detectedLocale);

    // Helper function to handle both direct translations and translation keys
    const getTranslation = (value: string | Record<string, string | Record<string, any>> | undefined, key: string) => {
      if (!value) return translationsManager.translate(key);
      if (typeof value === 'string') return value;

      // Handle nested objects (like welcomeMessage)
      const translation = value[detectedLocale];
      if (translation) {
        if (typeof translation === 'string') return translation;
        if (typeof translation === 'object' && 'prompts' in translation) return translation.prompts;
      }

      // Try English fallback
      const englishTranslation = value['en'];
      if (englishTranslation) {
        if (typeof englishTranslation === 'string') return englishTranslation;
        if (typeof englishTranslation === 'object' && 'prompts' in englishTranslation) return englishTranslation.prompts;
      }

      // Final fallback to translation system
      return translationsManager.translate(key);
    };

    // Update config with translated strings
    const updatedConfig: BotProps = {
      ...config,
      theme: {
        ...config.theme,
        chatWindow: {
          ...config.theme?.chatWindow,
          welcomeMessage: getTranslation(config.theme?.chatWindow?.welcomeMessage, 'chat.welcomeMessage'),
          errorMessage: getTranslation(config.theme?.chatWindow?.errorMessage, 'chat.errorMessage'),
          title: getTranslation(config.theme?.chatWindow?.title, 'chat.title'),
          sourceDocsTitle: getTranslation(config.theme?.chatWindow?.sourceDocsTitle, 'chat.sourceDocsTitle'),
          textInput: {
            ...config.theme?.chatWindow?.textInput,
            placeholder: getTranslation(config.theme?.chatWindow?.textInput?.placeholder, 'chat.inputPlaceholder'),
            maxCharsWarningMessage: getTranslation(config.theme?.chatWindow?.textInput?.maxCharsWarningMessage, 'chat.maxCharsWarning'),
          },
        },
        footer: {
          ...config.theme?.footer,
          text: getTranslation(config.theme?.footer?.text, 'chat.poweredBy'),
          company: getTranslation(config.theme?.footer?.company, 'chat.company'),
        },
        tooltip: {
          ...config.theme?.tooltip,
          tooltipMessage: getTranslation(config.theme?.tooltip?.tooltipMessage, 'chat.tooltipMessage'),
        },
        disclaimer: {
          ...config.theme?.disclaimer,
          title: getTranslation(config.theme?.disclaimer?.title, 'common.disclaimer.title'),
          message: getTranslation(config.theme?.disclaimer?.message, 'common.disclaimer.message'),
          buttonText: getTranslation(config.theme?.disclaimer?.buttonText, 'common.disclaimer.accept'),
          denyButtonText: getTranslation(config.theme?.disclaimer?.denyButtonText, 'common.disclaimer.deny'),
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

// Only register the Chatbot class in the window object
if (typeof window !== 'undefined') {
  (window as any).Chatbot = Chatbot;
}
