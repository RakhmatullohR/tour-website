# LEAD ENDPOINT — where the leads actually go

> **Status: `functions/api/lead.ts`, a Cloudflare Pages Function on this site's own
> origin.** It replaced `apps-script/Code.gs` on 2026-08-24. The Apps Script, the
> Google Sheet, the notification email and the daily digest are all gone; the old
> runbook (`docs/APPS-SCRIPT.md`) went with them and is recoverable from git.
>
> **The no-JS path is still untested against the new endpoint**; §5 is not optional.

## What it does

One submission goes to exactly one place:

| # | Destination | Role | If it fails |
|---|---|---|---|
| 1 | **Telegram** message | the alert **and** the only copy of the lead | one retry, then a real error to the browser and a `LEAD LOST` line, with the full text, in the Pages log |

Telegram being the only destination is a client decision from 2026-08-24, recorded
in `docs/OPEN-QUESTIONS.md` (B14). What changed on the same day is that **a failure
is now visible**. Under Apps Script it could not be: `ContentService` always
answered HTTP 200 and `submitLead()` never read the body, so a lead that Telegram
refused still showed the visitor a thank-you page. The function answers 502, the
browser reads it, and the visitor gets the error state with direct contact links.

### Why the site's own origin, and not the browser

Sending to `api.telegram.org` straight from the page was never an option, for two
independent reasons — either alone is disqualifying:

- **The bot token would ship in the bundle.** Anyone could take the bot over, post
  into the group and delete messages. A static site has nowhere to hide a secret.
- **`api.telegram.org` is unreachable from many Uzbek networks.** That is why the
  old script carried its own chat-id helper instead of telling anyone to open
  `/getUpdates` in a browser. Cloudflare's edge reaches Telegram; a visitor in
  Tashkent often does not.

## 1. The function

Nothing to deploy separately. `functions/api/lead.ts` is bundled by
`wrangler pages deploy` in the same GitHub Actions run that publishes the site, and
the workflow compiles it first (`wrangler pages functions build`) so a handler that
does not build fails the run **before** anything publishes.

Locally:

```
npm run build
npx wrangler pages dev dist --binding TG_TOKEN=... --binding TG_CHAT_ID=...
curl -X POST localhost:8788/api/lead -H 'Content-Type: application/json' \
     -d '{"form":"lead","locale":"uz","phone":"901234567","name":"Test"}'
```

## 2. Environment variables

**Cloudflare dashboard → Workers & Pages → `getcartravel` → Settings → Environment
variables.** Add both to **Production** (and to Preview if you test there), and use
**Encrypt** — an unencrypted variable is readable by anyone with dashboard access.

| Variable | Value |
|---|---|
| `TG_TOKEN` | bot token from **@BotFather** |
| `TG_CHAT_ID` | numeric id of the group the bot posts into |

No secret is ever written in the repo (BC3). There are no longer any `FORM_ENDPOINT`
or `FORM_TOKEN` GitHub secrets — delete them, they are read by nothing.

> **Changing a variable does not affect the running deployment.** Pages injects
> environment variables at deploy time. After editing them, re-run the workflow (or
> use **Retry deployment**) or the function keeps using the old values.

### Getting `TG_CHAT_ID`

Both of the usual recipes fail here: `api.telegram.org` is unreachable from most
Uzbek networks, so opening `/getUpdates` in a browser times out, and a bot in a
group has **privacy mode on by default**, so @userinfobot never sees a plain message.

The old `logTelegramChatIds()` helper ran on Google's servers to get around this.
The same trick now works from the Pages function's own environment, or from any
machine with a working route to Telegram:

1. Add the bot to the group and make it an administrator.
2. Send `/start@YourBotName` **in the group** — with privacy mode on, a bot only
   receives commands addressed to it, so a plain "salom" may produce no update.
3. `curl https://api.telegram.org/bot<TOKEN>/getUpdates` and read `result[].message.chat.id`.

**Group ids are negative** and supergroup ids begin `-100`. Copy the minus sign.

## 3. Deploy

Unchanged: push to `main`, and `.github/workflows/deploy.yml` runs the gates, builds,
compiles the function and publishes with `wrangler pages deploy dist/`. See
`docs/DEPLOY.md`.

## 4. What replaced the shared token

Nothing, deliberately. `FORM_TOKEN` existed because the old endpoint was a bare
public Google URL that any bot could POST to blind, and the "secret" that guarded it
shipped inside the page. The endpoint is on our own origin now, so the function
checks the `Origin`/`Referer` header instead — a value the browser sets and a page
cannot forge. A header that is **absent** is accepted: some browsers omit `Origin`
on same-origin form posts, and a missing header must never cost a real lead.

The honeypot, the time trap and the phone check are unchanged.

## 5. Prove it works — do not skip

A green build is not evidence. Both paths encode differently, and only one of them
has ever been exercised in production.

**With JavaScript on:** submit the contact form. Expect a Telegram message in the
group and the browser on `/uz/thanks/`.

**With JavaScript off:** disable JS in devtools and submit again. The browser now
performs a native submit and **navigates** to `/api/lead`, and the function answers
`303` to `/uz/thanks/`. This is new: until 2026-08-24 the form posted into a hidden
iframe and the visitor saw nothing at all.

> This path was broken and silent once before: `Code.gs` parsed the body as JSON
> only, while a native submit is always `application/x-www-form-urlencoded`. The
> function reads both — `parseBody()` branches on `Content-Type` — but a bug that
> has already happened once deserves a check, not trust.

**Then break it on purpose.** Set `TG_CHAT_ID` to a wrong value and submit: expect
the error box with the Telegram and WhatsApp links, **not** the thanks page, and a
`LEAD LOST` line in the Pages log. This is the behaviour the whole migration was
for; it is worth seeing once.

Finally, submit rubbish — no phone, or the hidden `website` honeypot filled. Expect
no Telegram message. The honeypot answers `200`; silence toward bots is deliberate.

## 6. Reading the logs

**Workers & Pages → `getcartravel` → Deployments → (a deployment) → Functions**, or
`npx wrangler pages deployment tail --project-name=getcartravel` for live output.

`LEAD LOST` is the line that matters. It carries the full message text, so a lead
that failed can still be recovered by hand for as long as the log is retained —
which is the only recovery path there is.

## Limits worth knowing

- **Free plan: 100,000 function invocations per day**, far above any plausible lead
  volume. Static assets do not count.
- **Each attempt to Telegram is capped at 3.5 s**, two attempts, so the function
  always answers inside the browser's 8 s budget (`SUBMIT_TIMEOUT_MS`). Without
  that cap a Telegram that accepts the connection and never replies would hold the
  request open until Cloudflare killed it — and the visitor would be back in the
  ambiguous case this migration removed.
- **There is no server-side rate limit.** The old 200/day notification cap died with
  the spreadsheet, for the reason in B14: with one destination, capping a send and
  destroying a lead are the same act. If a flood ever reaches the group, Cloudflare
  WAF rate-limiting on `/api/lead` is the place to add one — not the function.
