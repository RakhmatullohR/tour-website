#!/usr/bin/env node
/**
 * check-contrast.mjs — PLAN §18 manual check 9, automated.
 *
 *   node scripts/check-contrast.mjs
 *
 * §13.1 states the contrast rule as "NOT A CLAIM": every final foreground /
 * background pairing must be verified, and "no combination ships on assumption".
 * A comment in tokens.css cannot enforce that; this can.
 *
 * The pairs below are the ones the components ACTUALLY render. Adding a new
 * colour combination to a component without adding it here is the mistake this
 * file exists to catch — so the list is deliberately explicit, not derived.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(path.join(ROOT, 'src', 'styles', 'tokens.css'), 'utf8');

/** Read the palette from tokens.css itself, so this can never drift from source. */
const TOKENS = Object.fromEntries(
  [...css.matchAll(/--color-([\w-]+):\s*(#[0-9a-fA-F]{6});/g)].map((m) => [m[1], m[2]]),
);
const WHITE = '#ffffff';

const srgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const lum = (hex) =>
  srgb(hex)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((t, c, i) => t + c * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const col = (name) => (name === 'white' ? WHITE : (TOKENS[name] ?? null));

/* fg, bg, minimum, where it is rendered.
 * 4.5 = body text · 3.0 = large text (>=24px, or >=19px bold) and UI borders. */
const PAIRS = [
  ['white', 'brand-700', 4.5, 'Button variant=primary'],
  ['brand-900', 'accent-500', 4.5, 'Button variant=accent, discount Badge'],
  ['brand-700', 'white', 4.5, 'Button variant=secondary/ghost, links'],
  ['brand-600', 'white', 4.5, 'the logo accent word — inline with text, so SMALL-text rules apply'],
  ['neutral-800', 'neutral-50', 4.5, 'body text on the page background'],
  ['neutral-800', 'white', 4.5, 'body text on cards'],
  ['neutral-600', 'white', 4.5, 'secondary text, card summaries, breadcrumbs'],
  ['neutral-600', 'neutral-50', 4.5, 'secondary text on the page background'],
  ['brand-900', 'white', 4.5, 'headings on cards'],
  ['brand-900', 'neutral-50', 4.5, 'headings on the page background'],
  ['brand-700', 'neutral-50', 4.5, 'links on the page background'],
  ['white', 'brand-900', 4.5, 'footer text, dark section headings'],
  ['neutral-200', 'brand-900', 4.5, 'footer body text'],
  ['neutral-400', 'brand-900', 4.5, 'footer muted text'],
  ['accent-500', 'brand-900', 3.0, 'accent detail on dark sections (large text only)'],
  ['neutral-100', 'brand-900', 4.5, 'hero subhead'],
  ['brand-300', 'brand-900', 3.0, 'the 404 numeral and step numerals (large)'],
];

/* ⚠️ THE PAIRINGS THAT MUST FAIL — §13.1 names white-on-brand-500 explicitly and
 * says it "must never carry small text". A guard that only proves the good pairs
 * pass would not notice the day someone adds a bg-brand-500 button. */
const MUST_FAIL = [
  ['white', 'brand-500', 4.5, '§13.1: white on --brand-500 must NEVER carry small text'],
  ['brand-500', 'white', 4.5, '--brand-500 on white is large-text only (>=3:1); use brand-600 for small text'],
  ['neutral-400', 'white', 4.5, 'muted grey on white — too low for small text; use neutral-600'],
];

const errors = [];
let checked = 0;

for (const [fg, bg, min, where] of PAIRS) {
  const a = col(fg);
  const b = col(bg);
  if (!a || !b) { errors.push(`UNKNOWN TOKEN in pair ${fg}/${bg} — not declared in tokens.css`); continue; }
  const r = ratio(a, b);
  checked++;
  const ok = r >= min;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${fg} on ${bg}  — ${where}`);
  if (!ok) errors.push(`CONTRAST: ${fg} on ${bg} is ${r.toFixed(2)}:1, below the required ${min}:1 — ${where}`);
}

console.log('\n  Pairings that MUST stay below threshold (the negative test):');
for (const [fg, bg, min, why] of MUST_FAIL) {
  const r = ratio(col(fg), col(bg));
  checked++;
  const stillBad = r < min;
  console.log(`  ${stillBad ? 'OK' : 'ALERT'}  ${r.toFixed(2).padStart(5)}:1  ${fg} on ${bg}  — ${why}`);
  if (!stillBad)
    errors.push(
      `The palette changed so that ${fg} on ${bg} now passes ${min}:1. That is not a failure — but the rule in ` +
        `tokens.css and §13.1 is now stale and must be rewritten deliberately, not silently.`,
    );
}

console.log(`\ncheck-contrast: ${checked} pairing(s) checked against WCAG 2.1 AA.`);
if (errors.length) {
  for (const e of errors) console.error(`  FAIL  ${e}`);
  process.exit(1);
}
console.log('check-contrast: all pairings pass.');
