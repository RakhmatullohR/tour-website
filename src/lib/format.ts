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

/* ------------------------------------------------------------------ *
 * RUSSIAN PLURAL AGREEMENT
 *
 * Russian nouns after a number take one of THREE forms, chosen by the last digits:
 * 1 ночь · 2 ночи · 5 ночей. The dictionary previously hard-coded the many-form
 * ("{nights} ночей {days} дней"), which renders "2 ночей 3 дней" — visibly broken
 * grammar on every tour card, the most-repeated string on the site.
 *
 * The fix is a slot, not a rewrite of t(): the component asks for the right word
 * and passes it in, so uz.json and ru.json keep IDENTICAL interpolation slots and
 * check-i18n's slot-parity assertion still holds. Uzbek has no number agreement,
 * so its forms are simply the same word three times.
 * ------------------------------------------------------------------ */
type PluralForms = readonly [one: string, few: string, many: string];

const UNITS: Record<string, Record<'ru' | 'uz', PluralForms>> = {
  night: { ru: ['ночь', 'ночи', 'ночей'], uz: ['kecha', 'kecha', 'kecha'] },
  day: { ru: ['день', 'дня', 'дней'], uz: ['kun', 'kun', 'kun'] },
  tour: { ru: ['тур', 'тура', 'туров'], uz: ['tur', 'tur', 'tur'] },
};

/** Intl.PluralRules gives 'one' | 'few' | 'many' | 'other' for ru-RU; 'other' is
 *  only reached by fractions, which no count here can be. */
export function pluralUnit(unit: keyof typeof UNITS, n: number, locale: string): string {
  const forms = UNITS[unit][locale === 'ru' ? 'ru' : 'uz'];
  if (locale !== 'ru') return forms[0];
  const cat = new Intl.PluralRules('ru-RU').select(n);
  return cat === 'one' ? forms[0] : cat === 'few' ? forms[1] : forms[2];
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
