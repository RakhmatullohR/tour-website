// §15 / §8.1 — dates and numbers via Intl, per locale.
import { LOCALE_TAGS, DEFAULT_LOCALE } from '../i18n/locales.mjs';

const tag = (locale: string) => LOCALE_TAGS[locale] ?? locale;

/** How each locale WRITES the Uzbek soum.
 *
 *  English gets the ISO code, not a transliteration: "4,300,000 soum" means
 *  nothing to a reader who has never seen the currency, while UZS is what their
 *  bank, their card statement and every converter will show them. Uzbek and
 *  Russian keep the word their own readers use. Missing locale falls back to the
 *  default rather than rendering a bare number with no unit — a price with no
 *  currency is the one formatting bug that costs money. */
const SOUM: Record<string, string> = { uz: 'soʻm', ru: 'сум', en: 'UZS' };

/** Prices are DISPLAYED AS ENTERED and never auto-converted (§7). The currency
 *  token is localised; the amount is not. */
export function formatPrice(amount: number, currency: string, locale: string): string {
  const n = new Intl.NumberFormat(tag(locale), { maximumFractionDigits: 0 }).format(amount);
  if (currency === 'USD') return `$${n}`;
  return `${n} ${SOUM[locale] ?? SOUM[DEFAULT_LOCALE]}`;
}

/* ------------------------------------------------------------------ *
 * PLURAL AGREEMENT
 *
 * Russian nouns after a number take one of THREE forms, chosen by the last digits:
 * 1 ночь · 2 ночи · 5 ночей. The dictionary previously hard-coded the many-form
 * ("{nights} ночей {days} дней"), which renders "2 ночей 3 дней" — visibly broken
 * grammar on every tour card, the most-repeated string on the site.
 *
 * The fix is a slot, not a rewrite of t(): the component asks for the right word
 * and passes it in, so uz.json and ru.json keep IDENTICAL interpolation slots and
 * check-i18n's slot-parity assertion still holds. Uzbek has no number agreement,
 * so its forms are simply the same word three times; English has two, so its
 * `few` and `many` slots hold the same plural. The slot is what makes a third
 * locale free — no component had to change to add English.
 * ------------------------------------------------------------------ */
type PluralForms = readonly [one: string, few: string, many: string];

const UNITS: Record<string, Record<string, PluralForms>> = {
  night: { uz: ['kecha', 'kecha', 'kecha'], ru: ['ночь', 'ночи', 'ночей'], en: ['night', 'nights', 'nights'] },
  day: { uz: ['kun', 'kun', 'kun'], ru: ['день', 'дня', 'дней'], en: ['day', 'days', 'days'] },
  tour: { uz: ['tur', 'tur', 'tur'], ru: ['тур', 'тура', 'туров'], en: ['tour', 'tours', 'tours'] },
};

/** Which CLDR plural ruleset each locale is scored against. `null` means the
 *  language has no number agreement at all, so the count never changes the noun
 *  and asking Intl would be pure ceremony — Uzbek is such a language.
 *
 *  This is a per-locale FACT, not a special case for one language: adding a
 *  locale means adding its three forms above and its tag here, and nothing in
 *  the components changes. The previous `locale === 'ru' ? ... : ...` shape read
 *  as "Russian or Uzbek" and silently gave English "2 night 3 day". */
const PLURAL_TAG: Record<string, string | null> = { uz: null, ru: 'ru-RU', en: 'en' };

/** Intl.PluralRules gives 'one' | 'few' | 'many' | 'other'. For ru-RU 'other' is
 *  only reached by fractions, which no count here can be; for en it is the plain
 *  plural, which is why the `few` and `many` slots hold the same word. */
export function pluralUnit(unit: keyof typeof UNITS, n: number, locale: string): string {
  const forms = UNITS[unit][locale] ?? UNITS[unit][DEFAULT_LOCALE];
  const rules = PLURAL_TAG[locale];
  if (!rules) return forms[0];
  const cat = new Intl.PluralRules(rules).select(n);
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
