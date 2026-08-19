# APPS SCRIPT — where the leads actually go

> **Status: written, not deployed.** `apps-script/Code.gs` is complete. Until it is
> deployed and `FORM_ENDPOINT` is set, every form on the site renders, validates,
> shows its success state — and delivers nothing. The site looks finished and
> collects nothing, which is the single worst failure mode this project has.

## What it does once deployed

One submission fans out to three places, in a deliberate order (`Code.gs`, §9.3):

| # | Destination | Role | If it fails |
|---|---|---|---|
| 1 | **Google Sheet** row | the record of truth | the only failure returned to the browser, because a retry is then genuinely correct |
| 2 | **Telegram** message | primary alert — this is what the manager actually watches | recorded in the row's `status` cell, never thrown |
| 3 | **Email** | secondary alert, quota-guarded | recorded in the row's `status` cell, never thrown |

Plus a **daily digest email** (BC19). Its real job is not the count — it is making a
*silent* Telegram outage visible, since Telegram is both the primary alert and the
failure escape hatch the site's error state points at.

Telegram is optional at first. With `TG_TOKEN` unset the row is still appended, the
email still sends, and the row is marked `tg_unconfigured`. Start without it if you
want leads flowing today.

---

## ⚠️ Whose Google account — decide before step 1

**The client's. From day one.** Not the developer's.

`Code.gs` is deployed as *Execute as: Me*. "Me" is whoever owns the deployment. If
that is the developer:

- every lead flows through a freelancer's personal Google account indefinitely,
- the client's customer data lives in an account the client cannot access,
- and handover means redeploying under the client's account — **which changes the
  `/exec` URL**, so the site must be rebuilt and redeployed to match.

Doing it in the client's account now costs one extra login. Doing it later costs a
migration. (PLAN §9.3, Q8, R9.)

---

## 1. Sheet and script

1. In the **client's** Google account, create a spreadsheet — name it
   `Getcar Travel — Leads`.
2. **Extensions → Apps Script.** Delete the stub `myFunction`.
3. Paste the whole of `apps-script/Code.gs`. Save.

The script is bound to that spreadsheet, so `SHEET_ID` can stay unset. The `Leads`
sheet and its header row are created automatically on the first submission.

## 2. Script Properties

**Project Settings → Script Properties → Add script property.** No secret ever goes
in the code file (BC3) — that is why these live here.

| Property | Value | Required |
|---|---|---|
| `FORM_TOKEN` | any long random string, e.g. `gt-7f3a91c2b8e4` | yes |
| `NOTIFY_EMAIL` | the address alerts and the digest go to | yes |
| `TG_TOKEN` | bot token from **@BotFather** | optional |
| `TG_CHAT_ID` | numeric chat id the bot posts into | optional |
| `SHEET_ID` | only if the script is NOT bound to the sheet | no |

`FORM_TOKEN` must match the GitHub secret of the same name in step 4, character for
character. It is a **bot filter, not authentication** — it ships in the page and we
do not pretend otherwise (§9.5).

### Telegram, if you want it

1. Message **@BotFather** → `/newbot` → copy the token → `TG_TOKEN`.
2. Create a group or channel, add the bot as an administrator.
3. Get the numeric id: message **@userinfobot** in the group, or open
   `https://api.telegram.org/bot<TOKEN>/getUpdates` after posting once in the group.
   Group ids are negative — keep the minus sign.

## 3. Deploy as a Web App

**Deploy → New deployment → type: Web app.**

| Field | Value |
|---|---|
| Execute as | **Me** (the client's account — see the warning above) |
| Who has access | **Anyone** |

"Anyone" is required: the site posts from a visitor's browser with no Google login.
It is acceptable because the endpoint is **write-only by design** — `doGet` returns
a bare `{ok:true}` and nothing about stored leads (§9.6).

Authorise when prompted. Google will warn that the app is unverified — that is
normal for a private Apps Script; continue via **Advanced → Go to (project)**.

Copy the **Web app URL**. It ends in `/exec`. That is `FORM_ENDPOINT`.

> Re-deploying under **Manage deployments → edit → Version: New version** keeps the
> same `/exec` URL. Creating a *new deployment* mints a different URL and silently
> orphans the site. Always edit the existing one.

## 4. Wire it into the site

Repo → Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `FORM_ENDPOINT` | the `/exec` URL from step 3 |
| `FORM_TOKEN` | the same string as the Script Property |

The workflow maps these onto `LEAD_ENDPOINT` and `LEAD_TOKEN`, which is what
`config/site.ts` reads — see `docs/DEPLOY.md` §4 for why the names differ.

Then re-run the workflow. **The endpoint is baked in at build time**, so a static
site that was built without it will keep collecting nothing until it is rebuilt.

## 5. The daily digest trigger

**Triggers → Add Trigger:** function `dailyDigest`, event source *Time-driven*,
type *Day timer*, time *20:00–21:00*.

Skip this and a Telegram outage is invisible: Gmail is quota-gated and nobody
watches a spreadsheet.

---

## 6. Prove it works — do not skip

A green build is not evidence. Test both paths, because they encode differently and
only one of them was ever exercised.

**With JavaScript on:** submit the contact form. Expect a new row in the sheet, a
Telegram message, an email, and the browser to land on `/uz/thanks/`.

**With JavaScript off:** disable JS in devtools, submit again. The browser performs
a native submit into the hidden `gt-lead-sink` iframe.

> This path was broken until 2026-08-19 and failed **silently**, twice over:
> `Code.gs` parsed the body as JSON only, while a native submit is always
> `application/x-www-form-urlencoded`; and the shared token lived only in the
> `data-token` attribute, which a native submit cannot send. Both are fixed —
> `parseBody_` accepts either encoding, and the form emits a hidden `token` field.
> Test it anyway. A silent failure that has already happened once deserves a check,
> not trust.

**Check the `status` column** on both rows. Anything other than `ok` names the leg
that failed: `tg_failed`, `mail_skipped_quota`, `tg_unconfigured`.

Finally, submit rubbish — a body with no phone, or with the hidden `website`
honeypot filled. Expect **no row**, and a `200` either way. Silence toward bots is
deliberate.

---

## Quotas worth knowing before launch

- **Consumer Gmail sends ~100 recipients/day.** `Code.gs` refuses to send below 20
  remaining, so a spam burst cannot starve real leads of their alert. The row is
  still written and marked `mail_skipped_quota`.
- **Notifications are capped at 200/day**, counted independently of row appends.
  Spam can fill the sheet; it can never mute the client.
- Telegram has no Google quota, which is exactly why it is the primary leg.

## Still open

- **B1** — the §9.4 CORS assumption has never been tested against a real `/exec`.
  The code is written so the answer does not change the UX (`submitLead()`
  resolves-or-times-out and never reads the response body), but step 6 is the first
  time it is actually exercised. Watch the browser console on the JS test.
- **B2** — no lead has ever been submitted end to end. Step 6 closes it.
