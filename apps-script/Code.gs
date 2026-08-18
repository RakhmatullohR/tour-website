/**
 * Getcar Travel — lead intake Web App.  PLAN §9.3.
 *
 * ┌───────────────────────────────────────────────────────────────────────────┐
 * │ 🔐 NO SECRET IS EVER WRITTEN IN THIS FILE (BC3).                           │
 * │                                                                            │
 * │ Set these in the Apps Script UI, Project Settings > Script Properties:      │
 * │                                                                            │
 * │   TG_TOKEN      Telegram bot token from @BotFather                         │
 * │   TG_CHAT_ID    numeric chat/channel id the bot posts into                 │
 * │   FORM_TOKEN    the shared constant the site sends (a BOT FILTER, not auth) │
 * │   NOTIFY_EMAIL  address the secondary notification and the digest go to     │
 * │   SHEET_ID      (optional) target spreadsheet; defaults to the bound one    │
 * │                                                                            │
 * │ The tracked repository is PRIVATE (BC2) and carries placeholders only.      │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * DEPLOY AS:  Web App - Execute as: Me - Who has access: Anyone
 *
 * WARNING: "Me" MUST BE THE CLIENT'S GOOGLE ACCOUNT FROM DAY ONE (§9.3, Q8, R9).
 *   If it is the developer's, every lead flows through a freelancer's personal
 *   account indefinitely, and handover means redeploying under the client's
 *   account - WHICH CHANGES THE /exec URL and forces a site rebuild + redeploy.
 */

var SHEET_NAME = 'Leads';
var HEADERS = [
  'timestamp', 'form', 'name', 'phone', 'email', 'destination', 'dates', 'pax',
  'tourId', 'tourTitle', 'contactPref', 'message', 'locale', 'page', 'status',
];
/** §9.3 - notification sends are capped INDEPENDENTLY OF ROW APPENDS, so spam can
 *  fill the sheet but can never mute the client's alerts. */
var NOTIFY_DAILY_CAP = 200;

function props_() {
  return PropertiesService.getScriptProperties();
}

function sheet_() {
  var id = props_().getProperty('SHEET_ID');
  var ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

/** Length caps and control-character stripping only. §9.5: THE "reject bodies
 *  containing URLs" RULE IS DROPPED - it silently discarded legitimate enquiries
 *  pasting an Instagram or tour link. */
function clean_(value, max) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[\x00-\x1f\x7f]/g, ' ').trim().slice(0, max || 500);
}

function normalisePhone_(raw) {
  var digits = String(raw || '').replace(/[^\d+]/g, '');
  if (digits.charAt(0) === '+') return digits;
  if (digits.indexOf('998') === 0) return '+' + digits;
  if (digits.length === 9) return '+998' + digits;
  return digits ? '+' + digits : '';
}

/* --------------------------------------------------------------------------
 * doPost - ORDER OF OPERATIONS IS LOAD-BEARING (§9.3).
 *
 *   1. validate + append the row      cheap, no quota, MUST NOT be reachable twice
 *   2. Telegram   (PRIMARY)           no Google quota - isolated try/catch (BC18)
 *   3. email      (SECONDARY)         quota-guarded  - isolated try/catch (BC18)
 *   4. ALWAYS 200 once the row exists
 *
 * BC18 - WHY EACH LEG IS WRAPPED INDIVIDUALLY. A UrlFetchApp throw after the row
 * append used to kill the email fallback AND return an error to the browser, which
 * the user then resubmits against - producing DUPLICATE ROWS for a failure that had
 * nothing to do with their submission. A notification failure is recorded in the
 * row and never propagates.
 * ------------------------------------------------------------------------ */
function doPost(e) {
  var p = props_();
  var row;

  try {
    var data = JSON.parse(e.postData.contents); // text/plain body, §9.4

    // §9.5 shared token - blocks drive-by bots hitting the bare URL. NOT
    // authentication, and this code does not pretend otherwise.
    var expected = p.getProperty('FORM_TOKEN');
    if (expected && data.token !== expected) return ok_(); // silent: a bot learns nothing

    // §9.5 honeypot - accept and discard.
    if (clean_(data.website)) return ok_();

    var phone = normalisePhone_(data.phone);
    if (!/^\+\d{9,15}$/.test(phone)) return ok_(); // §9.1 the one required field

    row = appendRow_(data, phone);
  } catch (err) {
    // The ONLY failure that reaches the caller: the row could not be written, so
    // there is nothing to notify about and a retry is genuinely the right answer.
    return error_(err);
  }

  var notify = underNotifyCap_();

  // ---- 2. PRIMARY notification: Telegram. Isolated (BC18). ----
  try {
    if (notify) {
      var token = p.getProperty('TG_TOKEN');
      var chat = p.getProperty('TG_CHAT_ID');
      if (token && chat) {
        UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
          method: 'post',
          contentType: 'application/json',
          payload: JSON.stringify({ chat_id: chat, text: row.text, disable_web_page_preview: true }),
          muteHttpExceptions: false,
        });
      } else {
        markRow_(row, 'tg_unconfigured');
      }
    } else {
      markRow_(row, 'tg_skipped_cap');
    }
  } catch (err) {
    markRow_(row, 'tg_failed: ' + err); // RECORDED, NOT THROWN
  }

  // ---- 3. SECONDARY notification: email, quota-guarded. Isolated (BC18). ----
  try {
    var to = p.getProperty('NOTIFY_EMAIL');
    if (!to) {
      markRow_(row, 'mail_unconfigured');
    } else if (notify && MailApp.getRemainingDailyQuota() > 20) {
      // §9.3 / R7 - consumer Gmail caps at ~100 recipients/day. Without this guard
      // a spammer burns the quota and REAL LEADS STOP BEING EMAILED, SILENTLY.
      MailApp.sendEmail(to, 'Yangi ariza - Getcar Travel', row.text);
    } else {
      markRow_(row, 'mail_skipped_quota');
    }
  } catch (err) {
    markRow_(row, 'mail_failed: ' + err); // RECORDED, NOT THROWN
  }

  return ok_(); // ALWAYS 200 once the row is appended
}

function appendRow_(data, phone) {
  var sh = sheet_();
  var values = [
    new Date(),
    clean_(data.form, 20),
    clean_(data.name, 120),
    phone,
    clean_(data.email, 160),
    clean_(data.destination, 160),
    clean_(data.dates, 40),
    clean_(data.pax, 20),
    clean_(data.tourId, 60),
    clean_(data.tourTitle, 200),
    clean_(data.contactPref, 20),
    clean_(data.message || data.comment, 2000),
    clean_(data.locale, 8),
    clean_(data.page, 300),
    'ok',
  ];
  sh.appendRow(values);

  var text =
    'Yangi ariza (' + values[1] + ')\n' +
    (values[2] ? 'Ism: ' + values[2] + '\n' : '') +
    'Tel: ' + phone + '\n' +
    (values[4] ? 'Email: ' + values[4] + '\n' : '') +
    (values[5] ? 'Yonalish: ' + values[5] + '\n' : '') +
    (values[9] ? 'Tur: ' + values[9] + '\n' : '') +
    (values[6] ? 'Sana: ' + values[6] + '\n' : '') +
    (values[7] ? 'Kishi: ' + values[7] + '\n' : '') +
    (values[10] ? 'Aloqa: ' + values[10] + '\n' : '') +
    (values[11] ? 'Izoh: ' + values[11] + '\n' : '') +
    'Til: ' + values[12] + '  -  ' + values[13];

  return { sheet: sh, rowIndex: sh.getLastRow(), statusCol: HEADERS.length, text: text, notes: [] };
}

/** Appends to the row's `status` cell. This is where a failed notification leg is
 *  recorded instead of being thrown at the visitor (BC18). */
function markRow_(row, note) {
  try {
    row.notes.push(note);
    row.sheet.getRange(row.rowIndex, row.statusCol).setValue(row.notes.join(' | '));
  } catch (err) {
    // Never let the bookkeeping itself break the response.
  }
}

/** §9.3 - a daily counter in a script property. Row appends continue regardless;
 *  only notification SENDS stop at the cap. */
function underNotifyCap_() {
  var p = props_();
  var today = Utilities.formatDate(new Date(), 'Asia/Tashkent', 'yyyy-MM-dd');
  var stamp = p.getProperty('NOTIFY_DAY');
  var count = Number(p.getProperty('NOTIFY_COUNT') || '0');
  if (stamp !== today) {
    count = 0;
    p.setProperty('NOTIFY_DAY', today);
  }
  if (count >= NOTIFY_DAILY_CAP) return false;
  p.setProperty('NOTIFY_COUNT', String(count + 1));
  return true;
}

function ok_() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
function error_(err) {
  return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* --------------------------------------------------------------------------
 * BC19 - THE DAILY DIGEST.
 *
 * Telegram is BOTH the primary alert AND the primary failure escape hatch (the
 * site's form error state surfaces Telegram links). A Telegram outage removes both
 * at once, and neither remaining leg is observed: Gmail is quota-gated and nobody
 * watches a spreadsheet. This one email a day is the ONLY mechanism that would
 * surface a silent Telegram failure. It never approaches the quota.
 *
 * INSTALL: Apps Script UI > Triggers > Add Trigger > dailyDigest > Time-driven >
 *          Day timer > 20:00-21:00.
 * ------------------------------------------------------------------------ */
function dailyDigest() {
  var to = props_().getProperty('NOTIFY_EMAIL');
  if (!to) return;

  var sh = sheet_();
  var last = sh.getLastRow();
  var count = 0;
  var failures = 0;

  if (last > 1) {
    var values = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
    var today = Utilities.formatDate(new Date(), 'Asia/Tashkent', 'yyyy-MM-dd');
    for (var i = 0; i < values.length; i++) {
      var ts = values[i][0];
      if (!ts) continue;
      if (Utilities.formatDate(new Date(ts), 'Asia/Tashkent', 'yyyy-MM-dd') !== today) continue;
      count++;
      if (String(values[i][HEADERS.length - 1]).indexOf('failed') !== -1) failures++;
    }
  }

  var body = 'Bugun ' + count + ' ta ariza.';
  // The digest's real job: making a silent Telegram outage visible.
  if (failures) {
    body += '\n\nDIQQAT: ' + failures + ' ta arizada bildirishnoma yuborilmadi. ' +
            'Jadvaldagi "status" ustuniga qarang.';
  }
  MailApp.sendEmail(to, 'Getcar Travel - kunlik hisobot', body);
}

/** doGet exists only so opening the /exec URL in a browser does not look broken.
 *  It returns nothing about stored leads - the endpoint is WRITE-ONLY BY DESIGN,
 *  which is what makes a public URL acceptable (§9.6). */
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, service: 'getcar-lead-intake' }))
    .setMimeType(ContentService.MimeType.JSON);
}
