# Open questions

Developer-facing. The client-facing list is `analize/client-open-questions.md`.

Two sources: questions PLAN.md itself left open, and questions that surfaced while
executing P2–P6. Nothing here is a defect — each one is a decision that needs an
answer from outside the codebase.

---

## A. Carried from PLAN.md, still open

| # | Question | Blocks | Notes |
|---|---|---|---|
| A1 | **13.0 d or 13.5 d?** | the quote | Residual risk 1: P1 is bottom-up 1.7–2.0 d against 1.5 d costed. The plan deliberately does not decide this. **User's call.** |
| A2 | Does the client accept a **private** repo? | handover | Q9's framing implies they just open an account; BC2 adds a collaborator-invite step they must complete before they can edit anything. |
| A3 | Is the `RakhmatullohR/tour-website` repo name acceptable? | P8 | Cosmetic but client-visible once they are a collaborator. Raise before handover. |
| A4 | Will the client accept the manager-link payment flow? | architecture | Q7. A "no" changes the architecture class and voids §9's threat model. |
| A5 | Is ~8 tour packages achievable? **Partially answered 2026-08-24 — six, and only their durations.** | P3 scope | If Q6 returns fewer than 4, the catalogue, the filters and the thin destination template all need revisiting. Currently built against **8 developer-authored samples**. See the note below the table. |
| A6 | Recommend **against** exercising the priced `ms` option? | commercial | The Architect's standing position is that the case is weak. Not decided here. |
| A7 | Is Astro right **for handover** if the freelancer walks away? | engagement | Depends on an engagement model the brief does not specify. §11's retainer recommendation is the current answer. |

**A5 — partially answered 2026-08-24.** The client named the durations they sell and
nothing else: **Uzbekistan 7, 2 and 3 days; abroad 8, 7 and 4 days** — six packages, not
eight. Every other Q6 field (country and city, price and currency, what the price
includes and excludes, whether the air ticket is in it, departure city, group size,
departure dates) is still missing, so **the catalogue was deliberately left untouched**:
reshaping the samples to those durations would mean writing itineraries and prices the
client has never seen, which is the one thing this build does not do. The client's raw
wording is in `analize/answers.md`.

Two consequences, to act on when the rest of Q6 arrives:

- **Four of the eight samples do not fit the stated list** — Istanbul 5 d, Dubai 6 d and
  Phuket 10 d are durations the client did not name, and Xiva 4 d puts the 4-day tour in
  Uzbekistan when the client lists 4 days under *abroad*. **Three stated packages have no
  sample at all**: Uzbekistan 7 d, Uzbekistan 2 d, abroad 4 d.
- **The stated range is 2–8 days, which empties the `long` duration bucket.**
  `durationBucket` in `src/lib/tours.ts` cuts at ≤4 / ≤8 / 9+, and `catalog.duration.long`
  reads "9 kun va undan koʻp". Today only Phuket falls in it. Either drop that bucket or
  re-cut the boundaries once the real list lands — a filter option that matches nothing is
  worse than no filter.

**Settled during P0 by the smoke test** (previously open): `import.meta.glob` does
resolve inside `src/content.config.ts`, and `@astrojs/sitemap` does accept a
two-locale list.

---

## B. Raised by P2–P6 execution

| # | Question | Blocks | Why it is open |
|---|---|---|---|
| B1 | ~~**The §9.4 CORS spike has still not been run against a real `/exec`.**~~ **CLOSED 2026-08-20 as moot** — see below. | — | Leads arrive; the response body is not the question any more. |
| B2 | ~~**No form has been submitted end to end.**~~ **CLOSED 2026-08-20 for the JS path** — see below. The **no-JS path is still untested**. | Gate 1 | Real leads now reach the sheet, Telegram and email from the live site. |
| B3 | **Hero trust numbers (years / tourists / destinations).** | §6 row 2 | §6 says these "come from the client, never invented". `TRUST` in `src/config/site.ts` is `null`, so **the chip row does not render at all**. The hero is designed to look complete without it. Supply the numbers and the row appears. |
| B4 | **"Why us" claims need confirming, not inventing.** | Gate 2 | §6 row 7 says "Confirm; do not invent". The four shipped claims (own transfer fleet, native-language guide, official insurance, one manager) are grounded in the trading name and the client's own answers — but **none has been confirmed by the client in writing**. Verify before launch; each is one string in `uz.json`/`ru.json`. |
| B5 | ~~**Telegram / WhatsApp handles are assumed.**~~ **CLOSED 2026-08-24**, except YouTube. | — | Q16, Q17 and Q18-for-Instagram all answered on 2026-08-24 — see the record below. The assumed handle `'getcar_travel'` was **wrong**: the manager is `@getcar_admin`. `SOCIAL.youtube` is still `null` and its link auto-hides. |
| B6 | **Office address and opening hours are `null`.** | Gate 2 | Q21/Q22. The footer block, the Contacts map card and the `PostalAddress` in JSON-LD all auto-hide (BC12b). The `static-map` placeholder is generated and waiting. |
| B7 | **The USD→UZS rate used for PRICE FILTER BUCKETS is a guess.** | P3 polish | `src/lib/tours.ts` normalises a USD price at a coarse fixed rate **for bucketing only** — the price shown to a customer is never converted (§7). Today every sample tour is UZS, so the constant is unexercised. It becomes real the day the client prices a tour in USD. |
| B8 | **Reviews are all `real: false`, so the testimonial block ships as social proof.** | Gate 2 | Q14. Correct and deliberate — §6 row 10 permits fewer than three real reviews to fall back to social links, and inventing quotes was not an option. The `real: true` path is verified to render (3 cards, on Home and About). Three Tier-1 avatar placeholders are generated and waiting. |
| B9 | **The floating widget has not been checked against a real device.** | manual gate | §18 check 14. It is bottom-right, forms are left-aligned inside a max-width container, and the callback panel is width-capped — but that is an argument, not a measurement. **Only Chrome and Firefox exist on this machine; no iOS Safari, no Samsung Internet.** |
| B10 | **Two Tier-2 covers were generated to complete the 8-sample catalogue.** | scope hygiene | §16.1 prices Tier-2 (59 files) as a **+0.5 d add-on**. P3 needs 8 sample tours but Tier 1 budgets only the featured six covers, so `gen-placeholders.mjs --only` was added and **exactly two** files generated (`malayziya-kuala-lumpur`, `ozbekiston-xiva`). This is 2 of 59, not the add-on. Flagging it so it is not later mistaken for delivered scope. |
| B11 | **`METRICA_ID` is unset, so no analytics script and no consent banner ship.** | Gate 1 | Q8 (a **Yandex** account, not a Google one). All six §14 events are wired through one delegated listener and the consent gate is written; with no counter id the whole block is omitted rather than loading a tracker with a fake id. Set `METRICA_ID` and it activates. |
| B12 | ~~**`SITE_URL` still defaults to `https://getcar-travel.uz`.**~~ **CLOSED 2026-08-19** — see below. | — | — |
| B13 | **The consent checkbox was REMOVED from every form on 2026-08-24.** | legal | Removed on the client's instruction after the exposure was put in writing. `PLAN.md` §11 and §18's Gate-1 checklist both list it as **mandatory**, and R6 kept it even while narrowing the disclosure duty. The forms now collect a name and a phone number with no recorded consent. The Privacy page itself is untouched and still linked from the footer and the cookie banner. **Needs a lawyer's sign-off, not a developer's.** |
| B14 | **Lead delivery reduced to Telegram only, 2026-08-24.** | operational | The Sheets row, the notification email and the daily digest are gone on the client's instruction. A failed Telegram send now loses the lead outright, and the visitor is still shown a success message because `submitLead.ts` never reads the response. `TG_CHAT_ID` must be moved off a private chat before this is relied on. |
| B15 | **Lead intake moved off Apps Script to a Cloudflare Pages Function, 2026-08-24.** | operational | `functions/api/lead.ts` on this site's own origin replaced `apps-script/Code.gs`, which is deleted. The old Apps Script Web App deployment is STILL LIVE in Google and must be archived by hand — until then it is a public write endpoint nobody reads. `TG_TOKEN`/`TG_CHAT_ID` must be set as ENCRYPTED Pages environment variables before the next deploy, or every lead is lost. |

**Closed 2026-08-20 by the launch.**

**B2 — end-to-end submission.** The site went live on `getcartravel.uz` and real
leads now arrive. Evidence, not assertion:

| When | Path | Row | `status` |
|---|---|---|---|
| 07:59:34 | browser, JS on, `/uz/contacts/` | appended | `tg_unconfigured` — `TG_CHAT_ID` was not set yet |
| 08:30:20 | direct POST, correct token | appended | `ok` — Telegram **and** email delivered |
| 08:30:57 | direct POST, correct token | appended | `ok` |
| 08:30:20 | direct POST, **no token** | **no row** | — the §9.5 filter is armed, and still answered 200 |

Two things were proved by the same table rather than argued. The `+` on the phone
survives (`+998900995594` on 08-20 against `998900995594` on 08-19, when Sheets was
still evaluating the leading `+` as a formula), and a message beginning `=SUM(1;2)`
was stored as text. So `cell_()` is live in the deployed version.

**What is NOT closed: the no-JS path.** `LEAD-ENDPOINT.md` §5 asks for both, and only
the JS path has been walked. That path failed silently once already (JSON-only body
parsing, and a token that lived only in a DOM attribute), which is exactly why it
does not get to inherit the JS path's result.

**B1 — the CORS spike.** Settled as **moot**, and the distinction matters. A direct
POST to `/exec` does return `302 → script.googleusercontent.com/macros/echo?...`,
and fetching that hop returned `405` with a Drive "page not found" page — so the
response body is, in practice, not readable. But that probe was `curl` through a
TLS-intercepting corporate proxy, not a browser, and `curl` cannot answer a CORS
question at all: it does not enforce the policy. **What the probe did establish is
the only thing that matters** — the request arrives and the row is appended. Since
`submitLead()` redirects on resolve-or-timeout and never reads the body, there is
no decision left to make. Apps Script stays primary; Web3Forms and its ~250
submissions/month ceiling are not needed.

**Closed 2026-08-19 by the domain purchase.**

**B12 — `SITE_URL`.** `getcartravel.uz` is registered (AIRNET → UZINFOCOM, domain
id 9988). `astro.config.mjs` now defaults to it. The old placeholder was
`getcar-travel.uz` **with a hyphen** — a different name nobody owns, so this was
never merely "unset": it was a wrong value that would have shipped a wrong
canonical, hreflang, OG url, sitemap, JSON-LD and `robots.txt` on all 46 pages.
Verified in `dist/`: every absolute URL now carries the registered origin and the
hyphenated string appears nowhere in the output.

**A6 / Q1 — hosting.** Answered: Cloudflare Pages (Variant C), published from the
existing Actions pipeline rather than Pages' own Git integration, so `check:images`
and `check` still gate what ships. `docs/DEPLOY.md` is rewritten around it. The
BC17a record-and-recreate-MX checklist turned out **not to apply to this launch** —
the domain was registered the same day. Note the correction: the zone is **not**
empty — AIRNET auto-provisioned five default records (apex A, three CNAME, one MX),
captured in `docs/DEPLOY.md` §1.1 before anything was changed. None of them fronts
a live service, so there is no mail to destroy, but the checklist's capture step
did apply and was performed. It is retained for any future repoint of a live zone.

**Contact facts updated 2026-08-19.** Phone → `+998 94 091 40 00`. A public
contact email was added and now renders in the footer, as a Contacts channel and
as `email` in the TravelAgency schema, on the same auto-hide-on-null discipline as
ADDRESS and HOURS.

Two things this pulls forward:

- **`EMAIL` is provisional.** It is currently a personal-name Gmail, set so the
  client has something to review. `info@getcartravel.uz` is the intended value and
  the domain is already owned — replacing it is one string in `config/site.ts`.
- **§14 now has SEVEN Metrica events, not six.** `email_click` joins `form_submit`,
  `phone_click`, `telegram_click`, `whatsapp_click`, `tour_view` and `lang_switch`.
  The delegated listener in `Base.astro` has no whitelist so it fires already, but
  whoever configures the Yandex counter must create seven goals. `docs/PLAN.md`
  §14 still says six; it is left as the historical record.

**Phone changed again 2026-08-24 — and WhatsApp did NOT follow it.** `PHONE_E164`
is now `+998509074000` (`+998 50 907 40 00`), the number the client gave in the
original questionnaire; `PHONE_DISPLAY` moves with it. `SOCIAL.whatsapp` stays on
`998940914000` on an instruction given in the build session on 2026-08-24 and
recorded in `analize/answers.md`. Note the provenance honestly: this arrived through
the developer, **not** as a written client answer like the ones in `analize/`.

That divergence is the point of this entry. From 2026-08-19 the two were kept equal
precisely so WhatsApp could not silently point somewhere nobody answers — that
reasoning is now **superseded, not forgotten**: the client wants WhatsApp on the 94
number and calls on the 50 number. `site.ts` carries the same warning inline, because
the next person to read it will otherwise "fix" the mismatch. **This also closes Q16**
(WhatsApp is a different number from the phone). Q17 and Q18 are answered in the
contact-channels block below — except Q18 for YouTube, which is still open.

No **code** outside `config/site.ts` holds a phone number — `git grep` over `src/`
confirms it is still the single source (that is defect C8's fix holding), so the tel:
links, the floating widget, the root language picker, the lead-form prefill and the
`TravelAgency` JSON-LD all move with the constant. Re-verified in the built output:
249 `tel:` hrefs, all `+998509074000`; 158 `wa.me` hrefs, all `998940914000`; and the
only page that shows the WhatsApp number as text (`/contacts/`) shows the 94 number
against the 94 link.

Prose elsewhere does still quote numbers, and two places are now stale — flagged here
rather than edited, per the same convention that left `PLAN.md` §14 saying six Metrica
events:

- **`docs/PLAN.md` §10** specifies the WhatsApp deep link as `wa.me/998509074000`
  (line 844) — the phone digits. That is the number today's decision moved WhatsApp
  *away* from. Do not implement from that row; `SOCIAL.whatsapp` is the source.
- **`docs/PLAN.md` A7** (line 426) still lists "Same number for phone, WhatsApp,
  Telegram" as a live assumption, with Q16 named as what would overturn it. Q16 did
  overturn it, on 2026-08-24.

`analize/answers.md` and `analize/client-open-questions.md` quote the old number too,
but those are records of what was asked and answered on a date — correct as they stand.

**Contact channels answered 2026-08-24 — and one assumption was wrong.** Q17 turned
out to be **two** accounts, not one, and the handle this build had been shipping was not
either of them:

| | Before | After |
|---|---|---|
| `SOCIAL.telegram` (manager — the LEAD path) | `getcar_travel` *(a guess)* | **`getcar_admin`** |
| `SOCIAL.telegramChannel` (public channel) | did not exist | **`getcar_channel`** |
| `SOCIAL.instagram` | `null` | **`getcar_travel`** |
| `EMAIL` | `rrr.engineer.94@gmail.com` | **`info@getcartravel.com`** |

The Telegram one was live risk, not tidying: B5 called a wrong handle "a broken primary
conversion path", and `t.me/getcar_travel` had been the target of every Telegram CTA on
every page since launch.

Three judgement calls worth knowing about:

- **The channel is not a lead channel.** It carries no `telegram_click` Metrica event and
  no `?text=` prefill — a channel cannot answer a customer, so counting a follow as a lead
  click would corrupt the one metric that measures the conversion path. `telegramHref()`
  (manager, prefilled) and `telegramChannelHref()` (channel, bare) are separate for that
  reason. Both are in the `TravelAgency` `sameAs`, where "other official profiles" is
  exactly what the field means.
- **Instagram is stored as a username, not the URL supplied.** The link given was
  `instagram.com/getcar_travel?igsi=…&utm_source=qr` — share-sheet parameters from
  scanning their own QR code. Shipping them would have tagged every visitor as a QR
  arrival in the client's own Instagram analytics.
- **`EMAIL` is `.com` while the site is `.uz`** — flagged, not silently accepted. See the
  block comment in `config/site.ts`; nothing in this project owns `getcartravel.com`, and
  the address renders on 44 of the 46 built pages (all but `/` and `/404.html`) and in
  the JSON-LD on 6. It is shipped as instructed and needs one test message before
  launch, or a switch to `info@getcartravel.uz`.

Still open: **Q18 for YouTube** (`null`, auto-hides), and Q20 — see the SLA row below.

**Consent checkbox removed 2026-08-24 — on instruction, against the plan.** The
`consent` checkbox is gone from all four forms, together with its client-side check and
the two dictionary keys that fed it (`form.consent`, `form.consentRequired`).
`form.consentLink` survives because the **cookie banner** still links the Privacy page
with it.

Recorded plainly because the plan says the opposite. `docs/PLAN.md` §9.7 line 834 reads
"Unchanged and mandatory regardless of any of the above: a Privacy page in every shipped
locale, **an explicit consent checkbox on every form**", §18's Gate-1 checklist carries
the same line, and risk R6 kept the checkbox even as it withdrew v1's disclosure claim.
The exposure — Uzbek personal-data law requires the subject's consent to process a name
and a phone number — was put to the client before the change, and the instruction was
repeated. It is their call to make; this entry exists so nobody later reads the removal
as an oversight, and so the decision is easy to reverse.

What did NOT change: the Privacy page in both locales, its footer link, its sitemap
entries, the cookie-consent banner and its gate on Metrica. Re-adding the checkbox is one
block in `LeadForm.astro`, one check in `FormRuntime.astro` and two dictionary keys.

**Lead delivery is Telegram-only from 2026-08-24 — on instruction, and it is lossy.**
`apps-script/Code.gs` now does one thing: validate, then `sendMessage`. Removed with the
other two legs: `appendRow_`, `markRow_`, the `status` column, `dailyDigest` (BC19) and
the 200/day notification cap.

The cap went because its own rationale inverted. It existed so a spam burst could fill
the spreadsheet without muting alerts — "rows continue, only sends stop". With no rows,
"skip the send" and "destroy the lead" are the same action, so capping sends would have
meant capping leads.

What this actually costs, stated once so nobody has to rediscover it:

- **A failed send is unrecoverable.** The `tg_failed` status cell was the recovery path;
  there is no cell. Two send attempts, then a `LEAD LOST` line in the execution log with
  the full message text — recoverable by hand only while Google keeps the log.
- **The visitor is told "sent" regardless.** `submitLead.ts` returns `ok` when `fetch()`
  resolves, without reading status or body — that is what keeps the request CORS-simple
  (§9.4) — and `ContentService` cannot return a non-200 anyway. So the failure is
  invisible at both ends.
- **The precedent is in this file.** B2's own table records the first real lead arriving
  with `tg_unconfigured` on 2026-08-20. It survived because of the row. Under today's
  code it would have been lost behind a 200.

Two consequential changes fell out of it, both flagged to the client:

1. **`submitLead.ts` no longer treats a timeout as success.** The old comment justified
   that with "the row has very probably been appended — Apps Script does the cheap append
   FIRST". There is no append. A timeout now shows the error state (which offers the
   Telegram and WhatsApp links, §9.4) and keeps the draft. A duplicate message is cheap;
   a lost lead is not.
2. **The privacy page was factually wrong the moment this shipped.** It said leads are
   stored "in Google services (Google Sheets) and the company's Telegram channel" —
   Sheets no longer receives anything, and "Telegram channel" now reads as the public
   `@getcar_channel`. It now says the internal group, and explicitly that leads are not
   posted to the public channel.

Still to do by hand, outside the repo: delete the `dailyDigest` time-driven trigger (it
will email a failure notice daily against a function that no longer exists), drop the
`NOTIFY_EMAIL` and `SHEET_ID` script properties, and move `TG_CHAT_ID` from a private
chat to the group.

**Lead intake left Google entirely on 2026-08-24.** `apps-script/Code.gs` and
`docs/APPS-SCRIPT.md` are deleted; `functions/api/lead.ts` and `docs/LEAD-ENDPOINT.md`
replace them. Once Sheets and Gmail were gone the script's only job was relaying one
Telegram message, and the site is already hosted on Cloudflare, so the relay moved to
where the site already lives.

**This closes the failure mode B14 opened.** B14 recorded that a failed send was
invisible at both ends: `ContentService` could not return a non-200 and `submitLead()`
never read the response, so the visitor saw a thank-you page for a lead that did not
exist. A same-origin function can answer 502 and the browser can read it. Verified
locally with `wrangler pages dev` against a deliberately wrong bot token: `502
{"ok":false,"error":"telegram_failed"}` in 4.1 s — inside the browser's 8 s budget —
with the full lead text in the log under `LEAD LOST`, and the no-JS path getting a real
HTML error page instead of JSON.

Four things fell out of the move, all verified in the built output:

- **`LEAD_TOKEN` is gone.** It was a shared string that shipped in the page to filter
  bots hitting a bare public Google URL. On our own origin the function checks
  `Origin`/`Referer` instead — a value a page cannot forge. Absent headers are accepted;
  some browsers omit `Origin` on same-origin form posts and a missing header must never
  cost a lead.
- **`LEAD_ENDPOINT` is a constant, not a build-time secret.** The `FORM_ENDPOINT` and
  `FORM_TOKEN` GitHub secrets are read by nothing now and should be deleted. A build can
  no longer silently ship forms posting to an empty string — the defect the workflow
  comment at `deploy.yml` still describes.
- **The no-JS path got better, not just different.** The hidden `gt-lead-sink` iframe is
  gone: a native submit now navigates to `/api/lead` and the function answers `303` to
  `/{locale}/thanks/`, so a no-JS visitor finally sees a confirmation page. On failure
  they get a real page with a link to Contacts.
- **CI compiles the function before it publishes** (`wrangler pages functions build`), so
  a handler that does not build fails the run instead of being discovered by leads not
  arriving.

**A defect this change surfaced, and fixed.** Making the timeout return `error` gave the
visitor a retry prompt — and the client-side counter (`RATE_MAX = 3` per 10 min) counted
attempts that never reached the network, returning `discarded`, which `FormRuntime`
treats as success. Three failures in a row therefore sent the fourth submission to
`/thanks/` without sending anything anywhere. `underClientCap()` is now split into a
check and a `recordAttempt()` that only runs immediately before `fetch`, and
`rate-limited` is a distinct result that renders the error box. `discarded` still looks
exactly like success, which is correct: that path is for bots.

Still to do by hand, outside the repo, and the first two are now urgent rather than
tidy-up:

1. **Set `TG_TOKEN` and `TG_CHAT_ID` as encrypted Pages environment variables** and
   redeploy — Pages injects them at deploy time, so editing them does not affect a
   running deployment. Until this is done every lead is lost.
2. **Archive the old Apps Script Web App deployment.** It is still live and still
   accepting POSTs that nobody will ever read. Its `dailyDigest` trigger, if still
   installed, emails a failure notice daily against a function that no longer exists.
3. Delete the `FORM_ENDPOINT` and `FORM_TOKEN` GitHub secrets.
4. ~~Point `TG_CHAT_ID` at the group rather than a private chat.~~ **DONE 2026-08-24** —
   the configured id begins `-100`, which is a supergroup, so the destination is no
   longer one person's private chat. The privacy page still says "internal Telegram
   chat" rather than "group"; that is deliberate and stays true either way.

5. **ROTATE THE BOT TOKEN, and store it as a SECRET.** The token was first entered in
   the Pages dashboard as **type Text**, which renders it in plain sight — and it was
   then captured in a screenshot and shared. Treat it as burned: @BotFather →
   `/mybots` → **API Token** → **Revoke current token**, then re-enter the new one with
   type **Secret**. A leaked bot token means anyone can read every lead in the group,
   post as the company, and delete messages. `TG_CHAT_ID` is not a credential and may
   stay Text.

**A defect the post-deploy review caught, 2026-08-24.** Removing the hidden
`gt-lead-sink` iframe turned a no-JS submit into a real navigation — and the forms carried
`novalidate` in the markup, which disabled native validation for exactly the visitors who
have nothing else. So a JS-off visitor who mistyped a phone number was navigated to a bare
303 with everything they had typed discarded, the tour context on a booking form included,
and nothing saying why. Not a lost lead by the accepted B14 route: a lost lead by
abandonment, and invisible.

Fixed on both sides. `novalidate` is now set by `FormRuntime` at runtime, so it applies
exactly when the script that replaces it is present; and the function answers that case
with a bilingual page naming the problem, telling the visitor the browser's Back button
keeps what they typed, and linking to the page the form was on — validated as a
same-origin path, because `page` arrives from the form and `//evil.example` is a path a
browser would follow off-site.

Worth noting how it was missed: every local test posted a VALID phone, and the `400
invalid_phone` branch that was tested is unreachable on the native path. The tests
exercised the code, not the visitor.

**Lead delivery is now documented, not folklore.** `docs/LEAD-ENDPOINT.md` is the
runbook: Sheet + Telegram + email, the Script Properties, the Web App deployment
settings, and — the part that matters — a test step that exercises the JS **and**
the no-JS path. B1 and B2 close when someone walks it.

Fixed while writing it: the no-JS submission path never worked. `Code.gs` parsed
the body as JSON only, but a native form submit is always urlencoded; and the
shared token lived only in `data-token`, which a native submit cannot send. Both
failures returned 200, so the lead vanished without a trace at either end.

**Still open, deliberately:** whether the client wants `info@getcartravel.uz`.
Deferring is free — MX/SPF/DKIM are additions to a zone we control and do not
disturb the records that serve the site.

---

## C. Defects found and fixed during P2–P6

Recorded because each was silent — none announced itself.

| # | Defect | How it was found |
|---|---|---|
| C1 | `ru.json` and every Russian content block were **transliterated Latin, not Cyrillic** ("Puteshestvie ryadom s vami"). | Reading the P0/P1 output before building on it. |
| C2 | **The catalogue filters were dead.** The island's script queried `[data-tour-grid]`, which renders *after* it, got `null`, returned early — so the panel stayed `hidden` and nothing filtered. | Lighthouse `heading-order` failed (h1 → h3): the skipped `<h2>` was the filter panel's own, still hidden. |
| C3 | `--color-neutral-400` on white is **2.55:1**, used for the struck old price and the "(optional)" label. | Lighthouse `color-contrast`, then quantified by the new `check-contrast.mjs`. |
| C4 | The first fix for C2 (unhide from JS) introduced **CLS 0.372** against a 0.1 budget. Replaced with CSS keyed on the existing BC11 `html.js` marker → **CLS 0.006**. | Re-measuring after the fix instead of assuming it. |
| C5 | `Astro.props` was silently typed `Record<string, any>` in four components, disabling prop checking. Two latent type errors were hiding behind it. | `astro check` reported "'Props' is declared but never used"; a deliberate probe confirmed the props were untyped. |
| C6 | The language switcher rendered **`O'zbekcha` with an ASCII apostrophe** — the one Uzbek string on every page — because the §13.2 gate only inspected `uz.json`. | Reading the emitted switcher markup during the BC8 drill. |
| C7 | `Koʻk masjid` was written `Ko'k masjid` in a tour itinerary. | The widened orthography gate caught it immediately. |
| C8 | **The root language picker hardcoded the phone number**, in both the `tel:` href and the visible label, instead of reading `config/site.ts`. `site.ts` opens with "Client-supplied facts, in ONE place" — this was the one place that was not it. A number change would have updated all 45 content pages and left the **first page a visitor lands on** showing a dead number. | Changing the phone on 2026-08-19 and grepping the tree for the old value before editing, rather than editing `site.ts` and trusting it was the only source. |
| C8 | `_TEMPLATE.json`'s Russian block was transliterated Latin — and the client **duplicates that file**, so every tour they added would inherit it. | Reviewing what the client actually copies. |
| C9 | The §9.1 **callback form (4 of 4) was missing** from the floating widget. | `check-i18n.mjs`'s orphan check flagged `widget.callback` as declared but never used. |

---

## D. Not yet started

**P7 (real content swap)** and **P8 (deploy & handover)** are blocked on client input
and on hosting access respectively — Q1, Q2, Q5, Q6, Q9, Q13, Q14. Neither is startable
from this machine.

§15's performance numbers are **provisional against placeholders**, exactly as §15
requires. They are re-measured in P7 against real photography, and **those are the
numbers that count**.
