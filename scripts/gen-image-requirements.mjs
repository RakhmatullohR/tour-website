#!/usr/bin/env node
/**
 * gen-image-requirements.mjs — IMAGE-BRIEF-SPEC §6
 *
 *   node scripts/gen-image-requirements.mjs  ->  analize/image-requirements.md
 *
 * THE CLIENT-FACING DOCUMENT. Uzbek, Latin script only, never Cyrillic.
 *
 * THE MOST IMPORTANT RULE (§6.1): only rows with clientPhotoRequired: true appear.
 *   85 would make the client abandon the project.
 *   26 asks for six things they cannot photograph and looks careless.
 *   20 is achievable, and it is the number question 13 already promises them.
 *
 * Every count in the prose is COMPUTED from the manifest, never typed. Output is
 * idempotent: the same manifest yields a byte-identical file, no timestamps.
 * No blockquotes and no ** emphasis — the client pastes sections into Telegram,
 * which renders those literally (same reasoning as BC17f).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(path.join(ROOT, 'scripts', 'images.manifest.json'), 'utf8'));

const ask = (tier) => manifest.images.filter((r) => r.tier === tier && r.clientPhotoRequired);
const stage1 = ask(1);
const stage2 = ask(2);

const cell = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

function table(rows) {
  const head =
    '| # | Nima aks etishi kerak | Eng kichik oʻlcham | Yoʻnalishi | Qayerda koʻrinadi | Fayl nomi |\n' +
    '|---:|---|---|---|---|---|\n';
  return head + rows.map((r, i) =>
    `| ${i + 1} | ${cell(r.uz)} | ${r.width} × ${r.height} px | ${r.orientation} | ${cell((r.usedIn ?? []).join(', '))} | \`${r.filename}\` |`,
  ).join('\n') + '\n';
}

const doc = `# Getcar_travel — sayt uchun kerak boʻlgan rasmlar

## Qisqacha

Birinchi bosqich uchun ${stage1.length} ta rasm kerak.

Har bir rasm uchun quyida yozilgan: nima aks etishi kerak, qanday oʻlcham, gorizontalmi yoki vertikal.
Fayl nomini oʻzgartirmang — biz saytga aynan shu nom bilan qoʻyamiz. Nomini oʻzgartirsangiz ham boʻladi,
u holda biz oʻzimiz nomlaymiz, lekin qaysi rasm qaysi joyga tushishini yozib yuboring.

Hozircha sayt vaqtinchalik oʻrindosh rasmlar bilan ishlab turadi — ya'ni sayt ochiq boʻlaveradi.
Haqiqiy rasmlar kelgach biz ularni almashtiramiz.

## Muallif huquqi — muhim ogohlantirish

Internetdan yoki Google'dan olingan rasmlarni saytga qoʻyib boʻlmaydi.

Rasmlarning deyarli barchasi kimningdir mulki. Boshqa birovning suratini ruxsatsiz ishlatish —
muallif huquqini buzish hisoblanadi. Bunday hollarda surat egasi yoki uning vakili sizdan
kompensatsiya talab qilishi, saytdan suratni olib tashlashni talab qilishi mumkin. Bu haqiqiy
xavf — turizm sohasidagi suratlar ayniqsa faol nazorat qilinadi.

Qaysi rasmlarni ishlatsa boʻladi:

- Oʻzingiz yoki xodimlaringiz suratga olgan rasmlar — eng yaxshisi shu, chunki ular haqiqiy va ishonch uygʻotadi.
- Mijozlaringiz yuborgan rasmlar — ulardan yozma ruxsat olgan boʻlsangiz.
- Hamkor mehmonxona yoki tur operatori rasmiy ravishda bergan rasmlar — ruxsatni yozma olib qoʻying.
- Litsenziyasi sotib olingan stok rasmlar (masalan Shutterstock, Adobe Stock, Getty). Chek va litsenziyani saqlang.
- Bepul litsenziyali stok rasmlar (Unsplash, Pexels) — bepul, lekin odamlar aniq koʻringan rasmlarni tijorat uchun ishlatishda ehtiyot boʻling.

Qaysi rasmlarni ishlatib boʻlmaydi:

- Google Rasmlar (Google Images) qidiruvidan olingan har qanday rasm.
- Boshqa turizm kompaniyasining saytidan yoki Instagram sahifasidan olingan rasm.
- Suv belgisi (watermark) turgan rasm — bu ochiq-oydin boshqa birovniki degani.
- Internetdan olingan, kimniki ekani noma'lum rasm.

Rasm topilmasa nima qilamiz: biz sizga vaqtinchalik oʻrindosh rasm bilan saytni ishga tushiramiz —
sayt ochiq boʻlaveradi. Haqiqiy rasmlar kelgach almashtiramiz. Xohlasangiz, litsenziyali stok rasm
tanlab berishimiz mumkin — bu alohida hisoblanadi va litsenziya narxi ustiga qoʻshiladi.

## 1-BOSQICH — hozir kerak (${stage1.length} ta rasm)

Sayt ishga tushishi uchun shu ${stage1.length} ta rasm yetarli.

${table(stage1)}
## 2-BOSQICH — keyin (${stage2.length} ta rasm, shoshilinch emas)

Bu roʻyxatni hozir toʻldirish shart emas. Sayt ishga tushgandan keyin bosqichma-bosqich qoʻshamiz.
Toʻliq rasm chiqishi uchun qanday rasmlar kerak boʻlishini oldindan bilib qoʻyishingiz uchun yozdik.

${table(stage2)}
## Umumiy talablar

- .jpg yoki .png — telefonda olingan boʻlsa ham boʻladi, lekin eng katta sifatda yuboring.
- Telegramda yuborganda "fayl sifatida" (file) yuboring, oddiy rasm sifatida emas — aks holda sifat yoʻqoladi.
- Rasmda suv belgisi (watermark) boʻlmasin.
- Boshqa turizm kompaniyasining logotipi yoki nomi koʻrinmasin.
- Ekrandan olingan surat (screenshot) boʻlmasin.
- Kuchli filtr qoʻyilgan, qorongʻi yoki xira suratlar yaramaydi.
- Odamlar koʻringan suratlar uchun ularning roziligi boʻlsin.
- Jadvalda yozilgan oʻlcham eng kichik oʻlcham — undan kattaroq boʻlsa yanada yaxshi, kichikroq boʻlsa yaramaydi.

## Qachongacha kerak

Bu ${stage1.length} ta rasmni qachongacha yubora olasiz? Aniq sana yozib yuboring.

Sana kerak, chunki ish rejasi shunga qarab tuziladi. Rasmlar kechiksa sayt oʻrindosh rasmlar bilan
ishga tushadi va keyin almashtiriladi — bu ham normal, faqat oldindan kelishib olganimiz yaxshi.
`;

/* Latin-only assertion (§6.5) — reject any Cyrillic codepoint. */
const cyr = doc.match(/[Ѐ-ӿ]/g);
if (cyr) {
  console.error(`FAIL: output contains Cyrillic characters: ${[...new Set(cyr)].join(' ')}`);
  process.exit(1);
}

mkdirSync(path.join(ROOT, 'analize'), { recursive: true });
writeFileSync(path.join(ROOT, 'analize', 'image-requirements.md'), doc);
console.log(
  `gen-image-requirements: analize/image-requirements.md written — ` +
  `stage 1 = ${stage1.length} photographs, stage 2 = ${stage2.length}. Latin-only assertion passed.`,
);
