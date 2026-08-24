// PLAN §9 — THE ONLY PLACE THAT TALKS TO THE LEAD ENDPOINT.
//
// REWRITTEN 2026-08-24 with the move from Apps Script to a Cloudflare Pages
// Function (`functions/api/lead.ts`). The old contract is quoted here because
// every line of it inverted, and someone will otherwise "restore" a rule that now
// causes the bug it used to prevent:
//
//   OLD: "NEVER send Content-Type: application/json — it triggers a CORS preflight
//   and Apps Script does not answer OPTIONS." TRUE THEN. Now the endpoint is a
//   same-origin path, so there is no CORS at all and no preflight to avoid.
//
//   OLD: "the response may or may not be readable across the 302 to
//   googleusercontent.com, so the UX contract is written so that IT DOES NOT
//   MATTER: we redirect on resolve-or-timeout, never on confirmed success."
//   That was a workaround for an endpoint we could not hear back from. We can hear
//   back now, and we ACT ON IT: success is confirmed success. This is the whole
//   reason for the move — a failed send used to show the visitor a thank-you page.

export interface LeadPayload {
  /** Which form produced this. */
  form: 'quick' | 'booking' | 'lead' | 'callback';
  /** THE ONLY UNIVERSALLY REQUIRED FIELD — this market converts on phone. */
  phone: string;
  name?: string;
  email?: string;
  message?: string;
  comment?: string;
  dates?: string;
  pax?: string;
  destination?: string;
  /** Prefilled on tour detail pages. */
  tourId?: string;
  tourTitle?: string;
  contactPref?: 'call' | 'telegram' | 'whatsapp';
  /** Page locale, so the manager answers in the right language. */
  locale: string;
  /** Page URL, for attribution. */
  page: string;
  /** §9.5 honeypot — CSS-hidden. Non-empty means bot: ACCEPT AND DISCARD. */
  website?: string;
  /** §9.5 time trap — ms since the form rendered. */
  elapsedMs?: number;
}

export const SUBMIT_TIMEOUT_MS = 8000;
const DRAFT_KEY = 'gt:lead-draft';
const RATE_KEY = 'gt:lead-count';
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 3;
/** §9.5 — multi-field forms only. NOT applied to the one-field callback widget,
 *  where autofill would false-reject a real person. */
const MIN_ELAPSED_MS = 2000;

/** 'discarded' is BOT-SHAPED input and must be indistinguishable from success to
 *  the caller. 'rate-limited' must NOT be: it is a real person being stopped by our
 *  own counter, and showing them a thank-you page loses the lead in silence. */
export type SubmitResult = 'ok' | 'discarded' | 'error' | 'rate-limited';

/** E.164 with a permissive fallback for foreign numbers (§9.2). */
export function normalisePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('998')) return `+${digits}`;
  if (digits.length === 9) return `+998${digits}`;
  return digits ? `+${digits}` : '';
}

export const isValidPhone = (raw: string) => /^\+\d{9,15}$/.test(normalisePhone(raw));

/** §9.5 — a localStorage counter is NOT rate limiting. One click to clear, or
 *  incognito, or curl. It exists to slow an accidental double-submit, nothing
 *  more, and we do not claim otherwise.
 *
 *  SPLIT INTO CHECK AND RECORD on 2026-08-24. It used to do both in one call, made
 *  from the top of submitLead() — so an attempt that never reached the network
 *  still burned a slot. Combined with the timeout now surfacing an error whose copy
 *  says "try again", three failed attempts silently exhausted the cap and the
 *  fourth was reported to the visitor as SUCCESS. Only a request that actually
 *  goes out counts. */
function underClientCap(): boolean {
  try {
    const now = Date.now();
    const hits: number[] = JSON.parse(localStorage.getItem(RATE_KEY) ?? '[]').filter(
      (t: number) => now - t < RATE_WINDOW_MS,
    );
    return hits.length < RATE_MAX;
  } catch {
    return true; // storage blocked — never block a real submission over it
  }
}

function recordAttempt(): void {
  try {
    const now = Date.now();
    const hits: number[] = JSON.parse(localStorage.getItem(RATE_KEY) ?? '[]').filter(
      (t: number) => now - t < RATE_WINDOW_MS,
    );
    hits.push(now);
    localStorage.setItem(RATE_KEY, JSON.stringify(hits));
  } catch {
    /* storage blocked — the cap simply does not apply */
  }
}

export function saveDraft(p: Partial<LeadPayload>) {
  try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}
export function loadDraft(): Partial<LeadPayload> | null {
  try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? 'null'); } catch { return null; }
}
export function clearDraft() {
  try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
}

/**
 * Submit a lead.
 *
 * Returns 'discarded' for a bot-shaped submission — the caller then behaves
 * EXACTLY as it does on success, because telling a bot it was detected is how it
 * learns to evade the check.
 */
export async function submitLead(
  payload: LeadPayload,
  opts: { endpoint: string },
): Promise<SubmitResult> {
  // §9.5 honeypot: a bot that filled the hidden field. Accept and discard.
  if (payload.website) return 'discarded';
  // §9.5 time trap: multi-field forms only.
  if (payload.form !== 'callback' && payload.elapsedMs !== undefined && payload.elapsedMs < MIN_ELAPSED_MS)
    return 'discarded';
  if (!underClientCap()) return 'rate-limited';

  // Draft survives a failed submit so the user never retypes (§9.4 UX contract).
  saveDraft(payload);

  if (!opts.endpoint) {
    // No endpoint configured (the tracked tree carries placeholders only, BC3).
    // Surfacing this as an error is correct: the form must not silently pretend.
    return 'error';
  }

  const body = JSON.stringify({ ...payload, ts: new Date().toISOString() });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

  recordAttempt();

  try {
    const res = await fetch(opts.endpoint, {
      method: 'POST',
      // Same-origin now, so application/json is correct and preflight-free. The
      // old text/plain workaround is documented in this file's header.
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: controller.signal,
      redirect: 'follow',
    });
    // The response is READABLE, so it is read. This is the point of the move: the
    // endpoint answers 502 when Telegram refused the message, and the visitor is
    // shown the error state with direct contact links instead of a thank-you page
    // for a lead that does not exist.
    if (!res.ok) return 'error';
    clearDraft();
    return 'ok';
  } catch (err) {
    // A timeout (AbortError) lands here too, and it is NOT read as success. The
    // old code did, reasoning that "the row has very probably been appended";
    // there is no row and no second destination, so a timeout means UNKNOWN. The
    // two outcomes are not symmetric: a duplicate is one extra message in a group,
    // a lost lead is unrecoverable and invisible. The error state is not a dead
    // end — it carries the Telegram and WhatsApp links (§9.4) — and the draft is
    // kept, not cleared, so nothing is retyped.
    return 'error';
  } finally {
    clearTimeout(timer);
  }
}
