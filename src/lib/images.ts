// PLAN §7.2 — image resolution, specified end to end.
//
// A bare filename string in a tour JSON has no documented path to <Image>
// optimisation. A Zod .refine() VALIDATES; it does not TRANSFORM (BC16), so the
// lookup below is the explicit transform half.
//
// Why a bare filename rather than Astro's image() schema helper: image() resolves
// paths RELATIVE TO THE CONTENT FILE, which is hostile to the non-technical editor
// the client is. A flat filename is what they see in analize/image-requirements.md
// and what they name the file they send back.
import type { ImageMetadata } from 'astro';

const imageMap = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/*.{webp,png,jpg,jpeg}',
  { eager: true },
);

/** Bare filenames present in src/assets/images — the set the schema validates against. */
export const imageKeys = new Set(Object.keys(imageMap).map((p) => p.split('/').pop()!));

/** BC16 — the transform half. Components call this before passing to <Image>. */
export function resolveImage(filename: string): ImageMetadata {
  const entry = imageMap['/src/assets/images/' + filename];
  if (!entry) throw new Error(`Image not found in src/assets/images: ${filename}`);
  return entry.default;
}

/** Non-throwing variant: a missing photo must never block a client publish (§7.1). */
export function tryResolveImage(filename: string | undefined): ImageMetadata | null {
  if (!filename) return null;
  return imageMap['/src/assets/images/' + filename]?.default ?? null;
}
