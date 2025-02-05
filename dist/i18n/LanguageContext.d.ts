import { ParentComponent } from 'solid-js';
import { Locale } from './config';
interface LanguageContextValue {
    currentLocale: () => Locale;
    setLocale: (locale: Locale) => Promise<void>;
}
export declare const LanguageProvider: ParentComponent;
export declare const useLanguage: () => LanguageContextValue;
export {};
//# sourceMappingURL=LanguageContext.d.ts.map