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
| A5 | Is ~8 tour packages achievable? | P3 scope | If Q6 returns fewer than 4, the catalogue, the filters and the thin destination template all need revisiting. Currently built against **8 developer-authored samples**. |
| A6 | Recommend **against** exercising the priced `ms` option? | commercial | The Architect's standing position is that the case is weak. Not decided here. |
| A7 | Is Astro right **for handover** if the freelancer walks away? | engagement | Depends on an engagement model the brief does not specify. §11's retainer recommendation is the current answer. |

**Settled during P0 by the smoke test** (previously open): `import.meta.glob` does
resolve inside `src/content.config.ts`, and `@astrojs/sitemap` does accept a
two-locale list.

---

## B. Raised by P2–P6 execution

| # | Question | Blocks | Why it is open |
|---|---|---|---|
| B1 | **The §9.4 CORS spike has still not been run against a real `/exec`.** | P4 sign-off | R8 rates it 50/50. The code is written so the answer **does not change the UX** — `submitLead()` redirects on resolve-or-timeout and never reads the response body — so the site is correct either way. What is still unknown is whether to keep Apps Script primary or promote Web3Forms, and Web3Forms carries a **~250 submissions/month ceiling** Apps Script does not. Needs a throwaway `/exec` and one browser. |
| B2 | **No form has been submitted end to end.** | Gate 1 | Requires a Google account (Q8). Everything up to the network call is verified — validation, honeypot, time trap, draft persistence, error state, the no-JS iframe target. The Apps Script itself is syntax-checked but has never executed. **Gate 1's "Telegram within 30 s" row cannot be ticked until Q8 lands or a throwaway account is used.** |
| B3 | **Hero trust numbers (years / tourists / destinations).** | §6 row 2 | §6 says these "come from the client, never invented". `TRUST` in `src/config/site.ts` is `null`, so **the chip row does not render at all**. The hero is designed to look complete without it. Supply the numbers and the row appears. |
| B4 | **"Why us" claims need confirming, not inventing.** | Gate 2 | §6 row 7 says "Confirm; do not invent". The four shipped claims (own transfer fleet, native-language guide, official insurance, one manager) are grounded in the trading name and the client's own answers — but **none has been confirmed by the client in writing**. Verify before launch; each is one string in `uz.json`/`ru.json`. |
| B5 | **Telegram / WhatsApp handles are assumed.** | Gate 1 links | `SOCIAL.telegram` is `'getcar_travel'` and `SOCIAL.whatsapp` is the main phone number — both **guesses** pending Q16/Q17. Instagram and YouTube are `null` and their links auto-hide. A wrong Telegram handle is a broken primary conversion path. |
| B6 | **Office address and opening hours are `null`.** | Gate 2 | Q21/Q22. The footer block, the Contacts map card and the `PostalAddress` in JSON-LD all auto-hide (BC12b). The `static-map` placeholder is generated and waiting. |
| B7 | **The USD→UZS rate used for PRICE FILTER BUCKETS is a guess.** | P3 polish | `src/lib/tours.ts` normalises a USD price at a coarse fixed rate **for bucketing only** — the price shown to a customer is never converted (§7). Today every sample tour is UZS, so the constant is unexercised. It becomes real the day the client prices a tour in USD. |
| B8 | **Reviews are all `real: false`, so the testimonial block ships as social proof.** | Gate 2 | Q14. Correct and deliberate — §6 row 10 permits fewer than three real reviews to fall back to social links, and inventing quotes was not an option. The `real: true` path is verified to render (3 cards, on Home and About). Three Tier-1 avatar placeholders are generated and waiting. |
| B9 | **The floating widget has not been checked against a real device.** | manual gate | §18 check 14. It is bottom-right, forms are left-aligned inside a max-width container, and the callback panel is width-capped — but that is an argument, not a measurement. **Only Chrome and Firefox exist on this machine; no iOS Safari, no Samsung Internet.** |
| B10 | **Two Tier-2 covers were generated to complete the 8-sample catalogue.** | scope hygiene | §16.1 prices Tier-2 (59 files) as a **+0.5 d add-on**. P3 needs 8 sample tours but Tier 1 budgets only the featured six covers, so `gen-placeholders.mjs --only` was added and **exactly two** files generated (`malayziya-kuala-lumpur`, `ozbekiston-xiva`). This is 2 of 59, not the add-on. Flagging it so it is not later mistaken for delivered scope. |
| B11 | **`METRICA_ID` is unset, so no analytics script and no consent banner ship.** | Gate 1 | Q8 (a **Yandex** account, not a Google one). All six §14 events are wired through one delegated listener and the consent gate is written; with no counter id the whole block is omitted rather than loading a tracker with a fake id. Set `METRICA_ID` and it activates. |
| B12 | ~~**`SITE_URL` still defaults to `https://getcar-travel.uz`.**~~ **CLOSED 2026-08-19** — see below. | — | — |

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
