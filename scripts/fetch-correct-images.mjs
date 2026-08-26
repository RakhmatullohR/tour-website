// One-shot repair + extension of src/assets/images.
//
// WHY THIS EXISTS. The first image pass (scripts/fetch-and-build-all-images.mjs)
// mapped filenames to Unsplash IDs that were never verified against the SUBJECT
// the filename claims. A visual audit of all 85 assets found the covers and
// galleries were substantially wrong — not "a bit generic", but a different
// country: Moscow's St Basil's shipped as the Samarkand tour cover, a Tokyo
// street as the Sharm el-Sheikh cover, the Parthenon as the Egypt hero, the Taj
// Mahal as the Uzbekistan hero, Burj Al Arab as the Malaysia hero, Scotland and
// Norway inside the Dubai gallery, Singapore inside the Malaysia gallery.
//
// A tour operator's photograph is a factual claim about what the customer will
// see. Every ID below was read back from its own Unsplash search page together
// with the photographer's alt text, and every processed file was re-checked as a
// contact sheet before being committed. Anything that survived the audit is NOT
// in this map — the map is deliberately a repair list, not a full re-download.
//
// Re-run: `node scripts/fetch-correct-images.mjs` (network required).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { processAndSaveImage } from './process-images.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TMP = path.join(ROOT, '.image-cache');
const U = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=2200&q=85`;

/** filename -> [unsplash path, width, height, subject (for the audit trail)] */
const MAP = {
  /* ---------- UZBEKISTAN: Samarkand + Bukhara ---------- */
  // was: St Basil's Cathedral, Moscow — a different country.
  'tour-ozbekiston-samarqand-cover-1200x800.webp': ['photo-1715540335937-f54bf332585a', 1200, 800, 'Registon, Samarqand'],
  'tour-ozbekiston-samarqand-01-1600x1067.webp': ['photo-1605199423916-b725a00b324b', 1600, 1067, 'Registon maydoni'],
  'tour-ozbekiston-samarqand-02-1600x1067.webp': ['photo-1664602078796-68ee76b3fc59', 1600, 1067, 'Samarqand gumbazi'],
  'tour-ozbekiston-samarqand-03-1600x1067.webp': ['photo-1653023102302-247f5f0fbdd1', 1600, 1067, 'Buxoro, koʻk gumbaz'],
  'tour-ozbekiston-samarqand-04-1600x1067.webp': ['photo-1503806837798-ea0ce2e6402e', 1600, 1067, 'Buxoro, tarixiy markaz'],

  /* ---------- UZBEKISTAN: Khiva ---------- */
  // Was an airliner on a runway — for a tour that travels by train.
  //
  // SECOND PASS. The first replacement set came from an "Khiva" search whose top
  // results are mostly SAMARKAND AND BUKHARA: the cover landed on the Registan,
  // and two gallery slots on Poi Kalyan. Inside Uzbekistan that is still the wrong
  // city on a page named "Ichan qalʼa", and the customer who books it is the one
  // who finds out. These five were re-picked from `itchan-kala-khiva` and
  // `kalta-minor-minaret` and each was checked on a contact sheet: Khiva's
  // mud-brick walls and banded turquoise minaret are unmistakable next to
  // Samarkand's ribbed blue domes.
  'tour-ozbekiston-xiva-cover-1200x800.webp': ['photo-1774851406797-cd9ace6d6d6a', 1200, 800, 'Ichan qalʼa, Xiva'],
  'tour-ozbekiston-xiva-01-1600x1067.webp': ['photo-1728281522185-0c06b2d7a598', 1600, 1067, 'Kalta minor va qalʼa devori'],
  'tour-ozbekiston-xiva-02-1600x1067.webp': ['photo-1774851187747-c63297439857', 1600, 1067, 'Kalta minor va bozor'],
  'tour-ozbekiston-xiva-03-1600x1067.webp': ['photo-1744177332411-9a57cd922af7', 1600, 1067, 'Feruza gumbazlar'],
  'tour-ozbekiston-xiva-04-1600x1067.webp': ['photo-1728281711729-a3b3424e6c1e', 1600, 1067, 'Ichan qalʼa koʻchasi'],

  /* ---------- EGYPT: Sharm el-Sheikh ---------- */
  // was: a neon Tokyo street as the COVER of a Red Sea beach package.
  'tour-misr-sharm-cover-1200x800.webp': ['photo-1708694423464-0f5b19fb2444', 1200, 800, 'Sharm ash-Shayx kurorti'],
  'tour-misr-sharm-01-1600x1067.webp': ['photo-1748284813660-77495057c36d', 1600, 1067, 'Qizil dengiz sohili'],
  'tour-misr-sharm-02-1600x1067.webp': ['photo-1651871756929-09d7bde4e97d', 1600, 1067, 'Rif va baliqlar'],
  'tour-misr-sharm-03-1600x1067.webp': ['photo-1681158077449-77f23f629f0d', 1600, 1067, 'Qayiqlar, Qizil dengiz'],
  'tour-misr-sharm-04-1600x1067.webp': ['photo-1659188548843-265559c6b675', 1600, 1067, 'Qumli plyaj'],

  /* ---------- UAE: Dubai ---------- */
  // 03 was the Scottish Highlands, 04 a Norwegian fjord.
  'tour-dubay-01-1600x1067.webp': ['photo-1512453979798-5ea266f8880c', 1600, 1067, 'Burj Khalifa'],
  'tour-dubay-02-1600x1067.webp': ['photo-1624062999726-083e5268525d', 1600, 1067, 'Sahro safari'],
  'tour-dubay-03-1600x1067.webp': ['photo-1549944850-84e00be4203b', 1600, 1067, 'Tuyalar, sahro'],
  'tour-dubay-04-1600x1067.webp': ['photo-1607414851776-f2fcc379fb48', 1600, 1067, 'Dubay ufqi, kechqurun'],

  /* ---------- THAILAND: Phuket ---------- */
  'tour-tailand-phuket-01-1600x1067.webp': ['photo-1506665531195-3566af2b4dfa', 1600, 1067, 'Phi Phi orollari'],
  'tour-tailand-phuket-02-1600x1067.webp': ['photo-1586820672103-2272d8490ade', 1600, 1067, 'Katta Budda, Phuket'],
  'tour-tailand-phuket-03-1600x1067.webp': ['photo-1504214208698-ea1916a2195a', 1600, 1067, 'Longteyl qayiqlar'],
  'tour-tailand-phuket-04-1600x1067.webp': ['photo-1520961810802-7f0a32de665a', 1600, 1067, 'Phang Nga qoyalari'],

  /* ---------- MALAYSIA: Kuala Lumpur + Langkawi ---------- */
  // 03 was Gardens by the Bay — Singapore, not Malaysia.
  'tour-malayziya-kuala-lumpur-01-1600x1067.webp': ['photo-1566914447826-bf04e54bf1be', 1600, 1067, 'Petronas minoralari'],
  'tour-malayziya-kuala-lumpur-02-1600x1067.webp': ['flagged/photo-1560505455-11cee7a131b0', 1600, 1067, 'Batu gʻorlari'],
  'tour-malayziya-kuala-lumpur-03-1600x1067.webp': ['photo-1622665645573-b0b5dea09d98', 1600, 1067, 'Langkavi kanat yoʻli'],
  'tour-malayziya-kuala-lumpur-04-1600x1067.webp': ['photo-1703855433576-bc21410b1582', 1600, 1067, 'Langkavi plyaji'],

  /* ---------- TURKEY: Antalya ---------- */
  // 04 was hikers in the Dolomites.
  'tour-turkiya-antalya-01-1600x1067.webp': ['photo-1648325129746-abcc1b872380', 1600, 1067, 'Antalya porti'],
  'tour-turkiya-antalya-02-1600x1067.webp': ['photo-1641227059171-624465a39750', 1600, 1067, 'Kaleichi eski shahri'],
  'tour-turkiya-antalya-03-1600x1067.webp': ['photo-1633145528115-2e067cd0a482', 1600, 1067, 'Sohilda quyosh botishi'],
  'tour-turkiya-antalya-04-1600x1067.webp': ['photo-1711712667984-5b9b291272c0', 1600, 1067, 'Antalya sohili va togʻlar'],

  /* ---------- TURKEY: Istanbul ---------- */
  // 02 was a burger and fries; 04 a generic European alley.
  'tour-turkiya-istanbul-01-1600x1067.webp': ['photo-1623621534850-d325a1980c7e', 1600, 1067, 'Ayasofya'],
  'tour-turkiya-istanbul-02-1600x1067.webp': ['photo-1568592014308-076036f4f4b4', 1600, 1067, 'Katta bozor chiroqlari'],
  'tour-turkiya-istanbul-04-1600x1067.webp': ['photo-1589561454226-796a8aa89b05', 1600, 1067, 'Bosfor va Eminonu'],

  /* ---------- DESTINATION HEROES (1600x600) ---------- */
  // These three shipped a different country than the page they head:
  //   ozbekiston -> Taj Mahal (India) · misr -> Parthenon (Greece) · malayziya -> Burj Al Arab (Dubai)
  'dest-ozbekiston-hero-1600x600.webp': ['photo-1719144065955-89a4dadaba41', 1600, 600, 'Registon kechqurun'],
  'dest-misr-hero-1600x600.webp': ['photo-1541769740-098e80269166', 1600, 600, 'Giza piramidalari'],
  'dest-malayziya-hero-1600x600.webp': ['photo-1577931683033-1059552104e0', 1600, 600, 'Kuala-Lumpur ufqi'],

  /* ---------- INDONESIA (new country) ---------- */
  'dest-indoneziya-01-800x1000.webp': ['photo-1604999333679-b86d54738315', 800, 1000, 'Bali ibodatxonasi'],
  'dest-indoneziya-hero-1600x600.webp': ['photo-1555400038-63f5ba517a47', 1600, 600, 'Tegallalang sholi terrasalari'],
  'tour-indoneziya-bali-cover-1200x800.webp': ['photo-1518548419970-58e3b4079ab2', 1200, 800, 'Tanah Lot ibodatxonasi'],
  'tour-indoneziya-bali-01-1600x1067.webp': ['photo-1555400038-63f5ba517a47', 1600, 1067, 'Sholi terrasalari, Ubud'],
  'tour-indoneziya-bali-02-1600x1067.webp': ['photo-1544644181-1484b3fdfc62', 1600, 1067, 'Ulun Danu Bratan'],
  'tour-indoneziya-bali-03-1600x1067.webp': ['photo-1577717903315-1691ae25ab3f', 1600, 1067, 'Nusa Penida qoyalari'],
  'tour-indoneziya-bali-04-1600x1067.webp': ['photo-1574079899277-78c0454deba7', 1600, 1067, 'Bali darvozasi'],
};

fs.mkdirSync(TMP, { recursive: true });

const fetchOnce = async (url, dest, attempt = 1) => {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'getcar-travel-build/1.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  } catch (e) {
    if (attempt >= 3) throw e;
    await new Promise((r) => setTimeout(r, 800 * attempt));
    return fetchOnce(url, dest, attempt + 1);
  }
};

let ok = 0;
const failures = [];
for (const [file, [id, w, h, subject]] of Object.entries(MAP)) {
  const cached = path.join(TMP, id.replace(/\//g, '_') + '.jpg');
  try {
    if (!fs.existsSync(cached)) await fetchOnce(U(id), cached);
    await processAndSaveImage(cached, file, w, h);
    console.log(`  ✓ ${file}  —  ${subject}`);
    ok++;
  } catch (e) {
    failures.push(`${file}: ${e.message}`);
    console.error(`  ✗ ${file}  —  ${e.message}`);
  }
}

console.log(`\n${ok}/${Object.keys(MAP).length} images written.`);
if (failures.length) {
  console.error('FAILED:\n  ' + failures.join('\n  '));
  process.exit(1);
}
