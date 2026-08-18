#!/usr/bin/env node
/**
 * gen-placeholders.mjs — IMAGE-BRIEF-SPEC §5
 *
 * Produces every image in scripts/images.manifest.json as a labelled placeholder,
 * ENTIRELY OFFLINE. No image service, no font CDN, no placeholder API.
 *
 *   node scripts/gen-placeholders.mjs [--tier 1|2|all] [--force]
 *
 * Default is --tier 1, so the launch set is the cheap default.
 * WITHOUT --force AN EXISTING FILE IS NEVER OVERWRITTEN — this is what protects a
 * real client photograph that has already been dropped in under the same filename.
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FONT_DIR = path.join(ROOT, 'scripts', 'fonts');
const OUT_DIR = path.join(ROOT, 'src', 'assets', 'images');
const FONT_FAMILY = 'DejaVu Sans';

/* ---------------------------------------------------------------------------
 * HERMETIC FONTS (spec §5.4). sharp renders SVG text through librsvg + fontconfig,
 * which resolves fonts from the HOST machine. On a bare CI container the Uzbek
 * labels would render as tofu or blank and NOTHING WOULD FAIL. We therefore point
 * fontconfig at the bundled directory BEFORE sharp is imported, and back it up with
 * the render assertion in check-images.mjs.
 * ------------------------------------------------------------------------- */
const FC_CONF = path.join(FONT_DIR, 'fonts.conf');
writeFileSync(
  FC_CONF,
  `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig>
  <dir>${FONT_DIR}</dir>
  <dir>/usr/share/fonts</dir>
  <cachedir prefix="xdg">fontconfig</cachedir>
  <match target="pattern">
    <test qual="any" name="family"><string>sans-serif</string></test>
    <edit name="family" mode="prepend" binding="strong"><string>${FONT_FAMILY}</string></edit>
  </match>
</fontconfig>
`,
);
process.env.FONTCONFIG_FILE = FC_CONF;

// Dynamic import: sharp/libvips initialises fontconfig on load, so the env var
// above must be set first. A static import would hoist above it.
const sharp = (await import('sharp')).default;

/* ------------------------------ CLI ------------------------------ */
const argv = process.argv.slice(2);
const force = argv.includes('--force');
const tierArg = (() => {
  const i = argv.indexOf('--tier');
  return i === -1 ? '1' : (argv[i + 1] ?? '1');
})();
if (!['1', '2', 'all'].includes(tierArg)) {
  console.error(`--tier must be 1, 2 or all (got "${tierArg}")`);
  process.exit(1);
}
/* --only <substring>  — generate a NAMED SUBSET regardless of tier.
 * The launch sample catalogue (PLAN §16.2 P3, "8 sample tours") needs two covers
 * that the manifest classes as Tier 2, because Tier 1 only budgets the FEATURED
 * six. Pulling in all 59 Tier-2 rows to get two files would silently deliver a
 * priced add-on; this flag takes exactly the two. */
const onlyArg = (() => { const i = argv.indexOf('--only'); return i === -1 ? null : (argv[i + 1] ?? null); })();

const manifest = JSON.parse(readFileSync(path.join(ROOT, 'scripts', 'images.manifest.json'), 'utf8'));
const rows = manifest.images.filter(
  (r) => (onlyArg ? r.filename.includes(onlyArg) : tierArg === 'all' || r.tier === Number(tierArg)),
);
mkdirSync(OUT_DIR, { recursive: true });

/* --------------------- deterministic hue per GROUP ---------------------
 * Deterministic on `group`, NOT on filename, so every destination card shares one
 * hue and a screenshot of the mockup looks designed rather than random. The same
 * input always yields the same output, so regenerating produces no diff churn. */
function fnv1a32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}
const hueOf = (group) => fnv1a32(group) % 360;

const xml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Greedy wrap by estimated advance width (DejaVu Sans averages ~0.55em). */
function wrap(text, maxWidthPx, fontSize, maxLines) {
  const perChar = fontSize * 0.55;
  const maxChars = Math.max(8, Math.floor(maxWidthPx / perChar));
  const out = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= maxChars) line = candidate;
    else {
      if (line) out.push(line);
      line = word;
      if (out.length === maxLines) break;
    }
  }
  if (line && out.length < maxLines) out.push(line);
  if (out.length === maxLines) {
    const last = out[maxLines - 1];
    if (text.length > out.join(' ').length) out[maxLines - 1] = last.replace(/[.,;:]?$/, '') + '…';
  }
  return out;
}

function buildSvg(row) {
  const { width: w, height: h, filename, uz, tier, clientPhotoRequired, group } = row;
  const hue = hueOf(group);
  const bg = `hsl(${hue}, 18%, 88%)`;
  const fg = `hsl(${hue}, 30%, 28%)`;
  const short = Math.min(w, h);
  const pad = Math.round(short * 0.07);
  const inner = w - pad * 2;

  // Below ~400px on the short edge four lines do not fit legibly (spec §5.3).
  const compact = short < 400;

  const sBrief = Math.max(13, Math.round(short * 0.055));
  const sName = Math.max(10, Math.round(short * (compact ? 0.062 : 0.032)));
  const sDim = Math.max(11, Math.round(short * (compact ? 0.085 : 0.042)));
  const sTag = Math.max(9, Math.round(short * 0.026));

  const briefLines = compact ? [] : wrap(uz ?? '', inner, sBrief, 3);
  const marker = clientPhotoRequired ? 'mijozdan surat kerak' : 'dasturchi yasaydi';
  const tagText = compact ? '' : `TIER ${tier} · ${marker}`;

  const gap = Math.round(short * 0.028);
  const blocks = [];
  if (briefLines.length) blocks.push({ size: sBrief, weight: 600, lines: briefLines, lh: 1.32 });
  blocks.push({ size: sDim, weight: 700, lines: [`${w} × ${h}`], lh: 1.2 });
  blocks.push({ size: sName, weight: 400, lines: [filename], lh: 1.2, mono: true });
  if (tagText) blocks.push({ size: sTag, weight: 400, lines: [tagText], lh: 1.2 });

  const totalH =
    blocks.reduce((acc, b) => acc + b.lines.length * b.size * b.lh, 0) + gap * (blocks.length - 1);

  let y = h / 2 - totalH / 2;
  let body = '';
  for (const b of blocks) {
    for (const line of b.lines) {
      y += b.size * b.lh;
      const op = b.mono ? 0.62 : b.weight === 700 ? 1 : 0.86;
      body += `<text x="${w / 2}" y="${Math.round(y - b.size * (b.lh - 1) * 0.5)}" font-family="${FONT_FAMILY}" font-size="${b.size}" font-weight="${b.weight}" fill="${fg}" fill-opacity="${op}" text-anchor="middle">${xml(line)}</text>`;
    }
    y += gap;
  }

  const bw = Math.max(1, Math.round(short * 0.006));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <rect x="${bw / 2}" y="${bw / 2}" width="${w - bw}" height="${h - bw}" fill="none" stroke="${fg}" stroke-opacity="0.28" stroke-width="${bw}"/>
  ${body}
</svg>`;
}

/* ----- the logo is vector, the three icons are PNG (spec §2, two documented exceptions) ----- */
function buildLogoSvg(row) {
  const hue = hueOf(row.group);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${row.width}" height="${row.height}" viewBox="0 0 ${row.width} ${row.height}">
  <rect width="${row.width}" height="${row.height}" fill="none"/>
  <circle cx="150" cy="150" r="110" fill="hsl(${hue}, 45%, 35%)"/>
  <path d="M95 165 L150 95 L205 165 Z" fill="#fff" fill-opacity="0.92"/>
  <text x="300" y="150" font-family="${FONT_FAMILY}" font-size="78" font-weight="700" fill="hsl(${hue}, 45%, 25%)" dominant-baseline="middle">Getcar</text>
  <text x="300" y="222" font-family="${FONT_FAMILY}" font-size="44" font-weight="400" fill="hsl(${hue}, 30%, 45%)" dominant-baseline="middle">travel — PLACEHOLDER</text>
</svg>`;
}

function buildIconSvg(row) {
  const hue = hueOf(row.group);
  const s = row.width;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" rx="${Math.round(s * 0.18)}" fill="hsl(${hue}, 45%, 32%)"/>
  <path d="M${s * 0.26} ${s * 0.66} L${s * 0.5} ${s * 0.3} L${s * 0.74} ${s * 0.66} Z" fill="#fff" fill-opacity="0.94"/>
</svg>`;
}

/* ------------------------------ run ------------------------------ */
let written = 0, skipped = 0;
for (const row of rows) {
  const dest = path.join(OUT_DIR, row.filename);
  if (existsSync(dest) && !force) { skipped++; continue; }
  const ext = path.extname(row.filename);

  if (ext === '.svg') {
    writeFileSync(dest, buildLogoSvg(row) + '\n');
  } else if (ext === '.png') {
    await sharp(Buffer.from(buildIconSvg(row))).png({ compressionLevel: 9 }).toFile(dest);
  } else {
    await sharp(Buffer.from(buildSvg(row))).webp({ quality: 60 }).toFile(dest);
  }
  written++;
}

console.log(`gen-placeholders: ${onlyArg ? `only=${onlyArg}` : `tier=${tierArg}`}  written=${written}  skipped(existing)=${skipped}  total=${rows.length}`);
if (skipped && !force) console.log('  (existing files preserved — re-run with --force to overwrite)');
