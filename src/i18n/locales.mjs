// BC5 — THE single source of shipped locales.
// Consumed by astro.config.mjs (i18n.locales), every getStaticPaths(),
// the hreflang builder, the page-aware language switcher and the sitemap.
// Adding a locale is a one-line change here.
//
// 'en' SHIPPED 2026-08-26. It was AGREED SCOPE all along (BC14 — the client ticked
// Ingliz) and was staged on the English copy, not descoped; the copy has landed, so
// this list is what turns it on. en.json carries full key parity with uz.json and
// every content file has an `en` block.
// 'ms' only if Q4 answers AND the native-review gate passes.
export const SHIPPED_LOCALES = ['uz', 'ru', 'en'];
export const DEFAULT_LOCALE = 'uz';

/** Human labels for the language switcher and the root picker.
 *  @type {Record<string, string>} */
export const LOCALE_LABELS = {
  uz: 'Oʻzbekcha',
  ru: 'Русский',
  en: 'English',
  ms: 'Bahasa Melayu',
};

/** Compact codes for the header switcher. The full label in LOCALE_LABELS is
 *  ~90 px per locale; on a single-line header that is what pushed the row past
 *  the viewport at both 500 px and 1024 px. The full name still ships as sr-only
 *  text, so nothing is lost for a screen reader.
 *  @type {Record<string, string>} */
export const LOCALE_SHORT = { uz: 'UZ', ru: 'RU', en: 'EN', ms: 'MS' };

/** BCP-47 tags for <html lang> and hreflang.
 *  @type {Record<string, string>} */
export const LOCALE_TAGS = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en', ms: 'ms-MY' };
