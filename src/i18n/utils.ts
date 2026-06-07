import { locales } from './locales';

export const defaultLang = 'es';

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in locales) return lang as keyof typeof locales;
  return defaultLang;
}

export function useUiTranslations(lang: keyof typeof locales) {
  return function t(key: string) {
    const keys = key.split('.');
    let value: any = locales[lang].ui;

    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        // Fallback to default language if key missing
        let fallback: any = locales[defaultLang].ui;
        for (const fk of keys) {
          if (fallback && fallback[fk]) {
            fallback = fallback[fk];
          } else {
            return key;
          }
        }
        return fallback;
      }
    }
    return value;
  };
}
