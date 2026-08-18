#!/usr/bin/env node
/**
 * check-i18n.mjs — PLAN §18.
 *
 *   node scripts/check-i18n.mjs
 *
 * Assertions:
 *   1. Every shipped locale has a dictionary file
 *   2. Key parity across shipped locales — reports uz-fallbacks per locale
 *   3. No empty values (a blank string renders as nothing and looks like a bug)
 *   4. Interpolation slots match across locales — a {n} present in uz but missing
 *      in ru means the Russian string silently drops the number
 *   5. Every key used via t('...') in src/ exists in uz.json, and every uz key is
 *      used somewhere (the orphan half catches strings paid for but never shown)
 *   6. UZBEK ORTHOGRAPHY GATE (§13.2): uz.json must use the MODIFIER LETTERS
 *      oʻ/gʻ (U+02BB) and ʼ (U+02BC), never ASCII ' or a typographic quote.
 *      This is the check that a spellchecker-driven edit would otherwise undo.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const I18N = path.join(ROOT, 'src', 'i18n');

const { SHIPPED_LOCALES, DEFAULT_LOCALE } = await import(path.join(I18N, 'locales.mjs'));

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

/* ---- 1: every shipped locale has a dictionary ---- */
const dicts = {};
for (const locale of SHIPPED_LOCALES) {
  const file = path.join(I18N, `${locale}.json`);
  if (!existsSync(file)) {
    fail(`MISSING DICTIONARY: src/i18n/${locale}.json — '${locale}' is in SHIPPED_LOCALES`);
    continue;
  }
  dicts[locale] = JSON.parse(readFileSync(file, 'utf8'));
}

const base = dicts[DEFAULT_LOCALE];
if (!base) {
  console.error(`check-i18n: the default locale '${DEFAULT_LOCALE}' has no dictionary. Nothing else can be checked.`);
  process.exit(1);
}
const baseKeys = Object.keys(base);

/* ---- 2 + 3 + 4: parity, emptiness, interpolation slots ---- */
const slots = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

for (const [locale, dict] of Object.entries(dicts)) {
  if (locale === DEFAULT_LOCALE) continue;

  const missing = baseKeys.filter((k) => dict[k] === undefined);
  if (missing.length)
    fail(
      `FALLBACK TO ${DEFAULT_LOCALE}: locale '${locale}' is missing ${missing.length} key(s) and would render ` +
        `${DEFAULT_LOCALE} text to a ${locale} reader — ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? ', ...' : ''}`,
    );

  const extra = Object.keys(dict).filter((k) => base[k] === undefined);
  if (extra.length) warn(`locale '${locale}' has ${extra.length} key(s) absent from ${DEFAULT_LOCALE}: ${extra.join(', ')}`);

  for (const k of baseKeys) {
    if (dict[k] === undefined) continue;
    if (String(dict[k]).trim() === '') fail(`EMPTY VALUE: ${locale}.json["${k}"] is blank — it would render as nothing`);
    if (slots(base[k]) !== slots(dict[k]))
      fail(
        `SLOT MISMATCH: "${k}" has {${slots(base[k]) || '-'}} in ${DEFAULT_LOCALE} but {${slots(dict[k]) || '-'}} in ${locale} — ` +
          `the ${locale} string would silently drop or invent a value`,
      );
  }
}
for (const k of baseKeys) if (String(base[k]).trim() === '') fail(`EMPTY VALUE: ${DEFAULT_LOCALE}.json["${k}"] is blank`);

/* ---- 5: used keys exist, declared keys are used ---- */
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
const sources = walk(path.join(ROOT, 'src')).filter((f) => /\.(astro|ts|tsx|mjs)$/.test(f));

const used = new Set();
const dynamicPrefixes = new Set();
for (const f of sources) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/\bt\(\s*'([^']+)'/g)) used.add(m[1]);
  for (const m of src.matchAll(/\bt\(\s*"([^"]+)"/g)) used.add(m[1]);
  // Template-literal keys: t(`country.${x}`) — record the static prefix so the
  // orphan check does not flag the whole family as unused.
  for (const m of src.matchAll(/\bt\(\s*`([^`$]*)\$\{/g)) dynamicPrefixes.add(m[1]);
  // Keys named indirectly through a lookup table, e.g. { title: 'why.fleet.title' }
  for (const m of src.matchAll(/'([a-z][\w]*(?:\.[\w-]+)+)'/g)) if (base[m[1]] !== undefined) used.add(m[1]);
}

for (const k of used) if (base[k] === undefined) fail(`UNKNOWN KEY: t('${k}') is called but no such key exists in ${DEFAULT_LOCALE}.json`);

const orphans = baseKeys.filter(
  (k) => !used.has(k) && ![...dynamicPrefixes].some((p) => k.startsWith(p)),
);
if (orphans.length) warn(`${orphans.length} key(s) declared but never used: ${orphans.join(', ')}`);

/* ---- 6: THE UZBEK ORTHOGRAPHY GATE (§13.2) ---- */
// oʻ / gʻ must use U+02BB MODIFIER LETTER TURNED COMMA, and the tutuq belgisi
// must be U+02BC — not ASCII ' (U+0027) and not a curly quote (U+2018/2019).
const BAD_APOSTROPHE = /[oOgG]['‘’`]|['‘’](?=[aeiouAEIOU])/;
const checkUzbek = (where, k, v) => {
  if (typeof v === 'string' && BAD_APOSTROPHE.test(v))
    fail(
      `UZBEK ORTHOGRAPHY: ${where}["${k}"] uses an ASCII or typographic apostrophe where Uzbek Latin ` +
        `requires U+02BB (oʻ, gʻ) or U+02BC (sanʼat) — "${v.slice(0, 60)}"`,
    );
};

if (dicts.uz) for (const [k, v] of Object.entries(dicts.uz)) checkUzbek('uz.json', k, v);

// locales.mjs carries the ONE Uzbek string that appears on EVERY page — the
// language switcher's own label. It sat outside this gate and was wrong.
const { LOCALE_LABELS } = await import(path.join(I18N, 'locales.mjs'));
for (const [k, v] of Object.entries(LOCALE_LABELS)) {
  if (k === 'uz') checkUzbek('locales.mjs LOCALE_LABELS', k, v);
}

// The tour/destination/review/promotion CONTENT is Uzbek prose too, and it is
// what the client will edit. Same rule, same failure.
const contentRoot = path.join(ROOT, 'src', 'content');
if (existsSync(contentRoot)) {
  for (const f of walk(contentRoot)) {
    if (!f.endsWith('.json') || path.basename(f).startsWith('_')) continue;
    const data = JSON.parse(readFileSync(f, 'utf8'));
    const uzBlock = data?.i18n?.uz;
    if (!uzBlock) continue;
    const rel = path.relative(ROOT, f);
    for (const [k, v] of Object.entries(uzBlock)) {
      if (typeof v === 'string') checkUzbek(rel, k, v);
      else if (Array.isArray(v)) v.forEach((item, i) => checkUzbek(rel, `${k}[${i}]`, typeof item === 'string' ? item : item?.text));
    }
  }
}

/* ------------------------------ report ------------------------------ */
console.log(
  `check-i18n: locales=${SHIPPED_LOCALES.join(',')}  keys=${baseKeys.length}  ` +
    `used=${used.size}  dynamic-prefixes=${[...dynamicPrefixes].join(' ') || 'none'}`,
);
for (const w of warnings) console.warn(`  WARN  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`  FAIL  ${e}`);
  console.error(`\ncheck-i18n: ${errors.length} error(s).`);
  process.exit(1);
}
console.log('check-i18n: all assertions passed.');
