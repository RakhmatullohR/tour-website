> **Status: P0–P6 EXECUTED.** Consensus-approved by the Planner → Architect → Critic loop (2 iterations), with 19 binding pre-execution corrections folded into this document. **P7 (real content swap) and P8 (deploy & handover) are NOT started — both are blocked on client input and hosting access** (Q1, Q2, Q5, Q6, Q9, Q13, Q14).
> Verification at time of writing: `npm run build` green (**46 pages**, all 12 route types × 2 locales) · `npx astro check` 0 errors 0 warnings · `check:images` 26/26 · `check:i18n` 220 keys, full parity · `check:contrast` 20/20 pairings · `linkinator --recurse` **0 broken links** · Lighthouse mobile **Perf ≥ 97 · A11y 100 · BP 100 · SEO 100** on five pages · **zero horizontal scroll from 320 px to 1920 px** in both locales · nothing secret or generated is tracked by git.
## Execution log — P0 to P6

| Phase | Delivered | Gate result |
|---|---|---|
| **P0** | `.gitignore` repaired in BC1 order · locked stack installed (astro 7.2.2, sharp 0.35.3, tailwind 4.3.3, sitemap 3.7.3, @astrojs/check 0.9.10, zod 4) · `astro.config.mjs` with the BC4/BC5 i18n block · `src/content.config.ts` with a `glob()` loader and Zod 4 schema · `src/lib/images.ts` (BC16 `resolveImage`) · root language picker · `[lang]/` route tree · bilingual root 404 (BC10) · `.github/workflows/deploy.yml` with the weekly cron · `.env.example` · `docs/DEPLOY.md` with the mandatory MX checklist (BC17a) | **GREEN.** Smoke test passed: scaffold + collection + optimised image + `npm run build` exit 0, `astro check` clean. Both folded checks passed — `import.meta.glob` resolves inside `src/content.config.ts`, and `@astrojs/sitemap` accepts a two-locale list. |
| **P1** | `@theme` tokens · Inter + Unbounded self-hosted · `scripts/images.manifest.json` (85 rows) · bundled DejaVu fonts · `gen-placeholders.mjs` · **26 Tier-1 `.webp`** · `check-images.mjs` with the render assertion · `gen-image-requirements.mjs` · `analize/image-requirements.md` · `analize/client-open-questions.md` | **GREEN.** All 26 Tier-1 placeholders within budget (largest 27.7 KB against a 180 KB cap). Client document lists exactly **20** first-stage photographs, Latin-only assertion passed, byte-identical on regeneration. |
| **P2** | All 13 §6 Home sections · 14-component library (`ui/`, `cards/`, `sections/`, `islands/`, `forms/`) · inline SVG icon set (no icon font) · sticky header with a **no-JS `<details>` drawer** · footer with BC12b auto-hiding blocks · floating widget · **every string through `t()`** — `grep` finds no hardcoded copy | **GREEN.** Lighthouse mobile Home **Perf 99 · A11y 100 · BP 100 · SEO 100**, LCP 1.7 s, CLS 0.035, TBT 0 ms. With JS disabled all eight below-the-fold sections render. |
| **P3** | Supporting collections (`destinations`, `reviews`, `promotions`) with the same uz-required / non-emission discipline · **8 sample tours** · 6 destinations · catalogue with 4 filters · tour detail · destinations index + detail · about · promotions · contacts · privacy · thanks · bilingual root 404 | **GREEN.** All **12** §5 route types build in both locales (46 pages). Every §7.1 rule proved to fire — see the negative-test table below. |
| **P4** | `apps-script/Code.gs` with **Script Properties only (BC3)**, per-leg `try/catch` (BC18), the daily digest trigger (BC19) and the notification cap · `submitLead()` · all **4** forms · honeypot · time trap · consent · error state with contact fallbacks · no-JS hidden-iframe target | **PARTIAL — code complete, transport unverified.** Everything up to the network call is verified. **No submission has been made end to end: that needs Q8's Google account.** The §9.4 CORS spike is likewise still outstanding. Tracked as B1/B2 in `docs/OPEN-QUESTIONS.md`. |
| **P5** | `ru` wired through `SHIPPED_LOCALES` · **page-aware switcher (BC8)** · hreflang · `Intl` dates and numbers · **`ru.json` and every Russian content block rewritten from transliterated Latin into real Cyrillic** | **GREEN.** BC8 drill passed on all six sub-checks with `linkinator` clean. No Uzbek text leaks into any `ru` page; dates render `20 сентября 2026 г.` vs `20-sentabr, 2026`. |
| **P6** | Canonical · hreflang · OG (per-tour cover) · sitemap · generated `robots.txt` · **3 JSON-LD types** · Metrica with consent gating and all six events · favicons + webmanifest · a11y pass · provisional perf pass | **GREEN.** `TravelAgency` 22 ×, `TouristTrip` 16 ×, `BreadcrumbList` 40 ×. Home first load **201 KB / 19 requests**; fonts **100 KB**; **zero external JS files** (Astro inlined it). Metrica is dormant until `METRICA_ID` is set — no counter, no script, no banner. |

**Non-vacuous verification.** Every rule that could have been a no-op was proved to fire by negative test — the discipline this plan's own review process was built on:

| Rule | Negative test | Result |
|---|---|---|
| Render assertion (`check-images.mjs`) | Injected a text-free image over a real placeholder | **FAILED loudly**, naming the file and the font as likely cause; passed again on restore |
| `flightIncluded: false` requires a non-empty `priceNote` in every shipped locale | Blanked the `ru` `priceNote` | **Build FAILED** with the file, the field and the reason |
| `oldAmount > amount` | Set `oldAmount` below `amount` | **Build FAILED** — "otherwise the discount is fake" |
| Missing cover / price-in-prose must WARN, never block | Pointed `cover` at a non-existent file and put "50 USD" in `excludes` | **WARNED twice, build still succeeded** — client autonomy preserved |
| BC4 `prefixDefaultLocale` | Inspected emitted HTML | `getRelativeLocaleUrl` emits `/uz/` and `/ru/`, not a bare `/` |
| BC11 no-JS guard | Inspected compiled CSS | `.reveal` is hidden only under `html.js`; zero external JS files ship |
| **§7.1 malformed tour JSON** | Deleted `price.amount` | **Build FAILED**, naming the collection, the entry, the field, and the file path |
| **§7.1 non-emission (BC8)** | Deleted a tour's whole `ru` block | `/uz/.../` rendered · `/ru/.../` **not emitted** · switcher offered **only** `Oʻzbekcha` · hreflang carried no `ru` · the `ru` catalogue did not list it · the sitemap did not advertise it · **`linkinator` still clean** |
| **§7.3 layer 1 — build floor** | Added a 2020 departure date | **Absent from the emitted HTML** |
| **§7.3 layer 2 — runtime narrowing** | Injected a past `<time data-departure>` **into the built page** (layer 1 makes this unreachable from source) | Browser **removed it**; future dates survived. With every date stale the block swapped to *"Sanalar soʻrov boʻyicha"* |
| **§6.10 testimonials** | Flipped the three samples to `real: true`, then back | 3 review cards rendered on Home **and** About; reverting restored the social-proof fallback. Ships as `real: false` — **no invented client quotes** |
| **§13.1 contrast** | `check-contrast.mjs` asserts the pairings that **must stay below** threshold | White-on-`brand-500` still 4.08:1 — the rule cannot silently become a no-op |
| **§13.2 Uzbek orthography** | Wrote `Bog'lanish` with an ASCII apostrophe | **`check-i18n` FAILED**, naming the key and the string |
| **Catalogue filters** | Loaded `/uz/tours/?country=TR` in headless Chrome | 8 → **2 cards**, count text updated, non-matching cards hidden |
| **Responsive** | Measured `scrollWidth − clientWidth` over CDP at 320–1920 px, both locales, 4 page types | **0 px horizontal overflow at every width from 320 up**; 300 px overflows by ~12 px (below any shipping device) |

### Corrections discovered during execution

**During P0–P1**

1. **`import { z } from 'astro:content'` is `@deprecated` in Astro 7** — the runtime says so itself: *"Use `import { z } from 'astro/zod'` instead."* §8's stack table said Zod 4 (correct) but did not name the import path. Now uses `astro/zod`, which is a first-party subpath export, so there is no transitive-dependency risk of the kind that made the `sharp` claim wrong in v1.
2. **`@astrojs/sitemap` emitted a duplicate `hreflang="uz"`** — it has no locale segment to read at the bare root, so it fell back to `defaultLocale` and advertised *both* `/` and `/uz/` as the `uz` page. Real duplicate-hreflang defect, invisible until the sitemap was actually inspected. Fixed with a `filter` excluding `/` from the sitemap; every page's own `<head>` already declares `x-default → /uz/`, so nothing is lost.

**During P2–P6 — nine defects, none of which announced itself.** Full detail in `docs/OPEN-QUESTIONS.md` §C.

3. **`ru.json` and every Russian content block were transliterated Latin, not Cyrillic** — `"Puteshestvie ryadom s vami"`. It would have shipped a Russian locale no Russian speaker would read, while passing every check P0/P1 had. Rewritten wholesale, and `_TEMPLATE.json` with it — the client **duplicates** that file, so the defect was self-propagating.
4. **The catalogue filters were dead.** The island's script queried `[data-tour-grid]`, which the page renders *after* it, got `null`, and returned early — leaving the panel `hidden`. Found because Lighthouse flagged `heading-order` (h1 → h3): the skipped `<h2>` was the filter panel's own. **Gate 1's "catalogue filters by country, duration, price, category" would have been signed off against a control that did nothing.**
5. **`--neutral-400` is 2.55:1 on white** and carried the struck old price and the "(optional)" label. §13.1 demanded the pairings be verified rather than asserted; nothing verified them. Now `scripts/check-contrast.mjs` does — including a **negative half** that fails if a pairing the rule forbids ever starts passing.
6. **The first fix for (4) introduced CLS 0.372** against a 0.1 budget, by unhiding the panel from script. Replaced with CSS keyed on the BC11 `html.js` marker → **CLS 0.006**. Measuring the fix, not just the bug, is what caught it.
7. **`Astro.props` was silently `Record<string, any>` in four components**, disabling prop type-checking entirely; two latent type errors were hiding behind it. Confirmed with a deliberate probe (`const x: number = someString`) that TS did not flag until the props were annotated.
8. **The language switcher rendered `O'zbekcha` with an ASCII apostrophe** — the one Uzbek string on *every* page — because §13.2's gate only inspected `uz.json`. The gate now covers `locales.mjs` and all content prose, and immediately caught a second instance (`Ko'k masjid`).
9. **§9.1's callback form (4 of 4) was missing** from the floating widget. Found by `check-i18n.mjs`'s orphan check: `widget.callback` was declared and never used.
10. **A closed `<details>` becomes the containing block for its own panel.** Chrome keeps the panel in layout (`content-visibility: hidden`, so it can animate open), which implies `contain` — so the mobile drawer's `fixed inset-x-0` resolved against the **44 px hamburger** instead of the viewport, and its buttons stuck out to x=456 on a 360 px screen. Invisible, and it made every page scroll sideways.
11. **`Button`'s base class hardcodes `inline-flex`, so a caller's `hidden` cannot win.** Which of `.hidden` / `.inline-flex` applies is decided by **order in the stylesheet**, not by the class attribute — so the header CTA never hid on mobile and pushed the header 66 px past a 360 px viewport. Gate 1 lists 360 px explicitly; this would have failed it. Fixed with a `hidden sm:contents` wrapper, which leaves the ≥ sm layout untouched.

> **What (10) and (11) have in common:** both were *invisible*. Nothing overlapped, nothing looked wrong in a screenshot, and both Lighthouse runs scored 100 on accessibility. They were only found by measuring `scrollWidth − clientWidth` over CDP — and **only below 500 px**, which is where Chrome's `--window-size` floor silently stops honouring the flag. A viewport check that trusts `--window-size` at 360 px is testing 500 px and reporting a pass.

---

# Getcar_travel — static multilingual tour agency website
## PLAN v3 — FINAL (consensus-approved)

**Version:** 3.0 (final) · **Date:** 2026-08-18 · **Supersedes:** plan v1, plan v2
**Client:** Getcar_travel — already trading; LLC registration in progress via the single-window service
**Developer:** solo freelance build
**Constraint class:** fully static — no backend, no database, no server-side runtime

---

# Qisqacha — oʻzbekcha

*Bu boʻlim mijozga yuborish uchun ham yaroqli. Qolgan hujjat ingliz tilida — u dasturchi uchun.*

**Nima quramiz.** Getcar_travel uchun toʻliq statik (serversiz) koʻp tilli sayt: Astro 7 asosida, sahifalar oldindan HTML qilib tayyorlanadi, tur paketlari JSON fayllarda saqlanadi, saytdan kelgan arizalar **Telegram + Google Sheets + Gmail**'ga tushadi. Sayt **oʻzbek va rus** tilida ishga tushadi.

**Nimalar kiradi (birinchi bosqich — launch scope).** 12 xil sahifa turi: til tanlash · bosh sahifa · tur katalogi · har bir tur uchun alohida sahifa · davlatlar roʻyxati · har bir davlat sahifasi · biz haqimizda · aksiyalar · kontaktlar · maxfiylik siyosati · rahmat sahifasi · 404. Ustiga: 14 ta dizayn komponenti · 4 ta ariza formasi · 26 ta birinchi darajali rasm oʻrni · avtomatik nashr qilish tizimi (GitHub Actions) · Yandex Metrica · SEO (hreflang, sitemap, 3 ta JSON-LD turi) · domen ulash · **oʻzbekcha qoʻllanma va oʻqitish sessiyasi**.

**Nimalar kirmaydi.** Saytning oʻzida karta orqali toʻlash (Payme/Click server talab qiladi, ustiga MCHJ va bank shartnomasi kerak — hozir yoʻq) · admin panel · real vaqtda joy qoldigʻi · foydalanuvchi akkauntlari · aviabilet va viza xizmati · blog maqolalarini yozish · alohida Sharhlar va Xizmatlar sahifalari. **Ingliz tili kelishilgan** (anketada belgilangan) — u kesilmagan, faqat tarjima matnlari kelgach ochiladi. Malay tili Q4 javobiga bogʻliq.

**Halol narx.**
- Birinchi bosqich (launch scope): **13.0 ish kuni**
- Hammasi (blog, FAQ, 4 til, 28 komponent, Tier-2 rasmlar va boshqalar): **22.0 ish kuni**
- Agar roʻyxatdan oʻtish uchun aniq muddat boʻlsa: **+1.0 kun** (Phase 0.5) → jami 23.0

> **Bu ish kuni, kalendar kuni emas.** Bitta dasturchi ketma-ket ishlaydi. Hisob mijozdan **oxirgi bloklovchi javob** kelgan kundan boshlanadi.
> **Sizning qaroringiz:** tekshiruvchi P1 bosqichi taxminan 0.5 kunga kam baholangan deb hisoblaydi. Ikki variant: **13.0** deb aytish (bu riskni bilib turib), yoki **13.5** deb aytish. Buni men hal qilmadim — siz hal qilasiz.

**Boshlashdan oldin mijozdan nima kerak (ishni bloklaydi).**
1. **Hosting maʼlumotlari** (Q1) — saytni qanday joylashtirish shunga bogʻliq. Domenni koʻchirishdan oldin eski DNS yozuvlari, ayniqsa **MX (pochta)** yozuvlari, albatta koʻchirilishi shart — aks holda kompaniya pochtasi oʻchadi.
2. **Domen nomi** (Q2)
3. **Logotip fayli va rang kodlari** (Q5)
4. **Kamida 6–8 ta tur paketi maʼlumoti** + qachongacha yuborishning aniq sanasi (Q6)
5. **Kompaniya Google akkaunti** va **Yandex akkaunti** (Q8) — P4 bosqichini bloklaydi
6. **GitHub foydalanuvchi nomi** (Q9)
7. **20 ta rasm** + qachongacha yuborishning aniq sanasi (Q13)

**Mijoz nimani hal qilishi kerak.**
- Toʻlov: menejer Payme/Click havolasini yuboradigan variant toʻgʻri keladimi (Q7)?
- Malay tili kimlar uchun — Oʻzbekistonga kelayotgan malayziyaliklar uchunmi, yoki Malayziyaga ketayotgan oʻzbeklar uchunmi (Q4)?
- Turlarni oʻzi qoʻshadimi (GitHub orqali, 30 daqiqalik oʻqitish) yoki oylik toʻlov evaziga biz qilamizmi (Q24)?
- Roʻyxatdan oʻtish uchun aniq muddat bormi (Q3)?
- Kompaniya nomi saytda qanday yozilsin — `Getcar Travel`mi yoki `Getcar_travel`mi (Q19)?

**Muhim ogohlantirish.** Mijozdan hozircha **0 ta rasm, 0 ta tur maʼlumoti, 0 ta logotip** keldi. Shuning uchun sayt vaqtinchalik **oʻrindosh (placeholder) rasmlar** bilan ishga tushadi va hisob shunga qarab yoziladi (Gate 1). Haqiqiy kontent kelgach Gate 2 yopiladi. Internetdan olingan rasmlarni ishlatib boʻlmaydi — mualliflik huquqi boʻyicha jarima boʻlishi mumkin.

---

# Changes from v2 (binding corrections applied)

*The Critic's verdict on plan v2 was **APPROVE with 19 binding pre-execution corrections**. All 19 are applied below and are auditable here. The Architect's five upheld defects (N1–N5) and its non-blocking items were folded into these BCs by the Critic's adjudication.*

| BC | Correction | Applied where |
|---|---|---|
| **BC1** | P0 repo hygiene: scaffold **first**, then `printf` the `.gitignore` append with a **leading newline** (the file is 4 bytes, `.omc`, with no trailing newline, so `echo >>` would have produced `.omcnode_modules/`), then `git status`, then `npm install`. `npm create astro` writes its own `.gitignore` and would have overwritten a pre-emptive edit. | §16.2 P0, §20 |
| **BC2** | Repo visibility **DECIDED: PRIVATE**. Removes GitHub's 60-day auto-disable of scheduled workflows (public repos only), on which BC7's weekly cron depends, and closes BC3's exposure. Client gets collaborator access via Q9's username. | §20, PART C, §8.4 |
| **BC3** | Telegram bot token moved to Apps Script **Script Properties**; the tracked `apps-script/Code.gs` carries placeholders only. §20's "(token stays here)" comment corrected; §9.6's "Not exposed" claim made true. `.env.example` carries placeholders only. | §9.3, §9.6, §20 |
| **BC4** | `i18n.routing.prefixDefaultLocale: true` added to the Astro config. Verified in astro@7.2.2 source: without it `getRelativeLocaleUrl('uz','/tours/')` returns `/tours/`, a URL the `[lang]` tree never emits. `redirectToDefaultLocale` deliberately **not** set (defaults false), so `/` stays the language picker. | §8, §8.1 |
| **BC5** | `i18n.locales` driven from the same `SHIPPED_LOCALES` constant `getStaticPaths()` uses. Bonus: `getLocaleRelativeUrl` **throws `MissingLocale`** for an unlisted locale, turning "link to an unbuilt locale" into a loud build failure. `src/i18n/` file list reconciled with the shipped-locale set. | §8, §8.1, §20 |
| **BC6** | The cross-locale price-parity hard-fail is **deleted** — `price` and `flightIncluded` are top-level, single-instance, so parity holds by construction and the rule could never fire. Replaced by two enforceable rules: hard-fail on `flightIncluded: false` with an empty `priceNote`; **warn** (never fail) on currency-adjacent digits in locale prose. Flight-inclusion line now renders from the boolean via `t()`, never from prose. | §7.1, §16.2 P3, §17 Gate 1 |
| **BC7** | Build-time departure filtering **restored as the correctness floor**: "replaced" → "**supplemented**". Runtime JS narrows further. This is what makes BC2's weekly cron actually do something. | Changes table, §7.1, §7.3, §17 Gate 1 |
| **BC8** | Language switcher made **page-aware**: each page passes its own `availableLocales` (the set `getStaticPaths()` already used to decide emission, the same set driving hreflang). Absent locales are omitted or link to that locale's tour index. Without this, Gate 1's switcher / non-emission / zero-broken-links criteria were mutually unsatisfiable and `linkinator --recurse` would fail. | §8.1, §17 Gate 1 |
| **BC9** | Route count is **12** in all four places: §2, §5, §16.1, and PART A Option C. The double-count in §2 ("11 route types + a tour catalogue with per-tour detail pages") is removed. | §2, §5, §16.1, PART A |
| **BC10** | `src/pages/[lang]/404.astro` **dropped**. With `build.format: 'directory'` it emits `dist/{lang}/404/index.html`, which no `ErrorDocument` or platform 404 convention will ever serve. One bilingual root `404.astro` → `/404.html`, with links to `/uz/` and `/ru/`. Route count stays 12. | §5, §20 |
| **BC11** | No-JS guard on scroll-reveal: inline `<script>document.documentElement.classList.add('js')</script>` in `<head>`, and the rule scoped to `html.js .reveal { opacity: 0 }`. Without it, JS-off visitors saw a blank page below the fold — contradicting the ADR's second reason for choosing Astro. | §13.5 |
| **BC12** | Gate 1 made genuinely invoiceable: (a) invoicing criterion is **staging URL over HTTPS**, developer-controlled; live-on-client-domain moved to the handover list; (b) footer address **auto-hides when absent**; (c) form criterion qualified by the Apps Script account or its documented fallback; (d) **six priced deliverables that were in no gate added** — JSON-LD validation, axe pass, Metrica integration, Tier-1 placeholders, the Uzbek image-requirements document, the client manual + training session. | §17 Gate 1 |
| **BC13** | §9.7's legal paragraph prefixed **"Developer-internal background — do not paste this to the client"** (the plan is tracked in a repo the client can open, and §9.7's own rule forbids asserting a legal conclusion the client may rely on); the approved client-facing sentence is in its own quoted block. R6's "the rule inverted" → "the duty **narrowed from blanket to selective**". | §9.7, §19 R6 |
| **BC14** | **`en` provenance acknowledged.** The client affirmatively ticked *Ingliz* ✅ (`answers.md:51`) — stronger provenance than Blog or FAQ, which the plan kept, and than Reviews/Services, which it cut. `en` is now stated as **agreed scope, staged on client input**, not an add-on chosen by the developer. Same +1.0 d; no re-costing. | §4 A9, §16.1, §2.1, §3 Q12 |
| **BC15** | Image tiering reconciled with launch-scope pages: `promo-banner` (1), `cta-bg` (1), 3 testimonial avatars and `static-map` (1) moved **T2 → T1**, because P2 builds those Home sections and Contacts is a launch route, so their placeholders must exist at Gate 1. All six marked `clientPhotoRequired: false` so the client-facing ask stays at 20. | §12.2, §16.1, §16.2 P1, §17 |
| **BC16** | Image resolution completed: a Zod `.refine()` **validates, it does not transform**. `src/lib/images.ts` now also exports `resolveImage(filename): ImageMetadata`; components call it before `<Image>`. | §7.2 |
| **BC17** | Six additions to the §3 client questions: (a) **Q1** — existing site + corporate mail on that host, plus a mandatory **record-and-recreate-MX** step in `docs/DEPLOY.md` (a naive nameserver change would kill the client's email); (b) **Q6 + Q13** — an explicit "by what date" (R1 is the only High/High risk and its mitigation names a deadline nothing asked for); (c) **Q19** — how the company name is spelled on the site; (d) **Q8** — a Yandex account is also needed for Metrica; (e) intro corrected to "**1–9-savollar eng muhimi**"; (f) when generating `analize/client-open-questions.md`, **strip `> ` and `**`** so it pastes cleanly into Telegram. | §3, §8.4, §20 |
| **BC18** | `doPost` wraps notification legs 2 and 3 in **individual try/catch**. A `UrlFetchApp` throw after the row append killed the email fallback *and* returned an error the user resubmits against → duplicate rows. Failures are recorded in the row instead of thrown. | §9.3 |
| **BC19** | **Daily Telegram digest trigger** added: an Apps Script time-driven daily trigger emailing "Bugun N ta ariza". Telegram is now both the primary alert and the primary failure escape hatch; an outage removes both, and neither remaining leg is observed. One email/day never touches the quota. Absorbed into P4's 1.0 d. | §9.3, §19 |

## Also resolved in this pass (Critic's "minor, unfixed")

| Item | Resolution |
|---|---|
| `content/images.manifest.json` at the repo root sat confusingly beside `src/content/` | Moved to **`scripts/images.manifest.json`** — it is machine input to the three scripts that read it (`gen-placeholders.mjs`, `gen-image-requirements.mjs`, `check-images.mjs`), it is never client-editable content, and putting it under `src/content/` would place a non-collection file inside the content-collection namespace. One top-level directory removed. Consistent in §12, §20 and PART C. |
| Six T2 "service photos" had no consumer | **Dropped.** §6 row 4 renders six **inline SVG icons**, and the standalone Services page was cut. Tier totals restated below. |
| `dest-turkey-*` (English) vs `tour-turkiya-*` (Uzbek) in filenames | **All filename slugs standardised to Uzbek Latin, ASCII-only:** `turkiya`, `dubay`, `tailand`, `misr`, `malayziya`, `ozbekiston`. ISO country codes (`TR`, `AE`, `TH`, `EG`, `MY`, `UZ`) remain in the **data**, never in filenames. |

## Re-derived arithmetic (after all edits)

| Quantity | Derivation | Value |
|---|---|---|
| Launch-scope effort | 1.5 + 1.5 + 2.0 + 2.5 + 1.0 + 1.0 + 1.0 + 1.5 + 1.0 | **13.0 d** |
| Add-ons beyond launch | 12 menu rows (8.0) + staged `en` (1.0) | **9.0 d** |
| Full scope | 13.0 + 9.0 | **22.0 d** |
| Full scope incl. conditional Phase 0.5 | 22.0 + 1.0 | **23.0 d** |
| Critical path | P0→P1→P2→P3→P5→P6→P7→P8 = 12.0, plus P4 1.0 | **13.0 d** |
| Launch route types | §5 ✅ rows, counted | **12** |
| Tier 1 images | 20 (v2) + promo-banner 1 + cta-bg 1 + testimonial avatars 3 + static-map 1 | **26** |
| Tier 2 images | 71 (v2) − 6 promoted to T1 − 6 orphan service photos | **59** |
| Total image inventory | 26 + 59 | **85** |
| Client-facing photo ask | T1 rows with `clientPhotoRequired: true` (26 − 6 developer-generated) | **20** |

---

# Residual risks accepted

*Carried from the Critic's review. These are known, priced-in or explicitly un-priced, and accepted with eyes open. None of them is a defect to fix before execution.*

1. **P1 is approximately 0.5 d light.** Its 1.5 d must cover `@theme` tokens + two fonts + `oʻ`/`gʻ` verification + 14 components + a showcase page + a **26-row manifest with hand-written Uzbek subject briefs** + `gen-placeholders.mjs` + `gen-image-requirements.mjs` + `check-images.mjs` + 26 `.webp` files + the client document. A bottom-up estimate is **1.7–2.0 d**. The plan invited attack on P3 and P7; the under-costed phase is P1.
   **This is the user's call and this document deliberately does not decide it: either quote 13.0 d knowing this, or add +0.5 d and quote 13.5 d.** Nothing structural changes either way. If 13.5 is chosen, P1 becomes 2.0 d and every total in the table above shifts by +0.5.
2. **The `en` conversation will happen.** BC14 turns it from a discovered re-trade into a transparent staging decision, but the client ticked English and will ask when it appears. The answer is in §16.1 and Q12: agreed scope, staged on translation delivery, 1.0 d of wiring.
3. **13.0 d is EFFORT, not ELAPSED time.** For a solo build the "critical path" is decorative — every phase is sequential. Delivery is **13 working days after the last blocking answer** (Q1, Q5, Q6, Q8, Q13). Do not quote a calendar date until those answers land.
4. **The CORS spike may flip the transport.** R8 rates it 50/50. If Web3Forms becomes primary, its free tier of roughly 250 submissions per month becomes a real ceiling that Apps Script does not have.
5. **A10 (~8 tour packages) still rests on zero supplied data.** If Q6 returns fewer than 4 packages, the catalogue, the filters, and the thin destination-detail template all need revisiting before P3.
6. **Two open technical questions, both cheap to settle inside the existing P0 smoke test:** whether `import.meta.glob` resolves correctly inside `src/content.config.ts`'s Vite module-runner context, and whether `@astrojs/sitemap`'s i18n config tolerates a locale list shorter than four. Separately: whether the client accepts a **private** repo, since Q9's framing implies they simply open an account while BC2 adds a collaborator-invite step.

---

# PART A — RALPLAN-DR

**Mode:** SHORT. Escalate to DELIBERATE only if the client confirms real on-site card processing — that changes the architecture class.

## Principles

1. **The static constraint is the architecture, not a limitation to work around.** Every feature is designed to be correct with zero server, never as a degraded imitation of a dynamic site.
2. **Never promise capability we do not ship.** Where the client's answers exceed a static build (payments, admin panel, real-time availability), we resolve with an honest operational workflow and name it as such, in writing, before code is written.
3. **Content is data, not markup — but the authoring surface must survive a non-technical editor.** One schema-validated file per entity with all locales inside it, plus a duplicate-me template and a build-error bot that speaks plain Uzbek. **A cosmetic defect must never block a client publish.**
4. **Build-time failure over runtime surprise, and the failure must reach a human.** A content error breaks the build *and* posts a readable comment on the commit. A pipeline that fails silently is worse than no validation.
5. **Locale-aware from the first component.** Strings are externalised before the first page is built. Retrofitting i18n is the single most expensive avoidable mistake in this brief.

## Decision drivers

| # | Driver | Why it dominates |
|---|---|---|
| **D1** | **Client self-maintenance with no backend** | Client answered *"Uzim"* (myself) to who maintains the site and ✅ to adding tour packages themselves — with no admin panel available. Any stack choice that makes editing harder than filling a form needs a compensating workflow **and a publishing pipeline that actually publishes**. |
| **D2** | **Four locales must be pre-rendered as real HTML** | uz/ru/en/ms. Runtime client-side i18n (JSON swapped in the browser) yields one indexable page instead of four, killing the "attract foreign clients" goal outright. **This kills runtime i18n. It does not differentiate Astro from Next** — both require a hand-authored locale route tree. |
| **D3** | **Deploy target is unknown, and the build must run offline** | Client checked ✅ hosting but never said which; in Uzbekistan this is most often shared cPanel/LAMP with FTP only. Output must be inert files. Separately, ~85 images must be optimised **locally at build time**, with no remote image service in the loop. |

## Options

### Option A — Astro static + content collections + Tailwind 4 ⭐ RECOMMENDED

| Pros | Cons |
|---|---|
| **First-party local image pipeline.** `astro:assets` + `sharp` optimises every image on the build machine, offline. For an ~85-image brief with no ImageMagick/cwebp installed, this is the decisive differentiator. | Client must learn a git-based edit workflow (§11). |
| Ships ~0 KB JS by default; islands only for menu, filter, form, gallery. Best LCP on the 3G/4G mobile that dominates this market. | Content edits require a rebuild + redeploy — not instant publish. |
| Content collections + Zod 4: a malformed tour file fails the build with a file path and field name → D1's blast radius contained. | `.astro` syntax if the developer is React-only (≈ half a day; it is HTML + JSX expressions). |
| `dist/` is plain HTML/CSS/JS — FTP to cPanel, rsync to nginx, or Netlify/Cloudflare. D3 satisfied under every hosting outcome. | Locale route tree must be hand-authored (`[lang]/` + `getStaticPaths`) — same as Next. |

### Option B — Next.js with `output: 'export'`

| Pros | Cons |
|---|---|
| Developer likely already knows React → fastest ramp-up (~1 day saved). | **`output: 'export'` lists Image Optimization with the default loader as unsupported**, and the documented workaround is a **custom loader pointing at a remote service**. For a build-offline, 85-image brief that is a direct hit against D3. |
| Large ecosystem, easy handover to React freelancers. | Ships a React runtime and hydration payload for a brochure site — permanently heavier pages for zero user benefit. |
| `next-intl` is mature. | Built-in i18n routing is unsupported with static export; `app/[locale]/` is hand-authored — **the same work Astro needs**. No delta here. |

**Not eliminated.** Legitimate second choice if the developer's speed-to-build strongly favours familiarity. The honest trade: ~1 day saved on ramp-up, paid back in hand-rolled image plumbing plus a permanently heavier page.

### Option C — Hand-written multi-page HTML/CSS/JS — ❌ ELIMINATED

**12 route types × 4 locales**, with the two dynamic types expanding to ~8 tour pages and 6 destination pages per locale: 8 static pages + 8 tours + 6 destinations = **22 pages per locale × 4 = 88**, plus the root language picker and the root 404 → **≈ 90 hand-maintained HTML files at launch**, growing by 4 per tour the client adds. Every nav item, phone number, price, or footer change is applied 90 times by hand. Locale drift is not a risk, it is a certainty. No schema, so a client typo produces a silently broken page instead of a build error — the direct opposite of Principle 4.
**Narrow exception:** if scope collapses to a single-page brochure × 4 locales with no catalogue (~4 files). Worth naming only if the budget collapses.

### Option D-SaaS — Tilda / Wix — ❌ ELIMINATED

| Driver | Verdict |
|---|---|
| D1 | **Wins.** Genuinely solves self-editing. This is its real appeal and must be stated honestly to the client. |
| D2 | **Kills it.** No true i18n: four languages means cloning the whole project four times and hand-linking; hreflang support is partial to absent. Malay is not offered in Tilda's UI at all. |
| D3 | **Wastes it.** The hosting the client already paid for is abandoned and replaced by a recurring subscription with vendor lock-in and no code ownership. |

### Option D-WordPress — self-hosted WP + Polylang — ❌ ELIMINATED, on its own grounds

Not SaaS. **No subscription, no lock-in, and it *uses* the client's existing cPanel rather than abandoning it** — so the D3 objection above does not apply to it. And the i18n objection is weaker than v1 claimed: **Polylang's free tier supports unlimited languages with clean hreflang**; WPML is not required. Eliminated for three real reasons instead:

1. **It is a PHP backend.** No backend is the user's explicit, stated hard constraint for this engagement. A reviewer does not get to overrule the brief.
2. **Security ownership has no owner.** A self-hosted WP install with a non-technical owner, no guaranteed retainer, and no patching discipline is an unpatched PHP application inside a year. That risk lands on the client, and on the developer's reputation.
3. **Performance floor.** A themed WP install with a page builder cannot reach the mobile budget in §15 on a shared UZ host without a caching/optimisation stack that is itself a maintenance burden.

**Kept on file as the honest fallback:** if the client later insists on *both* instant self-service editing *and* real on-site card payments, self-hosted WordPress on their own cPanel is the correct recommendation — and it is a different project with a different quote. Say this out loud rather than silently under-delivering.

### Option E — Full backend now (Node/PHP + Payme/Click merchant API) — ❌ ELIMINATED

User's hard constraint, and independently blocked: a merchant contract requires a registered LLC with a bank account, which does not yet exist.

## Recommendation

**Option A (Astro static).** Its decisive advantage is the **first-party local `sharp` image pipeline** against an 85-image, build-offline brief where Next's static export documents no supported local path. Behind that: a zero-JS baseline that directly serves the mobile market, and content collections + Zod which convert D1 from an architecture problem into a documented, trainable workflow with a clean upgrade path.

**Explicitly not a reason:** i18n. Astro does not auto-generate routes across locales; the locale route tree is hand-authored in either framework.

---

# PART B — PLAN DOCUMENT

## 1. Overview & goals

| Attribute | Value (from the client) |
|---|---|
| Brand | `Getcar_travel` — spelling/casing to confirm (**Q19**); propose `Getcar Travel` for public use |
| Status | **Already trading** (*"Yurutyabman"*) — the site is not a launch, it is a formalisation |
| Destinations | Uzbekistan (domestic), Malaysia, Turkey, Dubai (UAE), Thailand, Sharm el-Sheikh (Egypt), + others |
| Services (checkboxes) | Tour packages ✅ · Hotel booking ✅ · Insurance ✅ · Transfer ✅ |
| Services (**free text, missed by the checkboxes**) | **Guide (`Gid`)** · **Meals (`ovqatlanish`)** — real services that must appear on the site |
| Explicitly NOT offered | Air tickets ❌ · Visa service ❌ |
| Phone | +998 50 907 40 00 |
| Supplied so far | zero photos, zero tour data, zero logo files, zero brand colour codes |

> **Load-bearing consequence of "no air tickets":** tour prices almost certainly **exclude flights**. Every package must state this unambiguously in every shipped language, and the data model carries a dedicated `flightIncluded` boolean (§7). Getting this wrong is a direct source of customer disputes. **BC6 turns this into a build-failing rule**, and the flight line renders from the boolean, never from prose.

**Primary goal, client's words:** *"Uzbekistonlik va chet ellik mijozlarga xizmatimizni aniqroq koʻrsatib berish"* — present services clearly to domestic and foreign clients. Objectives ticked: attract clients ✅, online booking ✅, information ✅, lead collection ✅.

| Audience | Locale | Intent | Content implication |
|---|---|---|---|
| Uzbek domestic outbound | `uz` | Packages to Turkey / Dubai / Thailand / Egypt | Price in UZS or USD, departure from Tashkent, instalment questions, Telegram/WhatsApp-first contact |
| Russian-speaking (UZ + CIS) | `ru` | Same catalogue, plus inbound CIS visitors | Cyrillic typography, Yandex-oriented SEO |
| International inbound | `en` | Visiting Uzbekistan — Silk Road, Samarkand, Bukhara, Khiva | **Different product set:** domestic tours, guide + transfer, not outbound beach packages. **Affirmatively ticked by the client** — agreed scope, staged on translation delivery (BC14). |
| Malaysian | `ms` | **Direction UNKNOWN — client question #4** | Demand is affirmatively signalled (hand-written into the form); direction is not. Priced option. |

**Success definition:** a prospect can, in their own language, find a relevant package, understand what is and is not included, and reach a human on Telegram/WhatsApp or leave a lead — from a phone, in under 60 seconds, on a 4G connection.

---

## 2. Scope

### IN SCOPE — launch scope

- Static multi-page site, pre-rendered. **Launch locales `uz` + `ru`**; `en` is agreed scope staged on translation delivery, `ms` is a priced option (§16.1).
- **12 route types** (§5), including the tour catalogue and per-tour detail pages
- Tour data model with Zod 4 schema validation, promotions/discount badges (client ✅)
- Lead / booking-request forms → **Telegram (primary) + Google Sheets + Gmail (secondary)**, with a daily digest email (BC19)
- Contact integration: click-to-call, Telegram, WhatsApp, Instagram, YouTube, floating widget
- **Publishing pipeline** (GitHub Actions → build → deploy → weekly scheduled rebuild), private repo
- **26 Tier-1 placeholder `.webp` files** (20 of which are client-photo slots) + an Uzbek client-facing image-requirements document
- Design system with brand colours swappable in one file
- SEO (hreflang, sitemap, 3 JSON-LD types), Yandex Metrica
- Deploy + domain wiring + Uzbek handover manual + a training session

### OUT OF SCOPE — and why

| Excluded | Client signal | Why it is out | Where it goes instead |
|---|---|---|---|
| **Real on-site card payment (Payme / Click / Visa)** | ✅ all three | Payme Merchant API and Click SHOP-API both require a **server implementing transaction callbacks** (`CheckPerformTransaction`/`CreateTransaction`/`PerformTransaction`; `Prepare`/`Complete`). That is definitionally a backend. Separately, **a merchant contract requires a registered LLC with a bank account**, which the client does not yet have. | §2(a) manager-issued payment-link workflow; Phase 2 quote |
| **Admin panel / CMS backend** | blank (never requested) | No server. | §11 workflow; optional Phase 2 git-backed admin UI |
| **Real-time availability / seat inventory** | implied by "onlayn bron" ✅ | Requires a database and locking. | Booking **request** form; manager confirms by hand |
| **User accounts / login / booking history** | not requested | No auth without a backend. | — |
| **Air ticket search or visa application** | both ❌ | Client does not sell these. | A "we do not provide" note to prevent wasted enquiries |
| **Automated currency conversion** | — | A stale rate on a price is a pricing and legal risk. | Price displayed in the currency it was entered in |
| **Blog article writing** | module provenanced, content not supplied | Content production is the client's. | Blog module priced as an add-on (§16.1) |

### Contradiction resolutions

**(a) "Online booking ✅ + online payment ✅" vs. static** — *carried verbatim from v1 and v2; this section is the plan's most important commercial output.*

The client also checked ✅ **"a form is enough"** (*"faqat forma toʻldirib yuborish kifoyami? ✅"*). We treat the form checkbox as operative and reconcile both answers honestly:

> **Phase 1 flow:** visitor picks a package → submits a **booking request** (`Bron soʻrovi`) with dates and passenger count → lead lands in Telegram + Google Sheets instantly → manager contacts them on Telegram/WhatsApp within the stated SLA → manager confirms availability and **sends a Payme or Click payment link generated from the merchant cabinet** → payment happens there → manager confirms the booking.

This is genuinely "online booking and online payment" from the client's mental model, requires zero backend, and is how most agencies in this market already operate. **Phase 2 (optional, separate quote):** a real backend with Payme/Click merchant integration, once the LLC and merchant contract exist.

> ⚠️ **Do not display Payme / Click / Visa logos in the footer until the merchant contract actually exists.** Showing acquirer badges the business cannot honour is misleading to customers. Gate this on client question #7.

**Named consequence:** because the manager-link flow cannot show real availability, **every "Bron qilish" button is a lead form wearing a booking button's clothes.** The button label, the form heading, and the thank-you page all say *soʻrov* (request), never *tasdiqlandi* (confirmed). This is recorded in the ADR consequences, not left to the executor's judgement.

**(b) "Client adds packages themselves ✅ + maintains it themselves" vs. no admin panel.**
Resolved by the ranked workflow in §11, and by making the publishing pipeline a real P0 deliverable so the promise is deliverable at all. Headline, stated plainly: **the client cannot publish a change without a browser, a GitHub account, and a ~2–3 minute rebuild wait.** If that is unacceptable, self-hosted WordPress is the correct product and a different quote.

**(c) Pages section entirely blank.** We proceed on §5, marked assumption A1, confirmed via client question #10. Blog and FAQ are developer-proposed defaults from `questions.md:43-55`, not inventions — retained as priced add-ons rather than cut.

**(d) Four locales including Malay.** Translation is not free and is not the developer's job. Launch `uz`+`ru`; **`en` is agreed scope, staged on the client's translation delivery**; `ms` is priced and gated on Q4 plus a native-review go/no-go.

**(e) Logo and brand colours exist but were not supplied.** Placeholder wordmark + token-based palette swappable in one file.

---

## 2.1 Nima kesildi va nega (what was cut, and why)

*Use this table when the client asks why something is not in the quote. The last column is the sentence to send.*

| Kesilgan narsa | Nega kesildi | Mijozga aytiladigan jumla |
|---|---|---|
| **Sharhlar (Reviews) alohida sahifa** | Anketada soʻralmagan; mijozda hozircha bitta ham sharh yoʻq | "Sharhlar uchun alohida sahifa hozircha kerak emas — 4-6 ta haqiqiy sharh yigʻilgach, ularni «Biz haqimizda» sahifasiga qoʻyamiz. Sahifa keyin ham qoʻshiladi." |
| **Xizmatlar (Services) alohida sahifa** | Anketada soʻralmagan; xizmatlar bosh sahifada allaqachon bor | "Xizmatlaringiz bosh sahifada 6 ta blok boʻlib chiqadi. Alohida sahifa qilish uchun har bir xizmatga alohida matn va rasm kerak — buni keyinroq qoʻshamiz." |
| **Blog moduli** | Anketada belgilanmagan; maqolalarni yozadigan odam yoʻq | "Blog foydali, lekin har oy maqola yozish kerak. Maqola yozadigan odam topilsa — 1 kunlik ish, alohida hisoblanadi." |
| **FAQ sahifasi** | Anketada belgilanmagan; savol-javob matnini mijoz yozishi kerak | "FAQ uchun 8-10 ta savol va javobni siz yozib berishingiz kerak. Matn tayyor boʻlsa — yarim kunlik ish." |
| **Ingliz tili — kesilmagan, kechiktirilgan** | Anketada **belgilangan** — demak kelishilgan ish. Faqat tarjima matnlari mijozdan keladi | "**Ingliz tili kelishilgan** — uni rejadan chiqarmadik. Sayt avval oʻzbek va rus tilida ochiladi, ingliz tilidagi matnlar kelishi bilan ingliz tilini ochamiz." |
| **Malay tili (birinchi bosqichda)** | Yoʻnalishi nomaʼlum (Q4); tarjimani tekshiradigan odam kerak | "Malay tilini tarjima tayyor boʻlgach va uni tekshiradigan odam topilgach qoʻshamiz — **alohida hisoblanadi**." |
| **59 ta ikkinchi darajali rasm** | Mijozdan hozircha 0 ta rasm keldi; 85 ta rasm soʻrash ishni toʻxtatadi | "Boshlash uchun 20 ta rasm yetarli. Qolganini keyin bosqichma-bosqich qoʻshamiz." |
| **AVIF format** | Har bir yangilanishda build vaqtini bir necha daqiqaga uzaytiradi | "Rasmlar WebP formatda boʻladi — bu barcha brauzerlarda ishlaydi va sayt tez yuklanadi." |
| **Google Analytics (birinchi bosqichda)** | Yandex Metrica bu bozorga yetarli va issiqlik xaritasi bepul | "Yandex Metrica oʻrnatamiz — u yerda tashrif buyuruvchilar saytda nima qilgani video kabi koʻrinadi. Google Analytics kerak boʻlsa keyin qoʻshamiz." |

---

## 3. Client questions — forward verbatim

*Uzbek, Latin script. Question 1 is the hard blocker: it decides how the site gets published at all, and whether repointing the domain would kill the company's email.*

**Generation rule (BC17f) — developer-only, not part of the forwardable block:** when `analize/client-open-questions.md` is generated, **strip the `> ` blockquote prefixes and the `**` emphasis markers**. Many Telegram clients render those literally and the list must paste in clean. The blockquote below is for readability inside this developer document only; **everything inside it, and nothing outside it, is what the client receives** — additions BC17a-e are already woven into the question text, unlabelled, so it stays forwardable verbatim.

> ### Getcar_travel sayti — aniqlashtirish savollari
>
> Assalomu alaykum! Ishni toʻgʻri boshlash uchun quyidagi savollarga javob bering. **1–9-savollar eng muhimi** — ularsiz ishni boshlab boʻlmaydi.
>
> **Eng muhim**
>
> 1. **Hosting qayerda?** Bu eng muhim savol — saytni qanday joylashtirishimiz shunga bogʻliq. Qaysi kompaniyadan olgansiz (masalan ahost.uz, ps.uz, uzinfocom, Beget, boshqa)? Kirish paneli **cPanel**mi? FTP maʼlumotlari bormi? Bilmasangiz — hosting kompaniyasidan kelgan xatni menga yuboring, oʻzim qarayman.
>    **Yana ikkita muhim savol shu yerda:** Hozir shu domenda sayt ishlayaptimi? Shu hosting orqali **korporativ pochta** (masalan `info@getcartravel.uz`) ishlatasizmi? Agar ha boʻlsa, menga albatta ayting — domen sozlamalarini notoʻgʻri oʻzgartirsak **pochtangiz ishlamay qoladi**. Biz eski sozlamalarni avval yozib olamiz, keyin tiklaymiz.
> 2. **Domen nomi qanday?** "Domen bor" deb yozgansiz, lekin nomini yozmagansiz. Masalan `getcartravel.uz`. Bu sayt manzillari va Google uchun kerak.
> 3. **Muddat bormi?** MCHJ roʻyxatdan oʻtish (yagona darcha) jarayoni uchun sayt **qaysi sanagacha** kerak? Aniq sana bormi, yoki shoshilinch emasmi? Agar aniq sana boʻlsa — birinchi hafta ichida bosh sahifani ishga tushiramiz, qolganini keyin toʻldiramiz.
> 4. **Malayziya tili kimlar uchun?** Anketada malay tilini oʻzingiz qoʻshib yozgansiz — demak kerak. Faqat yoʻnalishini aniqlashtiring:
>    (a) Malayziyalik sayyohlar **Oʻzbekistonga** kelishi uchunmi (Samarqand, Buxoro, Xiva, halol ovqat, namoz joylari)?
>    (b) Yoki oʻzbek mijozlar **Malayziyaga** borishi uchunmi?
>    Javobingizga qarab malay tilidagi boʻlim butunlay boshqacha boʻladi — (a) boʻlsa boshqa turlar roʻyxati kerak, (b) boʻlsa oddiy tarjima.
> 5. **Logotip va ranglar.** "Ha bor" deb yozgansiz — iltimos yuboring:
>    · logotip fayli (eng yaxshisi `.svg`, boʻlmasa katta `.png` shaffof fonda)
>    · korporativ ranglar kodlari (masalan `#1189A6`) yoki rangli namuna rasm.
> 6. **Tur paketlari roʻyxati.** Saytga qoʻyish uchun **kamida 6-8 ta** tayyor paket kerak. Har biri uchun:
>    nomi · davlat va shahar · necha kun / necha kecha · narxi va valyutasi (soʻm yoki dollar) · narxga **nima kiradi** · narxga **nima kirmaydi** · **aviabilet narxga kiradimi yoki yoʻq** · qaysi shahardan joʻnab ketiladi · guruh nechta kishilik · qaysi sanalarda bor.
>    **Bularni qachongacha yubora olasiz? (aniq sana yozing).** Bu sana ishni rejalashtirish uchun kerak.
> 7. **Toʻlov haqida — muhim.** Payme, Click va Visa'ni belgilagansiz. Ochigʻini aytamiz: **saytning oʻzida karta orqali toʻlash uchun server va bank bilan shartnoma kerak**, MCHJ roʻyxatdan oʻtib, bank hisob raqami ochilmaguncha buni qilib boʻlmaydi. Shuning uchun birinchi bosqichda shunday qilamiz:
>    mijoz saytda ariza qoldiradi → menejer Telegram/WhatsApp orqali bogʻlanadi → menejer Payme yoki Click'dan **toʻlov havolasi** yuboradi → mijoz shu yerda toʻlaydi.
>    **Shu variant sizga toʻgʻri keladimi?** Agar toʻlov saytning oʻzida boʻlishi shart boʻlsa — bu alohida, kattaroq ish boʻladi.
>    Yana: **hozir Payme yoki Click bilan shartnomangiz bormi?** Agar yoʻq boʻlsa, saytning pastida ularning logotipini qoʻymaymiz — mijozni chalgʻitmaslik uchun.
> 8. **Google akkaunt — kimning nomida?** Saytdan kelgan arizalar Google Jadvalga (Google Sheets) tushadi va buni boshqaradigan kichik dastur kerak. **Bu dastur boshidanoq sizning Google akkauntingizda yaratilishi kerak** — aks holda keyinchalik uni sizga oʻtkazganda saytni qaytadan yigʻish kerak boʻladi. Iltimos:
>    · kompaniya uchun alohida Gmail oching (shaxsiysini ishlatmang), masalan `getcartravel@gmail.com`
>    · shu akkaunt maʼlumotlarini menga vaqtincha bering yoki ekran orqali birga sozlaymiz.
>    **Yana bitta akkaunt kerak: Yandex akkaunti** — sayt statistikasi (Yandex Metrica) shu akkauntda boʻladi. Gmail bu yerda ishlamaydi, alohida Yandex ID kerak. Yangi oching yoki bori boʻlsa ayting.
> 9. **GitHub akkauntingiz bormi?** Sayt matnlari va turlarni oʻzingiz oʻzgartirishingiz uchun GitHub degan saytda akkaunt kerak (bepul, 3 daqiqada ochiladi: github.com). Akkaunt oching va **foydalanuvchi nomingizni (username) yuboring** — men sizga ruxsat beraman. Loyiha **yopiq (private)** boʻladi, faqat siz va men koʻramiz.
>
> **Sayt tuzilishi va kontent**
>
> 10. **Saytda qaysi sahifalar boʻlsin?** Anketada bu savol javobsiz qolgan edi. Biz shu roʻyxatni taklif qilamiz — kerakmasini oʻchiring:
>     Bosh sahifa · Biz haqimizda · Tur paketlari · Davlatlar · Har bir tur uchun alohida sahifa · Aksiyalar · Kontaktlar · Maxfiylik siyosati.
>     Qoʻshimcha (alohida hisoblanadi): Blog · FAQ (savol-javob) · Sharhlar sahifasi · Xizmatlar sahifasi.
> 11. **Kunlik dastur (itinerary) kerakmi?** Anketada buni belgilamagansiz (Narx, Davlat, Davomiyligi, Rasmlar — belgilangan). Shuning uchun biz uni **majburiy qilmaymiz**. Xohlasangiz qoʻshamiz: "1-kun: kelish va mehmonxonaga joylashish, 2-kun: ekskursiya..." Mijozning ishonchi ortadi, lekin har bir tur uchun matn yozib berishingiz kerak boʻladi. Kerakmi?
> 12. **Tarjima kim qiladi?** **Ingliz tili kelishilgan — u rejada bor**, uni chiqarib tashlamadik. Sayt avval oʻzbek va rus tilida ochiladi, ingliz tilidagi matnlar kelishi bilan ingliz tilini ham ochamiz. Malay tili esa Q4 javobiga bogʻliq. Matnlarni oʻzbek tilida siz yozib berasiz, keyin:
>     (a) tarjimani siz topasizmi, (b) biz mashina tarjimasi qilib, keyin siz tekshirasizmi, (c) yoki tarjimon uchun alohida toʻlov qilasizmi?
>     **Malay tili eng qiyini** — uni ingliz tilidan tarjima qilamiz va albatta shu tilni biladigan odam tekshirishi kerak. Tekshiruvchi topilmasa — malay tilini ochmaymiz, chunki yomon tarjima ishonchni yoʻqotadi.
> 13. **Rasmlar.** Hozircha rasm yubormagansiz. Sizga alohida hujjat tayyorlaymiz — unda **har bir rasm qanday boʻlishi kerakligi** yozilgan (nima aks etgan, oʻlchami, gorizontal yoki vertikal). Birinchi bosqich uchun **20 ta rasm** yetarli.
>     **Bularni qachongacha yubora olasiz? (aniq sana yozing).**
>     **Muhim:** internetdan olingan rasmlarni ishlatib boʻlmaydi — mualliflik huquqi boʻyicha jarima boʻlishi mumkin. Oʻzingiz suratga olgan yoki litsenziyasi sotib olingan rasm boʻlishi kerak.
> 14. **Mijozlar sharhi.** Haqiqiy mijozlaringizdan 4-6 ta sharh (ismi, shahri, qisqa matn, ruxsat bersa surati) yigʻib bera olasizmi? Bu saytdagi eng kuchli ishonch elementi.
> 15. **Blog kerakmi?** ("Turkiyaga sayohat uchun 5 maslahat" kabi maqolalar). Agar ha boʻlsa — maqolalarni kim yozadi?
>
> **Aloqa kanallari**
>
> 16. **WhatsApp raqami** +998 50 907 40 00 ning oʻzimi yoki boshqa raqammi?
> 17. **Telegram** — kompaniyaning Telegram kanali yoki menejer akkaunti bormi? Toʻliq havolasini yuboring (masalan `@getcartravel` yoki `t.me/...`). Arizalar shu yerga darhol tushadi.
> 18. **Instagram va YouTube** sahifalaringiz havolasini yuboring.
> 19. **Telefon raqami va kompaniya nomi.** +998 50 907 40 00 — shu raqam toʻgʻrimi? Yana qoʻshimcha raqam bormi (ofis raqami)?
>     Yana: **kompaniya nomi saytda qanday yozilsin — `Getcar Travel`mi yoki `Getcar_travel`mi?** Sayt pastida, sarlavhalarda va Google natijalarida shu yozuv chiqadi, shuning uchun bir marta hal qilib olaylik.
> 20. **Arizalarga kim javob beradi va qancha vaqtda?** (masalan "ish vaqtida 30 daqiqa ichida"). Buni saytda yozib qoʻyamiz — mijoz kutishni biladi.
>
> **Kompaniya maʼlumotlari (sayt pastida koʻrsatiladi)**
>
> 21. **Ish vaqtingiz** qanday? (masalan: Dushanba–Shanba, 09:00–18:00; Yakshanba dam olish)
> 22. **Ofis manzili** toʻliq qanday? Xaritada koʻrsatamizmi?
> 23. **MCHJ roʻyxatdan oʻtgach**: toʻliq rasmiy nomi, STIR (INN) raqami, va turizm faoliyati uchun **litsenziya / guvohnoma raqami**. Bularsiz ham saytni ochamiz — roʻyxatdan oʻtgach qoʻshamiz.
> 24. **Saytga turlarni kim qoʻshadi?** Anketada "oʻzim boshqaraman" deb yozgansiz. Ochigʻini aytamiz: **saytda admin panel boʻlmaydi** (server yoʻq). Turlarni oʻzgartirish uchun brauzerda maxsus faylni tahrirlash kerak — biz sizga oʻrgatamiz, 30 daqiqa vaqt oladi va oʻzgarish 2-3 daqiqada saytda koʻrinadi. **Shu sizga qulaymi**, yoki har oy kichik toʻlov evaziga biz oʻzgartirib turaylikmi?

---

## 4. Assumptions

| ID | Assumption | Overturned by | Blast radius if wrong |
|---|---|---|---|
| A1 | Sitemap per §5 accepted | Q10 | Low — routes are independent |
| A2 | **Malay locale direction is UNKNOWN.** Demand is affirmatively signalled (hand-written into a form that offered only uz/ru/en); *direction* is not. `answers.md:3` lists Malaysia among destinations, which is the literal outbound reading — but it is not decisive. **We build nothing `ms`-specific until Q4 answers.** | Q4 | Contained by construction — `ms` is a priced option, not baseline scope |
| A3 | No on-site payment in Phase 1; manager-issued links | Q7 | **HIGH** — would change the architecture class |
| A4 | **Itinerary is NOT requested.** Client checked four of five items in the same list and left *Dastur (itinerary)* unchecked — a deliberate omission, not a blank. Schema supports it as **optional**; the section is hidden when empty. | Q11 | None — designed as optional |
| A5 | Prices **exclude** flights (no air-ticket service) | Q6 | Medium — commercial dispute risk, now build-enforced (§7.1) |
| A6 | Hosting is shared cPanel/Apache with FTP; no Node, no serverless. **The client's corporate email very likely rides on the same host** (Q1) | **Q1** | Low for output; **HIGH for the pipeline** — decides the deploy step (§8.4); **HIGH for the client's email** if DNS is repointed without recreating MX records |
| A7 | Same number for phone, WhatsApp, Telegram | Q16, Q17 | Low |
| A8 | Brand is modern/premium, not budget-discount (*"albatta zamonaviy"*) | Q5 | Medium — restyle |
| A9 | Launch locales `uz`+`ru`. **`en` was affirmatively ticked (`answers.md:51`); it is staged, not descoped** — the +1.0 d is route/string/hreflang/QA wiring, and translation delivery is the client's per §8.2. `ms` remains a Q4-gated priced option. | Q12 | Low — planned as staged |
| A10 | ~8 tour packages at launch | Q6 | Low for build; **HIGH for launch date**. Fewer than 4 forces a catalogue redesign. |
| A11 | Content and images are the client's obligation; the developer builds the container | Q13, Q14 | **HIGH schedule risk** — §19 R1, mitigated by the LAUNCH-READY gate |
| A12 | No hard registration deadline until stated | **Q3** | Medium — a real deadline inserts Phase 0.5 (§16) |

---

## 5. Information architecture

**URL strategy:** all locales prefixed — `/{lang}/...`. Root `/` is a **real language-picker page** (`src/pages/index.astro`) carrying `hreflang` for every shipped locale plus `x-default → /uz/`.

> **v1 contradiction resolved:** v1 specified *both* a meta-refresh redirect page at `/` *and* an `.htaccess` root 302. If both shipped, the hreflang-bearing page would never be served. **We ship exactly one:** a real page, no meta-refresh (Google discourages it), no server redirect. It costs one click on the bare domain and works identically on cPanel, nginx, Netlify, and a USB stick — Principle: emit only inert files.
>
> **This survives BC4.** `i18n.routing.prefixDefaultLocale: true` is set so `getRelativeLocaleUrl()` emits the `/uz/` prefix, but `redirectToDefaultLocale` is left at its default of `false`, so Astro does **not** hijack `/`. Setting it to `true` would destroy the language picker — do not.

`astro.config.mjs` sets `trailingSlash: 'always'` and `build.format: 'directory'` so §14's trailing-slash hygiene is enforced by config, not by convention.

| Route | Path | Purpose | Launch scope |
|---|---|---|---|
| Language picker | `/` | hreflang + `x-default` | ✅ |
| Home | `/{lang}/` | Convert cold traffic | ✅ |
| Tour catalogue | `/{lang}/tours/` | Filterable list | ✅ |
| Tour detail | `/{lang}/tours/{slug}/` | Price, includes/excludes, gallery, booking form | ✅ |
| Destinations index | `/{lang}/destinations/` | Country hub grid | ✅ |
| Destination detail | `/{lang}/destinations/{country}/` | Thin template over the tour filter — SEO landing for "Turkiyaga tur" | ✅ |
| About | `/{lang}/about/` | Company, trust signals, **reviews folded in here** | ✅ |
| Promotions | `/{lang}/promotions/` | Filtered view of tours with a `discount` badge — **not a separate content type** | ✅ |
| Contacts | `/{lang}/contacts/` | All channels, static map, hours, lead form | ✅ |
| Privacy | `/{lang}/privacy/` | Required — the form collects personal data | ✅ |
| Thank-you | `/{lang}/thanks/` | Post-submit target; conversion anchor | ✅ |
| 404 | **`/404.html`** — one bilingual root page (BC10) | uz + ru text side by side, plus links to `/uz/` and `/ru/` | ✅ |
| ~~Services page~~ | — | **CUT** — zero provenance; content lives in the Home services block | ❌ |
| ~~Reviews page~~ | — | **CUT** — zero provenance and zero content supplied; folded into About | ❌ |
| FAQ | `/{lang}/faq/` | Provenanced (`questions.md:55`) but unticked | 💰 add-on |
| Blog index / post | `/{lang}/blog/` · `/{lang}/blog/{slug}/` | Provenanced (`questions.md:51`) but unticked; needs an author | 💰 add-on |

> **BC10 — why there is no per-locale 404.** With `build.format: 'directory'`, `src/pages/[lang]/404.astro` emits `dist/{lang}/404/index.html`, **not** `dist/{lang}/404.html`. No `ErrorDocument` directive and no platform 404 convention (Netlify, Cloudflare Pages) will ever serve that file, so a per-locale 404 route is dead weight that also creates a route the switcher can link to and the crawler can flag. Only the root `src/pages/404.astro` produces a real `404.html`. It ships bilingual.

**Count: 12 launch route types (BC9).** §2, §5, §16.1 and PART A Option C all state 12. This is the number that goes in the quote; it is the number that decides scope disputes.

---

## 6. Home page — section by section

| # | Section | Content | Images (Tier) |
|---|---|---|---|
| 1 | **Header / nav** | Logo, nav, language switcher (**page-aware — BC8**), click-to-call, "Ariza qoldirish" CTA. Sticky, condenses on scroll. Mobile: full-screen drawer. | logo ×2 (T1) |
| 2 | **Hero** | H1 brand promise, subhead, primary CTA "Turlarni koʻrish" + secondary "Bepul maslahat", 3 trust chips (years · tourists · destinations) — **numbers come from the client, never invented** | `hero-main-1920x1080.webp` + `hero-main-mobile-1080x1350.webp` (T1) |
| 3 | **Quick enquiry bar** | destination · dates · pax · phone → same endpoint. Highest-intent capture point. | — |
| 4 | **Services** | 6 cards: Tour packages · Hotel · Insurance · Transfer · **Guide** · **Meals** | **6 inline SVG icons — no photographs.** This is why the six T2 "service photos" were dropped: they had no consumer. |
| 5 | **Popular destinations** | 6 country cards, tour count + "from" price | 6 × `dest-{slug}-01-800x1000.webp` (T1) — slugs `turkiya`, `dubay`, `tailand`, `misr`, `malayziya`, `ozbekiston` |
| 6 | **Featured tours** | 3–6 cards where `featured: true`. Cover, country, duration, price (struck old price if discounted), badge, **flight-inclusion line rendered from the `flightIncluded` boolean via `t()` (BC6) — never from prose**, CTA | 6 × `tour-{slug}-cover-1200x800.webp` (T1) |
| 7 | **Why us** | 4 differentiators grounded in real advantages (own transfer fleet given the "Getcar" name, guide, insurance, direct-manager contact). **Confirm; do not invent.** | `about-team-1600x900.webp` (T1) |
| 8 | **How it works** | 4 steps: leave a request → manager contacts you → choose and confirm → pay via the link the manager sends. **This is where the payment story is told honestly.** | 4 numbered icons |
| 9 | **Promotions** | Full-bleed banner: discount %, valid-until, CTA. **Hidden entirely when no active promo** (data-driven). | `promo-banner-1600x600.webp` (**T1** — BC15) |
| 10 | **Testimonials** | 3–6 **real** reviews only (Q14). Fewer than 3 → replace with Instagram/Telegram social proof. | 3 × `avatar-0N-200x200.webp` (**T1** — BC15) |
| 11 | **CTA + lead form** | Headline, response SLA (Q20), fields per §9, consent checkbox + privacy link | `cta-bg-1600x900.webp` (**T1** — BC15) |
| 12 | **Footer** | Logo, short about, links, contacts, hours (Q21), **address block that renders when supplied and auto-hides when absent (BC12b)**, socials, **trading name at launch — INN + licence added post-registration (Q23)**, payment badges **only if Q7 confirms a merchant contract** | social SVGs |
| 13 | **Floating widget** | FAB → Telegram / WhatsApp / call. Mobile sticky bar. `prefers-reduced-motion` respected. | — |

> **BC15, stated plainly:** P2 builds sections 9, 10 and 11, and §10's Contacts page ships the static map — all of them launch scope. Their placeholders must therefore exist **before Gate 1**, which is why `promo-banner`, `cta-bg`, three testimonial avatars and `static-map` were moved from Tier 2 into Tier 1. All six are marked `clientPhotoRequired: false` (the developer generates them), so the client's ask stays at 20 photographs.

> **Phase 0.5 prefix rule:** if Q3 reveals a real registration deadline, the landing page is **sections 1, 2, 4, 5, 6, 8, 11, 12, 13 of this exact table** — the real components, the real content model, the real phone and Telegram. No throwaway artefacts. Adding the remaining sections later is additive, never a rewrite.

---

## 7. Tour data model

**One file per tour: `src/content/tours/{slug}.json`. All locales live inside that one file** so they cannot drift. A copy-me `_TEMPLATE.json` ships alongside; the client is instructed to **duplicate an existing tour, never author from scratch**.

```jsonc
{
  "id": "tr-antalya-7n",
  "slug": "turkiya-antalya-7-kun",
  "status": "published",              // draft | published | archived
  "featured": true,
  "order": 10,

  "country": "TR",                    // UZ | MY | TR | AE | TH | EG  (ISO code in DATA; filenames use Uzbek slugs)
  "cities": ["Antalya"],
  "category": "beach",                // beach | excursion | family | pilgrimage | shopping | domestic
  "departureCity": "Toshkent",

  "duration": { "days": 8, "nights": 7 },

  "price": {                          // TOP-LEVEL and SINGLE-INSTANCE — see the parity note below
    "amount": 6200000,
    "currency": "UZS",                // UZS | USD — displayed as entered, never auto-converted
    "per": "person",
    "oldAmount": 7000000              // optional -> struck-through + auto "-11%" badge
  },
  "flightIncluded": false,            // REQUIRED, TOP-LEVEL — client does not sell air tickets

  "groupSize": { "min": 2, "max": 20 },
  "departures": ["2026-06-05", "2026-06-19"],   // ISO; filtered at BUILD and re-checked at RUNTIME, see §7.3
  "badges": ["hot", "discount"],

  "images": {
    "cover": "tour-turkiya-antalya-cover-1200x800.webp",
    "gallery": ["tour-turkiya-antalya-01-1600x1067.webp"]
  },

  "i18n": {
    "uz": {
      "title": "Antalya — 7 kecha 8 kun, 5* mehmonxona",
      "summary": "Ultra all-inclusive dam olish...",
      "priceNote": "Narxga aviabilet kirmaydi.",   // REQUIRED when flightIncluded === false
      "includes": ["Mehmonxona 5* (7 kecha)", "Ultra all-inclusive", "Transfer", "Sugʻurta", "Gid"],
      "excludes": ["Aviabilet", "Viza", "Shaxsiy xarajatlar"],
      "itinerary": [],                // OPTIONAL (A4). Empty -> section omitted.
      "seo": { "title": "...", "description": "..." }
    },
    "ru": { /* same shape */ }
  }
}
```

> **Parity note (BC6, binding).** `price` and `flightIncluded` are **top-level and single-instance**, so cross-locale parity holds **by construction**. There is nothing to compare and nothing to drift. **Do not move them into the `i18n` blocks.** Doing so would permit per-locale prices and force a translation round-trip for every price change — the exact client-autonomy deadlock this design avoids.

### 7.1 Validation — strictness matched to commercial risk

v1 hard-failed on a missing cover image (cosmetic) but only warned on a missing locale (commercial). That is reversed. **v2's cross-locale price-parity hard-fail is deleted (BC6): it could never fire**, because there is only ever one price object. Two enforceable rules replace it.

| Rule | Behaviour | Why |
|---|---|---|
| `uz` block missing | **BUILD FAILS** with file path + field | Source of truth |
| **`flightIncluded === false` AND `priceNote` missing or empty in any shipped locale** | **BUILD FAILS** | The client does not sell air tickets (§1). A price shown in a shipped language with no "flight not included" note is the single most likely source of a customer dispute. This is the rule v2's parity check should have been. |
| **Locale prose (`summary`, `priceNote`, `includes`, `excludes`) contains a digit adjacent to a currency token** — `soʻm｜som｜sum｜UZS｜USD｜$｜€｜₽｜руб` | **WARNS**, plus one line in the end-of-build summary. **Never a hard fail.** | Catches a stale number typed into prose. It must not block a publish: `"Viza rasmiylashtiruvi — 50 USD"` in `excludes` is entirely legitimate. Same treatment as the `images.cover` rule below, and required by Principle 3. |
| `oldAmount <= amount` | **BUILD FAILS** | Prevents a fake discount |
| A non-`uz` locale block is absent | **The page for that locale is NOT EMITTED.** It never appears in the sitemap, never appears in any `hreflang` cluster, and **the page-aware language switcher (BC8) never links to it.** | v1 emitted `/ru/tours/x/` containing Uzbek text, orphaned from its own hreflang — textbook thin/duplicate content aimed at exactly the audience the site exists for |
| `images.cover` unresolvable against `imageKeys` | **WARNS**, substitutes a generated placeholder, prints a summary line at the end of the build | A missing photo must never block a client publish |
| `itinerary` empty or absent | Section omitted (A4) | |
| `status: "draft"` | Excluded from output entirely | |
| All `departures` in the past | **Filtered at build AND re-evaluated in the browser** (BC7) — see §7.3 | |

**Tour-detail rendering rule (BC6):** the flight-inclusion line on the tour detail page and on every tour card renders **from the `flightIncluded` boolean through `t()`**, never from `priceNote` or any other free prose. `priceNote` is supporting detail; the boolean is the fact.

### 7.2 Image resolution — specified end to end

A bare string like `"tour-...webp"` has no documented path to `<Image>` optimisation. A Zod `.refine()` **validates; it does not transform** (BC16), so the lookup is explicit:

```ts
// src/lib/images.ts
const imageMap = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/*.webp', { eager: true }
);

export const imageKeys = new Set(
  Object.keys(imageMap).map(p => p.split('/').pop()!)
);

// BC16 — the transform half. Components call this before <Image>.
export function resolveImage(filename: string): ImageMetadata {
  const entry = imageMap['/src/assets/images/' + filename];
  if (!entry) throw new Error(`Image not found in src/assets/images: ${filename}`);
  return entry.default;
}
```

The schema validates filenames against `imageKeys` with a Zod `.refine()` — not an `fs` check — so the rule behaves identically in CI and locally. Components then call `resolveImage()` and pass the returned `ImageMetadata` to `<Image>`.

> **Why a bare filename rather than Astro's `image()` schema helper:** `image()` resolves paths **relative to the content file**, which is hostile to the non-technical editor D1 puts in charge. A flat filename is what the client sees in the image-requirements document and what they name the file they send back. The lookup above is the cost of that choice, and it is small.

### 7.3 Stale departures — build-time floor, runtime narrowing, weekly rebuild

v1 filtered past departure dates at build time on a site that only rebuilds when someone commits. v2 **replaced** that with runtime JS, which left the no-JS path permanently wrong. **BC7 restores the floor: build-time filtering is supplemented by runtime evaluation, not replaced by it.**

**Three layers, in order of authority:**
1. **Build time (the correctness floor).** Past `departures` entries are dropped during the build. Whatever the browser does or does not do, the emitted HTML is correct as of the last build.
2. **Runtime (narrowing).** Departure dates render as `<time datetime="2026-06-05" data-departure>`; ~10 lines of inline JS on load hide any `<time data-departure>` now in the past and, if none remain, swap the block for the localised *"Sanalar soʻrov boʻyicha"* string.
3. **Weekly rebuild.** The P0 pipeline runs a `schedule:` cron every week, so the build-time floor never drifts more than seven days — **and because the repo is PRIVATE (BC2), GitHub's 60-day auto-disable of scheduled workflows in public repositories does not apply.**

**Worst case with JS disabled:** a date at most seven days stale. Bounded, and materially different from v2's permanently-false display.

**Empty-`departures` fallback:** month granularity — *"Iyun 2026 — aniq sanalar soʻrov boʻyicha"* — is used **only** when a tour has no dates at all. It is not the primary rendering: concrete dates let a customer self-qualify at the highest-intent moment, which is exactly what §1's "under 60 seconds" optimises for.

### 7.4 Supporting collections

`src/content/destinations/{country}.json` · `src/content/reviews/*.json` (rendered on About) · `src/content/promotions/*.json` · `src/content/faq/*.json` (add-on) · `src/content/blog/{lang}/{slug}.md` (add-on).

---

## 8. Tech stack — locked to verified reality

| Layer | Choice | Notes |
|---|---|---|
| Framework | **`astro@^7`** (7.2.2), `output: 'static'` | v1 said Astro 5 — two majors stale, would not build |
| Content config | **`src/content.config.ts`** (not `src/content/config.ts`) | Required location in Astro 7 |
| Collections | `defineCollection({ loader: glob({...}) })` — **`loader` is REQUIRED**, imported from `astro/loaders` | `glob()` for `*.json`/`*.md`, `file()` for single-file collections |
| Schema | **Zod 4** (astro depends on `zod ^4.3.6`) | Zod 4 error-customisation and string-format APIs — **not Zod 3 syntax** |
| Styling | **`@tailwindcss/vite`** + Tailwind 4.3.3, tokens declared with **`@theme`** in `src/styles/tokens.css` | **No `tailwind.config.ts`**, and **not** the deprecated `@astrojs/tailwind` integration |
| Images | `astro:assets` `<Image>`/`<Picture>` with **explicit `sharp@^0.35.3` devDependency** | `sharp` is an **optionalDependency** of astro and optional deps fail **silently**. Verified working here: sharp 0.35.3 / libvips 8.18.3. **WebP only at launch** — AVIF across ~85 sources adds minutes to every client-triggered rebuild and breaks the "2–3 minute publish" promise. |
| Type checking | `@astrojs/check@0.9.10` + `typescript` as declared devDeps | `npx astro check` fails without them |
| Routing | `trailingSlash: 'always'`, `build.format: 'directory'` | Makes §14's URL hygiene enforced, not aspirational |
| **i18n config** | **`i18n.defaultLocale: 'uz'`, `i18n.locales: SHIPPED_LOCALES`, `i18n.routing.prefixDefaultLocale: true`** (BC4, BC5) | See the config block and the verification note below. `redirectToDefaultLocale` is deliberately left unset. |
| Interactivity | Vanilla TS islands (`client:visible` / `client:idle`): menu, lang switcher, tour filter, lightbox, form, floating widget | No React runtime for a brochure site. **JS budget ≤ 60 KB gzipped** |
| Fonts | Self-hosted via `@fontsource` | Avoids the Google Fonts CDN (slow in CIS networks) |
| Icons | Inline SVG sprite | No icon-font payload |
| Forms | Google Apps Script Web App → **Telegram + Sheets + Gmail** (§9) | No backend |
| Sitemap | `@astrojs/sitemap@3.7.3` | Verified: `createGetI18nLinks` builds alternates only from URLs actually in the emitted page list, so it will not advertise a non-emitted locale page. Compatible with §7.1's non-emission rule. |
| Analytics | **Yandex Metrica only at launch** (free heatmaps and session replay, serves the RU audience, one script, simpler consent). GA4 is a priced add-on. | Requires a **Yandex account**, not a Google one — Q8 (BC17d) |

```js
// astro.config.mjs — the locale-critical part (BC4 + BC5)
import { SHIPPED_LOCALES } from './src/i18n/locales.mjs';   // ['uz','ru'] at launch

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'uz',
    locales: SHIPPED_LOCALES,                  // BC5 — the SAME constant getStaticPaths() consumes
    routing: { prefixDefaultLocale: true },    // BC4 — REQUIRED, see below
    // redirectToDefaultLocale is NOT set. It defaults to false, which is what keeps
    // `/` as the real language-picker page (§5). Setting it to true destroys §5.
  },
});
```

> **BC4 — why `prefixDefaultLocale: true` is mandatory.** Verified directly in astro@7.2.2 source: `dist/i18n/index.js` pushes the locale segment only for the four `*-prefix-always*` strategies, otherwise `else if (locale !== defaultLocale)`. With the default `pathname-prefix-other-locales`, `getRelativeLocaleUrl('uz','/tours/')` returns **`/tours/`** — a URL the `[lang]` tree never emits, i.e. a guaranteed 404 on every internal link to the default locale. `dist/core/app/common.js:8-16` maps `prefixDefaultLocale: true` + `redirectToDefaultLocale: false` to `pathname-prefix-always-no-redirect`, which is in the prefix set; `redirectToDefaultLocale` defaults to `false` (`dist/core/config/schemas/base.js:227`).
>
> **BC5 — why one constant.** `getLocaleRelativeUrl` calls `peekCodePathToUse` and **throws `MissingLocale`** for a locale absent from `i18n.locales`. Driving `i18n.locales` and `getStaticPaths()` from the same `SHIPPED_LOCALES` export therefore converts "link to an unbuilt locale" from a silent 404 into a **loud build failure** — free enforcement, exactly matching Principle 4.

> **P0 gate, non-negotiable:** scaffold + one collection with a `glob()` loader + one optimised image + `npm run build` **GREEN** before any design work starts. Everything above is verified-current as of this plan's date, and versions move. Fold two cheap checks into the same smoke test: that `import.meta.glob` resolves inside `src/content.config.ts`'s Vite module-runner context, and that `@astrojs/sitemap`'s i18n config accepts a two-locale list.

### 8.1 i18n — how it actually works

**The v1 claim that Astro "natively prerenders every locale" is false and is deleted.** Astro's file-based routing creates routes from files that exist; it does not auto-generate them across locales.

- Routes live in **`src/pages/[lang]/`** and are generated by **`getStaticPaths()`** returning `SHIPPED_LOCALES`. A real `src/pages/index.astro` serves the language picker. *(Verified sound: `Astro.currentLocale` is derived from the pathname — `dist/i18n/utils.js:105` `computeCurrentLocale` — and Astro 7 additionally ships `computeCurrentLocaleFromParams` for exactly this route shape. This design is first-class and supported.)*
- Astro's `i18n` config is used **for helpers only** — `Astro.currentLocale`, `getRelativeLocaleUrl`, plus the `prefixDefaultLocale` behaviour above. **`i18n.routing.fallback` is never relied upon**; its behaviour with a `[lang]` param tree is not what the naive reading suggests.
- **`SHIPPED_LOCALES` is a single exported constant** consumed by `astro.config.mjs`, every `getStaticPaths()`, the hreflang builder, and the sitemap config. Adding a locale is a one-line change in one file.
- UI strings live in `src/i18n/{locale}.json`, **one file per shipped locale**, behind a typed `t()` helper. At launch that is `uz.json` + `ru.json`; `en.json` is added when Q12's translations arrive; `ms.json` only if Q4 and the native-review gate both pass. **Every component consumes `t()` from the first component built** (Principle 5) — there is no uz-only phase to retrofit.
- A missing UI key falls back to `uz` and logs a build warning. It never renders a raw key to a user.
- Every page emits reciprocal `hreflang` for **locales actually present on that page**, plus `x-default → uz`.
- **The language switcher is PAGE-AWARE (BC8).** Every page passes its own `availableLocales` — the exact set `getStaticPaths()` used to decide emission, and the same set that drives that page's hreflang. Locales absent from that set are either **omitted from the switcher** or **linked to that locale's tour index**; the switcher **never links to a URL that was not emitted**. Where all locales are present the path is preserved (`/ru/tours/antalya/` ↔ `/en/tours/antalya/`) — same slug across locales, only the prefix changes. No slug-translation map.
  > Without this, three Gate-1 criteria — path-preserving switcher, non-emission of incomplete locales, and zero broken internal links — are mutually unsatisfiable, and §18's `linkinator --recurse` would fail on exactly the pages most likely to be missing a locale.
- `<html lang>` per locale; dates and numbers via `Intl`.

### 8.2 Translation workflow

Client writes source content in Uzbek → developer machine-translates as a first pass → **native review before publish** → `ms` last, using **English as the pivot** (uz→ms direct quality is poor). **Go/no-go: no native Malay review, no `ms` launch.** A badly translated locale damages trust more than its absence.

**`en` is agreed scope (BC14).** The client ticked it. The 1.0 d in §16.1 buys routes, strings, hreflang and QA; it does not buy translation. The locale opens the day the client's English copy lands.

### 8.3 Content survivability for a non-technical editor

JSON braces are a genuine hazard for the person D1 says must self-serve. Three mitigations, all cheap:

1. `src/content/tours/_TEMPLATE.json` with inline comments and a "duplicate this file" instruction at the top of the Uzbek manual.
2. A GitHub Action that, on a failed build, **posts a comment on the commit translating the Zod error into plain Uzbek** (`"turkiya-antalya.json faylida narx yozilmagan — 12-qatorga qarang"`). This turns Principle 4 from a developer convenience into a client-facing safety net.
3. The last good build stays live; a broken commit never takes the site down.

### 8.4 Publishing pipeline — a P0 DELIVERABLE, not an assumption

v1's §11 promised "CI rebuilds and deploys, ~2–3 minutes" while defining **no CI anywhere**, on top of an assumption (A6) of FTP-only cPanel with no Node. Under v1 as written, the client commits and **nothing happens**: no rebuild, no deploy, site unchanged, client believes they published. That collapsed the entire D1 resolution.

> **Repo visibility: PRIVATE. Decided, not deferred (BC2).**
> - GitHub auto-disables scheduled workflows after 60 days of inactivity **in public repositories only**. §7.3's weekly cron depends on that not happening, and R3 rates "client never touches the repo" as High.
> - It closes the exposure surface entirely: an unfinished site, the Apps Script `/exec` URL, and any deploy configuration stay unreadable.
> - Budget: a weekly cron plus roughly ten client commits a month at ~3 minutes each is about **35 minutes against the 2,000 free private-repo Actions minutes**.
> - The client gets **collaborator access** via the GitHub username from Q9. This is an extra invite step the developer performs; the client only has to open the account.
> - Also raise before handover: renaming `tour-website` to something client-facing.

**`.github/workflows/deploy.yml`, built in P0:**

| Stage | Detail |
|---|---|
| Triggers | `push` to `main`; `workflow_dispatch` (a URL the client can bookmark); **`schedule:` weekly cron** (§7.3) |
| Build | `npm ci && npm run build` on `ubuntu-latest`, Node 24 |
| Guard | Build failure → **no deploy**, last good version stays live, failure emails the developer, and the Uzbek error comment is posted (§8.3) |
| Deploy step | **Chosen by Q1's answer** — see below |
| Secrets | FTP credentials / deploy token in GitHub repo secrets. Never in the repo. |

| Q1 answer | Deploy step |
|---|---|
| Shared cPanel with FTP | An FTP-deploy action pushing `dist/` to `public_html/`. Ship an `.htaccess` for gzip/brotli, far-future cache on `/_astro/*`, `ErrorDocument 404 /404.html`, force-HTTPS. **No root 302** (§5). Verify PHP is not intercepting routes. |
| VPS with SSH | `rsync dist/` + an nginx server block with the same cache/compression policy, `error_page 404 /404.html` |
| No usable access, or client agrees to migrate | **Netlify or Cloudflare Pages free tier.** Point the existing domain (apex `ALIAS`/`ANAME` + `CNAME www`). Free auto-TLS, deploy-on-push, instant rollback, and a build hook the client can trigger — which also unlocks the optional admin UI. **Technically the better outcome; keep the paid hosting for email.** Recommend it with reasoning; do not silently override the client's purchase. |

> ⚠️ **MANDATORY pre-cutover step, to be written into `docs/DEPLOY.md` (BC17a).** Before any nameserver or DNS change: **export and record every existing DNS record for the domain — especially `MX`, and also `TXT`/SPF, `DKIM`, `CNAME` for mail, and any `A` record for a mail host — then recreate them at the new provider before the change propagates.** The plan's own recommendation is to keep the client's paid hosting for email; a naive nameserver switch to Netlify or Cloudflare **deletes the client's email service**. Q1 asks whether corporate mail runs on that host precisely so this step is not skipped. This is a checklist item with a checkbox, not a paragraph.

Host-specific behaviour (`.htaccess` directives, compression) is tested **only under the scenario that actually ships** — it is never an acceptance criterion in the general case.

---

## 9. Forms without a backend

### 9.1 Inventory

| Form | Where | Fields |
|---|---|---|
| Quick enquiry | Home hero strip | destination · dates · pax · **phone\*** |
| Booking request | Tour detail, prefilled with tour id/title | name\* · phone\* · dates · pax · comment · consent\* |
| General lead | Contacts, footer CTA | name\* · phone\* · email · message · consent\* |
| Callback | Floating widget | **phone\*** only — one field, maximum conversion |

`*` required. **Phone is the only universally required field** — this market converts on phone, not email. Contact preference (Telegram / WhatsApp / call) as a radio group.

### 9.2 Validation

Progressive enhancement first: native HTML5 `required`/`pattern` so the form still works with JS off (via the iframe fallback), plus TS refinement. Phone normalised to E.164 (`+998XXXXXXXXX`) with a permissive fallback for foreign numbers. Inline errors, `aria-describedby`-linked, in the page's locale. Submit button disabled/loading; double-submit guarded.

### 9.3 Transport — Apps Script, Telegram-primary, each leg isolated

**`doPost` order of operations, with BC18's isolation:**

```js
// apps-script/Code.gs — structure, not final code.
// The token is NEVER in this file; see the Script Properties note below.
function doPost(e) {
  const props = PropertiesService.getScriptProperties();

  // 1. validate + append the row.  Cheap, no quota. This must not be reachable twice.
  const row = validateAndAppend(e);          // throws only on genuinely invalid input

  // 2. PRIMARY notification — Telegram. No Google quota. (BC18: isolated.)
  try {
    UrlFetchApp.fetch(tgUrl(props.getProperty('TG_TOKEN')), tgPayload(props, row));
  } catch (err) {
    markRow(row, 'tg_failed: ' + err);       // recorded, NOT thrown
  }

  // 3. SECONDARY notification — email, quota-guarded. (BC18: isolated.)
  try {
    if (MailApp.getRemainingDailyQuota() > 20 && underDailyNotifyCap(props)) {
      MailApp.sendEmail(/* ... */);
    } else {
      markRow(row, 'mail_skipped_quota');
    }
  } catch (err) {
    markRow(row, 'mail_failed: ' + err);      // recorded, NOT thrown
  }

  return ok();                                // ALWAYS 200 once the row is appended
}
```

> **BC18 — why each leg is wrapped individually.** In v2's ordering a `UrlFetchApp` throw after the row append killed the email fallback **and** returned an error to the browser, which the user then resubmits against — producing **duplicate rows** for a failure that had nothing to do with their submission. A notification failure is recorded in the row and never propagates.

> **BC19 — the daily digest.** Telegram is now both the **primary alert** (§9.3) and the **primary failure escape hatch** (§9.4's error state surfaces Telegram/WhatsApp links). A Telegram outage removes both at once, and neither remaining leg is observed: Gmail is quota-gated and nobody watches a spreadsheet. Therefore add an Apps Script **time-driven DAILY trigger** that emails a one-line digest — *"Bugun N ta ariza"* — counted from the sheet. One email a day never approaches the quota, and it is the only mechanism that would surface a silent Telegram failure. Absorbed into P4's 1.0 d.

> 🔐 **Secret handling (BC3, binding).** The Telegram bot token and chat ID live in **Apps Script Script Properties**, read as `PropertiesService.getScriptProperties().getProperty('TG_TOKEN')` and `...getProperty('TG_CHAT_ID')`. The **tracked** `apps-script/Code.gs` carries **placeholders only**, plus a header comment naming the two properties that must be set in the Apps Script UI. §9.3's notification counter already uses a script property, so the mechanism is not new. `.env.example` likewise carries placeholder values only — **never the real `/exec` URL and never the real form token**. Combined with BC2's private repo, §9.6's "Not exposed" claim becomes true rather than aspirational.

**Why Telegram is primary:** v1 justified the public endpoint on "no lead data can be exfiltrated" — true, but that analyses reads only. Every POST also triggered `MailApp.sendEmail`, and **consumer Gmail is capped at ~100 recipients/day** (Workspace ~1,500). Q8 explicitly recommends the client open a free company Gmail — a consumer account. A spammer who finds the `/exec` URL burns the daily quota, after which **real leads stop being emailed, silently.** Telegram has no Google quota and is where this client already works. Additionally: **notification sends are capped independently of row appends** (a script property counter reset daily), so spam can fill the Sheet but cannot mute the notifications.

**Ownership:** the Web App deploys as *Execute as: Me*. **"Me" must be the CLIENT's Google account from day one.** If it is the developer's, every lead flows through the freelancer's personal account indefinitely, and handover requires redeploying under the client's account — **which changes the `/exec` URL and forces a site rebuild + redeploy.** This is client question #8 and it **blocks P4**. If the client cannot supply it in time, the fallback is to build against a throwaway account and budget an explicit P8 task for the URL swap + redeploy.

**Deploy as:** Web App · *Execute as: Me (client)* · *Who has access: Anyone*.

### 9.4 The CORS question — resolved by a day-0 spike, not by assertion

Apps Script does not respond to `OPTIONS` preflight, so any request triggering preflight fails. The **`text/plain` avoids preflight** half of this is well established. The other half — whether the response is **readable** across the `302 → script.googleusercontent.com` hop — is genuinely contested; it is a real and widely reported behaviour, but it is not settled fact, and v1 rested its entire form UX contract, one acceptance criterion, and one verification step on it.

> **P0 spike, 30 minutes, before P4 is costed.** POST `text/plain;charset=utf-8` with a JSON string body to a throwaway `/exec` from a real browser page. Log whether `res.ok` and `res.json()` are readable. **Record the result in this document.**
>
> | Outcome | Design |
> |---|---|
> | Readable | Apps Script stays primary with real success/error UX. Parse with `JSON.parse(e.postData.contents)`; return `ContentService.createTextOutput(...).setMimeType(MimeType.JSON)`. |
> | Not readable | **Web3Forms becomes primary** (real CORS, readable JSON, vendor-side spam filtering, ~250 submissions/mo free, access key public by design). Apps Script demoted to fire-and-forget for Sheets + Telegram enrichment. **Note the ceiling: ~250/month is a real limit Apps Script does not have** — see residual risk 4. |

> ❌ **Never send `Content-Type: application/json`** — it triggers preflight and the request dies. This is the single most common failure with this integration.

**No-JS fallback regardless:** `<form method="POST" action="{exec}" target="hidden-iframe">` + a hidden iframe. Zero CORS involvement.

**UX contract:** submit → spinner → **8-second timeout** → redirect to `/{lang}/thanks/` **on resolve-or-timeout, never on "confirmed success."** On error: keep the entered data, show a locale-appropriate message, and **surface direct Telegram/WhatsApp/call links** — a failed form must never be a dead end. Draft persisted to `sessionStorage`.

The transport sits behind one `submitLead()` function, so switching providers is a one-file change.

### 9.5 Bot friction — not security

*None of this stops a targeted attacker, and the plan does not claim it does.*

| Layer | Mechanism | Honest limit |
|---|---|---|
| Honeypot | CSS-hidden `website` field; non-empty → accept and discard | Defeated by a bot that renders CSS |
| Time trap | Render timestamp; **multi-field forms only, < 2 s → reject** | Not applied to the one-field callback widget, where autofill would false-reject |
| Client counter | `localStorage`, 3 per 10 min | **Not rate limiting** — one click to clear, or incognito, or `curl` |
| Shared token | Constant checked in `doPost` | Blocks drive-by bots hitting the bare URL. Not authentication; we do not claim otherwise. |
| **Notification cap** | Script property counter; row appends continue, notification sends stop at a daily cap | The layer that actually protects the client (§9.3) |
| Field sanity | Length caps | **The "reject bodies containing URLs" rule from v1 is DROPPED** — it silently discards legitimate enquiries pasting an Instagram or tour link |

### 9.6 What is exposed, and why it is acceptable

| Exposed | Risk | Verdict |
|---|---|---|
| Apps Script `/exec` URL | Junk rows in the Sheet | **Acceptable.** The script only **appends**; it never reads or returns existing rows, so **no lead data can be exfiltrated**. Worst case is deletable spam. The mail-quota consequence is closed by §9.3. |
| Shared form token | Readable in the bundle | Acceptable — a bot filter, not authentication |
| Web3Forms access key | Same class | Acceptable — the vendor documents it as public by design |
| Telegram bot token | Would be catastrophic | **Not exposed — and now structurally so (BC3).** It lives in Apps Script Script Properties, not in `apps-script/Code.gs`, and the repo is private (BC2). |

**The rule:** a public write-only append endpoint is acceptable because there is nothing to steal and no money to move. If a later phase adds payments or reads customer data back, this design is void and needs a real backend.

### 9.7 Personal data — what to actually tell the client

> **Developer-internal background — do not paste this to the client.** *(BC13. This document is tracked in a repo the client is granted access to, and §9.7's own rule forbids asserting a legal conclusion in anything the client may rely on. The paragraph below is reasoning for the developer; the client-facing wording is the separate quoted block that follows.)*
>
> Uzbek personal-data law was amended effective 27 March 2026, **narrowing the duty from a blanket domestic-storage requirement to a selective model**: most categories of personal data may be processed and stored on international servers under conditions, with mandatory domestic storage reserved for **sensitive categories**. A lead form collecting a name and a phone number is not a sensitive category, so Google Sheets is very unlikely to create an obligation here. v1's disclosure — which told the client that UZ law requires local storage and that "strict compliance requires a local backend" — is **withdrawn**: as of March 2026 it is not merely stale, and as written it could push the client to buy a backend they do not need.

**The approved client-facing sentence, and the only one to send:**

> *"Shaxsiy maʼlumotlarni saqlash qoidalari 2026-yilda oʻzgardi. Sizning saytingizdagi kabi oddiy ism va telefon raqami olinadigan forma cheklangan toifaga kirmaydi. Shunga qaramay, saytni ishga tushirishdan oldin bu masalani yuristingiz bilan bir marta tekshirib olishingizni tavsiya qilamiz."*

**Wording rule:** state it in non-specific terms and **never** cite an article number, a date, or a compliance conclusion in a document the client may rely on.

**Unchanged and mandatory regardless of any of the above:** a Privacy page in every shipped locale, an explicit consent checkbox on every form, and a plain statement of what is collected and who sees it.

---

## 10. Contact & social

| Channel | Implementation |
|---|---|
| Phone | `tel:+998509074000`, displayed `+998 50 907 40 00` |
| Telegram | `https://t.me/{username}` (Q17); `?text=` prefilled with the package name on tour pages |
| WhatsApp | `https://wa.me/998509074000?text=...` (Q16); prefilled message measurably lifts reply rate |
| Instagram / YouTube | `target="_blank" rel="noopener noreferrer"` (Q18) |
| Map | **Static image (`static-map-800x500.webp`, Tier 1 per BC15) + "open in Yandex/Google Maps" link.** No embedded iframe — an embed costs ~500 KB and destroys LCP for a map almost nobody interacts with. The map block, like the footer address, **auto-hides when Q22 is unanswered.** |
| Floating widget | FAB → Telegram / WhatsApp / call; keyboard-accessible, `Esc` closes, honours `prefers-reduced-motion` |

Every outbound contact click fires a Metrica event, so the client can see which channel actually converts.

---

## 11. Content editing workflow

| Rank | Option | Client effort | Cost | Latency | Honest verdict |
|---|---|---|---|---|---|
| **1 ⭐ launch** | **Edit tour JSON in the GitHub web UI** → pipeline (§8.4) rebuilds and deploys | ~30 min training + an Uzbek screenshot guide | Free | ~2–3 min | Realistic for 2–4 tours/month. **This only works because §8.4 exists.** Risk: JSON braces intimidate a non-technical client → mitigated by `_TEMPLATE.json`, "duplicate, never author", and the Uzbek build-error bot (§8.3). Requires a collaborator invite on the private repo (BC2). |
| **2 — optional upgrade** | **Sveltia / Decap CMS** — a real `/admin` login and form UI, commits to git behind the scenes | ~10 min | Free, but needs a GitHub OAuth broker (a small Cloudflare Worker, or Netlify's built-in) | ~2–3 min | The right long-term answer. **Honest caveat: the OAuth broker is technically a tiny server**, so "zero backend" becomes "zero backend we operate." Requires Netlify/Cloudflare hosting. Build only once the client demonstrates they are actually editing. |
| 3 | **Google Sheets as CMS** — build step pulls the published CSV | Near zero | Free | Needs the scheduled/manual rebuild trigger | Lowest learning curve, but images still need hosting and the client pastes URLs; two sources of truth. Good fallback if the client rejects git outright. |
| 4 | **Developer on retainer** | Zero | Monthly fee | Hours to a day | Lowest risk, best content quality, recurring revenue for the freelancer |

**Recommendation: ship #1 + #4 together** — train the client *and* keep a small retainer as the safety net. Re-evaluate at 60 days: editing weekly → build #2; never touching it → settle on #4.

---

## 12. Placeholder images

> The full inventory table, the client-facing document specification, and the generator specifications live in **`docs/IMAGE-BRIEF-SPEC.md`**. This section carries the naming rule, the tier totals, and the generation constraints.

### 12.1 Naming

```
{section}-{subject}-{variant}-{W}x{H}.webp
```
`hero-main-1920x1080.webp` · `dest-turkiya-01-800x1000.webp` · `tour-turkiya-antalya-cover-1200x800.webp`

Lowercase, hyphen-separated, **ASCII only** (no Cyrillic and no `oʻ`/`gʻ` — they break on some FTP clients and in URLs). Dimensions embedded so the client sees the **minimum source size** from the filename alone. Real photos drop in under the **exact same filenames** with zero code change — this is why the dimensions are in the name.

> **Slug convention, standardised (Critic minor item).** All destination and tour slugs in filenames are **Uzbek Latin, transliterated to ASCII**: `turkiya` · `dubay` · `tailand` · `misr` · `malayziya` · `ozbekiston`. v2 mixed English (`dest-turkey-*`) with Uzbek (`tour-turkiya-*`); that is fixed **before any file is generated**, because the filenames are what the client sees and names their photographs after. ISO country codes (`TR`, `AE`, `TH`, `EG`, `MY`, `UZ`) stay in the **data** (`country` field) and never appear in a filename.

### 12.2 Tiered inventory — totals

Demanding 85 photographs from a client who has supplied zero is R1 weaponised against your own schedule. The manifest carries a `tier` field and a `clientPhotoRequired` boolean; the client-facing document is generated grouped by tier and **shows only the rows the client must actually photograph**.

**TIER 1 — required to launch: 26 files** *(20 of them client photographs)*

| Group | Files | Dimensions | `clientPhotoRequired` |
|---|---:|---|---|
| Hero, desktop | 1 | 1920×1080 | ✅ true |
| Hero, mobile (art-directed 4:5 crop) | 1 | 1080×1350 | ✅ true |
| Logo + favicon set | 4 | SVG + 32 / 180 / 512 | ✅ true |
| Destination cards | 6 | 800×1000 | ✅ true |
| Tour covers (the featured six) | 6 | 1200×800 | ✅ true |
| About / team | 1 | 1600×900 | ✅ true |
| OG default image | 1 | 1200×630 | ✅ true |
| **Promo banner** *(BC15 — Home §6.9)* | 1 | 1600×600 | ❌ false — developer-generated |
| **CTA background** *(BC15 — Home §6.11)* | 1 | 1600×900 | ❌ false — developer-generated |
| **Testimonial avatars** *(BC15 — Home §6.10)* | 3 | 200×200 | ❌ false — developer-generated |
| **Static map** *(BC15 — §10, Contacts is a launch route)* | 1 | 800×500 | ❌ false — developer-generated |
| **TIER 1 TOTAL** | **26** | | **20 true / 6 false** |

**TIER 2 — nice to have: 59 files** *(a +0.5 d priced add-on, §16.1)*

| Group | Files | Dimensions |
|---|---:|---|
| Destination hero banners | 6 | 1600×600 |
| Tour galleries (8 tours × 4) | 32 | 1600×1067 |
| Team portraits | 3 | 600×800 |
| Testimonial avatars (beyond the first three) | 3 | 200×200 |
| Blog covers (ship with the blog add-on) | 6 | 1200×630 |
| Promo banners (beyond the first) | 1 | 1600×600 |
| Per-locale OG images | 3 | 1200×630 |
| Extra tour covers (catalogue headroom beyond the featured six) | 5 | 1200×800 |
| **TIER 2 TOTAL** | **59** | |

> **Dropped in this pass:** the six T2 "service photos" (800×600). **They had no consumer.** §6 row 4 renders six **inline SVG icons**, and the standalone Services page was cut in v2. Carrying them would have put six impossible-to-place rows into the client's document.
>
> **Cover-slot arithmetic:** 6 Tier-1 covers (the featured tours) + 5 Tier-2 covers = **11 cover slots** against A10's ~8 launch tours — 8 used, 3 spare for the catalogue's first growth.

**GRAND TOTAL: 26 + 59 = 85 files. Client-facing ask: 20 photographs.**

### 12.3 Generation — offline, and hermetic

No ImageMagick, `cwebp`, or `ffmpeg` on this machine. Node 24 + **an explicit `sharp@^0.35.3` devDependency** (v1's "Astro bundles sharp for free" is **false** — it is an `optionalDependency`, and optional deps fail silently).

`scripts/gen-placeholders.mjs` reads **`scripts/images.manifest.json`**, composes an SVG per entry (neutral background, deterministic hue per group so mockups read as intentional, overlaid filename + dimensions + Uzbek subject label), and pipes it through `sharp(svg).webp({ quality: 60 }).toFile(...)`. **Zero external image services** — nothing at build time reaches the network.

> **Manifest location (Critic minor item).** The manifest moved from `content/images.manifest.json` at the repo root to **`scripts/images.manifest.json`**. It is machine input to the three scripts that read it, it is never client-editable content, and a root-level `content/` directory sitting beside `src/content/` was the confusion being reported. This also removes a top-level directory.

> **Hermeticity requirement.** `sharp`'s SVG text goes through librsvg + fontconfig, which is **machine-dependent**. It renders Uzbek diacritics correctly here (582 system fonts, DejaVu Sans covers U+02BB — verified) but on a bare CI container would silently produce unlabelled placeholders. Therefore: **ship a font file in `scripts/fonts/` and reference it explicitly in the SVG**, and add a **render assertion** to `check-images.mjs` comparing the mean channel value against a text-free control, so a blank render fails loudly instead of shipping.

`scripts/gen-image-requirements.mjs` generates the Uzbek client document from the same manifest. **Full specification in `docs/IMAGE-BRIEF-SPEC.md`.**

---

## 13. Design system

### 13.1 Palette — provisional pending Q5

Every value is a custom property declared via `@theme` in `src/styles/tokens.css`. Swapping the real palette is a ~6-line edit.

| Token | Value | Use |
|---|---|---|
| `--brand-900` | `#06232B` | Dark sections, footer |
| `--brand-700` | `#0C4A5A` | **Primary button background** (white text passes AA) |
| `--brand-500` | `#1189A6` | Accents, links, icons |
| `--brand-300` | `#6FC7D9` | Tints, hovers |
| `--accent-500` | `#F2A03D` | **CTA amber** — pair only with `--brand-900` text |
| `--accent-600` | `#D9832A` | CTA hover |
| `--neutral-50…900` | `#F7F9FA … #0B0F12` | Text, surfaces, borders |

> ⚠️ **Contrast rule, not a claim:** white on `--brand-500` does **not** reach 4.5:1 and must never carry small text. Primary buttons use `--brand-700` + white; amber buttons use `--accent-500` + `--brand-900`. Every final pairing is verified in §18 — no combination ships on assumption.

### 13.2 Typography

- **Display:** `Unbounded` (700/800) — modern/premium, full Cyrillic
- **Body:** `Inter` (400/500/600) — excellent Cyrillic and Latin-Extended
- Self-hosted via `@fontsource`, subset `latin` + `latin-ext` + `cyrillic`, `font-display: swap`, preload only the hero display weight.

> **Uzbek gate:** Uzbek Latin needs `oʻ`/`gʻ` (U+02BB modifier letter turned comma) and `ʼ` (U+02BC). Many otherwise-good fonts render these as tofu or misaligned. **Both faces must be visually verified against `Oʻzbekiston · gʻalaba · sanʼat` before being locked in** (§18). Malay needs only plain Latin.

Fluid `clamp()` scale, 1.25 ratio. Body 16 px minimum (17–18 px preferred for Cyrillic). Line-height 1.6 body / 1.15 display. Measure capped at 68ch.

### 13.3 Spacing, radii, elevation

4 px base: `4 8 12 16 24 32 48 64 96 128`. Radii `sm 6 · md 12 · lg 20 · full`. Three soft low-opacity shadow levels. Container `1240px`, gutters `16 / 24 / 32`.

### 13.4 Components — 14 at launch

Button (primary/secondary/ghost/icon) · Input · Select · Textarea · Checkbox · TourCard · DestinationCard · ReviewCard · Badge · PriceTag (struck old price + auto discount %) · Accordion · Gallery/Lightbox · LanguageSwitcher (**page-aware, BC8**) · Alert.

**Cut from v1's 28:** DatePicker (use native `type="date"`), Tabs, Pagination, Skeleton, EmptyState, Toast, Steps, Stat, Breadcrumbs-as-component (inline), BlogCard, ServiceCard (Home block is bespoke), SectionHeading (utility class), Radio (folded into Checkbox styles), Textarea variants. Add back only when a page actually needs one.

### 13.5 Motion — and the no-JS guard

Durations 150 / 250 / 400 ms; easing `cubic-bezier(.4,0,.2,1)`. Scroll-reveal fade + 16 px rise, **once only**, via `IntersectionObserver`. Hover 1.03 image scale inside `overflow:hidden`. **`@media (prefers-reduced-motion: reduce)` disables all transforms and reveals** — non-negotiable. No parallax, no autoplay video, no scroll-jacking.

> **BC11 — the scroll-reveal must not require JS to render content.** Elements that start at `opacity: 0` and are revealed by `IntersectionObserver` **never reveal with JavaScript disabled**, leaving an effectively blank page below the fold — which directly contradicts the ADR's second reason for choosing Astro. The fix is two lines:
>
> ```html
> <!-- in <head>, before any stylesheet that hides content -->
> <script>document.documentElement.classList.add('js')</script>
> ```
> ```css
> /* scoped: only hide when JS is present to un-hide */
> html.js .reveal { opacity: 0; transform: translateY(16px); }
> ```
> With JS off, `.reveal` is never hidden in the first place and everything renders. This is a Gate-1 concern, not a polish item.

### 13.6 Visual direction — and its honest budget

Modern-premium editorial travel. Generous whitespace, crisp typographic hierarchy with a real display face, restrained colour (photos carry colour; UI stays neutral with one amber accent reserved *exclusively* for CTAs). Rounded-but-not-pill cards, thin `--neutral-200` borders instead of heavy shadows. No gradients-on-gradients, no glassmorphism, no stock-template carousel hero.

> **Named tension:** "large confident photography" and a ≤180 KB hero on Slow 4G are in direct conflict. **Resolution: premium is carried by typography, whitespace, and restraint — not by image weight.** Budget split explicitly: **hero ≤ 120 KB mobile / ≤ 180 KB desktop**, with the art-directed 4:5 mobile crop as a second asset. If a client photo cannot make budget at acceptable quality, the section gets a tighter crop, not a bigger file.

---

## 14. SEO & analytics

| Item | Implementation |
|---|---|
| Titles / descriptions | Per page **per locale**, from content; templated fallback; ≤60 / ≤155 chars |
| hreflang | **Shipped locales actually emitted for that page** + `x-default → uz`, reciprocal, absolute URLs (needs Q2). Same `availableLocales` set that drives the page-aware switcher (BC8). |
| Canonical | Self-referencing absolute URL |
| Open Graph | `og:locale` + `og:locale:alternate`; per-locale OG image; per-tour OG uses the tour cover |
| Sitemap | `@astrojs/sitemap` with i18n config; drafts, `/thanks/`, and 404 excluded |
| robots.txt | Allow all, `Sitemap:` line, disallow `/thanks/` |
| **JSON-LD — 3 types** (down from 6) | `TravelAgency` (home + about) · **`TouristTrip` per tour** (`name`, `description`, `offers` with price + currency + availability) · `BreadcrumbList`. `FAQPage` and `Article` ship with their add-on routes. |
| Verification | Google Search Console **and Yandex Webmaster** |
| Analytics | **Yandex Metrica** at launch, deferred, after consent. **Six events, all wired at Gate 1:** `form_submit`, `phone_click`, `telegram_click`, `whatsapp_click`, `tour_view`, `lang_switch`. Needs a **Yandex account** (Q8, BC17d). GA4 = priced add-on. |
| Favicon | 32/180/192/512 + `site.webmanifest` + `theme-color` |
| URL hygiene | Lowercase, hyphenated, ASCII slugs, trailing slash (enforced by config, §8) |

---

## 15. Performance & accessibility targets

> ⚠️ **These numbers are PROVISIONAL until P7.** Every target below is first measured against synthetic placeholder `.webp` files a few KB in size. Real 1920×1080 travel photography is the entire difficulty. **All of §15 is re-measured after the real-image swap, and the P7 gate is the one that counts.**

### Performance (mobile, Slow 4G, Moto G-class)

| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 90 |
| Lighthouse Best Practices / SEO | ≥ 95 / 100 |
| LCP | < 2.5 s |
| CLS | < 0.1 |
| INP | < 200 ms |
| Home first-load total | < 900 KB incl. hero |
| JS shipped | < 60 KB gzipped |
| **Hero image** | **≤ 120 KB mobile / ≤ 180 KB desktop** |
| Any other single image | ≤ 120 KB |
| Fonts | ≤ 2 families × 3 weights, subset, ≤ 120 KB total |
| Requests, first load | < 35 |

Enforced by: `srcset` on every image, explicit `width`/`height` (CLS), lazy-load below the fold, `content-visibility: auto` on long sections, no render-blocking third-party scripts.

### Accessibility (WCAG 2.1 AA)

| Requirement | Target |
|---|---|
| Lighthouse Accessibility | ≥ 95 |
| Contrast | 4.5:1 body · 3:1 large text and UI borders |
| Keyboard | Everything reachable and operable; visible `:focus-visible`; logical tab order; `Esc` closes menu/lightbox/widget; focus trapped in modals and restored on close |
| Skip link | "Asosiy kontentga oʻtish" as the first focusable element |
| Images | `alt` **in the page's own locale**; decorative `alt=""` |
| Forms | Real `<label>`s (never placeholder-only); errors via `aria-describedby`; `aria-live` on the submit result |
| Semantics | One `<h1>` per page, no heading skips, landmark regions |
| Language | `<html lang>` correct per locale — required for screen readers to pronounce Russian correctly |
| Motion | `prefers-reduced-motion` fully honoured; **and content renders with JS entirely off (BC11)** |
| Touch targets | ≥ 44×44 px |
| Zoom | Usable at 200%; no `maximum-scale` lock |

---

## 16. Roadmap

**This is a solo build. Effort-days are not parallelisable and the totals below are plain sums.** v1's "P4 and P5 run in parallel with P3" is deleted; it recovered a day that does not exist on a fixed-scope quote priced in effort.

### 16.1 Quote table — hold the estimate OR the scope, not both

| | Effort | What it includes |
|---|---:|---|
| **LAUNCH SCOPE** | **13.0 d** | **12 route types**, `uz`+`ru`, 14 components, **26 Tier-1 images (20 client-photo slots + 6 developer-generated)**, 4 forms, publishing pipeline on a private repo, Metrica with all six events, 3 JSON-LD types, WebP only, deploy + Uzbek manual + training session |

**Agreed scope, staged on client input** *(BC14 — this is not a developer-chosen add-on; the client ticked it)*

| | Effort | What it includes |
|---|---:|---|
| **`en` locale** | **+1.0 d** | Routes, strings, hreflang, QA. **Translation delivery is the client's** (§8.2, Q12). Opens the day the English copy lands. |

**Priced add-on menu — 12 rows, 8.0 d**

| | Effort | What it includes |
|---|---:|---|
| `ms` locale | +1.0 d | Same wiring as `en`, gated on Q4 **and** the native-review go/no-go |
| Blog module | +1.0 d | Collection, index + `[slug]` routes, `Article` JSON-LD, Home teaser, covers |
| FAQ route | +0.5 d | Collection, accordion page, `FAQPage` JSON-LD |
| Reviews route | +0.5 d | Standalone page (content already renders on About) |
| Services route | +0.5 d | Standalone page (content already renders on Home) |
| Promotions as its own content type | +0.5 d | Rather than a filtered tour view |
| Bespoke destination detail pages | +0.5 d | Rather than a thin template over the filter |
| **Tier-2 images (59 more)** | +0.5 d | Manifest rows, generation, requirement-document rows |
| Full 28-component library | +1.0 d | The 14 cut in §13.4 |
| GA4 alongside Metrica | +0.5 d | Second script, consent handling, event parity |
| AVIF + remaining JSON-LD types | +0.5 d | Adds minutes to every rebuild |
| 4-locale scale-out across all routes + QA | +1.0 d | The cost of testing everything ×4 rather than ×2 |
| **Menu subtotal** | **8.0 d** | |

**Conditional, outside every total below**

| | Effort | What it includes |
|---|---:|---|
| Phase 0.5 registration landing | +1.0 d | **Only if Q3 reveals a real deadline.** Strict prefix of the real Home page. |

| Roll-up | Arithmetic | Total |
|---|---|---:|
| Launch scope | phase sum, §16.2 | **13.0 d** |
| Everything beyond launch | staged `en` 1.0 + menu 8.0 | **9.0 d** |
| **FULL SCOPE (everything v1 promised)** | 13.0 + 9.0 | **22.0 d** |
| Full scope with the conditional landing | 22.0 + 1.0 | **23.0 d** |

**v1's ~11 days is withdrawn.** It summed to 12.0 arithmetically, recovered a day through a parallelism a solo developer cannot realise, priced no publishing pipeline, and priced i18n as a 1-day retrofit onto 4.5 days of uz-only work. A bottom-up re-cost of v1's own scope is 18–22 days. **Quote 13.0 d for the launch scope, or quote the add-ons explicitly. Do not quote 11 days for 22 days of work.**

> **Open pricing decision, deliberately not made here (residual risk 1).** The Critic's bottom-up estimate for P1 is 1.7–2.0 d against the 1.5 d costed. **Either quote 13.0 knowing this, or add +0.5 d and quote 13.5** (P1 → 2.0 d, every total above +0.5). This is the user's call.

### 16.2 Phases — launch scope

| Phase | Deliverables | Effort | Acceptance | Blocked by |
|---|---|---:|---|---|
| **P0 — Foundation, pipeline, spikes** | **(1)** Scaffold and repo hygiene **in the order below (BC1)**. **(2)** Astro 7 + `@tailwindcss/vite` + `src/content.config.ts` with a `glob()` loader, `sharp@^0.35.3`, `@astrojs/check` + `typescript`, `trailingSlash:'always'`, and the **BC4/BC5 i18n config block** from §8. **(3)** Set repo visibility **PRIVATE** and invite the client as collaborator once Q9 lands (BC2). **(4)** GitHub Actions pipeline incl. the weekly cron (§8.4). **(5)** 30-min CORS spike (§9.4). **(6)** Send the §3 questions. | **1.5 d** | **Toolchain smoke test GREEN: scaffold + one collection + one optimised image + `npm run build` exits 0 and `npx astro check` passes**, plus the two folded checks from §8. `git status --short` shows **no `.omc/` and no `node_modules/`**. Pipeline deploys a hello-world to a temporary target. CORS spike result recorded in `docs/PLAN.md`. Questions delivered. | — |
| **P0.5 — Registration landing** *(conditional)* | Sections 1,2,4,5,6,8,11,12,13 of §6 in `uz`, on the real domain, live. **Strict prefix of the real Home page — no throwaway artefacts.** | **1.0 d** | Live over HTTPS; real phone + Telegram work; a reviewer opening the domain sees a credible company | **Q3** = a real deadline; **Q1, Q2** |
| **P1 — Design system + placeholders** | Tokens via `@theme`, typography incl. the `oʻ`/`gʻ` gate, 14 components, `scripts/images.manifest.json`, `gen-placeholders.mjs` with the explicit bundled font, **26 Tier-1 `.webp`**, `gen-image-requirements.mjs`, `check-images.mjs`, and the Uzbek image-requirements document | **1.5 d** *(see the open pricing decision above)* | **All 26 Tier-1 placeholders exist within budget**; a showcase page renders every component; both fonts render `Oʻzbekiston · gʻalaba · sanʼat` correctly; the render assertion passes; `analize/image-requirements.md` is generated in Uzbek, grouped by tier, listing **only the 20 `clientPhotoRequired: true` rows** | — |
| **P2 — Home page, locale-aware** | All 13 sections of §6, fully responsive, **including sections 9, 10 and 11 whose placeholders BC15 moved into Tier 1**. **Every string comes from `src/i18n/uz.json` via `t()` from the first component** — no hardcoded copy anywhere. Includes the BC11 `html.js` guard. | **2.0 d** | Renders at 360/768/1440 with no horizontal scroll; Lighthouse mobile Perf ≥ 90 **against placeholders (provisional)**; zero console errors; `grep` finds no hardcoded user-facing string in components; **with JS disabled, every section below the fold is visible** | — |
| **P3 — Routes + catalogue** | Zod 4 schemas, 8 sample tours, catalogue with filters (country/duration/price/category), tour detail, destinations index + detail, about, promotions, contacts, privacy, thanks, **one bilingual root 404 (BC10)** | **2.5 d** | All **12** §5 launch route types build; a deliberately malformed tour JSON **fails the build with file path and field name**; **a tour with `flightIncluded: false` and an empty `priceNote` fails the build**; **a currency-adjacent number in locale prose produces a build-summary WARNING and does not fail**; the flight line renders from the boolean via `t()`; filters degrade to the full list with JS disabled | **Q6** for real data (samples unblock the build) |
| **P4 — Forms & contact** | Apps Script **under the client's account**, **token in Script Properties (BC3)**, Telegram-primary notification with quota guard and **per-leg try/catch (BC18)**, **daily digest trigger (BC19)**, Sheets + Gmail, all 4 forms, bot-friction layers, floating widget, social links | **1.0 d** | End-to-end submission appears **in Telegram within 30 s** and in the Sheet; email sends when quota allows and is skipped cleanly when it does not; **a forced Telegram failure still appends the row, still returns 200, and records the failure in the row**; the daily digest email arrives; honeypot and time-trap submissions rejected; forced network failure shows the error state with contact fallbacks and preserved input | **Q8** (Google **and Yandex** account ownership), **Q16–Q18** |
| **P5 — `ru` locale activation** | Second locale wired through `SHIPPED_LOCALES` → `getStaticPaths`, **page-aware switcher (BC8)**, hreflang, `Intl` formatting, translated strings and content | **1.0 d** | Both locales build; the switcher preserves the path **for locales that page emits** and links to nothing non-emitted; no missing-key fallback appears in output; `<html lang>` correct; a locale with a missing content block emits **no page**, appears in **no** hreflang cluster, and **is not offered by the switcher**; `linkinator --recurse` reports zero broken links | **Q12** |
| **P6 — SEO, analytics, hardening** | Meta, hreflang, OG, sitemap, robots, 3 JSON-LD types, Metrica with all six events + consent gating, favicons, a11y pass, **provisional** perf pass | **1.0 d** | §14 met; **all 3 JSON-LD types validate in the Rich Results Test**; **axe clean on Home, catalogue, and a tour page** | **Q2** (domain, for absolute URLs) |
| **P7 — Real content swap + image budget** ⚠️ **ON THE CRITICAL PATH** | Client photos, logo, brand colours, real tours, reviews, trading-name footer. **Plus an explicit image-optimisation task: crop, resize, re-encode every supplied photo to the §15 budget.** | **1.5 d** | `find dist -name "*.webp" -size +180k` returns nothing; **§15 Lighthouse targets RE-RUN and met against the real images**; contrast re-verified against the real palette | **Q5, Q6, Q13, Q14** |
| **P8 — Deploy & handover** | Hosting wiring per Q1 **including the mandatory DNS/MX record capture and recreation (BC17a)**, domain, TLS, host config, Search Console + Webmaster, Uzbek manual, training session, credential handover | **1.0 d** | Live on the real domain over HTTPS; **the client's existing MX records verified still resolving after cutover**; every shipped locale reachable; pipeline deploys from a client commit end-to-end | **Q1, Q2, Q9** |

**Total: 13.0 d.** (1.5 + 1.5 + 2.0 + 2.5 + 1.0 + 1.0 + 1.0 + 1.5 + 1.0 = 13.0)

**Critical path:** P0 → P1 → P2 → P3 → P5 → P6 → **P7** → P8 = 12.0 d, plus P4 at 1.0 d = **13.0 d**. For a solo developer the distinction is bookkeeping: every phase is sequential (residual risk 3).

**P0 step 1 — the exact command sequence (BC1). Order is load-bearing:**

```bash
# 1. Scaffold FIRST. `npm create astro` writes its OWN .gitignore and would
#    overwrite any pre-emptive edit.
npm create astro@latest . -- --template minimal --no-install --git=false --yes

# 2. THEN append. The leading \n is mandatory: the existing .gitignore is exactly
#    4 bytes (`.omc`, 2e 6f 6d 63) with NO trailing newline, so `echo >>` would
#    produce `.omcnode_modules/` and neither pattern would work.
printf '\n.omc\nnode_modules/\ndist/\n.astro/\n.env\n.env.*\n!.env.example\n.DS_Store\nreports/\n' >> .gitignore

# 3. VERIFY before installing anything.
git status --short          # MUST show no .omc/ and no node_modules/

# 4. Only now install.
npm install
```

`.omc/` currently holds `sessions/` and `state/` — real content that must stay ignored.

**Client-blocked work starts on day 0**, the moment the §3 questions go out — not after P6.

---

## 17. Acceptance — two gates

**v1 had 11 completion criteria the developer could not satisfy without client action, and R1's "bill by phase" mitigation was never wired into the criteria. Gates split them and tie invoicing to the developer-controllable gate. BC12 finishes the job: Gate 1 is now 100% developer-controlled, and it contains every priced launch-scope deliverable.**

Legend: 🟩 **developer-controlled** · 🟨 **client-dependent** · ⬜ **manual / off-machine**

### GATE 1 — LAUNCH-READY ⇒ **the build is invoiced**

*Every row is 🟩. If the client answers nothing at all after day 0, the developer can still reach this gate and still invoice.*

| | Criterion | Control |
|---|---|---|
| ☐ | Every §5 launch route (**all 12 types**) builds and renders in every **shipped** locale | 🟩 |
| ☐ | Tour catalogue filters by country, duration, price, category | 🟩 |
| ☐ | Every tour detail page shows price, duration, includes/excludes, **flight-inclusion status rendered from the `flightIncluded` boolean via `t()`**, gallery, and a booking form | 🟩 |
| ☐ | All 4 forms deliver end-to-end — **Telegram within 30 s** verified, Sheet row verified — **against the client's Apps Script account, OR against the documented throwaway-account fallback in §9.3** *(BC12c)* | 🟩 |
| ☐ | A failed submission shows an error, preserves input, and offers Telegram/WhatsApp/call fallbacks; **a failed notification leg still appends the row and still returns 200** *(BC18)* | 🟩 |
| ☐ | The daily digest email fires *(BC19)* | 🟩 |
| ☐ | **Language switcher preserves the current path for locales that page emits, and never links to a non-emitted URL** *(BC8)* | 🟩 |
| ☐ | A locale with missing content emits **no page** and appears in **no** hreflang cluster | 🟩 |
| ☐ | Promotions and testimonial sections auto-hide when empty | 🟩 |
| ☐ | **Departures are filtered at build AND re-evaluated in the browser** *(BC7)*; a date expiring between builds disappears client-side | 🟩 |
| ☐ | Malformed tour JSON fails the build with file path + field name; **`flightIncluded: false` with an empty `priceNote` in any shipped locale fails the build**; **a currency-adjacent number in locale prose produces a build-summary WARNING and does NOT fail** *(BC6)* | 🟩 |
| ☐ | **With JavaScript disabled, every section below the fold renders** *(BC11)* | 🟩 |
| ☐ | Renders correctly at 360 / 390 / 768 / 1024 / 1440 / 1920 px | 🟩 |
| ☐ | Uzbek `oʻ`/`gʻ` and Russian Cyrillic render correctly in **every** font weight | 🟩 |
| ☐ | Zero broken internal links (`linkinator --recurse`), zero broken images | 🟩 |
| ☐ | **Zero console errors** *("or warnings" dropped — unachievable with any third-party analytics loaded)* | 🟩 |
| ☐ | Lighthouse mobile on Home, catalogue, a tour page: Perf ≥ 90 · A11y ≥ 95 · BP ≥ 95 · SEO 100 — **provisional, against placeholders** | 🟩 |
| ☐ | Publishing pipeline deploys a commit end-to-end; a failing build blocks deploy and leaves the last good version live; **repo is private and the cron is scheduled** *(BC2)* | 🟩 |
| ☐ | Privacy page live in every shipped locale; consent checkbox on every form | 🟩 |
| ☐ | **Footer shows trading name + phone; the address block renders when supplied and auto-hides when absent** *(BC12b)* | 🟩 |
| ☐ | **Deployed and verified over HTTPS on a STAGING URL** *(BC12a — the client's own domain moved to handover)* | 🟩 |
| ☐ | **All 3 JSON-LD types validate in the Rich Results Test** *(BC12d)* | 🟩 |
| ☐ | **axe clean on Home, catalogue, and a tour page** *(BC12d)* | 🟩 |
| ☐ | **Metrica script integrated with consent gating and all six §14 events wired** — any counter ID; the client's real counter is a Gate-2 item *(BC12d)* | 🟩 |
| ☐ | **All 26 Tier-1 placeholders generated within budget** *(BC12d + BC15)* | 🟩 |
| ☐ | **`analize/image-requirements.md` generated in Uzbek, grouped by tier, listing only the 20 `clientPhotoRequired: true` rows** *(BC12d)* | 🟩 |
| ☐ | **`docs/CLIENT-MANUAL-UZ.md` delivered and the training session held** *(BC12d)* | 🟩 |
| ☐ | **Placeholder images ARE PERMITTED** outside the hero and tour covers | 🟩 |

> **This resolves v1's self-veto.** v1's R1 said "the site launches with placeholders if content slips" while §17 required "zero placeholder images in production." Both could not hold. Launch permits placeholders; content completeness is a separate gate.
>
> **And BC12 resolves the invoicing deadlock.** v2 put "live on the client's domain" inside the invoicing gate, so an unanswered Q1 — the plan's own number-one blocker — would have blocked payment for work already done.

### HANDOVER LIST — after Gate 1, not gating the invoice

| | Step | Control |
|---|---|---|
| ☐ | Live on the client's domain over HTTPS with a valid certificate | 🟨 Q1, Q2 |
| ☐ | **Existing DNS records — especially `MX` — recorded before cutover and verified still resolving after** *(BC17a)* | 🟨 Q1 |
| ☐ | Client's GitHub collaborator invite accepted on the private repo | 🟨 Q9 |
| ☐ | Apps Script re-deployed under the client's own account **if** the throwaway fallback was used, and the `/exec` URL swapped + redeployed | 🟨 Q8 |

### GATE 2 — CONTENT-COMPLETE ⇒ the site is *finished*, on the client's schedule

| | Criterion | Control |
|---|---|---|
| ☐ | Zero placeholder images in production | 🟨 Q13 |
| ☐ | Real logo and brand colours applied | 🟨 Q5 |
| ☐ | ≥ 6 real tour packages with real prices | 🟨 Q6 |
| ☐ | **§15 performance targets RE-RUN and met against the real photography** | 🟩 *(work)* / 🟨 *(inputs)* |
| ☐ | Footer address block populated with the real office address | 🟨 Q22 |
| ☐ | Per-locale: no missing-key fallback text visible. **Each locale ships only when complete** — never partially. | 🟨 Q12 |
| ☐ | Metrica recording pageviews and contact events **under the client's own Yandex counter** | 🟨 Q8 (Yandex account) |
| ☐ | Verified in Search Console + Yandex Webmaster; sitemap submitted | 🟨 (client DNS/domain) |
| ☐ | **Post-registration update:** footer shows official legal name, INN, and licence number | 🟨 **circularly blocked** — the registration this site is meant to enable. **Not a launch gate.** |

### Manual / device gate (outside the automated pipeline)

| | Check | Why |
|---|---|---|
| ☐ | Telegram, WhatsApp, Instagram, YouTube, and `tel:` all open their apps on a real phone | ⬜ not verifiable on this Linux box |
| ☐ | Safari (iOS) and Samsung Internet render correctly | ⬜ only Chrome + Firefox are installed here |
| ☐ | Floating widget does not cover the form submit button on a real device | ⬜ |

### 60-day review checkpoint — **not a completion gate**

| | Item |
|---|---|
| ☐ | The client has independently added one tour end-to-end |
| ☐ | Decide: build the §11 rank-2 admin UI, or settle on a retainer |

> v1 made "client independently adds one tour" a completion criterion. It is hostage twice over — to the client's willingness *and* to a pipeline v1 never built. It is a review checkpoint, not a gate on getting paid.

---

## 18. Verification

```bash
# --- Build integrity ---
npm run build                      # exit 0; Zod 4 errors surface here
npx astro check                    # needs @astrojs/check + typescript devDeps
node scripts/check-images.mjs      # manifest coverage, size budget, content refs,
                                   # AND the placeholder text-render assertion
node scripts/check-i18n.mjs        # missing keys; report uz-fallbacks per locale

# --- Serve and crawl ---
npx serve dist -l 4321
npx linkinator http://localhost:4321 --recurse --silent   # zero broken links
                                   # This is the check BC8 exists to satisfy.

# --- Performance & accessibility (Chrome + Firefox verified present) ---
npx lighthouse http://localhost:4321/uz/ --form-factor=mobile \
  --throttling-method=simulate --output=html --output-path=./reports/lh-home-mobile.html
# repeat for /uz/tours/ and one /uz/tours/{slug}/
npx @axe-core/cli http://localhost:4321/uz/ --exit

# --- Output sanity ---
find dist -name "*.webp" -size +180k          # image budget breaches
grep -rL 'hreflang' dist --include="*.html"   # pages missing hreflang
grep -c 'hreflang' dist/uz/index.html         # expect shipped locales + x-default
grep -rn 'Bron qilish\|Ariza qoldirish' src/components | grep -v 't('  # hardcoded strings
test -f dist/404.html                          # BC10 — the ONE real 404
! find dist -path '*/404/index.html' | grep .  # BC10 — no per-locale 404 directories
```

**Run the Lighthouse block TWICE: once in P6 (provisional) and again in P7 after the real-image swap. The P7 numbers are the ones that count.**

**Manual checks**

1. **Form end-to-end** — submit from a real browser; confirm the **Telegram message first**, then the Sheet row, then the email; all within 30 s. Then submit with the honeypot filled (silently dropped) and within 2 s of load on a multi-field form (rejected). Then submit with DevTools set to Offline (error state, contact fallbacks, input preserved).
2. **Mail-quota drill** — temporarily set the notification cap to 1 and confirm that the second submission still appends the row and still fires Telegram, and that the skipped email is recorded in the row.
3. **Notification-failure drill (BC18)** — point `TG_TOKEN` at a deliberately invalid value and submit. The row must still append, the response must still be 200, the failure must be recorded in the row, and the email leg must still run.
4. **Daily-digest drill (BC19)** — run the time-driven trigger by hand; confirm the "Bugun N ta ariza" email arrives with the right count.
5. **Locale spot check** — for `/`, `/tours/`, one tour, and `/contacts/` in each shipped locale: correct `<html lang>`, no `uz` text leaking, correct date/number formatting, `alt` text in the right language.
6. **Switcher / non-emission interaction (BC8)** — take a tour with no `ru` block. Confirm `/uz/tours/{slug}/` renders, that its switcher does **not** offer `ru` (or points `ru` at `/ru/tours/`), that `/ru/tours/{slug}/` does not exist, and that `linkinator` reports nothing.
7. **Stale-date check** — set the system clock past a departure date, reload, confirm the date disappears and "dates on request" appears. Then rebuild with the clock still forward and confirm the date is gone from the emitted HTML too (BC7's build-time floor).
8. **No-JS pass (BC11)** — disable JavaScript entirely. Every Home section below the fold must be visible, the form must still submit via the hidden-iframe fallback, and departure dates must still render.
9. **Contrast** — run every final foreground/background pair through a checker; ≥ 4.5:1 body, ≥ 3:1 large. Explicitly re-check white-on-`--brand-500` (expected to fail; must not carry small text).
10. **Uzbek diacritics** — render `Oʻzbekiston · gʻalaba · sanʼat` in every weight; no tofu, no misalignment.
11. **Keyboard-only pass** — Tab through Home and one tour page: skip link works, focus always visible, `Esc` closes menu/lightbox/widget, focus returns to the trigger.
12. **Pipeline drill** — push a deliberately broken tour JSON; confirm the deploy is blocked, the site is unchanged, and the Uzbek error comment appears on the commit.
13. **Secret audit (BC3)** — `grep -rn` the whole tracked tree for the real bot token, the real `/exec` URL and the real form token. Zero hits, including in `apps-script/Code.gs` and `.env.example`.
14. **Mobile device pass** ⬜ — real iPhone and Android: no horizontal scroll at 360 px, tap targets ≥ 44 px, sticky header does not obscure content, `tel:`/`wa.me`/`t.me` open their apps.

---

## 19. Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| **R1** | **Client never supplies photos, logo, tours, or translations** | **High** | **High** | Questions + the Tier-1 image document go out **day 0**, and **Q6 and Q13 now demand an explicit date** (BC17b). Build entirely on placeholders. **Invoicing ties to LAUNCH-READY (§17), which permits placeholders and is now 100% developer-controlled (BC12)** — this is the actual mitigation. Bill by phase. |
| **R2** | Client insists on real on-site card payment | Medium | **High** | Q7 raises it in writing before code. Out of scope with a technical *and* a legal reason. Priced separately. |
| **R3** | Client cannot manage JSON editing | **High** | Medium | Q24 sets expectations pre-build. 30-min training + Uzbek guide + `_TEMPLATE.json` + the Uzbek build-error bot (§8.3). Retainer offered as default. |
| **R4** | Hosting turns out Node-less, FTP-only, or otherwise crippled | Medium | Low | Output is inert static files. The pipeline's deploy step is the only variable, and all three variants are pre-specified (§8.4). |
| **R5** | Malay ships as bad machine translation | **High** | Medium | Q4 determines whether `ms` is even the right product. Hard go/no-go: **no native review, no `ms` launch.** English pivot, never uz→ms direct. |
| **R6** | **Personal-data disclosure is wrong** | — | Medium | v1's disclosure is **withdrawn** — effective 27 March 2026 **the duty narrowed from blanket to selective** (§9.7). Client-facing wording is non-specific + "verify with counsel", is quoted verbatim in §9.7, and the reasoning behind it is marked developer-internal (BC13). Privacy page and consent checkbox regardless. |
| **R7** | **Spam burns the Gmail send quota and real leads stop being emailed silently** | Medium | **High** | Telegram is primary (no Google quota); `MailApp.getRemainingDailyQuota()` checked; notification sends capped independently of row appends (§9.3). |
| **R8** | Apps Script CORS response is not readable | 50/50 | Medium | Day-0 spike (§9.4) before P4 is costed. Web3Forms pre-selected as the primary fallback. Redirect fires on resolve-or-timeout regardless. **If it flips, note the ~250/month free ceiling** (residual risk 4). |
| **R9** | **Apps Script sits under the developer's Google account** | Medium | Medium | Q8 makes ownership a pre-P4 blocker. If unavoidable, the `/exec` swap + rebuild + redeploy is an explicit handover task, costed, not discovered at handover. |
| **R10** | Client-committed content breaks the build | Medium | Low | Zod fails the build **before** deploy; last good version stays live; Uzbek error comment posted. |
| **R11** | Client uses copyrighted internet images | **High** | Medium | Explicit warning in Q13 and in `analize/image-requirements.md`. Licensed stock offered as a paid add-on. |
| **R12** | Real photos blow the §15 budget | **High** | Medium | P7 carries an explicit image-optimisation task and is **on the critical path**; §15 is re-measured there. Tighter crops, not bigger files. |
| **R13** | Brand colours arrive late and clash | Medium | Low | Every colour is a `@theme` token in one file; re-skin ≈ 6 lines + a contrast re-verification. |
| **R14** | Scope creep | **High** | Medium | This document is the scope baseline. §2 OUT and §2.1 cut list are explicit; §16.1 prices every add-on. Anything new is a written change request. |
| **R15** | **Registration deadline is real and undisclosed** | Unknown | Medium | Q3 asks on day 0 — a message, not 1.5 days of work. A real deadline inserts Phase 0.5, constrained to a **strict prefix** of the real Home page so nothing is thrown away. |
| **R16** | **Domain cutover kills the client's corporate email** *(new, from BC17a)* | Medium | **High** | The plan's own recommendation keeps the paid hosting for email while pointing the domain elsewhere. Q1 now asks whether corporate mail runs on that host, and `docs/DEPLOY.md` carries a **mandatory pre-cutover checklist step**: export every existing DNS record — `MX`, SPF/`TXT`, DKIM, mail `CNAME`/`A` — and recreate them at the new provider **before** the change propagates. P8 acceptance verifies MX still resolves after cutover. |

---

## 20. File / folder structure

```
/home/rahmatulloh/projects/asaka/new-project/          # EXISTING git repo, origin/main
                                                       # VISIBILITY: PRIVATE (BC2)
├── .gitignore                          # BC1: appended AFTER scaffold, with a LEADING newline
│                                       #      .omc  node_modules/  dist/  .astro/
│                                       #      .env  .env.*  !.env.example  .DS_Store  reports/
├── .github/workflows/deploy.yml        # P0 — build, guard, deploy, weekly cron
├── analize/                            # client-facing (never built into the site)
│   ├── questions.md · answers.md       # existing
│   ├── client-open-questions.md        # NEW — §3, Uzbek, forwardable verbatim,
│   │                                   #       generated WITHOUT `> ` or `**` (BC17f)
│   └── image-requirements.md           # NEW — Uzbek, generated, grouped by tier,
│                                       #       only clientPhotoRequired:true rows (20)
├── docs/                               # TRACKED developer docs
│   ├── PLAN.md                         # ⭐ this plan
│   ├── IMAGE-BRIEF-SPEC.md             # ⭐ image inventory + generator specifications
│   ├── OPEN-QUESTIONS.md
│   ├── CLIENT-MANUAL-UZ.md
│   └── DEPLOY.md                       # incl. the MANDATORY DNS/MX capture step (BC17a)
├── scripts/
│   ├── images.manifest.json            # BC/minor: moved here from the repo root.
│   │                                   # inventory + tier + clientPhotoRequired + Uzbek briefs
│   ├── fonts/                          # explicit font for hermetic SVG text rendering
│   ├── gen-placeholders.mjs · gen-image-requirements.mjs
│   ├── check-images.mjs                # existence + budget + render assertion
│   └── check-i18n.mjs
├── public/                             # favicons, robots.txt, site.webmanifest, .htaccess (if cPanel)
├── src/
│   ├── assets/images/                  # placeholders now, real photos later, same filenames
│   ├── components/{ui,sections,cards,islands}/
│   ├── layouts/                        # the <head> carries the BC11 `html.js` marker script
│   ├── pages/
│   │   ├── index.astro                 # real language picker + x-default (NO meta-refresh)
│   │   ├── 404.astro                   # THE ONLY 404 — bilingual uz+ru, emits /404.html (BC10)
│   │   └── [lang]/                     # getStaticPaths() over SHIPPED_LOCALES
│   │       ├── index.astro
│   │       ├── tours/index.astro · tours/[slug].astro
│   │       ├── destinations/index.astro · destinations/[country].astro
│   │       ├── about.astro · promotions.astro · contacts.astro
│   │       └── privacy.astro · thanks.astro
│   │                                   # NOTE: no [lang]/404.astro — see BC10
│   ├── content.config.ts               # ⭐ Astro 7 location; glob()/file() loaders; Zod 4
│   ├── content/
│   │   ├── tours/_TEMPLATE.json · tours/*.json
│   │   ├── destinations/*.json · reviews/*.json · promotions/*.json
│   ├── i18n/
│   │   ├── locales.mjs                 # ⭐ SHIPPED_LOCALES — the single source (BC5)
│   │   ├── uz.json · ru.json           # launch. en.json when Q12 lands; ms.json only if Q4 + native review pass
│   │   └── utils.ts                    # t() helper
│   ├── lib/{submitLead.ts, images.ts, seo.ts, analytics.ts}   # images.ts exports resolveImage() (BC16)
│   └── styles/tokens.css               # ⭐ @theme — every brand colour lives here
├── apps-script/Code.gs                 # doPost -> Telegram + Sheets + Gmail
│                                       # (token in Script Properties, NOT in this file — BC3)
├── astro.config.mjs · tsconfig.json    # NO tailwind.config.ts; i18n block per BC4/BC5
└── package.json · .env.example · README.md   # .env.example = PLACEHOLDERS ONLY (BC3)
```

`analize/` and `docs/` sit outside `src/` and `public/`, so they are never built into the published output.

---

## 21. ADR — static Astro site with form-only lead capture

**Status:** Proposed — **pending approval** · **Date:** 2026-08-18 · **Supersedes:** the ADRs in plan v1 and plan v2

**Decision.** Build Getcar_travel as a fully static, pre-rendered **Astro 7** site with JSON content collections (Zod 4), a hand-authored `[lang]` locale route tree driven by a single `SHIPPED_LOCALES` constant, and lead capture via a Google Apps Script Web App writing to **Telegram (primary), Google Sheets, and Gmail (secondary)** with a daily digest. Launch locales `uz` + `ru`; **`en` is agreed scope staged on the client's translation delivery**; `ms` is priced and gated. No backend, no database, no on-site payment processing in Phase 1. A GitHub Actions publishing pipeline **on a private repository** is part of the deliverable, not an assumption.

**Drivers.**
- **D1** — the client must self-maintain with no server available
- **D2** — locales must be pre-rendered as real HTML, or the foreign-client goal fails *(this kills runtime client-side i18n; it does not differentiate Astro from Next)*
- **D3** — deploy target is unknown and likely Node-less, and ~85 images must be optimised locally, offline

**Alternatives considered.**
- **Next.js static export** — viable second choice; rejected because `output: 'export'` documents Image Optimization with the default loader as unsupported and the documented workaround is a **custom loader pointing at a remote service**, which is a direct hit against D3 on an 85-image brief — while also shipping a React runtime a brochure site does not need. Its i18n cost is **the same as Astro's**, not worse.
- **Hand-written multi-page HTML** — rejected: ≈90 hand-maintained files at launch growing by 4 per tour, guaranteed locale drift, no validation.
- **SaaS no-code (Tilda, Wix)** — rejected: no true four-language support (Malay unavailable in Tilda's UI), abandons the hosting the client already paid for, recurring subscription, vendor lock-in, no code ownership. Honestly acknowledged as the winner on D1 alone.
- **Self-hosted WordPress + Polylang** — rejected on its own grounds, not by association with SaaS. It is **not** SaaS, has **no** subscription or lock-in, **uses** the client's existing cPanel, and **Polylang's free tier handles unlimited languages with clean hreflang** — so v1's "WPML only, paid" objection was false and is withdrawn. Rejected because (1) it is a PHP backend, which is the user's explicit hard constraint for this engagement; (2) a self-hosted WP with a non-technical owner and no guaranteed retainer is an unpatched PHP application within a year; (3) it cannot reach the §15 mobile budget on a shared UZ host without a caching stack that is itself a maintenance burden. **Retained as the honest recommendation** if the client later demands both instant self-service editing and real on-site payments — a different project, a different quote.
- **Full backend now** — rejected: the user's hard constraint, and independently blocked because the LLC and bank account do not yet exist, so a merchant contract is impossible.

**Why chosen.** Astro's **first-party local `sharp` image pipeline** is the decisive differentiator for an 85-image, build-offline brief on a machine with no ImageMagick, `cwebp`, or `ffmpeg`. Behind it: a zero-JS baseline that directly serves the 3G/4G mobile market, and content collections + Zod 4, which convert D1 from an unsolvable architecture problem into a documented, trainable workflow with a clean upgrade path to a git-backed admin UI. The Apps Script transport delivers leads to three channels the client already uses at zero cost and zero server, and its only exposure — a public write-only append endpoint — carries no exfiltration or financial risk once the mail-quota path is capped and the bot token lives in Script Properties.

**Consequences.**
- ✅ Excellent mobile performance and per-locale SEO; near-zero running cost; portable to any host; content errors caught at build time and reported to the client in Uzbek.
- ⚠️ Content changes require a rebuild (~2–3 min) — **and this is only true because the publishing pipeline is a P0 deliverable.**
- ⚠️ The client must learn a browser-based git edit flow, or stay on a retainer. **Agreed before the build starts (Q24), never discovered at handover.**
- ⚠️ **Every "Bron qilish" button is a lead form, not a booking.** The site can never show real availability. Labels say *soʻrov*, never *tasdiqlandi*.
- ⚠️ No on-site payment; revenue collection stays a manual manager step via Payme/Click links.
- ⚠️ **The repository is private, so the client needs a collaborator invite, not just an account.** That is one extra step in the handover and one extra thing that can stall.
- ⚠️ **Departure dates are correct only as of the last build plus the browser's own check.** With JS off the worst case is a date up to seven days stale — bounded by the weekly cron, which itself depends on the repo staying private.
- ⚠️ Lead data resides offshore in Google Sheets. Under the March 2026 rules this is very unlikely to create an obligation for name+phone data, but the client is told in non-specific terms and pointed at counsel.
- ⚠️ The optional admin UI requires a GitHub OAuth broker, so "zero backend" becomes "zero backend we operate."
- ⚠️ Astro's release cadence means this repo will need migration work in ~18 months. The retainer, or a documented `npm ci` lockfile-pinned build, is the answer — not a different framework.

**Follow-ups.**
1. **Q1 (hosting, existing site, and corporate email)** — blocks the pipeline's deploy step, which blocks the entire D1 story, and determines whether a DNS change would kill the client's mail. Answer first.
2. **Q3 (registration deadline)** — decides whether Phase 0.5 exists. Ask day 0.
3. **Q8 (Google *and* Yandex account ownership)** — blocks P4 and Gate 2's Metrica row. Create the Apps Script under the client's account from day one.
4. **Q4 (Malay direction)** — before any `ms` content work; it determines the product set, not just the language.
5. **Q7 (payment expectation)** — confirmed in writing before P4.
6. **Q19 (company name spelling)** — needed before the footer, titles, and OG tags are written.
7. **CORS spike result** — recorded in this document before P4 is costed.
8. **Set the repo to PRIVATE and invite the client** as soon as Q9 returns a username.
9. Re-run §15 after P7. The provisional numbers do not count.
10. Re-evaluate §11 at 60 days; build the admin UI only if the client is demonstrably editing.
11. Revisit payments once the LLC and merchant contract exist — a separately quoted Phase 2 backend.

---

# PART C — Artifact locations

*Only `docs/PLAN.md` and `docs/IMAGE-BRIEF-SPEC.md` exist. Everything else below is created at execution time, which is a separate approval gate.*

| Artifact | Absolute path | Language | Audience | Tracked? | Exists? |
|---|---|---|---|---|---|
| **Execution plan** (this document) | `/home/rahmatulloh/projects/asaka/new-project/docs/PLAN.md` | English + one Uzbek summary | Developer (+ client summary) | ✅ | ✅ |
| **Image brief specification** | `/home/rahmatulloh/projects/asaka/new-project/docs/IMAGE-BRIEF-SPEC.md` | English (Uzbek strings quoted) | Developer | ✅ | ✅ |
| **Open questions tracker** | `/home/rahmatulloh/projects/asaka/new-project/docs/OPEN-QUESTIONS.md` | English | Developer | ✅ | ☐ |
| **Client questions** (§3, forwardable verbatim, `> ` and `**` stripped) | `/home/rahmatulloh/projects/asaka/new-project/analize/client-open-questions.md` | **Uzbek (Latin)** | Client | ✅ | ☐ |
| **Image requirements** (tiered, 20 client rows) | `/home/rahmatulloh/projects/asaka/new-project/analize/image-requirements.md` | **Uzbek (Latin)** | Client | ✅ | ☐ |
| **Image manifest** | `/home/rahmatulloh/projects/asaka/new-project/scripts/images.manifest.json` | — | Machine | ✅ | ☐ |
| **Client manual** (P8) | `/home/rahmatulloh/projects/asaka/new-project/docs/CLIENT-MANUAL-UZ.md` | **Uzbek (Latin)** | Client | ✅ | ☐ |
| **Deploy runbook** (incl. the DNS/MX step) | `/home/rahmatulloh/projects/asaka/new-project/docs/DEPLOY.md` | English | Developer | ✅ | ☐ |
| **Publishing pipeline** | `/home/rahmatulloh/projects/asaka/new-project/.github/workflows/deploy.yml` | — | Machine | ✅ | ☐ |
| **Site source root** | `/home/rahmatulloh/projects/asaka/new-project/` (Astro at the repo root) | — | — | ✅ | ☐ |

**Repo:** existing git repo, `origin/main`, `https://github.com/RakhmatullohR/tour-website.git`, clean tree. **Visibility: PRIVATE (BC2).** **First action is the P0 command sequence in §16.2 — scaffold, then append `.gitignore` with a leading newline, then verify, then install.** Getting that order wrong pushes `node_modules/` on the first commit and, later, a `.env` containing the Apps Script `/exec` URL and form token. Raise renaming `tour-website` before it is shown to the client.

---

## Open questions this plan does not resolve

*These belong in `docs/OPEN-QUESTIONS.md` when it is created.*

| Question | Why it is open |
|---|---|
| **13.0 d or 13.5 d?** | Residual risk 1. P1 is bottom-up 1.7–2.0 d against 1.5 d costed. **This is the user's pricing call and the plan deliberately does not make it.** |
| Whether the client accepts a **private** repo | Q9's framing implies they simply open an account; BC2 adds a collaborator-invite step the client must complete before they can edit anything. |
| Whether `import.meta.glob` resolves inside `src/content.config.ts`'s Vite module-runner context | Plausible but unproven. Cheap — folded into the P0 smoke test. |
| Whether `@astrojs/sitemap`'s i18n config tolerates a locale list shorter than four | Same: folded into the P0 smoke test. |
| Whether Astro is right **for handover** if the freelancer walks away | Depends on an engagement model neither the brief nor the answers specify. The retainer recommendation in §11 is the current answer. |
| Whether ~8 tour packages (A10) is achievable at all | The client has supplied zero. If Q6 returns fewer than 4, the catalogue, filters, and the thin destination-detail template all need revisiting. |
| Whether the `RakhmatullohR/tour-website` repo name matters | Cosmetic, but client-visible once they are invited as a collaborator. Raise before P8. Q19 now settles the *brand* spelling. |
| Whether the client will accept the manager-link payment flow | Q7. A "no" changes the architecture class and voids §9's threat model. |
| Whether to recommend **against** exercising the priced `ms` option | The Architect's standing position is that the commercial case is weak (Uzbek customers travelling to Malaysia do not read Malay). The Critic's adjudication stands — `ms` is priced, Q4-gated and native-review-gated, which is correct handling — but the recommendation itself is not made here. |

---

*End of plan. Execution requires explicit approval.*
