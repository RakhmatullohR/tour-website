import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "src", "assets", "images");

export async function processAndSaveImage(inputPath, filename, targetWidth, targetHeight, maxBudgetKB = 175) {
  const outputPath = path.join(OUT_DIR, filename);
  let quality = 84;
  let buffer;

  while (quality >= 40) {
    buffer = await sharp(inputPath)
      .resize(targetWidth, targetHeight, { fit: "cover", position: "center" })
      .webp({ quality, effort: 6 })
      .toBuffer();

    if (buffer.length <= maxBudgetKB * 1024 || quality <= 42) {
      break;
    }
    quality -= 4;
  }

  fs.writeFileSync(outputPath, buffer);
  console.log(`Processed ${filename}: ${targetWidth}x${targetHeight}, ${(buffer.length / 1024).toFixed(1)} KB (quality: ${quality})`);
  return outputPath;
}
