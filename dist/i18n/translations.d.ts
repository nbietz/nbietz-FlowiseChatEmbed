import { Locale } from './config';
export type TranslationKey = string;
export interface Translations {
    [key: TranslationKey]: string | {
        [key: string]: any;
    };
}
export declare class TranslationsManager {
    private static instance;
    private translations;
    private currentLocale;
    private constructor();
    static getInstance(): TranslationsManager;
    setLocale(locale: Locale): void;
    getCurrentLocale(): Locale;
    loadTranslations(locale: Locale): Promise<void>;
    translate(key: TranslationKey, params?: {
        [key: string]: string | number;
    }): string;
    private getNestedTranslation;
}
export declare const t: (key: TranslationKey, params?: {
    [key: string]: string | number;
} | undefined) => string;
//# sourceMappingURL=translations.d.ts.map