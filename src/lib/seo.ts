// PLAN §14 — JSON-LD, three types at launch: TravelAgency, TouristTrip,
// BreadcrumbList. FAQPage and Article ship with their add-on routes.
//
// Every URL emitted here is ABSOLUTE, because that is what the Rich Results Test
// and hreflang both require.
import type { CollectionEntry } from 'astro:content';
import { PHONE_E164, BRAND_NAME, SOCIAL, ADDRESS } from '../config/site';

export type Json = Record<string, unknown>;

const abs = (site: URL | undefined, path: string) => new URL(path, site).href;

export function travelAgencySchema(site: URL | undefined, locale: string, description: string): Json {
  const sameAs = [
    SOCIAL.telegram && `https://t.me/${SOCIAL.telegram}`,
    SOCIAL.instagram && `https://instagram.com/${SOCIAL.instagram}`,
    SOCIAL.youtube && `https://youtube.com/${SOCIAL.youtube}`,
  ].filter(Boolean);

  const schema: Json = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: BRAND_NAME,
    description,
    url: abs(site, `/${locale}/`),
    telephone: PHONE_E164,
    areaServed: 'UZ',
  };
  if (sameAs.length) schema.sameAs = sameAs;
  // Auto-hides when the client has not supplied an address (BC12b) — an
  // incomplete PostalAddress is worse than none for structured data.
  if (ADDRESS)
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: locale === 'ru' ? ADDRESS.ru : ADDRESS.uz,
      addressCountry: 'UZ',
    };
  return schema;
}

export function touristTripSchema(
  site: URL | undefined,
  locale: string,
  tour: CollectionEntry<'tours'>,
  imageUrl: string | null,
): Json {
  const b = tour.data.i18n[locale]!;
  const schema: Json = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: b.title,
    description: b.summary,
    url: abs(site, `/${locale}/tours/${tour.data.slug}/`),
    touristType: tour.data.category,
    offers: {
      '@type': 'Offer',
      price: tour.data.price.amount,
      priceCurrency: tour.data.price.currency,
      // Every "Bron qilish" button is a LEAD FORM, not a booking (ADR). The site
      // can never show real availability, so this is the honest value.
      availability: 'https://schema.org/PreOrder',
      url: abs(site, `/${locale}/tours/${tour.data.slug}/`),
    },
    provider: { '@type': 'TravelAgency', name: BRAND_NAME, telephone: PHONE_E164 },
  };
  if (imageUrl) schema.image = abs(site, imageUrl);
  if (tour.data.duration) schema.itinerary = { '@type': 'ItemList', numberOfItems: tour.data.duration.days };
  return schema;
}

export function breadcrumbSchema(site: URL | undefined, crumbs: { name: string; path: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(site, c.path),
    })),
  };
}
