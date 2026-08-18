# DEPLOY — Getcar_travel

> **Status: the deploy step is BLOCKED on client question 1 (hosting type).**
> The pipeline in `.github/workflows/deploy.yml` builds, verifies and archives
> `dist/` today. It does not publish until exactly one deploy variant below is
> uncommented. Question 1 is the plan's #1 blocking question for this reason.

---

## ⚠️ STOP — do this BEFORE any DNS or nameserver change

**A naive nameserver switch to Netlify or Cloudflare DELETES THE CLIENT'S EMAIL.**

The plan's own recommendation is to keep the client's paid hosting for email
(`docs/PLAN.md` §8.4). Their corporate mail — `info@…` — almost certainly rides on
the same hosting account that serves the domain. Moving nameservers moves *all* DNS,
including the records that route mail. Client question 1 asks whether corporate mail
runs on that host precisely so this step is never skipped.

This is a checklist, not a paragraph. Tick every box.

- [ ] Ask question 1 and get an explicit answer on corporate email.
- [ ] Export the **complete** current DNS zone before touching anything:
      `dig +noall +answer any getcartravel.uz @8.8.8.8` and the hosting panel's own
      zone export. Save both into `.omc/` or a private note — never into the repo.
- [ ] Record every one of these record types, not just the obvious ones:
      - [ ] `MX` — mail routing. **Losing this loses their email.**
      - [ ] `TXT` / SPF (`v=spf1 …`)
      - [ ] `TXT` DKIM selectors (often `default._domainkey`, `mail._domainkey`)
      - [ ] `TXT` DMARC (`_dmarc`)
      - [ ] `CNAME` for mail (`mail`, `webmail`, `autodiscover`, `autoconfig`)
      - [ ] any `A` record pointing at a mail host
      - [ ] `TXT` verification records (Google Search Console, Yandex Webmaster)
- [ ] **Recreate every record at the new provider BEFORE changing the nameservers.**
- [ ] Lower TTL to 300s at least 24h before the switch, so a mistake is reversible fast.
- [ ] After the switch: send a test email **to** and **from** the company address.
- [ ] Confirm with the client that mail works before closing the task.

If the answer to question 1 is "shared cPanel with FTP", **prefer Variant A below** —
it publishes the site without touching DNS at all, which removes this entire risk.

---

## Variant A — shared cPanel over FTP (no DNS change)

Uncomment the FTP block in `.github/workflows/deploy.yml`. Repo secrets required:
`FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`. Deploys `dist/` to `public_html/`.

Ship an `.htaccess` alongside it:

```apache
# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml
</IfModule>

# Astro's hashed assets are immutable
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 1 year"
  <FilesMatch "^/_astro/">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>

ErrorDocument 404 /404.html

# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

**NO root 302 to /uz/.** `/` is the real language-picker page that carries
`x-default` for the whole site (`docs/PLAN.md` §5). A root redirect would mean that
page is never served, which was the v1/v2 contradiction this plan resolved.

Also verify PHP is not intercepting routes on that host.

## Variant B — VPS over SSH

`rsync -avz --delete dist/ user@host:/var/www/getcar/` plus an nginx block with the
same cache and compression policy and `error_page 404 /404.html;`.

## Variant C — Netlify or Cloudflare Pages (free tier)

Technically the better outcome: free auto-TLS, deploy-on-push, instant rollback, and
a build hook the client can bookmark. Point the apex with `ALIAS`/`ANAME` and `www`
with `CNAME`. **Keep the paid hosting for email** — and do the DNS checklist above
first. Recommend this with reasoning; do not silently override the client's purchase.

---

## Repo settings (BC2 — decided, not deferred)

- [ ] Repository visibility: **PRIVATE.** GitHub auto-disables scheduled workflows
      after 60 days of inactivity **in public repositories only**, and the weekly
      cron is what keeps build-time departure filtering from drifting (§7.3).
      Private also keeps the unfinished site and the Apps Script `/exec` URL
      unreadable. Budget: a weekly cron plus ~10 client commits a month at ~3
      minutes is about **35 minutes against 2,000 free private-repo minutes**.
- [ ] Invite the client as a collaborator once question 9 returns their username.
- [ ] Consider renaming `tour-website` to something client-facing before handover.
- [ ] Repo secrets: `FTP_HOST` / `FTP_USER` / `FTP_PASSWORD` (or the Variant B/C
      equivalents), `FORM_ENDPOINT`, `FORM_TOKEN`. Repo variables: `SITE_URL`,
      `METRICA_ID`.
- [ ] **The Telegram bot token is NOT a repo secret and NOT in `apps-script/Code.gs`.**
      It lives in Apps Script → Project Settings → Script Properties as `TG_TOKEN`
      and `TG_CHAT_ID` (BC3).
