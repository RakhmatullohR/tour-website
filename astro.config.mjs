// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { SHIPPED_LOCALES, DEFAULT_LOCALE } from './src/i18n/locales.mjs';

// Q2 RESOLVED 2026-08-19 — the domain is registered, not assumed: getcartravel.uz
// (registrar AIRNET, registry UZINFOCOM, holder Rustamov Raxmatillo Rustam O'g'li).
// Note the spelling: NO hyphen. The previous placeholder read `getcar-travel.uz`,
// which is a different name that nobody owns — it would have shipped a wrong
// canonical, hreflang, OG, sitemap and JSON-LD on every single page.
// SITE_URL still wins so deploy previews can override the production origin.
// `||`, NOT `??`. deploy.yml passes SITE_URL: ${{ vars.SITE_URL }} — an UNSET
// repository variable expands to the EMPTY STRING, not to undefined, and '' is
// not nullish, so `??` would hand Astro site: '' and silently ship relative
// canonicals with no origin. `||` falls through on '' as well as on undefined.
const SITE = process.env.SITE_URL?.trim() || 'https://getcartravel.uz';

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },

  i18n: {
    defaultLocale: DEFAULT_LOCALE,
    // BC5 — the SAME constant getStaticPaths() consumes. getLocaleRelativeUrl
    // throws MissingLocale for a locale absent from this list, which turns
    // "link to an unbuilt locale" into a loud build failure instead of a 404.
    locales: SHIPPED_LOCALES,
    routing: {
      // BC4 — MANDATORY. Verified in astro@7.2.2 dist/i18n/index.js: the locale
      // segment is pushed only for the *-prefix-always* strategies, otherwise
      // `else if (locale !== defaultLocale)`. Without this,
      // getRelativeLocaleUrl('uz','/tours/') returns '/tours/' — a URL the
      // [lang] tree never emits, i.e. a 404 on every default-locale link.
      prefixDefaultLocale: true,
      // redirectToDefaultLocale is deliberately NOT set. It defaults to false,
      // which is what keeps `/` as the real language-picker page (PLAN §5).
    },
  },

  integrations: [
    sitemap({
      i18n: { defaultLocale: DEFAULT_LOCALE, locales: Object.fromEntries(SHIPPED_LOCALES.map((l) => [l, l])) },
      // The bare root `/` is the language-picker page (PLAN §5). @astrojs/sitemap
      // has no locale segment to read there, so it falls back to defaultLocale and
      // emits hreflang="uz" for BOTH `/` and `/uz/` — two different URLs claiming
      // the same locale, which is a genuine duplicate-hreflang defect. The picker
      // has no search value of its own, and every emitted page already declares
      // x-default -> /uz/ in its own <head>, so exclude it from the sitemap.
      filter: (page) => new URL(page).pathname !== '/',
    }),
  ],

  vite: { plugins: [tailwindcss()] },
});
