import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "src", "assets", "images");

// High resolution curated photo mapping
const photoMap = {
  // Tour Covers
  "tour-ozbekiston-samarqand-cover-1200x800.webp": "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=1800&q=80",
  "tour-ozbekiston-xiva-cover-1200x800.webp": "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1800&q=80",
  "tour-malayziya-kuala-lumpur-cover-1200x800.webp": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1800&q=80",
  "tour-reserve-01-cover-1200x800.webp": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=80",
  "tour-reserve-02-cover-1200x800.webp": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1800&q=80",
  "tour-reserve-03-cover-1200x800.webp": "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1800&q=80",

  // About, CTA, Promo
  "about-team-1600x900.webp": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80",
  "cta-bg-1600x900.webp": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=80",
  "promo-banner-01-1600x600.webp": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80",
  "promo-banner-02-1600x600.webp": "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=2000&q=80",

  // Destination Hero Panoramas
  "dest-turkiya-hero-1600x600.webp": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=2000&q=80",
  "dest-dubay-hero-1600x600.webp": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2000&q=80",
  "dest-misr-hero-1600x600.webp": "https://images.unsplash.com/photo-1503152394-c571994fd383?auto=format&fit=crop&w=2000&q=80",
  "dest-tailand-hero-1600x600.webp": "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2000&q=80",
  "dest-malayziya-hero-1600x600.webp": "https://images.unsplash.com/photo-1546412414-e1885259563a?auto=format&fit=crop&w=2000&q=80",
  "dest-ozbekiston-hero-1600x600.webp": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=2000&q=80",

  // Avatars
  "avatar-01-200x200.webp": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  "avatar-02-200x200.webp": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  "avatar-03-200x200.webp": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80",
  "avatar-04-200x200.webp": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
  "avatar-05-200x200.webp": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  "avatar-06-200x200.webp": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",

  // Team
  "team-01-600x800.webp": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1000&q=80",
  "team-02-600x800.webp": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80",
  "team-03-600x800.webp": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1000&q=80",

  // Blog Covers
  "blog-01-cover-1200x630.webp": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1800&q=80",
  "blog-02-cover-1200x630.webp": "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1800&q=80",
  "blog-03-cover-1200x630.webp": "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1800&q=80",
  "blog-04-cover-1200x630.webp": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1800&q=80",
  "blog-05-cover-1200x630.webp": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1800&q=80",
  "blog-06-cover-1200x630.webp": "https://images.unsplash.com/photo-1544885935-98dd03b09034?auto=format&fit=crop&w=1800&q=80",

  // Tour Galleries (Antalya)
  "tour-turkiya-antalya-01-1600x1067.webp": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80",
  "tour-turkiya-antalya-02-1600x1067.webp": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=2000&q=80",
  "tour-turkiya-antalya-03-1600x1067.webp": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80",
  "tour-turkiya-antalya-04-1600x1067.webp": "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=2000&q=80",

  // Tour Galleries (Istanbul)
  "tour-turkiya-istanbul-01-1600x1067.webp": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2000&q=80",
  "tour-turkiya-istanbul-02-1600x1067.webp": "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=2000&q=80",
  "tour-turkiya-istanbul-03-1600x1067.webp": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=2000&q=80",
  "tour-turkiya-istanbul-04-1600x1067.webp": "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=2000&q=80",

  // Tour Galleries (Dubai)
  "tour-dubay-01-1600x1067.webp": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2000&q=80",
  "tour-dubay-02-1600x1067.webp": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=80",
  "tour-dubay-03-1600x1067.webp": "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?auto=format&fit=crop&w=2000&q=80",
  "tour-dubay-04-1600x1067.webp": "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=2000&q=80",

  // Tour Galleries (Phuket)
  "tour-tailand-phuket-01-1600x1067.webp": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2000&q=80",
  "tour-tailand-phuket-02-1600x1067.webp": "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=2000&q=80",
  "tour-tailand-phuket-03-1600x1067.webp": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=2000&q=80",
  "tour-tailand-phuket-04-1600x1067.webp": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80",

  // Tour Galleries (Sharm)
  "tour-misr-sharm-01-1600x1067.webp": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2000&q=80",
  "tour-misr-sharm-02-1600x1067.webp": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=2000&q=80",
  "tour-misr-sharm-03-1600x1067.webp": "https://images.unsplash.com/photo-1544885935-98dd03b09034?auto=format&fit=crop&w=2000&q=80",
  "tour-misr-sharm-04-1600x1067.webp": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=2000&q=80",

  // Tour Galleries (Samarkand)
  "tour-ozbekiston-samarqand-01-1600x1067.webp": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80",
  "tour-ozbekiston-samarqand-02-1600x1067.webp": "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=2000&q=80",
  "tour-ozbekiston-samarqand-03-1600x1067.webp": "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=2000&q=80",
  "tour-ozbekiston-samarqand-04-1600x1067.webp": "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=2000&q=80",

  // Tour Galleries (Kuala Lumpur)
  "tour-malayziya-kuala-lumpur-01-1600x1067.webp": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2000&q=80",
  "tour-malayziya-kuala-lumpur-02-1600x1067.webp": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=2000&q=80",
  "tour-malayziya-kuala-lumpur-03-1600x1067.webp": "https://images.unsplash.com/photo-1508964942454-1a56651d54ac?auto=format&fit=crop&w=2000&q=80",
  "tour-malayziya-kuala-lumpur-04-1600x1067.webp": "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=2000&q=80",

  // Tour Galleries (Khiva)
  "tour-ozbekiston-xiva-01-1600x1067.webp": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80",
  "tour-ozbekiston-xiva-02-1600x1067.webp": "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=2000&q=80",
  "tour-ozbekiston-xiva-03-1600x1067.webp": "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=2000&q=80",
  "tour-ozbekiston-xiva-04-1600x1067.webp": "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=2000&q=80",
};

async function downloadAndProcess(url, filename, width, height, budgetKB = 175) {
  const outPath = path.join(OUT_DIR, filename);
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error("HTTP " + res.status + ": " + res.statusText);
    const buf = Buffer.from(await res.arrayBuffer());

    let quality = 84;
    let webpBuf;
    while (quality >= 38) {
      webpBuf = await sharp(buf)
        .resize(width, height, { fit: "cover", position: "center" })
        .webp({ quality, effort: 6 })
        .toBuffer();
      if (webpBuf.length <= budgetKB * 1024 || quality <= 40) break;
      quality -= 4;
    }
    fs.writeFileSync(outPath, webpBuf);
    console.log("OK: " + filename + " (" + width + "x" + height + ", " + (webpBuf.length/1024).toFixed(1) + " KB, q=" + quality + ")");
    return true;
  } catch (err) {
    console.error("FAILED: " + filename + " — " + err.message);
    return false;
  }
}

async function createOgBanners() {
  const ogItems = [
    { file: "og-default-1200x630.webp", title: "GETCAR TRAVEL", subtitle: "Dunyo boʻylab unutilmas sayohatlar" },
    { file: "og-ru-1200x630.webp", title: "GETCAR TRAVEL", subtitle: "Незабываемые путешествия по всему миру" },
    { file: "og-en-1200x630.webp", title: "GETCAR TRAVEL", subtitle: "Unforgettable journeys around the world" },
    { file: "og-ms-1200x630.webp", title: "GETCAR TRAVEL", subtitle: "Percutian impian anda ke seluruh dunia" }
  ];

  const heroPath = path.join(OUT_DIR, "hero-main-1920x1080.webp");
  const bgBase = await sharp(heroPath)
    .resize(1200, 630, { fit: "cover", position: "center" })
    .toBuffer();

  for (const item of ogItems) {
    const svgOverlay = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ogGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#06232b" stop-opacity="0.88"/>
          <stop offset="60%" stop-color="#0c4a5a" stop-opacity="0.75"/>
          <stop offset="100%" stop-color="#1189a6" stop-opacity="0.6"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#ogGrad)"/>
      <g transform="translate(80, 140)">
        <rect width="160" height="6" rx="3" fill="#f2a03d"/>
        <text x="0" y="70" font-family="system-ui, sans-serif" font-size="58" font-weight="900" fill="#ffffff" letter-spacing="1">
          ` + item.title + `
        </text>
        <text x="0" y="130" font-family="system-ui, sans-serif" font-size="28" font-weight="500" fill="#f2a03d">
          ` + item.subtitle + `
        </text>
        <g transform="translate(0, 190)">
          <rect width="280" height="54" rx="27" fill="#f2a03d"/>
          <text x="140" y="34" font-family="system-ui, sans-serif" font-size="20" font-weight="700" fill="#06232b" text-anchor="middle">
            getcartravel.uz
          </text>
        </g>
      </g>
    </svg>`;

    const compositeBuf = await sharp(bgBase)
      .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
      .webp({ quality: 80, effort: 6 })
      .toBuffer();

    fs.writeFileSync(path.join(OUT_DIR, item.file), compositeBuf);
    console.log("OK OG: " + item.file + " (" + (compositeBuf.length/1024).toFixed(1) + " KB)");
  }
}

async function run() {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/images.manifest.json"), "utf8"));
  console.log("Processing " + Object.keys(photoMap).length + " photos...");

  for (const [filename, url] of Object.entries(photoMap)) {
    const row = manifest.images.find(r => r.filename === filename);
    if (!row) {
      console.warn("Manifest row not found for " + filename);
      continue;
    }
    await downloadAndProcess(url, filename, row.width, row.height, 175);
  }

  await createOgBanners();
  console.log("All downloads & OG banners completed!");
}

run();
