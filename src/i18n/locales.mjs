// BC5 — THE single source of shipped locales.
// Consumed by astro.config.mjs (i18n.locales), every getStaticPaths(),
// the hreflang builder, the page-aware language switcher and the sitemap.
// Adding a locale is a one-line change here.
//
// 'en' is AGREED SCOPE (BC14) — the client ticked Ingliz. It is staged, not
// descoped: add 'en' here the day the English copy lands.
// 'ms' only if Q4 answers AND the native-review gate passes.
export const SHIPPED_LOCALES = ['uz', 'ru'];
export const DEFAULT_LOCALE = 'uz';

/** Human labels for the language switcher and the root picker.
 *  @type {Record<string, string>} */
export const LOCALE_LABELS = {
  uz: "O'zbekcha",
  ru: 'Русский',
  en: 'English',
  ms: 'Bahasa Melayu',
};

/** BCP-47 tags for <html lang> and hreflang.
 *  @type {Record<string, string>} */
export const LOCALE_TAGS = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en', ms: 'ms-MY' };
