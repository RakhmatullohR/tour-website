# DEPLOY — Getcar_travel

> **Status: LIVE since 2026-08-20.** `https://getcartravel.uz` serves the site,
> `www` 301s to it, and the lead pipeline carries real submissions. Variant C —
> Cloudflare Pages, published from the GitHub Actions pipeline.
>
> **What actually blocked the launch was none of the DNS work.** The wrangler step
> was added on a branch that was never merged, so `on: push: branches: [main]` never
> fired it; the repo had **zero** Actions secrets; and the account had **zero** Pages
> projects, which `wrangler pages deploy` cannot create for itself. All three were
> silent — the DNS looked wrong, and the DNS was the only part that was fine.
> §2–§4 exist so the next zone does not repeat it.

| Decision | Value | Settled |
|---|---|---|
| Domain | **`getcartravel.uz`** (no hyphen) | 2026-08-19 — registered, not assumed |
| Registrar | AIRNET (`billing.airnet.uz`), registry UZINFOCOM | domain id 9988, holder Rustamov Raxmatillo Rustam Oʻgʻli |
| Host | Cloudflare Pages, free tier | Variant C |
| Publisher | GitHub Actions → `wrangler pages deploy` | not Pages' own Git integration — see §1.2 |
| Corporate mail | **Open.** Client has not decided. | see §5 |
| Inherited DNS | AIRNET default zone — A, 3 CNAME, 1 MX — captured in §1.1 | none of it live; nothing was deleted blind |

---

## 1. Why this shape

### 1.1 The zone as actually found — and what BC17a's checklist means here

The previous revision of this file opened with a checklist headed *"a naive
nameserver switch DELETES THEIR EMAIL"*. That warning was written against
assumption A6 — that the client already owned a domain, already had a site on
shared cPanel, and had `info@…` mail riding on the same host. Moving nameservers
in that world silently destroys MX, SPF, DKIM and DMARC.

**That world did not materialise — but the zone is NOT empty either.** An earlier
revision of this section claimed it was. That was an assumption, and Cloudflare's
scan disproved it. `getcartravel.uz` was registered from scratch on 2026-08-19
(`cctld.uz` returned *"domen mavjud emas"* immediately before purchase), and AIRNET
then provisioned a **default zone automatically**. As scanned on 2026-08-19:

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `getcartravel.uz` | `176.96.243.100` | Proxied |
| CNAME | `ftp` | `getcartravel.uz` | Proxied |
| CNAME | `mail` | `getcartravel.uz` | Proxied |
| CNAME | `www` | `getcartravel.uz` | Proxied |
| MX | `getcartravel.uz` | `getcartravel.uz` prio 0 | DNS only |

This is the registrar's boilerplate, not client configuration, and the distinction
is what matters: `176.96.243.100` is AIRNET shared infrastructure the client does
not use, and the `MX` points at the apex with **no mailbox behind it** — no hosting
was purchased (the AIRNET balance moved 27 500 → 500 so'm, the domain fee alone),
so no mail can be flowing through it. Nothing here is a live service.

So BC17a's conclusion survives — there is no working mail to destroy — but its
*premise* has to be stated correctly: the zone carries records, they were captured
above before anything was changed, and that capture IS the checklist's first step
rather than an exemption from it.

Two of these records need deciding, not just recording:

- **The apex `A`.** Binding the Pages custom domain (§3.1) replaces it. Leave it
  until then; it merely serves an AIRNET page in the interim.
- **The `MX`.** It is inert today and becomes actively misleading once the apex is
  Cloudflare-proxied, because proxied records do not carry SMTP. Delete it when
  §5's mail question is answered — replaced by a real provider's records, or
  removed so mail to `@getcartravel.uz` bounces honestly instead of silently.

`ftp` and `mail` are AIRNET conveniences for hosting that was never bought; they
can be deleted at any time.

The §6 checklist is kept because it becomes live again the moment anyone repoints
a zone carrying records someone actually depends on.

### 1.2 Why we do not use Cloudflare Pages' Git integration

Pages can watch the repo itself and run `npm run build`. It was rejected:

- **It runs `npm run build` and nothing else.** `check:images` and `check` are the
  gates that stop a blank placeholder or a type error from publishing. Pages'
  builder never invokes them, so the pipeline's guarantees would apply to a build
  nobody ships and not to the one visitors see.
- **It splits the secrets.** `SITE_URL` and
  `METRICA_ID` already live in GitHub. Pages' builder needs its own copy, so every
  rotation becomes two edits and drift becomes possible.
- **It hides failures from the client.** The Uzbek `failure()` notice
  (PLAN §8.3) is a GitHub Actions step. A Pages-side build failure produces a
  Cloudflare dashboard entry the client will never open.

Deploying from the existing job keeps one build, one set of gates, one secret
store, and one place a failure is explained in a language the client reads.

---

## 2. One-time provisioning — Cloudflare

1. Create a free account at `dash.cloudflare.com`.
2. **Add a site** → `getcartravel.uz` → **Free** plan. The DNS scan comes back
   with **five records**, not zero: an apex `A`, three `CNAME`s and one `MX`. That
   is AIRNET's default zone, itemised in §1.1. Import all of it. Nothing there is
   a live service, but do not delete anything at this step — §3.1 and §5 decide
   each record deliberately, and a blind delete here is how the one record that
   did matter gets lost.
3. Cloudflare issues **two nameservers** (`*.ns.cloudflare.com`). They are unique
   per account. The pair assigned to this zone on 2026-08-19:

   ```
   darwin.ns.cloudflare.com
   dina.ns.cloudflare.com
   ```

   They replace AIRNET's `dns1.airnet.uz` / `dns2.airnet.uz`. Recorded here so the
   delegation can be re-checked later with `dig +short NS getcartravel.uz` — but if
   you are provisioning a DIFFERENT zone, read your own pair off the screen rather
   than copying these.
4. **Workers & Pages → Create → Pages → Direct Upload.** Name the project
   **`getcartravel`** — it must match `--project-name` in the workflow exactly.
   Upload nothing; the first Actions run supplies the files.

   > `wrangler pages deploy` cannot create a project non-interactively. Skip this
   > and the first run fails with *"project not found"*.

   **Done on 2026-08-20 — via the API, not the dashboard**, because the dashboard
   was not available at the time:

   ```sh
   curl -X POST -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
     --data '{"name":"getcartravel","production_branch":"main"}' \
     "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects"
   ```

   A `Cloudflare Pages → Edit` token is enough for this; it is the same token the
   workflow already needs. Listing first (`GET .../pages/projects`) is worth the one
   extra call — it returned an empty array, which is how "the project was never
   created" was distinguished from "the project exists and auth is wrong".

5. **My Profile → API Tokens → Create Token → Custom.** One permission:
   **Account → Cloudflare Pages → Edit**. Nothing else. Copy the token once — it
   is never shown again.
6. **Account ID** is on the right-hand side of any account page in the dashboard.

## 3. One-time provisioning — AIRNET

Change the nameservers to the two from §2.3:

`billing.airnet.uz` → **Sotib olingan domenlar** → `getcartravel.uz` → the **☰**
menu → DNS / nameserver settings → replace both entries → save.

Propagation for `.uz` is typically minutes, occasionally up to 24 h. Cloudflare
emails when the zone goes active.

Once active, in Cloudflare: **SSL/TLS → Overview → Full (strict)**, and
**Edge Certificates → Always Use HTTPS → On**. That is the Variant A
`RewriteCond %{HTTPS} off` rule, done at the edge.

### 3.1 Attach the domain to the Pages project — DO NOT SKIP

Everything up to here leaves `getcartravel.uz` pointing at **AIRNET's parking
IP**, not at your site — the inherited apex `A` (`176.96.243.100`, §1.1) is still
what answers. Adding the zone to Cloudflare and creating a Pages project are two
unrelated facts: the deployment is reachable only at `getcartravel.pages.dev`
until the hostname is bound to the project.

Binding it **replaces that inherited apex `A`**. Cloudflare will say so and ask to
confirm; accept. If it refuses because the name is occupied, delete the `A` record
in DNS first — it is registrar boilerplate for hosting that was never bought.

Skip this and the failure is quiet in the worst way — the Actions run is green,
wrangler reports a successful upload, and every one of the 46 pages ships a
canonical, hreflang, `x-default`, OG url, JSON-LD and sitemap entry pointing at an
origin that serves an error page.

**Workers & Pages → `getcartravel` → Custom domains → Set up a custom domain →
`getcartravel.uz`.** Cloudflare creates the record and issues the certificate;
wait for status **Active**.

Then decide `www`. The canonical is the apex, so `www` must not serve a second
copy of the site:

Note the starting position: the inherited zone already carries a proxied
`CNAME www → getcartravel.uz` (§1.1). Left alone, `www` therefore follows the apex
straight to Pages and serves a **second, fully working copy** of the site under a
hostname the canonical does not point at. Doing nothing is not the neutral option
here — it is the duplicate-content option.

- **Recommended:** add `www.getcartravel.uz` as a second custom domain, then a
  Redirect Rule sending `www.getcartravel.uz/*` to `https://getcartravel.uz/$1`
  with a 301. Visitors who type `www` land on the canonical host.
- **Or:** delete the inherited `www` CNAME outright, so `www.getcartravel.uz`
  stops resolving. Honest, and no duplicate — but anyone typing `www` out of habit
  gets an error page.

**CHOSEN 2026-08-20: the Redirect Rule ALONE, with no second custom domain.**

Correct the prediction above while recording it. Once the apex became a CNAME to
Pages, `www` did not serve a duplicate — it returned **522**, because the inherited
proxied `CNAME www → getcartravel.uz` sent Cloudflare back to Cloudflare and no
origin was ever reached. "Doing nothing" was not the duplicate-content option here;
it was the broken-hostname option.

The rule is Cloudflare's own *Redirect from WWW to root* template. It runs at the
edge before any origin fetch, so it fixes the 522 without the second custom domain
the bullet above assumed was necessary. Adding that domain would only have created
a duplicate for the rule to intercept. The rule-only shape also fails closed: if
someone disables it, `www` breaks visibly rather than quietly serving a second copy
of the site under a hostname the canonical does not point at.

Verified: `/uz/tours/` → `301 https://getcartravel.uz/uz/tours/` and `/?a=1` →
`301 https://getcartravel.uz/?a=1`, so both the path and the query survive.

**Expect HTTPS to fail for a while first.** Observed on this zone: minutes after
activation the apex answered `http://` with 200 while `https://` returned *"no
alternative certificate subject name matches"*. That is Cloudflare's Universal SSL
still being issued, not a misconfiguration — it clears on its own, typically within
the hour. Do not "fix" it by turning SSL/TLS down to Flexible; that ships a site
that is encrypted to the visitor and plaintext behind the edge.

> **A TLS-intercepting network makes this check lie.** On the office connection
> here every `https://` probe failed with *"self-signed certificate in certificate
> chain"* and an issuer of `CN=asakabank.chek` — a corporate proxy re-signing
> traffic, not a Cloudflare problem, and indistinguishable from one if you stop at
> the error string. `curl -k` gets past it for the status-code checks, but it means
> **the certificate itself cannot be verified from such a machine at all.** Check
> the padlock from a phone on mobile data instead.

Verify before calling the launch done — a green pipeline is not evidence. Do not
hardcode the asset hash: it changes every build, and the example that used to sit
here (`i18n.B_Jk2V-Z.css`) had already gone stale.

```sh
dig +short A getcartravel.uz                     # Cloudflare IPs, not 176.96.243.100
curl -sI https://getcartravel.uz/    | head -1   # 200
curl -sI https://getcartravel.uz/nope/ | head -1 # 404, not 200
curl -sI https://www.getcartravel.uz/uz/tours/   # 301 to the apex, path preserved
A=$(basename "$(ls dist/_astro/*.css | head -1)")
curl -sI "https://getcartravel.uz/_astro/$A" | grep -i cache-control
# must read exactly: public, max-age=31536000, immutable
# if it reads "…immutable, public, max-age=0, must-revalidate" then a `_headers`
# rule overlaps /_astro/* and Cloudflare comma-joined them — see public/_headers

# THE ONE THAT MATTERS MOST — a site that ships without this collects nothing:
curl -s https://getcartravel.uz/uz/contacts/ | grep -o 'data-endpoint="[^"]*"'
```

**Measured 2026-08-20, all passing:** apex `188.114.96.11 / 188.114.97.11` ·
`/` `/uz/` `/ru/` 200 · `/nope/` 404 · `http://` 301 to `https://` ·
`www` 301 with path and query preserved · `/_astro/*`
`public, max-age=31536000, immutable` with no comma-joined second value ·
`/uz/` `public, max-age=0, must-revalidate` · `nosniff` and
`strict-origin-when-cross-origin` on every response · `data-endpoint` populated.

## 4. One-time provisioning — GitHub

Repo → Settings → Secrets and variables → Actions:

| Kind | Stored as | Reaches the build as | Value |
|---|---|---|---|
| Secret | `CLOUDFLARE_API_TOKEN` | — | from §2.5 |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | — | from §2.6 |
| Variable | `SITE_URL` | `SITE_URL` | `https://getcartravel.uz` |
| Variable | `METRICA_ID` | `METRICA_ID` | Yandex Metrica counter (blank ⇒ no tracker, no banner) |

The middle column is not decoration. `src/config/site.ts` reads `LEAD_ENDPOINT`,
`LEAD_TOKEN` and `METRICA_ID`; the workflow's Build step maps the differently
named secrets onto them. It previously exported `PUBLIC_FORM_ENDPOINT` and
friends — names **nothing in the tree reads** — so the build was green while
`LEAD_ENDPOINT` fell back to `''` and every lead form rendered with a bare
`data-endpoint` attribute. The site looked finished and collected nothing.
Verified fixed: a build with `LEAD_ENDPOINT` set now emits
`data-endpoint="https://script.google.com/…/exec"` into the contact page.

`SITE_URL` is belt-and-braces: `astro.config.mjs` falls back to the same origin.
The fallback uses `||`, not `??`, because an **unset GitHub variable expands to
the empty string** — `'' ?? default` is `''`, which would have shipped originless
canonicals site-wide while the build stayed green.

Then: **Actions → Build and deploy → Run workflow**, or push to `main`.

### What ships alongside the HTML

`public/_headers` is copied verbatim into `dist/` and read by Pages. It sets
`immutable` on `/_astro/*` (content-hashed, so the bytes behind a URL cannot
change) and `max-age=0, must-revalidate` on everything else, so a client who
publishes a tour sees it on the next refresh.

There is deliberately **no `_redirects` file**. `/` is the real language-picker
page carrying `x-default` for the whole site (PLAN §5); a root redirect to `/uz/`
would mean it is never served. Compression, HTTP→HTTPS and serving `/404.html`
with a 404 status are all automatic on Pages — `dist/404.html` is the bilingual
root 404 from BC10.

---

## 5. Corporate mail — open, and safe to defer

The client has not decided whether they want `info@getcartravel.uz`. Deferring
costs nothing: MX, SPF, DKIM and DMARC are **additions** to a zone we already
control, and adding them does not touch the records that serve the site.

When the answer arrives: Zoho Mail and Yandex 360 both have free tiers that fit an
agency of this size. Add their records in Cloudflare DNS, then send a test message
in **both** directions before telling the client it works.

## 6. The record-and-recreate checklist — for the next time a live zone moves

Its *first* step — capture the zone before changing anything — DID apply to the
`getcartravel.uz` launch and was performed: the inherited AIRNET zone is recorded
in §1.1. Its recreate-before-switching steps did not, because none of those
records fronted a live service (§1.1). The full checklist applies to any future
repoint of a zone carrying records someone depends on.

- [ ] Export the complete zone before touching anything:
      `dig +noall +answer any <domain> @8.8.8.8`, plus the panel's own zone export.
      Save outside the repo.
- [ ] Record every type, not just the obvious ones: `MX`; `TXT` SPF; `TXT` DKIM
      selectors (`default._domainkey`, `mail._domainkey`); `TXT` DMARC (`_dmarc`);
      `CNAME` for `mail` / `webmail` / `autodiscover` / `autoconfig`; any `A`
      pointing at a mail host; Search Console and Webmaster verification `TXT`s.
- [ ] Recreate every record at the new provider **before** changing nameservers.
- [ ] Drop TTL to 300 s at least 24 h ahead, so a mistake is reversible fast.
- [ ] After the switch, send test mail **to** and **from** the company address.
- [ ] Confirm with the client that mail works before closing the task.

## 7. Variants not taken

Recorded for the record; not carried in the workflow as commented YAML, because
dead code in a pipeline is a trap.

- **Variant A — shared cPanel over FTP.** `SamKirkland/FTP-Deploy-Action`,
  `dist/` → `public_html/`, plus an `.htaccess` doing compression, far-future
  cache on `/_astro/*`, `ErrorDocument 404 /404.html` and force-HTTPS. Its one
  real advantage — it publishes without touching DNS — was worth having only
  while the zone carried the client's mail. It does not.
- **Variant B — VPS over SSH.** `rsync -avz --delete dist/ user@host:/var/www/`
  plus an nginx block with the same cache and compression policy and
  `error_page 404 /404.html;`. Most control, most ongoing maintenance, and a TLS
  renewal the client would own.

---

## 8. Repo settings (BC2 — decided, not deferred)

- [ ] Repository visibility: **PRIVATE.** GitHub auto-disables scheduled workflows
      after 60 days of inactivity **in public repositories only**, and the weekly
      cron is what keeps build-time departure filtering from drifting (§7.3).
      Private also keeps the unfinished site and the Apps Script `/exec` URL
      unreadable. Budget: a weekly cron plus ~10 client commits a month at ~3
      minutes is about **35 minutes against 2,000 free private-repo minutes**.
- [ ] Invite the client as a collaborator once question 9 returns their username.
- [ ] Consider renaming `tour-website` to something client-facing before handover.
- [ ] **The Telegram bot token is NOT a repo secret and NOT in the tracked tree.**
      It is an encrypted Cloudflare Pages environment variable (`docs/LEAD-ENDPOINT.md` §2).
      It lives in Apps Script → Project Settings → Script Properties as `TG_TOKEN`
      and `TG_CHAT_ID` (BC3).
