/**
 * POST /api/lead — lead intake. THE ONLY SERVER-SIDE CODE IN THIS PROJECT.
 *
 * Replaces `apps-script/Code.gs` (deleted 2026-08-24). The Apps Script existed to
 * hold a Telegram bot token somewhere a static site could not. With Google Sheets
 * and Gmail removed earlier the same day, its only remaining job was relaying one
 * message — and Cloudflare, where this site is already hosted, does that better:
 *
 *   · the token is an encrypted Pages environment variable, never in the bundle;
 *   · this runs on OUR origin, so there is no CORS, no `/exec` URL, no preflight,
 *     and — the part that actually matters — THE BROWSER CAN READ THE RESPONSE.
 *     Under Apps Script it could not: ContentService always answered 200 and
 *     submitLead() never read the body, so a failed send showed the visitor a
 *     success message while the lead vanished. That failure mode is gone here.
 *   · the request to Telegram leaves from Cloudflare's edge, not the visitor's
 *     network — `api.telegram.org` is unreachable from many Uzbek networks, which
 *     is also why sending straight from the browser was never an option.
 *
 * ENVIRONMENT (Pages project → Settings → Environment variables, ENCRYPTED):
 *   TG_TOKEN     bot token from @BotFather
 *   TG_CHAT_ID   numeric group id the bot posts into (group ids are negative)
 * Nothing else. No secret is ever written in this file (BC3).
 *
 * UNCHANGED BY THE MOVE: Telegram is the ONLY destination, so a message that does
 * not arrive is a lead that does not exist. The difference is that now the visitor
 * is told, and the failure is in a log with the full text.
 */

/** Encrypted Pages environment variables. Optional at the type level on purpose:
 *  an unset variable is a deployment mistake this code must survive, not crash on. */
interface Env {
  TG_TOKEN?: string;
  TG_CHAT_ID?: string;
}

/** The slice of the Pages Functions context this handler uses. Hand-written so the
 *  project needs no `@cloudflare/workers-types` dependency — tsconfig includes
 *  every file, so `astro check` reads this one and an unresolved import would fail
 *  the build. */
interface PagesContext {
  request: Request;
  env: Env;
}

type Lead = Record<string, string>;

/** Length caps and control-character stripping only. §9.5: the "reject bodies
 *  containing URLs" rule stays DROPPED — it discarded legitimate enquiries that
 *  pasted an Instagram or a tour link. */
const clean = (value: unknown, max = 500): string =>
  value === null || value === undefined
    ? ''
    : String(value)
        .replace(/[\u0000-\u001f\u007f]/g, ' ')
        .trim()
        .slice(0, max);

/** E.164 with a permissive fallback for foreign numbers (§9.2). Mirrors
 *  normalisePhone() in src/lib/submitLead.ts: that one normalises for display,
 *  this one normalises what actually reaches the manager. */
const normalisePhone = (raw: unknown): string => {
  const digits = String(raw ?? '').replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('998')) return `+${digits}`;
  if (digits.length === 9) return `+998${digits}`;
  return digits ? `+${digits}` : '';
};

/** TWO ENCODINGS REACH THIS ENDPOINT, AND ONLY ONE OF THEM IS JSON.
 *
 *  The JS path sends JSON. The no-JS path is a NATIVE FORM SUBMIT, which a browser
 *  always encodes as application/x-www-form-urlencoded — no markup makes it send
 *  JSON. Reading only JSON is exactly the bug that silently lost every no-JS lead
 *  until 2026-08-19; it is not being reintroduced.
 *
 *  Which encoding it was also decides the RESPONSE shape: JSON for `fetch`, a
 *  redirect or a real page for a native submit, because in that case whatever we
 *  return IS the visitor's next screen. */
async function parseBody(request: Request): Promise<{ data: Lead; native: boolean }> {
  const type = request.headers.get('content-type') ?? '';

  if (type.includes('application/json') || type.includes('text/plain')) {
    try {
      const raw: unknown = JSON.parse(await request.text());
      if (raw && typeof raw === 'object') return { data: raw as Lead, native: false };
    } catch {
      // A malformed JSON body is still worth reading no further rather than
      // throwing — but it is not worth losing the request over either.
    }
    return { data: {}, native: false };
  }

  const form = await request.formData();
  const data: Lead = {};
  form.forEach((value, key) => {
    if (typeof value === 'string') data[key] = value;
  });
  return { data, native: true };
}

/** The message the group receives. Format deliberately identical to the Apps
 *  Script version — the client reads these every day and a reshuffle would cost
 *  them time for no benefit. */
function buildText(data: Lead, phone: string): string {
  const f = (key: string, max: number) => clean(data[key], max);
  const line = (label: string, value: string) => (value ? `${label}: ${value}\n` : '');

  return (
    `Yangi ariza (${f('form', 20)})\n` +
    line('Ism', f('name', 120)) +
    `Tel: ${phone}\n` +
    line('Email', f('email', 160)) +
    line('Yonalish', f('destination', 160)) +
    line('Tur', f('tourTitle', 200)) +
    line('Sana', f('dates', 40)) +
    line('Kishi', f('pax', 20)) +
    line('Aloqa', f('contactPref', 20)) +
    line('Izoh', clean(data.message || data.comment, 2000)) +
    `Til: ${f('locale', 8)}  -  ${f('page', 300)}`
  );
}

/** Per-attempt budget. TWO attempts must finish inside the 8 s the browser gives
 *  us (SUBMIT_TIMEOUT_MS in src/lib/submitLead.ts), because the whole point of
 *  moving off Apps Script was that the visitor gets a REAL answer instead of the
 *  client's own timeout. Found by running it: without a timeout a Telegram that
 *  accepts the connection and then never answers holds the request open until
 *  Cloudflare kills it, and the visitor sees the ambiguous case again. */
const TELEGRAM_TIMEOUT_MS = 3500;

/** ONE retry. Telegram is a single point of failure and a lost lead is
 *  unrecoverable, so a transient 5xx or a dropped connection is worth a second
 *  attempt. Two attempts, not a loop: a flood must not become a retry queue.
 *  Returns the failure reason, or null on success. */
async function sendTelegram(env: Env, text: string): Promise<string | null> {
  const url = `https://api.telegram.org/bot${env.TG_TOKEN}/sendMessage`;
  let last = 'unknown';

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: env.TG_CHAT_ID, text, disable_web_page_preview: true }),
        signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
      });
      if (res.ok) return null;

      // Telegram answers 4xx with a JSON description that names the real problem
      // ("chat not found", "bot was kicked from the group"). Keep it verbatim.
      last = `HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`;
      // A 4xx fails identically on a retry — a wrong chat id does not heal in
      // 200 ms. Only 5xx and thrown network errors are worth a second attempt.
      if (res.status < 500) break;
    } catch (err) {
      last = String(err);
    }
  }

  return last;
}

const json = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });

/** What a no-JS visitor's browser renders on failure. They performed a native
 *  submit, so this response is their next page — a bare JSON body would be a dead
 *  end, and §9.4 says a failed form must never be one. */
function nativeFailure(locale: string): Response {
  const ru = locale === 'ru';
  const title = ru ? 'Заявка не отправлена' : 'Ariza yuborilmadi';
  const text = ru
    ? 'Произошла техническая ошибка. Пожалуйста, свяжитесь с нами напрямую — все каналы на странице контактов.'
    : 'Texnik xatolik yuz berdi. Iltimos, biz bilan bevosita bogʻlaning — barcha kanallar kontaktlar sahifasida.';
  const back = ru ? 'Открыть контакты' : 'Kontaktlarni ochish';

  return new Response(
    `<!doctype html><html lang="${ru ? 'ru' : 'uz'}"><meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<title>${title}</title>` +
      `<body style="font:16px/1.6 system-ui,sans-serif;max-width:40rem;margin:3rem auto;padding:0 1rem">` +
      `<h1 style="font-size:1.5rem">${title}</h1><p>${text}</p>` +
      `<p><a href="/${ru ? 'ru' : 'uz'}/contacts/">${back}</a></p>`,
    { status: 502, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env } = context;

  // Same-origin only. This replaces the shared FORM_TOKEN, which existed solely
  // because the old endpoint was a bare public Google URL with no origin context.
  // A header the browser sets and a page cannot forge beats a "secret" that
  // shipped inside that page. Absent headers are ACCEPTED: some browsers omit
  // Origin on same-origin form posts, and a missing header must never cost a lead.
  const host = new URL(request.url).host;
  const foreign = (value: string | null): boolean => {
    if (!value) return false;
    try {
      return new URL(value).host !== host;
    } catch {
      return false;
    }
  };
  if (foreign(request.headers.get('origin')) || foreign(request.headers.get('referer')))
    return json({ ok: false, error: 'cross_origin' }, 403);

  let data: Lead;
  let native: boolean;
  try {
    ({ data, native } = await parseBody(request));
  } catch (err) {
    return json({ ok: false, error: `unreadable_body: ${String(err)}` }, 400);
  }

  const locale = data.locale === 'ru' ? 'ru' : 'uz';
  const redirectTo = (path: string) => Response.redirect(new URL(path, request.url).toString(), 303);

  // §9.5 honeypot — accept and discard. Silence is deliberate: a bot that learns
  // nothing does not adapt. A real visitor can never fill this field.
  if (clean(data.website)) return native ? redirectTo(`/${locale}/thanks/`) : json({ ok: true }, 200);

  // §9.1 — the one universally required field.
  const phone = normalisePhone(data.phone);
  if (!/^\+\d{9,15}$/.test(phone))
    return native ? redirectTo(`/${locale}/contacts/`) : json({ ok: false, error: 'invalid_phone' }, 400);

  const text = buildText(data, phone);

  if (!env.TG_TOKEN || !env.TG_CHAT_ID) {
    // A deployment mistake, not a visitor mistake. Log the whole lead so it can be
    // recovered from the Pages log, and answer with the truth.
    console.error(`LEAD LOST: TG_TOKEN or TG_CHAT_ID is not set.\n${text}`);
    return native ? nativeFailure(locale) : json({ ok: false, error: 'not_configured' }, 503);
  }

  const failure = await sendTelegram(env, text);
  if (failure) {
    console.error(`LEAD LOST: telegram send failed (${failure})\n${text}`);
    return native ? nativeFailure(locale) : json({ ok: false, error: 'telegram_failed' }, 502);
  }

  return native ? redirectTo(`/${locale}/thanks/`) : json({ ok: true }, 200);
}

/** Anything that is not a POST. Opening the URL in a browser must not look broken,
 *  and must reveal nothing: this endpoint is WRITE-ONLY BY DESIGN (§9.6). */
export function onRequest(): Response {
  return json({ ok: true, service: 'getcar-lead-intake' }, 405);
}
