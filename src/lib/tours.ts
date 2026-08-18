// Shared tour queries. Every route that lists tours goes through here, so the
// §7.1 non-emission rule and the §7.3 build-time departure floor are applied in
// ONE place and cannot drift between the Home page, the catalogue and a
// destination page.
import { getCollection, type CollectionEntry } from 'astro:content';
import { todayISO } from './format';

export type Tour = CollectionEntry<'tours'>;
export type Destination = CollectionEntry<'destinations'>;

/** Published tours that carry a block for `locale`, sorted by `order`.
 *
 *  §7.1 — a tour with no block for this locale is NOT advertised in this
 *  language: no card, no detail page, no hreflang entry, and the page-aware
 *  switcher never offers it. */
export async function getToursFor(locale: string): Promise<Tour[]> {
  const all = await getCollection('tours');
  return all
    .filter((e) => e.data.status === 'published')
    .filter((e) => e.data.i18n[locale] !== undefined)
    .sort((a, b) => a.data.order - b.data.order);
}

/** §7.3 layer 1 — THE BUILD-TIME CORRECTNESS FLOOR. Past departures are dropped
 *  here, so the emitted HTML is correct as of the last build whatever the browser
 *  does. Layer 2 (runtime JS) narrows further; layer 3 (the weekly cron) keeps
 *  this floor from drifting more than seven days. */
export const upcomingDepartures = (t: Tour, today = todayISO()) =>
  t.data.departures.filter((d) => d >= today).sort();

/** The set of shipped locales this tour can actually be rendered in — the same
 *  set that decides emission, drives hreflang, and feeds the switcher (BC8). */
export const localesFor = (t: Tour, shipped: readonly string[]) =>
  shipped.filter((l) => t.data.i18n[l] !== undefined);

export async function getDestinationsFor(locale: string): Promise<Destination[]> {
  const all = await getCollection('destinations');
  return all
    .filter((e) => e.data.i18n[locale] !== undefined)
    .sort((a, b) => a.data.order - b.data.order);
}

/** §6 row 10 / Q14 — REAL reviews only. A sample never reaches the page. */
export async function getReviewsFor(locale: string) {
  const all = await getCollection('reviews');
  return all
    .filter((e) => e.data.real === true)
    .filter((e) => e.data.i18n[locale] !== undefined)
    .sort((a, b) => a.data.order - b.data.order);
}

/** Active promotions, with the same three-layer date discipline as departures:
 *  filtered at build here, re-checked in the browser, floor refreshed weekly. */
export async function getPromotionsFor(locale: string, today = todayISO()) {
  const all = await getCollection('promotions');
  return all
    .filter((e) => e.data.active && e.data.validUntil >= today)
    .filter((e) => e.data.i18n[locale] !== undefined)
    .sort((a, b) => a.data.order - b.data.order);
}

/** The Promotions ROUTE is a filtered view of tours carrying a real discount —
 *  not a separate content type (§5). */
export const discountedTours = (tours: Tour[]) =>
  tours.filter((t) => t.data.price.oldAmount && t.data.price.oldAmount > t.data.price.amount);

/** Cheapest published tour price for a country — the "from" figure on a
 *  destination card. Null when that country has no tour in this locale. */
export function fromPrice(tours: Tour[], country: string) {
  const inCountry = tours.filter((t) => t.data.country === country);
  if (inCountry.length === 0) return null;
  const cheapest = inCountry.reduce((a, b) => (a.data.price.amount <= b.data.price.amount ? a : b));
  return { amount: cheapest.data.price.amount, currency: cheapest.data.price.currency, count: inCountry.length };
}

/** Coarse duration bucket, shared by the filter UI and the data attributes it
 *  filters on, so the two can never disagree. */
export const durationBucket = (days: number) => (days <= 4 ? 'short' : days <= 8 ? 'medium' : 'long');

/** Price buckets are expressed in UZS. A USD-priced tour is normalised at a
 *  deliberately coarse, DISPLAY-ONLY rate purely so it lands in a sensible
 *  filter bucket — the price shown to the customer is never converted (§7). */
const USD_TO_UZS_BUCKETING_ONLY = 12_500;
export const priceBucket = (amount: number, currency: string) => {
  const uzs = currency === 'USD' ? amount * USD_TO_UZS_BUCKETING_ONLY : amount;
  return uzs <= 5_000_000 ? 'low' : uzs <= 10_000_000 ? 'mid' : 'high';
};
