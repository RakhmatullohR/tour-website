# IMAGE-BRIEF-SPEC — image inventory and generator specification

> **Status: PENDING APPROVAL — this is the SPECIFICATION, not the generated output.**
> `scripts/images.manifest.json`, the 85 placeholder `.webp` files, and the client-facing
> `analize/image-requirements.md` are all produced at **execution time (phase P1)**.
> Nothing described below has been created. Companion document: `docs/PLAN.md` §12.

**Version:** 1.0 · **Date:** 2026-08-18 · Reflects binding corrections **BC15** (tier promotion), the
Critic's "minor, unfixed" items (orphan service photos dropped, manifest relocated, filename slugs
standardised to Uzbek), and **BC12d** (the client document is a Gate-1 deliverable).

---

## 1. Totals — corrected and re-derived

| Tier | Files | Of which client photographs | Scope |
|---|---:|---:|---|
| **Tier 1** — required to launch | **26** | **20** | Launch scope, priced inside the 13.0 d |
| **Tier 2** — nice to have | **59** | 59 | +0.5 d priced add-on (`docs/PLAN.md` §16.1) |
| **TOTAL** | **85** | | |

**Derivation from plan v2's numbers, so the change is auditable:**

| Step | T1 | T2 | Total |
|---|---:|---:|---:|
| plan v2 as written | 20 | 71 | 91 |
| **BC15** — promote `promo-banner` (1), `cta-bg` (1), testimonial avatars (3), `static-map` (1) into T1, because P2 builds those Home sections and Contacts is a launch route, so their placeholders must exist before Gate 1 | **26** | **65** | 91 |
| **Drop the 6 orphan "service photos"** (800×600). They had **no consumer**: `docs/PLAN.md` §6 row 4 renders six **inline SVG icons**, and the standalone Services page was cut. | 26 | **59** | **85** |

**The six promoted files are marked `clientPhotoRequired: false`** — the developer generates them
(a brand-coloured promo/CTA field, neutral avatar silhouettes, a rendered static map). This is what
keeps the client's ask at **20 photographs**, not 26 and certainly not 85.

> **The three numbers must never be confused:**
> **85** = files on disk · **26** = files needed before launch · **20** = photographs the client is asked for.
> Only the last number ever appears in `analize/image-requirements.md`.

---

## 2. Naming convention

```
{section}-{subject}-{variant}-{W}x{H}.webp
```

| Rule | Detail |
|---|---|
| Case and separators | Lowercase, hyphen-separated. No spaces, no underscores. |
| Character set | **ASCII only.** No Cyrillic, and no `oʻ` / `gʻ` (U+02BB) — they break on some FTP clients and in URLs. |
| **Dimensions live in the filename** | `-1920x1080` is the **minimum acceptable source size**. This is the whole point: the client reads the required resolution off the filename without opening any document, and a real photograph drops in under the **exact same filename** with **zero code change**. |
| Slug language | **Uzbek Latin, transliterated to ASCII.** `turkiya` · `dubay` · `tailand` · `misr` · `malayziya` · `ozbekiston`. Plan v2 mixed `dest-turkey-*` (English) with `tour-turkiya-*` (Uzbek); that is settled here, **before any file is generated**, because the filenames are what the client names their photographs after. |
| ISO codes | Country codes (`TR`, `AE`, `TH`, `EG`, `MY`, `UZ`) live in the **data** (`country` field, `docs/PLAN.md` §7) and **never** in a filename. |
| Format | `.webp` for every photographic asset. **Two documented exceptions:** the logo is `.svg` (vector), and the three favicon/manifest icons are `.png` (required by browsers and by `site.webmanifest`). |
| Location | `src/assets/images/` — flat, no subdirectories, because `src/lib/images.ts` globs `'/src/assets/images/*.webp'` and `resolveImage()` looks up by bare filename. |

---

## 3. Complete image inventory

Columns: **filename** · **dimensions** · **aspect** · **tier** · **where it is used** · **`clientPhotoRequired`** ·
**Uzbek description of what the photograph must depict** (this last column is copied verbatim into the
client document, so it is written for a non-technical reader).

### 3.1 TIER 1 — 26 files, required before Gate 1

| # | Filename | Dimensions | Aspect | Tier | Where it is used | `clientPhotoRequired` | Nima aks etishi kerak (oʻzbekcha) |
|---:|---|---|---|---|---|---|---|
| 1 | `hero-main-1920x1080.webp` | 1920×1080 | 16:9 | T1 | Home §6.2 hero, desktop | ✅ true | Sayohatning eng chiroyli kadri — dengiz, tarixiy joy yoki mamnun sayyohlar guruhi. Gorizontal, yorugʻ, oʻrtasi boʻsh (ustiga matn tushadi). |
| 2 | `hero-main-mobile-1080x1350.webp` | 1080×1350 | 4:5 | T1 | Home §6.2 hero, mobil (art-directed vertikal kesim) | ✅ true | Yuqoridagi kadrning **vertikal** varianti — telefon ekrani uchun. Asosiy obyekt markazda boʻlsin. |
| 3 | `logo-primary.svg` | vector | — | T1 | Header, footer, hujjatlar | ✅ true | Kompaniya logotipi **`.svg`** formatda. `.svg` boʻlmasa — shaffof fonli katta `.png` (kamida 1000 px kenglikda). |
| 4 | `logo-favicon-32x32.png` | 32×32 | 1:1 | T1 | Brauzer yorligʻi (favicon) | ✅ true | Logotipdan yasaladi — mijoz alohida yubormaydi, faqat aniq logotip fayli kerak. |
| 5 | `logo-apple-touch-180x180.png` | 180×180 | 1:1 | T1 | iOS bosh ekran belgisi | ✅ true | Xuddi shu logotipdan. |
| 6 | `logo-maskable-512x512.png` | 512×512 | 1:1 | T1 | `site.webmanifest`, Android | ✅ true | Xuddi shu logotipdan. |
| 7 | `dest-turkiya-01-800x1000.webp` | 800×1000 | 4:5 | T1 | Home §6.5 davlat kartochkasi · `/destinations/` | ✅ true | Turkiya — Antalya sohili yoki Istanbul manzarasi. **Vertikal** kadr. |
| 8 | `dest-dubay-01-800x1000.webp` | 800×1000 | 4:5 | T1 | Home §6.5 · `/destinations/` | ✅ true | Dubay — zamonaviy osmonoʻpar binolar yoki Burj Khalifa. Vertikal. |
| 9 | `dest-tailand-01-800x1000.webp` | 800×1000 | 4:5 | T1 | Home §6.5 · `/destinations/` | ✅ true | Tailand — oq qumli plyaj, palmalar, feruza suv. Vertikal. |
| 10 | `dest-misr-01-800x1000.webp` | 800×1000 | 4:5 | T1 | Home §6.5 · `/destinations/` | ✅ true | Misr — Sharm-el-Shayx dengizi yoki qadimiy yodgorlik. Vertikal. |
| 11 | `dest-malayziya-01-800x1000.webp` | 800×1000 | 4:5 | T1 | Home §6.5 · `/destinations/` | ✅ true | Malayziya — Kuala-Lumpur (Petronas minoralari) yoki orol manzarasi. Vertikal. |
| 12 | `dest-ozbekiston-01-800x1000.webp` | 800×1000 | 4:5 | T1 | Home §6.5 · `/destinations/` | ✅ true | Oʻzbekiston — Samarqand Registoni, Buxoro yoki Xiva. Vertikal. |
| 13 | `tour-turkiya-antalya-cover-1200x800.webp` | 1200×800 | 3:2 | T1 | Tur kartochkasi + tur sahifasi sarlavhasi | ✅ true | Shu turning oʻz surati — mehmonxona, plyaj yoki guruh surati. Gorizontal. |
| 14 | `tour-turkiya-istanbul-cover-1200x800.webp` | 1200×800 | 3:2 | T1 | Tur kartochkasi + tur sahifasi | ✅ true | Istanbul turi uchun asosiy surat. Gorizontal. |
| 15 | `tour-dubay-cover-1200x800.webp` | 1200×800 | 3:2 | T1 | Tur kartochkasi + tur sahifasi | ✅ true | Dubay turi uchun asosiy surat. Gorizontal. |
| 16 | `tour-tailand-phuket-cover-1200x800.webp` | 1200×800 | 3:2 | T1 | Tur kartochkasi + tur sahifasi | ✅ true | Phuket turi uchun asosiy surat. Gorizontal. |
| 17 | `tour-misr-sharm-cover-1200x800.webp` | 1200×800 | 3:2 | T1 | Tur kartochkasi + tur sahifasi | ✅ true | Sharm-el-Shayx turi uchun asosiy surat. Gorizontal. |
| 18 | `tour-ozbekiston-samarqand-cover-1200x800.webp` | 1200×800 | 3:2 | T1 | Tur kartochkasi + tur sahifasi | ✅ true | Samarqand–Buxoro turi uchun asosiy surat. Gorizontal. |
| 19 | `about-team-1600x900.webp` | 1600×900 | 16:9 | T1 | Home §6.7 "Nega biz" · `/about/` | ✅ true | Jamoa surati yoki ofisdagi ish jarayoni. Haqiqiy odamlar — stock surat emas. Gorizontal. |
| 20 | `og-default-1200x630.webp` | 1200×630 | 1.91:1 | T1 | Telegram/Facebook havola koʻrinishi (Open Graph) | ✅ true | Kompaniyani eng yaxshi koʻrsatadigan gorizontal kadr — havola ulashilganda shu chiqadi. |
| 21 | `promo-banner-01-1600x600.webp` | 1600×600 | 8:3 | T1 | Home §6.9 aksiya bloki | ❌ **false** — dasturchi yasaydi | Fon banneri — brend ranglarida, ustiga chegirma foizi yoziladi. Mijozdan surat kerak emas. |
| 22 | `cta-bg-1600x900.webp` | 1600×900 | 16:9 | T1 | Home §6.11 ariza formasi foni | ❌ **false** — dasturchi yasaydi | Forma orqasidagi fon — brend ranglarida, matn oʻqilishi uchun xira. Mijozdan surat kerak emas. |
| 23 | `avatar-01-200x200.webp` | 200×200 | 1:1 | T1 | Home §6.10 sharh avatari | ❌ **false** — dasturchi yasaydi | Neytral siluet. Haqiqiy mijoz surati kelsa (Q14) shu fayl almashtiriladi. |
| 24 | `avatar-02-200x200.webp` | 200×200 | 1:1 | T1 | Home §6.10 | ❌ **false** | Yuqoridagidek. |
| 25 | `avatar-03-200x200.webp` | 200×200 | 1:1 | T1 | Home §6.10 | ❌ **false** | Yuqoridagidek. |
| 26 | `static-map-800x500.webp` | 800×500 | 8:5 | T1 | `/contacts/` xarita bloki (§10) | ❌ **false** — dasturchi yasaydi | Ofis manzili xaritadan olingan statik rasm. Q22 javob berilgach yasaladi; javobsiz boʻlsa blok yashiriladi. |

**Tier 1 check: 26 rows · 20 with `clientPhotoRequired: true` · 6 with `false`.**

### 3.2 TIER 2 — 59 files, priced add-on

Every Tier-2 row is `clientPhotoRequired: true`. Filenames are enumerated by pattern; the manifest
carries every row explicitly.

| Group | Files | Filename pattern | Dimensions | Aspect | Where it is used | Nima aks etishi kerak (oʻzbekcha) |
|---|---:|---|---|---|---|---|
| Destination hero banners | 6 | `dest-{slug}-hero-1600x600.webp` for `turkiya` · `dubay` · `tailand` · `misr` · `malayziya` · `ozbekiston` | 1600×600 | 8:3 | `/destinations/{country}/` sahifa sarlavhasi | Har bir davlat uchun keng gorizontal manzara. Ustiga matn tushadi — oʻrtasi tinch boʻlsin. |
| Tour galleries | 32 | `tour-{tour-slug}-{01..04}-1600x1067.webp` for the 8 tours in §3.3 | 1600×1067 | 3:2 | Tur sahifasidagi galereya | Har bir tur uchun 4 tadan: mehmonxona, ovqat, ekskursiya, guruh. Gorizontal. |
| Team portraits | 3 | `team-{01..03}-600x800.webp` | 600×800 | 3:4 | `/about/` jamoa bloki | Menejerlarning **vertikal** portreti, bir xil fonda. |
| Testimonial avatars (beyond the first three) | 3 | `avatar-{04..06}-200x200.webp` | 200×200 | 1:1 | Home §6.10 · `/about/` | Haqiqiy mijoz surati — faqat mijoz ruxsat bersa. |
| Blog covers | 6 | `blog-{01..06}-cover-1200x630.webp` | 1200×630 | 1.91:1 | Blog add-on route | Maqola mavzusiga mos gorizontal surat. Blog moduli bilan birga keladi. |
| Promo banners (beyond the first) | 1 | `promo-banner-02-1600x600.webp` | 1600×600 | 8:3 | Ikkinchi aksiya | Birinchi bannerdek, boshqa aksiya uchun. |
| Per-locale OG images | 3 | `og-{ru,en,ms}-1200x630.webp` | 1200×630 | 1.91:1 | Open Graph, til boʻyicha | `og-default` bilan bir xil, matni shu tilda. |
| Extra tour covers (catalogue headroom) | 5 | `tour-malayziya-kuala-lumpur-cover-1200x800.webp` · `tour-ozbekiston-xiva-cover-1200x800.webp` · `tour-reserve-{01..03}-cover-1200x800.webp` | 1200×800 | 3:2 | Tur kartochkasi + tur sahifasi | Qolgan va keyingi turlar uchun asosiy surat. Gorizontal. |
| **TIER 2 TOTAL** | **59** | | | | | |

**Tier 2 check: 6 + 32 + 3 + 3 + 6 + 1 + 3 + 5 = 59.**

### 3.3 Tour slugs — the eight launch tours (A10)

`turkiya-antalya` · `turkiya-istanbul` · `dubay` · `tailand-phuket` · `misr-sharm` ·
`ozbekiston-samarqand` · `malayziya-kuala-lumpur` · `ozbekiston-xiva`

**Cover-slot arithmetic:** 6 Tier-1 covers (the featured tours) + 5 Tier-2 covers = **11 cover slots**
against 8 launch tours — 8 used, 3 held as reserve for the catalogue's first growth. Gallery
arithmetic: 8 tours × 4 images = 32.

> If Q6 returns fewer than 4 real packages, this whole section is re-derived before generation
> (`docs/PLAN.md` residual risk 5).

---

## 4. `scripts/images.manifest.json` — the single source

One object per file. This is the **only** input to all three scripts; nothing else enumerates images.

```jsonc
{
  "version": 1,
  "images": [
    {
      "filename": "hero-main-1920x1080.webp",
      "width": 1920,
      "height": 1080,
      "aspect": "16:9",
      "tier": 1,                       // 1 | 2
      "group": "hero",                 // drives the deterministic placeholder hue (§5)
      "usedIn": ["Home §6.2 (desktop)"],
      "clientPhotoRequired": true,     // ONLY true rows reach the client document (§6)
      "orientation": "gorizontal",     // gorizontal | vertikal | kvadrat
      "uz": "Sayohatning eng chiroyli kadri — dengiz, tarixiy joy yoki mamnun sayyohlar guruhi..."
    }
  ]
}
```

| Field | Rule |
|---|---|
| `filename` | Must match `{section}-{subject}-{variant}-{W}x{H}.{ext}` and must agree with `width`/`height`. `check-images.mjs` asserts this. |
| `tier` | `1` or `2`. Drives grouping in the client document and the Gate-1 generation count. |
| `group` | Free-form group key (`hero`, `dest`, `tour-cover`, `tour-gallery`, `logo`, `og`, `promo`, `cta`, `avatar`, `team`, `map`, `blog`). Placeholder hue is derived from it deterministically. |
| `clientPhotoRequired` | **The gate on the client document.** `false` means the developer generates it. |
| `uz` | Hand-written Uzbek subject brief, Latin script. Copied verbatim into the client document. **This is the expensive column** — 26 of these written by hand is a real part of why P1 is estimated light (`docs/PLAN.md` residual risk 1). |

**Location:** `scripts/images.manifest.json`. Moved out of a root-level `content/` directory, which sat
confusingly beside `src/content/`. It is machine input to the three scripts that read it, it is never
client-editable content, and `src/content/` is the content-collection namespace — a non-collection
file does not belong there.

---

## 5. `scripts/gen-placeholders.mjs` — specification

**Purpose:** produce every `.webp` in the manifest as a labelled placeholder, entirely offline.

**Inputs:** `scripts/images.manifest.json`, `scripts/fonts/<bundled>.ttf`
**Output:** one file per manifest row into `src/assets/images/`
**Dependency:** `sharp@^0.35.3` as an **explicit devDependency**. `sharp` is an `optionalDependency`
of astro and optional dependencies fail **silently** — never rely on the transitive copy.

### 5.1 Behaviour

| Requirement | Specification |
|---|---|
| CLI | `node scripts/gen-placeholders.mjs [--tier 1|2|all] [--force]`. Default `--tier 1`, so the launch set is the cheap default. **Without `--force`, an existing file is never overwritten** — this is what protects a real client photograph that has already been dropped in under the same filename. |
| Composition | Build an SVG string at the exact `width`×`height`, then `sharp(Buffer.from(svg)).webp({ quality: 60 }).toFile(...)`. |
| Network | **Zero external requests.** No image service, no font CDN, no placeholder API. Asserted by the fact that the only I/O is the local font file. |
| Non-`.webp` rows | Logo (`.svg`) and the three favicon `.png` files are emitted as simple generated marks in their own formats, not routed through the WebP encoder. |

### 5.2 Deterministic hue per group

```
hue = (fnv1a32(row.group) % 360)
background = hsl(hue, 18%, 88%)      // desaturated — mockups must read as intentional, not as noise
foreground = hsl(hue, 30%, 28%)      // text, guaranteed contrast against the background above
```

Deterministic on `group`, **not** on filename, so that every destination card shares one hue, every
tour cover shares another, and a screenshot of the mockup looks designed rather than random. The same
input always yields the same output, so regenerating produces no diff churn.

### 5.3 Text burned into the placeholder

Four lines, centred, largest first, all sized relative to the shorter edge:

1. **The Uzbek subject brief** (`row.uz`), wrapped, truncated to three display lines — *this is the line that makes a placeholder useful to a human looking at the mockup*
2. **The filename** (`row.filename`)
3. **The dimensions** as `1920 × 1080` — so the required source size is legible from the mockup, not only from the filename
4. **The tier and ask marker** — `TIER 1 · mijozdan surat kerak` or `TIER 1 · dasturchi yasaydi`

For rows below roughly 400 px on the short edge (the 200×200 avatars, the favicons), collapse to lines
2 and 3 only; four lines do not fit legibly.

### 5.4 Hermetic font handling — mandatory

`sharp`'s SVG text rendering goes through **librsvg + fontconfig**, which resolves fonts from the
**host machine**. On this workstation it renders Uzbek diacritics correctly (582 system fonts;
DejaVu Sans covers U+02BB — verified). On a bare CI container it would silently produce
**unlabelled placeholders**, and nothing would fail.

**Therefore:**

1. **Ship a font file** in `scripts/fonts/` — one that demonstrably covers `oʻ` (U+02BB), `gʻ`, `ʼ` (U+02BC) and Cyrillic.
2. **Reference it explicitly** in the SVG (`@font-face` with a `file://` URL to the bundled file, plus `font-family` on every `<text>`), never by bare family name.
3. **Never** rely on a system font being present.

### 5.5 Render assertion — lives in `check-images.mjs`

The assertion that closes the hermeticity hole. For each generated placeholder:

1. Render a **text-free control** at the same dimensions with the same background — nothing but the flat hue.
2. Compute `sharp(file).stats()` and compare **mean channel value** and **standard deviation** against the control.
3. **A placeholder whose statistics match the text-free control within tolerance means the text did not render.** Fail loudly with the filename and a message naming the font as the likely cause.

Also asserted by `check-images.mjs`:

| Assertion | Failure mode it catches |
|---|---|
| Every manifest row exists on disk (for the requested tier) | A generation run that silently skipped rows |
| Filename `WxH` suffix matches actual decoded dimensions | A client dropping in a photograph at the wrong size |
| Every image referenced from `src/content/**` exists in the manifest | A tour JSON pointing at a filename nobody ever briefed |
| Every manifest row is referenced by something, or is explicitly marked reserve | **The orphan-file check that would have caught the six service photos.** |
| No `.webp` exceeds the §15 budget (180 KB; hero 120 KB mobile) | A real photograph blowing the performance budget |
| The render assertion above | Fonts missing on the build machine |

---

## 6. `scripts/gen-image-requirements.mjs` → `analize/image-requirements.md`

**This is the client-facing document.** Uzbek, Latin script only, never Cyrillic. It is a **Gate-1
deliverable** (`docs/PLAN.md` §17, BC12d) and it goes out on **day 0** alongside the §3 questions,
because R1 — the client supplying nothing — is the only High/High risk in the plan.

### 6.1 The filtering rule — the most important rule in this document

> **Only rows with `clientPhotoRequired: true` appear in the client document.**

| What the number would be | Effect on the client |
|---|---|
| 85 (everything) | Abandons the project. |
| 26 (all of Tier 1) | Asks for six things they cannot photograph — a banner background, a form background, three avatar silhouettes, a map screenshot — and looks careless. |
| **20 (Tier 1 ∩ `clientPhotoRequired: true`)** | **Correct.** Achievable, and it is the number Q13 already promises them. |

Tier-2 rows are generated into a clearly separated **second section** headed *"Keyingi bosqich —
shoshilinch emas"*, so the client can see the full picture without being asked for it now. The
document opens with the Tier-1 count and only the Tier-1 count.

### 6.2 Document structure

```
# Getcar_travel — sayt uchun kerak boʻlgan rasmlar

## Qisqacha
Birinchi bosqich uchun 20 ta rasm kerak.  <- generated from the true-row count, never hardcoded
Har bir rasm uchun quyida yozilgan: nima aks etishi kerak, qanday oʻlcham, gorizontalmi yoki vertikal.
Fayl nomini oʻzgartirmang — biz shu nom bilan saytga qoʻyamiz.

## Muallif huquqi — muhim ogohlantirish        <- §7 below, verbatim
## 1-BOSQICH — hozir kerak (20 ta rasm)        <- tier 1, clientPhotoRequired: true
## 2-BOSQICH — keyin (59 ta rasm, shoshilinch emas)   <- tier 2
## Umumiy talablar                              <- §6.4 below
```

### 6.3 Columns of the client table

Exactly six, in this order. No `tier` column (the section heading carries it) and no
`clientPhotoRequired` column (every visible row is `true`).

| # | Column header (Uzbek) | Source | Note |
|---|---|---|---|
| 1 | `#` | row index within the section | So the client can say "12-rasm tayyor" |
| 2 | `Nima aks etishi kerak` | `row.uz` | **The widest column.** The whole document exists for this text. |
| 3 | `Eng kichik oʻlcham` | `${width} × ${height} px` | Rendered with a real `×`, not the letter x |
| 4 | `Yoʻnalishi` | `row.orientation` | `gorizontal` / `vertikal` / `kvadrat` — plain words, never "3:2" |
| 5 | `Qayerda koʻrinadi` | `row.usedIn`, translated to Uzbek | "Bosh sahifada eng tepada", not "Home §6.2" |
| 6 | `Fayl nomi` | `row.filename` | With: *"Faylni shu nom bilan yuborsangiz eng qulay — lekin nomini oʻzgartirmasangiz ham boʻladi, biz oʻzimiz nomlaymiz."* |

Aspect ratios are **deliberately absent** from the client's table. `4:5` means nothing to a
non-technical reader; `vertikal` plus a pixel size means everything. The ratios in §3 above are for
the developer.

### 6.4 Fixed tail sections (same text every generation)

**`Umumiy talablar`:**

- `.jpg` yoki `.png` — telefonda olingan boʻlsa ham boʻladi, lekin **eng katta sifatda** yuboring.
- Telegramda yuborganda **"fayl sifatida" (file)** yuboring, oddiy rasm sifatida emas — aks holda sifat yoʻqoladi.
- Rasmda **suv belgisi (watermark)** boʻlmasin.
- Boshqa turizm kompaniyasining logotipi yoki nomi koʻrinmasin.
- Ekrandan olingan surat (screenshot) boʻlmasin.
- Kuchli filtr, qorongʻi yoki xira suratlar yaramaydi.
- Odamlar koʻringan suratlar uchun ularning roziligi boʻlsin.

**`Qachongacha kerak`:** repeats Q13's explicit-date request, so the deadline is asked in both documents.

### 6.5 Generator requirements

| Requirement | Specification |
|---|---|
| CLI | `node scripts/gen-image-requirements.mjs` → writes `analize/image-requirements.md` |
| Idempotence | Same manifest ⇒ byte-identical output. No timestamps in the body. |
| Counts | **Every count in the prose is computed from the manifest**, never typed. If a row's `clientPhotoRequired` flips, "20 ta rasm" updates itself. |
| Script | **Latin only.** A generation-time assertion rejects any Cyrillic codepoint (U+0400–U+04FF) in the output. |
| Markdown | Plain tables and headings. **No blockquotes and no `**` emphasis inside the rows** — the client may paste sections into Telegram, which renders those literally (same reasoning as BC17f for `client-open-questions.md`). |
| Placement | `analize/` is outside `src/` and `public/`, so it is never built into the published site. |

---

## 7. Copyright warning — Uzbek, verbatim

Reproduced at the **top** of `analize/image-requirements.md`, immediately after the summary, and
repeated in question 13 of `analize/client-open-questions.md`. This is risk **R11**, rated High/Medium.

> ## Muallif huquqi — muhim ogohlantirish
>
> **Internetdan yoki Google'dan olingan rasmlarni saytga qoʻyib boʻlmaydi.**
>
> Rasmlarning deyarli barchasi kimningdir mulki. Boshqa birovning suratini ruxsatsiz ishlatish —
> muallif huquqini buzish hisoblanadi. Bunday hollarda surat egasi yoki uning vakili sizdan
> **kompensatsiya talab qilishi**, saytdan suratni olib tashlashni talab qilishi mumkin. Bu haqiqiy
> xavf — turizm sohasidagi suratlar ayniqsa faol nazorat qilinadi.
>
> **Qaysi rasmlarni ishlatsa boʻladi:**
> - **Oʻzingiz yoki xodimlaringiz suratga olgan** rasmlar — eng yaxshisi shu, chunki ular haqiqiy va ishonch uygʻotadi.
> - **Mijozlaringiz yuborgan** rasmlar — ulardan yozma ruxsat olgan boʻlsangiz.
> - **Hamkor mehmonxona yoki tur operatori** rasmiy ravishda bergan rasmlar — ruxsatni yozma olib qoʻying.
> - **Litsenziyasi sotib olingan** stok rasmlar (masalan Shutterstock, Adobe Stock, Getty). Chek va litsenziyani saqlang.
> - **Bepul litsenziyali** stok rasmlar (Unsplash, Pexels) — bepul, lekin **odamlar aniq koʻringan** rasmlarni tijorat uchun ishlatishda ehtiyot boʻling.
>
> **Qaysi rasmlarni ishlatib boʻlmaydi:**
> - Google Rasmlar (Google Images) qidiruvidan olingan har qanday rasm.
> - Boshqa turizm kompaniyasining saytidan yoki Instagram sahifasidan olingan rasm.
> - Suv belgisi (watermark) turgan rasm — bu ochiq-oydin boshqa birovniki degani.
> - Internetdan olingan, kimniki ekani nomaʼlum rasm.
>
> **Rasm topilmasa nima qilamiz:** biz sizga vaqtinchalik oʻrindosh rasm bilan saytni ishga tushiramiz —
> sayt ochiq boʻlaveradi. Haqiqiy rasmlar kelgach almashtiramiz. Xohlasangiz, litsenziyali stok rasm
> tanlab berishimiz mumkin — bu **alohida hisoblanadi** va litsenziya narxi ustiga qoʻshiladi.

---

## 8. Execution checklist (phase P1)

Nothing below has been done.

- [ ] Write `scripts/images.manifest.json` — **85 rows**, 26 at `tier: 1`, of which 20 `clientPhotoRequired: true`
- [ ] Hand-write the `uz` subject brief for all 26 Tier-1 rows (the expensive part)
- [ ] Add the bundled font to `scripts/fonts/` and verify it covers U+02BB, U+02BC and Cyrillic
- [ ] Implement `scripts/gen-placeholders.mjs` per §5
- [ ] Generate **26 Tier-1** files into `src/assets/images/`
- [ ] Implement `scripts/check-images.mjs` per §5.5, including the render assertion and the orphan check
- [ ] Run it; all assertions green
- [ ] Implement `scripts/gen-image-requirements.mjs` per §6
- [ ] Generate `analize/image-requirements.md`; confirm it lists **exactly 20** first-stage rows and contains **zero Cyrillic**
- [ ] Send it to the client with the §3 question list, on day 0
