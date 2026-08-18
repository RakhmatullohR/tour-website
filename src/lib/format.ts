// §15 / §8.1 — dates and numbers via Intl, per locale.
import { LOCALE_TAGS } from '../i18n/locales.mjs';

const tag = (locale: string) => LOCALE_TAGS[locale] ?? locale;

/** Prices are DISPLAYED AS ENTERED and never auto-converted (§7). The currency
 *  token is localised; the amount is not. */
export function formatPrice(amount: number, currency: string, locale: string): string {
  const n = new Intl.NumberFormat(tag(locale), { maximumFractionDigits: 0 }).format(amount);
  if (currency === 'USD') return `$${n}`;
  return `${n} ${locale === 'ru' ? 'сум' : 'soʻm'}`;
}

export function formatDate(iso: string, locale: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat(tag(locale), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}

export function formatDateShort(iso: string, locale: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat(tag(locale), { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(d);
}

/** The struck-through old price only ever produces a badge when the discount is
 *  real — the schema already hard-fails on oldAmount <= amount (§7.1). */
export const discountPercent = (amount: number, oldAmount?: number) =>
  oldAmount && oldAmount > amount ? Math.round(((oldAmount - amount) / oldAmount) * 100) : null;

/** Today in ISO, UTC. The build-time departure floor (§7.3 layer 1) compares
 *  against this, and the runtime script compares against the browser's own. */
export const todayISO = () => new Date().toISOString().slice(0, 10);
