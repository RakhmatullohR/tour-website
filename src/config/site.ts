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
  youtube: null,             // TODO(Q18) — still no channel
};

/** Q3 — public contact email. Set 2026-08-24, replacing the provisional
 *  personal-name Gmail.
 *
 *  READ THIS BEFORE THE NEXT DEPLOY. The value given was `info@getcartravel.com`
 *  — **`.com`, while the site itself runs on `getcartravel.uz`** (astro.config.mjs,
 *  docs/DEPLOY.md §1). Nothing in this project owns or points at the `.com` domain,
 *  and `docs/DEPLOY.md` §2 records that the default MX on the `.uz` zone was
 *  deliberately removed so mail there "bounces honestly". So this address is
 *  unverified on two counts: the domain may not be the client's, and no mailbox is
 *  known to exist behind it. It is shipped as instructed, not as confirmed.
 *
 *  Measured against the built tree, not estimated: it renders on 44 of the 46
 *  emitted pages — every page carrying the shared footer, i.e. all but the root
 *  language picker `/` and `/404.html` — plus the Contacts channel list, and as
 *  `email` in the TravelAgency JSON-LD on 6 of them (uz+ru home, about, contacts).
 *  A dead address is therefore a dead conversion path on nearly the whole site,
 *  worse than the Gmail it replaced. Verify a message actually arrives, or switch
 *  the one string to `info@getcartravel.uz` (that domain IS owned; Zoho Mail or
 *  Yandex 360 host it free — DEPLOY.md §5).
 *
 *  Null hides the email everywhere — footer row, contacts channel and the
 *  TravelAgency schema — exactly like ADDRESS and HOURS below. */
export const EMAIL: string | null = 'info@getcartravel.com';

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
