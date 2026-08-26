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

  // The floor used to be 42, and the loop broke there whether or not the budget
  // was met — so a busy photograph (dense foliage, a market stall, a reef) simply
  // shipped over budget and check-images failed on it later. The floor is now 28,
  // and `smartSubsample` buys roughly another 8% on exactly those images by
  // subsampling chroma rather than throwing away more luma detail.
  while (quality >= 28) {
    buffer = await sharp(inputPath)
      .resize(targetWidth, targetHeight, { fit: "cover", position: "center" })
      .webp({ quality, effort: 6, smartSubsample: true })
      .toBuffer();

    if (buffer.length <= maxBudgetKB * 1024) break;
    quality -= 6;
  }

  if (buffer.length > maxBudgetKB * 1024)
    console.warn(`  WARN ${filename} is ${(buffer.length / 1024).toFixed(0)} KB at the q28 floor — budget ${maxBudgetKB} KB`);

  fs.writeFileSync(outputPath, buffer);
  console.log(`Processed ${filename}: ${targetWidth}x${targetHeight}, ${(buffer.length / 1024).toFixed(1)} KB (quality: ${quality})`);
  return outputPath;
}
