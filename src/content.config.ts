// Astro 7 requires this file at src/content.config.ts (NOT src/content/config.ts),
// and `loader` is REQUIRED in defineCollection. Schemas are Zod 4 (astro depends
// on zod ^4.3.6). PLAN §8.
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod'; // NOT 'astro:content' — that re-export is @deprecated in Astro 7
import { glob } from 'astro/loaders';
import { imageKeys } from './lib/images';
import { SHIPPED_LOCALES } from './i18n/locales.mjs';

/** Catches a stale number typed into prose. WARNS — never a hard fail (BC6):
 *  "Viza rasmiylashtiruvi — 50 USD" in `excludes` is entirely legitimate. */
const MONEY_IN_PROSE = /\d[\s ]*(so['ʻ`]m|som|sum|UZS|USD|\$|€|₽|руб)/i;
const warnOnce = new Set<string>();
const warn = (msg: string) => {
  if (warnOnce.has(msg)) return;
  warnOnce.add(msg);
  console.warn(`  [content] WARN  ${msg}`);
};

const localeBlock = z.object({
  title: z.string().min(3),
  summary: z.string().min(10),
  priceNote: z.string().optional(),
  includes: z.array(z.string()).default([]),
  excludes: z.array(z.string()).default([]),
  itinerary: z.array(z.object({ day: z.number().int().positive(), text: z.string() })).default([]),
  seo: z.object({ title: z.string(), description: z.string() }).optional(),
});

const tours = defineCollection({
  loader: glob({ pattern: '**/[^_]*.json', base: './src/content/tours' }),
  schema: z
    .object({
      id: z.string(),
      slug: z.string().regex(/^[a-z0-9-]+$/),
      status: z.enum(['draft', 'published', 'archived']).default('published'),
      featured: z.boolean().default(false),
      order: z.number().int().default(100),

      country: z.enum(['UZ', 'MY', 'TR', 'AE', 'TH', 'EG']),
      cities: z.array(z.string()).default([]),
      category: z.enum(['beach', 'excursion', 'family', 'pilgrimage', 'shopping', 'domestic']),
      departureCity: z.string().default('Toshkent'),

      duration: z.object({ days: z.number().int().positive(), nights: z.number().int().nonnegative() }),

      // TOP-LEVEL and SINGLE-INSTANCE (BC6). Cross-locale parity holds BY
      // CONSTRUCTION. Do NOT move these into the i18n blocks: that would permit
      // per-locale prices and force a translation round-trip for every price
      // change — the exact client-autonomy deadlock this design avoids.
      price: z.object({
        amount: z.number().positive(),
        currency: z.enum(['UZS', 'USD']),
        per: z.enum(['person', 'group']).default('person'),
        oldAmount: z.number().positive().optional(),
      }),
      flightIncluded: z.boolean(),

      groupSize: z.object({ min: z.number().int().positive(), max: z.number().int().positive() }).optional(),
      departures: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).default([]),
      badges: z.array(z.enum(['hot', 'discount', 'new', 'last-minute'])).default([]),

      images: z.object({ cover: z.string(), gallery: z.array(z.string()).default([]) }),

      i18n: z.record(z.string(), localeBlock),
    })
    /* ---- §7.1 validation: strictness matched to COMMERCIAL risk ---- */
    .refine((t) => t.i18n.uz !== undefined, {
      error: 'The `uz` locale block is required — it is the source of truth.',
      path: ['i18n', 'uz'],
    })
    .refine((t) => !t.price.oldAmount || t.price.oldAmount > t.price.amount, {
      error: 'price.oldAmount must be GREATER than price.amount — otherwise the discount is fake.',
      path: ['price', 'oldAmount'],
    })
    // BUILD FAILS. The client does not sell air tickets (§1). A price shown in a
    // shipped language with no "flight not included" note is the single most
    // likely source of a customer dispute.
    .refine(
      (t) =>
        t.flightIncluded ||
        SHIPPED_LOCALES.every((l) => {
          const b = t.i18n[l];
          return !b || (b.priceNote !== undefined && b.priceNote.trim().length > 0);
        }),
      {
        error:
          'flightIncluded is false, so every shipped locale MUST carry a non-empty priceNote ' +
          '(e.g. "Narxga aviabilet kirmaydi."). Missing in at least one shipped locale.',
        path: ['i18n'],
      },
    )
    .superRefine((t, ctx) => {
      // WARN, never fail (BC6).
      for (const [loc, b] of Object.entries(t.i18n)) {
        const prose = [b.summary, b.priceNote ?? '', ...b.includes, ...b.excludes].join(' | ');
        if (MONEY_IN_PROSE.test(prose))
          warn(`${t.slug} [${loc}]: a price appears inside prose. The real price lives in the top-level "price" field — check it is not stale.`);
      }
      // WARN + placeholder. A missing photo must never block a client publish.
      if (!imageKeys.has(t.images.cover))
        warn(`${t.slug}: cover "${t.images.cover}" is not in src/assets/images — a placeholder will be used.`);
      for (const g of t.images.gallery)
        if (!imageKeys.has(g)) warn(`${t.slug}: gallery image "${g}" is not in src/assets/images — it will be skipped.`);
      void ctx;
    }),
});

export const collections = { tours };
