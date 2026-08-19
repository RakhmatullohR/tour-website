// Client-supplied facts, in ONE place.
//
// Everything the client has not yet answered is `null`, and every consumer
// AUTO-HIDES on null rather than rendering an empty block or an invented value
// (BC12b for the footer address; the same discipline applied everywhere else).
// This is what lets Gate 1 be reached with zero client answers.
//
// PLAN §6 row 2: the hero trust numbers "come from the client, NEVER invented".
// They are null until the client supplies them, and the chips do not render.

/** E.164, digits only after the +. Used for tel: and wa.me. */
export const PHONE_E164 = '+998509074000';
/** Human-readable form. */
export const PHONE_DISPLAY = '+998 50 907 40 00';

export interface SocialLinks {
  /** Q17 — t.me username, without the @. */
  telegram: string | null;
  /** Q16 — wa.me number, digits only. */
  whatsapp: string | null;
  /** Q18 */
  instagram: string | null;
  /** Q18 */
  youtube: string | null;
}

export const SOCIAL: SocialLinks = {
  telegram: 'getcar_travel', // TODO(Q17): confirm the real username with the client
  whatsapp: '998509074000',  // TODO(Q16): confirm the real WhatsApp number
  instagram: null,           // TODO(Q18)
  youtube: null,             // TODO(Q18)
};

/** Q22 — office address. Null until supplied; the footer block and the Contacts
 *  map card both auto-hide (BC12b). */
export const ADDRESS: { uz: string; ru: string; mapUrl: string } | null = null;

/** Q21 — opening hours. Null until supplied; the block auto-hides. */
export const HOURS: { uz: string; ru: string } | null = null;

/** Q19 — how the company name is spelled on the site. */
export const BRAND_NAME = 'Getcar Travel';

/** Post-registration only (Q23). Null at launch: the LLC does not exist yet, so
 *  the footer shows the TRADING NAME and nothing more. */
export const LEGAL: { name: string; inn: string; licence: string } | null = null;

/** §6 row 2 — trust chips. NEVER invented; null hides the chip row entirely. */
export const TRUST: { years: number; tourists: number; destinations: number } | null = null;

/** Q8 — Yandex Metrica counter. Any counter ID satisfies Gate 1; the client's
 *  real counter is a Gate-2 item. Null disables the script entirely. */
// `||`, not `??` — an unset GitHub repo variable reaches the build as '', not
// undefined, and '' ?? null is ''. Base.astro gates on truthiness so either
// value omits the tracker, but only `||` makes the declared `string | null`
// type honest. Same reason as astro.config.mjs's SITE_URL.
export const METRICA_ID: string | null = process.env.METRICA_ID?.trim() || null;

/** §9 — the Apps Script Web App /exec URL. Placeholder-only in the tracked tree
 *  (BC3); the real value arrives from the environment at build time. */
export const LEAD_ENDPOINT = process.env.LEAD_ENDPOINT ?? '';
/** §9.5 — a bot filter, NOT authentication. We do not claim otherwise. */
export const LEAD_TOKEN = process.env.LEAD_TOKEN ?? '';

export const telHref = () => `tel:${PHONE_E164}`;
export const telegramHref = (text?: string) =>
  SOCIAL.telegram ? `https://t.me/${SOCIAL.telegram}${text ? `?text=${encodeURIComponent(text)}` : ''}` : null;
export const whatsappHref = (text?: string) =>
  SOCIAL.whatsapp ? `https://wa.me/${SOCIAL.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}` : null;
