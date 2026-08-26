// Client-supplied facts, in ONE place.
//
// Everything the client has not yet answered is `null`, and every consumer
// AUTO-HIDES on null rather than rendering an empty block or an invented value
// (BC12b for the footer address; the same discipline applied everywhere else).
// This is what lets Gate 1 be reached with zero client answers.
//
// PLAN §6 row 2: the hero trust numbers "come from the client, NEVER invented".
// They are null until the client supplies them, and the chips do not render.

/** E.164, digits only after the +. Used for `tel:`.
 *  NOT for wa.me — WhatsApp runs on its own number, see `SOCIAL.whatsapp`. */
export const PHONE_E164 = '+998509074000';
/** Human-readable form. */
export const PHONE_DISPLAY = '+998 50 907 40 00';

export interface SocialLinks {
  /** Q17 — the MANAGER's t.me username, without the @. This is the LEAD path: every
   *  "write to us" CTA and the `?text=` prefill point here. */
  telegram: string | null;
  /** Q17 — the public CHANNEL's t.me username, without the @. Follow-only. It must
   *  never become the target of a lead CTA: a channel cannot answer a customer. */
  telegramChannel: string | null;
  /** Q16 — wa.me number, digits only. */
  whatsapp: string | null;
  /** Q18 */
  instagram: string | null;
  /** Q18 */
  youtube: string | null;
}

export const SOCIAL: SocialLinks = {
  // Q17 ANSWERED 2026-08-24 — and it is two accounts, not one. The manager handle
  // changed from the assumed 'getcar_travel' to 'getcar_admin'; the channel is new.
  telegram: 'getcar_admin',
  telegramChannel: 'getcar_channel',
  // Q16 ANSWERED 2026-08-24, and the answer is a DIVERGENCE: the phone moved to
  // +998 50 907 40 00 while WhatsApp was told to stay on the 94 number. These
  // two no longer track each other ON PURPOSE. Do not "resync" them by copying
  // PHONE_E164 here — that would point WhatsApp at a different account.
  whatsapp: '998940914000',  // = +998 94 091 40 00, kept by instruction 2026-08-24
  // Q18 ANSWERED 2026-08-24 for Instagram. Stored as the USERNAME, not the URL the
  // client sent: their link carried `?igsi=...&utm_source=qr`, which is a share-sheet
  // artefact from scanning their own QR code. Shipping it would tag every visitor as
  // arriving from that QR in Instagram's own analytics.
  instagram: 'getcar_travel',
  // Q18 ANSWERED 2026-08-26. Stored as the @handle EXACTLY as YouTube spells it,
  // because a handle is the whole path segment: youtube.com/@GetCarTravel. The
  // old `https://youtube.com/${SOCIAL.youtube}` interpolation assumed a bare
  // channel name and would have produced youtube.com/GetCarTravel — a 404. Use
  // `youtubeHref()` below; nothing should interpolate this field by hand.
  youtube: '@GetCarTravel',
};

/** Q3 — public contact email. WITHDRAWN 2026-08-26 at the client's instruction:
 *  "Bogʻlanish boʻlimidan Emailni olib tashla."
 *
 *  Null is the switch, not a deletion of the plumbing. Every consumer already
 *  auto-hides on null (BC12b), so this one line removes the address from all
 *  three places it used to render — the footer contact row, the Contacts channel
 *  grid, and `email` in the TravelAgency JSON-LD — with no dead markup left
 *  behind and no branch to re-add if a mailbox is ever set up.
 *
 *  For the record of WHY this was the right call rather than a loss: the value
 *  removed was `info@getcartravel.com` — **`.com`, while the site runs on
 *  `getcartravel.uz`** (astro.config.mjs, docs/DEPLOY.md §1). Nothing in this
 *  project owns the `.com` domain, and DEPLOY.md §2 records that the default MX
 *  on the `.uz` zone was deliberately removed so mail there bounces honestly. The
 *  address was therefore unverified on two counts and was very likely a dead
 *  conversion path on 44 of 46 pages. The channels that remain — phone, Telegram,
 *  WhatsApp — all reach a human.
 *
 *  To restore: set a real, tested address here. Nothing else needs to change. */
export const EMAIL: string | null = null;

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

/** §9 — where a lead is POSTed. A SAME-ORIGIN PATH since 2026-08-24, served by
 *  `functions/api/lead.ts` on Cloudflare Pages. It replaced an Apps Script `/exec`
 *  URL that had to be injected at build time from a secret, which is why this is
 *  now a constant and not an environment read: there is nothing left to configure,
 *  and a build can no longer silently ship a form that posts nowhere.
 *
 *  The bot token lives in the Pages environment, never here — see the header of
 *  `functions/api/lead.ts`. `LEAD_TOKEN` is gone with the same change: it was a
 *  shared string that shipped inside the page to filter drive-by bots hitting a
 *  bare public Google URL. The endpoint is our own origin now, so the function
 *  checks the Origin header instead — something the page cannot forge. */
export const LEAD_ENDPOINT = '/api/lead';

export const telHref = () => `tel:${PHONE_E164}`;
export const mailtoHref = () => (EMAIL ? `mailto:${EMAIL}` : null);
export const telegramHref = (text?: string) =>
  SOCIAL.telegram ? `https://t.me/${SOCIAL.telegram}${text ? `?text=${encodeURIComponent(text)}` : ''}` : null;
/** The public channel. No `?text=` — a prefill is meaningless on a channel, which is
 *  read-only for the visitor. */
export const telegramChannelHref = () =>
  SOCIAL.telegramChannel ? `https://t.me/${SOCIAL.telegramChannel}` : null;
export const whatsappHref = (text?: string) =>
  SOCIAL.whatsapp ? `https://wa.me/${SOCIAL.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}` : null;
export const instagramHref = () =>
  SOCIAL.instagram ? `https://www.instagram.com/${SOCIAL.instagram}/` : null;
/** YouTube is the one platform here with TWO incompatible URL shapes: a modern
 *  `@handle` is a path segment of its own, while a legacy channel needs
 *  `/channel/UC…`. Interpolating the raw field into `youtube.com/${x}` — which is
 *  what four call sites used to do — produces a 404 for the handle form. This is
 *  the single place that knows the difference. */
export const youtubeHref = () => {
  const y = SOCIAL.youtube;
  if (!y) return null;
  if (y.startsWith('http')) return y;
  if (y.startsWith('UC')) return `https://www.youtube.com/channel/${y}`;
  return `https://www.youtube.com/${y.startsWith('@') ? y : `@${y}`}`;
};
/** What the Contacts page SHOWS for YouTube — the handle, never the bare URL. */
export const youtubeDisplay = () =>
  SOCIAL.youtube ? (SOCIAL.youtube.startsWith('@') ? SOCIAL.youtube : `@${SOCIAL.youtube}`) : null;
/** Human-readable form of whatever `SOCIAL.whatsapp` holds — DERIVED, never typed
 *  a second time, so the number a page SHOWS can never drift from the number its
 *  link opens. Since 2026-08-24 that is a different number from PHONE_DISPLAY, so
 *  the Contacts page must not reuse the phone's display string for WhatsApp.
 *  Null when WhatsApp is unset; anything that is not a 12-digit UZ number falls
 *  back to a bare `+digits` rather than being mangled into a wrong shape. */
export const whatsappDisplay = (): string | null => {
  if (!SOCIAL.whatsapp) return null;
  const m = /^998(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(SOCIAL.whatsapp);
  return m ? `+998 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : `+${SOCIAL.whatsapp}`;
};
