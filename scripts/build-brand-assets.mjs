// Derives every brand asset the site ships from ONE source file:
// src/assets/brand/logo-source.jpg — the logo the client supplied.
//
// Everything else (favicons, the Apple touch icon, the PWA icons, the in-page
// mark) is GENERATED, never hand-edited, so the client can replace one file and
// re-run this instead of re-cutting nine sizes by hand.
//
//   node scripts/build-brand-assets.mjs
//
// The source is a circular badge that fills its square frame edge to edge, so the
// alpha mask below is a full-bleed circle. If the client ever sends a logo with
// its own margin, adjust INSET rather than re-cropping the file.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src', 'assets', 'brand', 'logo-source.jpg');
const IMAGES = path.join(ROOT, 'src', 'assets', 'images');
const PUBLIC = path.join(ROOT, 'public');

if (!fs.existsSync(SRC)) {
  console.error(`Missing ${path.relative(ROOT, SRC)} — put the client's logo there first.`);
  process.exit(1);
}

const INSET = 0; // px of the source frame that is NOT part of the badge
const meta = await sharp(SRC).metadata();
const side = Math.min(meta.width, meta.height) - INSET * 2;
const r = side / 2;

/** The badge, as a square PNG with everything outside the circle transparent. */
const circleMask = Buffer.from(
  `<svg width="${side}" height="${side}"><circle cx="${r}" cy="${r}" r="${r}" fill="#fff"/></svg>`,
);
const round = await sharp(SRC)
  .extract({ left: Math.round((meta.width - side) / 2), top: Math.round((meta.height - side) / 2), width: side, height: side })
  .composite([{ input: circleMask, blend: 'dest-in' }])
  .png()
  .toBuffer();

const write = async (buf, file, note) => {
  fs.writeFileSync(file, buf);
  console.log(`  ✓ ${path.relative(ROOT, file).padEnd(42)} ${(buf.length / 1024).toFixed(1).padStart(6)} KB  ${note}`);
};

/* ---- the in-page mark: header, footer and the root language picker ---- */
await write(
  await sharp(round).resize(512, 512).png({ compressionLevel: 9, palette: true, quality: 92 }).toBuffer(),
  path.join(IMAGES, 'logo-getcar-512x512.png'),
  'header / footer mark (transparent)',
);

/* ---- favicons. PNG, not SVG: the logo is a photograph of a flag badge and
        cannot be vectorised without becoming a different drawing. ---- */
for (const s of [32, 48, 192]) {
  await write(
    await sharp(round).resize(s, s).png({ compressionLevel: 9, palette: true, quality: 92 }).toBuffer(),
    path.join(PUBLIC, s === 32 ? 'favicon.png' : `icon-${s}.png`),
    `favicon ${s}px`,
  );
}

/* ---- Apple touch icon. iOS composites onto BLACK when alpha is present, which
        would ring the badge in black, so this one is flattened onto white. ---- */
await write(
  await sharp(round).resize(180, 180).flatten({ background: '#ffffff' }).png({ compressionLevel: 9, palette: true, quality: 92 }).toBuffer(),
  path.join(PUBLIC, 'apple-touch-icon.png'),
  'iOS home screen (opaque)',
);

/* ---- Maskable PWA icon. Android crops to an arbitrary shape and keeps only the
        inner 80% "safe zone", so the badge is inset and the surround is the brand
        colour rather than transparency. ---- */
const safe = Math.round(512 * 0.78);
await write(
  await sharp({ create: { width: 512, height: 512, channels: 4, background: '#0c4a5a' } })
    .composite([{ input: await sharp(round).resize(safe, safe).toBuffer(), gravity: 'center' }])
    .png({ compressionLevel: 9, palette: true, quality: 92 })
    .toBuffer(),
  path.join(PUBLIC, 'icon-512.png'),
  'PWA maskable (safe-zone inset)',
);

/* ---- The old vector favicon drew a generic paper plane that is not the
        client's mark. Removing it also removes the `type="image/svg+xml"` link
        that would otherwise WIN over the PNGs in every modern browser. ---- */
const staleSvg = path.join(PUBLIC, 'favicon.svg');
if (fs.existsSync(staleSvg)) {
  fs.unlinkSync(staleSvg);
  console.log('  ✗ public/favicon.svg                        removed (generic placeholder mark)');
}

console.log('\nBrand assets rebuilt from src/assets/brand/logo-source.jpg');
