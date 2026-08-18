// PLAN §8.1 — typed t() helper. EVERY component consumes t() FROM THE FIRST
// COMPONENT BUILT (Principle 5). There is no uz-only phase to retrofit later.
import uz from './uz.json';
import ru from './ru.json';
import { DEFAULT_LOCALE, SHIPPED_LOCALES } from './locales.mjs';

const dicts: Record<string, Record<string, string>> = { uz, ru };
export type TranslationKey = keyof typeof uz;
export type Locale = (typeof SHIPPED_LOCALES)[number];

/** Values substituted into `{placeholder}` slots. */
export type TParams = Record<string, string | number>;

const interpolate = (s: string, params?: TParams) =>
  params ? s.replace(/\{(\w+)\}/g, (m, k) => (k in params ? String(params[k]) : m)) : s;

/** A missing key falls back to uz and logs a build warning.
 *  It NEVER renders a raw key to a user. */
export function useTranslations(locale: string) {
  const dict = dicts[locale] ?? dicts[DEFAULT_LOCALE];
  return function t(key: TranslationKey, params?: TParams): string {
    const hit = dict[key] ?? dicts[DEFAULT_LOCALE][key];
    if (dict[key] === undefined)
      console.warn(`  [i18n] WARN  missing key "${key}" for locale "${locale}" — fell back to ${DEFAULT_LOCALE}`);
    return interpolate(hit ?? String(key), params);
  };
}

export type TFunction = ReturnType<typeof useTranslations>;
