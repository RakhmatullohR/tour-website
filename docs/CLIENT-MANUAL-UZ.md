# Getcar Travel — sayt boshqaruvi qoʻllanmasi

Bu hujjat sayt egasi uchun. Dasturchi bilimi talab qilinmaydi.
Hamma ish brauzerda, GitHub saytida bajariladi.

> **Eng muhim qoida:** yangi tur qoʻshayotganda **hech qachon noldan yozmang**.
> Mavjud turni **nusxa koʻchiring** va faqat kerakli joylarini oʻzgartiring.

---

## 1. Sayt qanday ishlaydi

Sayt oddiy saytlardan farq qiladi: unda admin panel yoki maʼlumotlar bazasi yoʻq.
Har bir tur — bu bitta **fayl**. Siz faylni oʻzgartirasiz, sayt esa **2–3 daqiqada**
oʻzini qayta yigʻadi va yangilanadi.

Buning foydasi:
- sayt juda tez ishlaydi (telefonda ham);
- buzib kirish uchun hech narsa yoʻq — parol va baza yoʻq;
- xato qilsangiz, **eski versiya saytda qolib turadi** — sayt hech qachon "oʻchmaydi".

---

## 2. Birinchi marta: GitHub'ga kirish

1. Dasturchi sizni loyihaga **hamkor (collaborator)** qilib qoʻshadi. Emailingizga
   taklif keladi — uni qabul qiling.
2. `github.com` saytiga kiring.
3. Loyiha nomini oching. Turlar shu papkada: `src/content/tours/`

> Repozitoriy **yopiq (private)**. Uni sizdan va dasturchidan boshqa hech kim
> koʻrmaydi.

---

## 3. Yangi tur qoʻshish

1. `src/content/tours/` papkasini oching.
2. Oʻzingizga **eng oʻxshash** turni tanlang (masalan yangi Turkiya turi qoʻshsangiz —
   `turkiya-antalya-7-kun.json`).
3. Faylni oching → oʻng yuqorida **`...`** tugmasi → **Copy raw file**.
4. Papkaga qayting → **Add file** → **Create new file**.
5. Fayl nomini yozing. Qoidalar:
   - faqat **kichik lotin harflari**, raqam va **chiziqcha**;
   - oxirida `.json`;
   - oʻzbekcha harflar (`oʻ`, `gʻ`, `ʼ`), boʻsh joy va bosh harf **boʻlmaydi**.
   - Toʻgʻri: `turkiya-kemer-5-kun.json`
   - Notoʻgʻri: `Turkiya Kemer.json`, `turkiya_kemer.JSON`
6. Nusxa olingan matnni ichiga qoʻying va oʻzgartiring (pastdagi jadvalga qarang).
7. Pastda **Commit changes** tugmasini bosing.
8. 2–3 daqiqa kuting — tur saytda paydo boʻladi.

### Nimani oʻzgartirish kerak

| Maydon | Nima yoziladi | Eslatma |
|---|---|---|
| `id` | takrorlanmas belgi, masalan `tr-kemer-5n` | boshqa turlarnikidan farq qilsin |
| `slug` | **fayl nomi bilan bir xil**, `.json`siz | saytdagi manzil shundan yasaladi |
| `status` | `published` — saytda koʻrinadi<br>`draft` — saytda **koʻrinmaydi** | tayyor boʻlmasa `draft` qoldiring |
| `featured` | `true` — bosh sahifada chiqadi | 6 tadan koʻp qilmang |
| `order` | tartib raqami (10, 20, 30...) | kichik raqam yuqorida turadi |
| `country` | `TR` `AE` `TH` `EG` `MY` `UZ` | faqat shu 6 tasi |
| `category` | `beach` `excursion` `family` `pilgrimage` `shopping` `domestic` | faqat shu 6 tasi |
| `duration` | `days` — kun, `nights` — kecha | |
| `price.amount` | narx, **faqat raqam** | `6200000` ✅ `6 200 000 soʻm` ❌ |
| `price.currency` | `UZS` yoki `USD` | |
| `price.oldAmount` | eski narx (chegirma uchun) | **yangi narxdan katta boʻlishi shart** |
| `flightIncluded` | `false` — aviabilet kirmaydi<br>`true` — kiradi | pastdagi ogohlantirishni oʻqing |
| `departures` | joʻnash sanalari: `"2026-09-05"` | shu tartibda: yil-oy-kun |
| `images.cover` | rasm fayl nomi | rasm avval yuborilgan boʻlishi kerak |
| `i18n.uz` / `i18n.ru` | oʻzbekcha va ruscha matnlar | ikkalasi ham toʻldirilsin |

> ⚠️ **`flightIncluded` `false` boʻlsa**, `priceNote` maydonini **ikkala tilda ham**
> toʻldirish shart (masalan: `"Narxga aviabilet kirmaydi."`). Boʻsh qoldirsangiz sayt
> yigʻilmaydi — bu ataylab shunday qilingan: narx koʻrsatilib, aviabilet haqida hech
> narsa yozilmasa, mijoz bilan janjal chiqadi.

---

## 4. Narxni oʻzgartirish

Eng koʻp bajariladigan ish. Faylni oching → **qalam belgisi** (Edit) → `price` ichidagi
`amount` raqamini oʻzgartiring → **Commit changes**.

> **Narx faqat bitta joyda** — `price` ichida. Tillar ichiga (`i18n`) narx yozmang.
> Aks holda oʻzbekcha va ruscha narx bir-biridan farq qilib qolishi mumkin.

Chegirma qilmoqchi boʻlsangiz:
```
"price": { "amount": 5500000, "currency": "UZS", "per": "person", "oldAmount": 6200000 }
```
Sayt eski narxni chizib tashlaydi va **chegirma foizini oʻzi hisoblaydi**.

---

## 5. Turni vaqtincha yashirish

Oʻchirmang. `"status": "published"` ni `"status": "draft"` ga oʻzgartiring.
Tur saytdan yoʻqoladi, lekin maʼlumot saqlanib qoladi — keyin qaytarish oson.

---

## 6. Rasm qoʻshish

1. Rasm **oʻlchami** `analize/image-requirements.md` faylida yozilgan — undan kichik
   boʻlmasin.
2. `src/assets/images/` papkasini oching → **Add file** → **Upload files**.
3. **Fayl nomi hujjatdagi nom bilan bir xil boʻlishi shart.** Masalan
   `tour-turkiya-antalya-cover-1200x800.webp`. Nom toʻgʻri boʻlsa, saytda hech narsa
   oʻzgartirmasdan yangi rasm chiqadi.

> ❗ **Internetdan rasm olmang.** Google'dan yoki boshqa sayt'dan olingan rasm uchun
> mualliflik huquqi boʻyicha jarima kelishi mumkin. Faqat **oʻzingiz suratga olgan**
> rasmlarni ishlating.

---

## 7. Xato qilsam nima boʻladi?

Xavotir olmang. Tizim shunday qurilgan:

1. Siz oʻzgartirish saqlaysiz.
2. Sayt oʻzini qayta yigʻishga urinadi.
3. **Agar xato boʻlsa — yigʻilmaydi va saytda ESKI, ishlaydigan versiya qoladi.**
4. GitHub'da oʻzgartirishingiz yonida **qizil ✗** belgisi chiqadi. Uni bosing —
   qaysi faylda va nima xato ekani yozilgan boʻladi.

Eng koʻp uchraydigan xatolar:

| Belgi | Sabab | Yechim |
|---|---|---|
| Qizil ✗, "Unexpected token" | vergul yoki qavs tushib qolgan | oxirgi oʻzgartirishni tekshiring |
| Qizil ✗, `priceNote` haqida | `flightIncluded: false`, lekin izoh yozilmagan | ikkala tilga ham izoh yozing |
| Qizil ✗, `oldAmount` haqida | eski narx yangisidan kichik | eski narxni kattaroq qiling |
| Tur saytda chiqmayapti | `status` `draft` boʻlib qolgan | `published` qiling |
| Rasm chiqmayapti | fayl nomi mos emas | nomni harfma-harf tekshiring |

Hal qilolmasangiz — dasturchiga yozing. **Sayt ishlashda davom etadi.**

---

## 8. Arizalar qayerga tushadi

Saytdagi har bir forma (4 ta joyda: bosh sahifa, tur sahifasi, kontaktlar, pastdagi
tugma) **faqat bitta joyga** — kompaniyaning ichki **Telegram chatiga** tushadi.

Ilgari ariza yana ikkita joyga borardi: Google Sheets jadvaliga va emailga. **2026-yil
24-avgustda ular sizning koʻrsatmangiz bilan olib tashlandi.** Endi qaraydigan joyingiz
bitta — Telegram guruhi.

> **Buni bilib qoʻying.** Arizaning boshqa nusxasi yoʻq. Telegram xabari kelmasa —
> masalan bot guruhdan chiqarilsa, tokeni almashtirilsa yoki Telegram vaqtincha
> ishlamasa — **ariza butunlay yoʻqoladi**. Mijoz esa saytda "yuborildi" degan yozuvni
> koʻrgan boʻladi, chunki sayt javobni kutmaydi.
>
> Bitta yaxshi yangilik ham bor: 24-avgustdan beri xabar yetib bormasa, **mijoz buni
> koʻradi** — unga xatolik haqida yozuv va Telegram/WhatsApp havolalari chiqadi.
> Ilgari unday emas edi: mijoz "yuborildi" degan yozuvni koʻrardi.
>
> Shuning uchun ikkita oddiy qoida:
> 1. Botni guruhdan chiqarmang va tokenini almashtirmang. Zarur boʻlsa — avval
>    dasturchiga ayting.
> 2. Bir necha kun umuman ariza kelmasa, buni "mijoz yoʻq" deb emas, **"tekshirish
>    kerak"** deb tushuning: saytdagi formani oʻzingiz toʻldirib, xabar chatga
>    kelishini sinab koʻring.

Eski jadval oʻchirilmadi — unda 24-avgustgacha kelgan arizalar saqlanib turibdi.

---

## 9. Nimani oʻzgartirmaslik kerak

Bu fayllarga tegmang — ular saytning ishlashini taʼminlaydi:

- `src/pages/`, `src/components/`, `src/layouts/`, `src/lib/`, `src/styles/`
- `astro.config.mjs`, `package.json`, `src/content.config.ts`
- `.github/` papkasi

Siz faqat shu joylarda ishlaysiz:
- `src/content/tours/` — turlar
- `src/content/destinations/` — davlatlar
- `src/content/reviews/` — sharhlar
- `src/content/promotions/` — aksiyalar
- `src/assets/images/` — rasmlar

---

## 10. Sharhlar (reviews)

Sharh fayllarida `"real": false` deb turadi — bunday sharh **saytda chiqmaydi**.

Haqiqiy mijoz sharh yozgandan keyin:
1. `src/content/reviews/` papkasida `_TEMPLATE.json` dan nusxa oling;
2. matnni yozing;
3. `"real"` ni `true` qiling.

Kamida **3 ta** haqiqiy sharh boʻlgandan keyin bosh sahifada "Mijozlar fikri" bloki
paydo boʻladi. Undan kam boʻlsa — ijtimoiy tarmoq havolalari koʻrinadi.

> Sharhlarni **oʻzingiz toʻqib yozmang**. Yolgʻon sharh ishonchni yoʻqotadi va uni
> mijozlar tez sezadi.

---

## 11. Qisqacha eslatma

| Nima qilmoqchisiz | Qayerga borasiz |
|---|---|
| Narxni oʻzgartirish | `src/content/tours/<tur>.json` → `price.amount` |
| Yangi tur | mavjud turdan nusxa → yangi fayl |
| Turni yashirish | `status` → `draft` |
| Sanalarni yangilash | `departures` roʻyxati |
| Rasm almashtirish | `src/assets/images/` ga **xuddi shu nom** bilan yuklash |
| Aksiya | `src/content/promotions/` |
| Sharh chiqarish | `reviews/` → `"real": true` |

**Har qanday oʻzgartirish 2–3 daqiqada saytda koʻrinadi.**
