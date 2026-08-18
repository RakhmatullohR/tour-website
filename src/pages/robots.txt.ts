// §14 — robots.txt. Generated rather than static so the Sitemap: line always
// carries the real deployed origin, which changes between staging and production.
import type { APIRoute } from 'astro';
import { SHIPPED_LOCALES } from '../i18n/locales.mjs';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site).href;
  const disallow = SHIPPED_LOCALES.map((l) => `Disallow: /${l}/thanks/`).join('\n');
  return new Response(
    `User-agent: *\nAllow: /\n${disallow}\n\nSitemap: ${sitemap}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
