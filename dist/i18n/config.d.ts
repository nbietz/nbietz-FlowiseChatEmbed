export type Locale = 'en' | 'es' | 'es-MX' | 'fr' | 'de' | 'zh' | 'hi' | 'ar' | 'ja' | 'ru' | 'tr' | 'he' | string;
export interface LocaleConfig {
    code: Locale;
    name: string;
    dir?: 'ltr' | 'rtl';
    dateFormat?: string;
}
export declare const defaultLocale: Locale;
export declare const supportedLocales: LocaleConfig[];
export declare const fallbackLocale: Locale;
//# sourceMappingURL=config.d.ts.map