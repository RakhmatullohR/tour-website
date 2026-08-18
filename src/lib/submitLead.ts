// PLAN §9 — THE ONLY PLACE THAT TALKS TO THE LEAD ENDPOINT.
//
// Switching provider (Apps Script <-> Web3Forms, §9.4) is a one-file change
// because every form on the site goes through submitLead() below.
//
// ❌ NEVER send `Content-Type: application/json`. It triggers a CORS preflight,
//    Apps Script does not answer OPTIONS, and the request dies. This is the single
//    most common failure with this integration. We send text/plain, which is a
//    CORS-safelisted value and therefore never preflighted.
//
// The response may or may not be readable across the 302 -> googleusercontent.com
// hop (§9.4, R8 — rated 50/50 and settled by the P0 spike). The UX contract is
// therefore written so that IT DOES NOT MATTER: we redirect on resolve-or-timeout,
// never on "confirmed success".

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

export type SubmitResult = 'ok' | 'discarded' | 'error';

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
 *  more, and we do not claim otherwise. */
function underClientCap(): boolean {
  try {
    const now = Date.now();
    const hits: number[] = JSON.parse(localStorage.getItem(RATE_KEY) ?? '[]').filter(
      (t: number) => now - t < RATE_WINDOW_MS,
    );
    if (hits.length >= RATE_MAX) return false;
    hits.push(now);
    localStorage.setItem(RATE_KEY, JSON.stringify(hits));
    return true;
  } catch {
    return true; // storage blocked — never block a real submission over it
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
  opts: { endpoint: string; token: string },
): Promise<SubmitResult> {
  // §9.5 honeypot: a bot that filled the hidden field. Accept and discard.
  if (payload.website) return 'discarded';
  // §9.5 time trap: multi-field forms only.
  if (payload.form !== 'callback' && payload.elapsedMs !== undefined && payload.elapsedMs < MIN_ELAPSED_MS)
    return 'discarded';
  if (!underClientCap()) return 'discarded';

  // Draft survives a failed submit so the user never retypes (§9.4 UX contract).
  saveDraft(payload);

  if (!opts.endpoint) {
    // No endpoint configured (the tracked tree carries placeholders only, BC3).
    // Surfacing this as an error is correct: the form must not silently pretend.
    return 'error';
  }

  const body = JSON.stringify({ ...payload, token: opts.token, ts: new Date().toISOString() });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

  try {
    await fetch(opts.endpoint, {
      method: 'POST',
      // CORS-safelisted. Do not "fix" this to application/json.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
      signal: controller.signal,
      redirect: 'follow',
    });
    clearDraft();
    return 'ok';
  } catch (err) {
    // An AbortError means the 8 s budget expired. The row has very probably been
    // appended — Apps Script does the cheap append FIRST (§9.3) — so treating a
    // timeout as failure would produce duplicate submissions. Resolve-or-timeout
    // is the contract; only a genuine network failure is an error.
    if (err instanceof DOMException && err.name === 'AbortError') {
      clearDraft();
      return 'ok';
    }
    return 'error';
  } finally {
    clearTimeout(timer);
  }
}
