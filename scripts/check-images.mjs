#!/usr/bin/env node
/**
 * check-images.mjs — IMAGE-BRIEF-SPEC §5.5
 *
 *   node scripts/check-images.mjs [--tier 1|2|all]
 *
 * Assertions, in the order they catch the most damage:
 *   1. Every manifest row exists on disk (for the requested tier)
 *   2. The filename's WxH suffix matches the actual decoded dimensions
 *   3. No .webp exceeds the PLAN §15 budget (180 KB; the mobile hero 120 KB)
 *   4. THE RENDER ASSERTION — a placeholder whose statistics match a text-free
 *      control means the TEXT DID NOT RENDER (fonts missing on the build machine).
 *      This is what closes the librsvg/fontconfig hermeticity hole.
 *   5. Every image referenced from src/content/** exists in the manifest
 *   6. Every manifest row is used by something or is explicitly marked reserve
 *      (the orphan check that caught the six dropped "service photos")
 */
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.env.FONTCONFIG_FILE = path.join(ROOT, 'scripts', 'fonts', 'fonts.conf');
const sharp = (await import('sharp')).default;

const IMG_DIR = path.join(ROOT, 'src', 'assets', 'images');
const BUDGET_DEFAULT = 180 * 1024;
const BUDGET_MOBILE_HERO = 120 * 1024;

const argv = process.argv.slice(2);
const tierArg = (() => { const i = argv.indexOf('--tier'); return i === -1 ? '1' : (argv[i + 1] ?? '1'); })();

const manifest = JSON.parse(readFileSync(path.join(ROOT, 'scripts', 'images.manifest.json'), 'utf8'));
const rows = manifest.images.filter((r) => tierArg === 'all' || r.tier === Number(tierArg));

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

/* ---- 1 + 2 + 3: existence, dimensions, budget ---- */
for (const row of rows) {
  const file = path.join(IMG_DIR, row.filename);
  if (!existsSync(file)) { fail(`MISSING: ${row.filename} (tier ${row.tier}) — run: npm run gen:placeholders`); continue; }

  const m = row.filename.match(/-(\d+)x(\d+)\.(webp|png)$/);
  if (m) {
    const meta = await sharp(file).metadata();
    if (meta.width !== Number(m[1]) || meta.height !== Number(m[2]))
      fail(`DIMENSION MISMATCH: ${row.filename} — filename says ${m[1]}x${m[2]}, file is ${meta.width}x${meta.height}`);
    if (meta.width !== row.width || meta.height !== row.height)
      fail(`MANIFEST MISMATCH: ${row.filename} — manifest says ${row.width}x${row.height}, file is ${meta.width}x${meta.height}`);
  }

  if (row.filename.endsWith('.webp')) {
    const size = statSync(file).size;
    const budget = row.filename.includes('hero-main-mobile') ? BUDGET_MOBILE_HERO : BUDGET_DEFAULT;
    if (size > budget)
      fail(`OVER BUDGET: ${row.filename} is ${(size / 1024).toFixed(0)} KB, budget ${(budget / 1024).toFixed(0)} KB`);
  }
}

/* ---- 4: THE RENDER ASSERTION (spec §5.5) ----
 * Render a text-free control at the same dimensions with the same flat background,
 * then compare mean channel value and standard deviation. A placeholder that matches
 * the control within tolerance has NO TEXT ON IT — the font did not resolve. */
function fnv1a32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}

for (const row of rows) {
  if (!row.filename.endsWith('.webp')) continue;           // logo/icons carry no prose
  const file = path.join(IMG_DIR, row.filename);
  if (!existsSync(file)) continue;
  if (Math.min(row.width, row.height) < 120) continue;      // too small to assert on

  const hue = fnv1a32(row.group) % 360;
  const control = await sharp({
    create: { width: row.width, height: row.height, channels: 3, background: `hsl(${hue}, 18%, 88%)` },
  }).webp({ quality: 60 }).toBuffer();

  const [a, b] = await Promise.all([sharp(file).stats(), sharp(control).stats()]);
  const sd = (s) => s.channels.reduce((t, c) => t + c.stdev, 0) / s.channels.length;
  const mn = (s) => s.channels.reduce((t, c) => t + c.mean, 0) / s.channels.length;

  const sdDelta = Math.abs(sd(a) - sd(b));
  const mnDelta = Math.abs(mn(a) - mn(b));
  if (sdDelta < 1.0 && mnDelta < 1.0)
    fail(
      `RENDER ASSERTION FAILED: ${row.filename} is statistically indistinguishable from a text-free control ` +
      `(sd delta ${sdDelta.toFixed(3)}, mean delta ${mnDelta.toFixed(3)}). ` +
      `The label text did not render — the bundled font in scripts/fonts/ is the likely cause.`,
    );
}

/* ---- 5: content references resolve to manifest rows ---- */
const known = new Set(manifest.images.map((r) => r.filename));
const contentDir = path.join(ROOT, 'src', 'content');
function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
const referenced = new Set();
for (const f of walk(contentDir)) {
  if (!/\.(json|md)$/.test(f) || path.basename(f).startsWith('_')) continue;
  for (const hit of readFileSync(f, 'utf8').matchAll(/"([\w-]+\.(?:webp|png|svg))"/g)) {
    referenced.add(hit[1]);
    if (!known.has(hit[1]))
      fail(`UNBRIEFED IMAGE: ${path.relative(ROOT, f)} references "${hit[1]}", which is not in the manifest`);
  }
}

/* ---- 6: orphan check ---- */
for (const row of manifest.images) {
  const used = Array.isArray(row.usedIn) && row.usedIn.length > 0;
  if (!used && !row.reserve)
    fail(`ORPHAN: ${row.filename} has no "usedIn" entry and is not marked "reserve": true — nothing consumes it`);
}

/* ------------------------------ report ------------------------------ */
const t1 = manifest.images.filter((r) => r.tier === 1);
console.log(
  `check-images: tier=${tierArg}  checked=${rows.length}  ` +
  `manifest: T1=${t1.length} (client photos ${t1.filter((r) => r.clientPhotoRequired).length}), total=${manifest.images.length}`,
);
for (const w of warnings) console.warn(`  WARN  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`  FAIL  ${e}`);
  console.error(`\ncheck-images: ${errors.length} error(s).`);
  process.exit(1);
}
console.log('check-images: all assertions passed.');
