# Hosting on Cloudflare

The site is a static Hugo build served by a **Cloudflare Worker with static
assets** (`wrangler.jsonc`), built and deployed by **Cloudflare Workers
Builds** (Git integration with the GitHub repository `dfxaorg/dfxa`). The
domains `dfxa.at`, `dfxa.eu` and `dfxa.org` are registered with and managed
in Cloudflare. Mail to `contact@dfxa.at` is handled by **Cloudflare Email
Routing** and the Email Worker `dfxa-mail-forwarder`, which is managed in the
Cloudflare dashboard, not in this repository (section 6).

Checked against the Cloudflare documentation source
(`cloudflare/cloudflare-docs`) on 16 October 2026. Menu names in the
dashboard change from time to time; the links in each section point to the
current documentation.

## 1. How a change goes live

1. A pull request against `main` runs the GitHub Actions checks
   (`.github/workflows/ci.yml`): language parity, Hugo build, SEO check,
   internal link check, accessibility (axe) and Content-Security-Policy
   check, service finder test. Branch protection requires them, plus the
   other expert's approval (`docs/repository-setup.md`).
2. Workers Builds builds every pushed branch. For branches other than `main`
   it uploads a **preview** to `https://dev.dfxa.at` (section 3a), marked
   `X-Robots-Tag: noindex` and behind Cloudflare Access, without changing
   the live site. Previews may contain draft text (`TODO`).
3. After merging, Workers Builds builds `main` with
   `sh scripts/build-cloudflare.sh` and deploys it to `dfxa.at`. The build
   fails, and nothing is deployed, if the language parity check, the Hugo
   build or the SEO check fails. The deploy command runs the TODO guard (no
   `TODO` in published files) before `wrangler deploy`, so every production
   deployment is guarded, even with a wrongly configured production branch.

## 2. Create the Worker and connect the repository

Documentation: <https://developers.cloudflare.com/workers/ci-cd/builds/>

- [ ] Cloudflare dashboard → Workers & Pages → Create → Import a repository →
      GitHub → install the Cloudflare GitHub app for the organisation
      `dfxaorg` (repository `dfxa` only) → select `dfxaorg/dfxa`.
- [ ] Project settings:

  | Setting | Value |
  | --- | --- |
  | Worker name | `dfxa` (must match `name` in `wrangler.jsonc`) |
  | Production branch | `main` (check this: Cloudflare proposes the repository's default branch) |
  | Build command | `sh scripts/build-cloudflare.sh` |
  | Deploy command | `sh scripts/check-no-todo.sh && npx wrangler deploy` |
  | Preview command | `npx wrangler preview --name dev` |
  | Root directory | `/` |

- [ ] Build variables (Settings → Build → Variables and secrets):

  | Variable | Value | Purpose |
  | --- | --- | --- |
  | `HUGO_VERSION` | `0.166.0` | The build image ships an older Hugo by default |
  | `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` | `1` | Browser tests run in GitHub Actions, not in Workers Builds |

- [ ] Settings → Build → Branch control: enable preview builds for
      non-production branches (needed for `dev.dfxa.at`, section 3a).

## 3. Custom domain and redirects

Documentation: <https://developers.cloudflare.com/workers/configuration/routing/custom-domains/>,
<https://developers.cloudflare.com/rules/url-forwarding/>

- [ ] `dfxa.at` is attached to the Worker by `wrangler.jsonc`
      (`"routes": [{ "pattern": "dfxa.at", "custom_domain": true }]`); the
      first deployment creates the DNS record and the certificate. Remove
      any existing `A`/`AAAA`/`CNAME` record for `dfxa.at` first. If the
      first deployment fails because the build token may not create the
      custom domain, add `dfxa.at` in the dashboard instead (Worker →
      Settings → Domains & Routes → Add → Custom domain); the entry in
      `wrangler.jsonc` then matches the existing domain.
- [ ] `www.dfxa.at` → `https://dfxa.at` (zone `dfxa.at`):
  - DNS: proxied record for `www` (e.g. `AAAA www 100::`, proxied/orange cloud),
    so that Cloudflare receives the requests.
  - Rules → Redirect Rules → create: wildcard pattern
    `http*://www.dfxa.at/*` → `https://dfxa.at/${2}`, status 301,
    preserve query string.
- [ ] `dfxa.eu` and `dfxa.org` → `https://dfxa.at` (in each zone):
  - DNS: proxied records for `@` and `www` (e.g. `AAAA @ 100::` and
    `AAAA www 100::`, proxied).
  - Redirect Rule: `http*://dfxa.eu/*` → `https://dfxa.at/${2}` and
    `http*://www.dfxa.eu/*` → `https://dfxa.at/${2}`, status 301, preserve
    query string (same for `dfxa.org`). Alternatively one account-level
    Bulk Redirect list with all four source hostnames.
- [ ] `/de/` → `/` is handled by `static/_redirects`.

## 3a. Previews on dev.dfxa.at

Documentation: <https://developers.cloudflare.com/workers/previews/custom-domains/>,
<https://developers.cloudflare.com/workers/configuration/cloudflare-access/>

Previews are served by the same Worker on `<preview name>.dfxa.at`. The
preview command names the preview `dev`, so the latest push to any branch
other than `main` is at `https://dev.dfxa.at` (it also appears as
`dev-dfxa.<account>.workers.dev`). Previews skip the TODO guard and show
draft text, including the legal notice and privacy policy, so only the
experts may open them.

- [ ] **Access first**, before the first preview build: Worker `dfxa` →
      Access → Protect this Worker behind Access → **Previews only** →
      policy: emails of both experts (login by one-time PIN). The live site
      `dfxa.at` stays public.
- [ ] Domain for previews: `wrangler.jsonc` sets `"previews_enabled": true`
      on `dfxa.at`; it takes effect with the first production deployment.
      Until launch, add it in the dashboard instead: Worker → Domains → Add
      Domain → `dfxa.at`, Enable for **Preview** (this does not make
      `dfxa.at` live). Cloudflare creates a wildcard record `*.dfxa.at` and
      its certificate; existing records such as `www` take precedence.
- [ ] Check: `https://dev.dfxa.at` asks for the Access login; after login,
      the Network tab shows `X-Robots-Tag: noindex` (custom domain
      previews, unlike `workers.dev`, do not add it themselves).

## 4. Zone settings (privacy and no third-party content)

The site must not load third-party resources, set cookies or run analytics.
Some Cloudflare features inject scripts or set cookies; check that they are
**off** for `dfxa.at` (and leave them off for `dfxa.eu`/`dfxa.org`):

- [ ] Web Analytics / Real User Monitoring (RUM): no automatic setup and no
      beacon for `dfxa.at`.
- [ ] Scrape Shield → **Email Address Obfuscation**: off. The site already
      obfuscates addresses itself; Cloudflare's feature would inject a script
      (blocked by the site's Content-Security-Policy) and rewrite the links.
- [ ] Speed → **Rocket Loader**: off.
- [ ] Security → **Bot Fight Mode** / JavaScript challenges: off (they can
      inject scripts and set the `__cf_bm` cookie).
- [ ] Zaraz: not enabled.
- [ ] SSL/TLS: mode Full (strict), **Always Use HTTPS** on, minimum TLS 1.2.
      HSTS is sent by the site itself (`static/_headers`); enable HSTS in the
      dashboard only if all subdomains are served over HTTPS.

After launch, verify in the browser developer tools (Network tab, Cookies)
that no request leaves `dfxa.at` and no cookie is set.

## 5. Response headers

`static/_headers` sets a strict Content-Security-Policy (only same-origin
scripts, plus the hash of the one-line inline script in
`layouts/_partials/head.html`), HSTS, `X-Content-Type-Options`,
`Referrer-Policy`, `Permissions-Policy` and the content types of the
Markdown and `llms.txt` files. If the inline script changes, update its hash:

```sh
printf '%s' 'document.documentElement.classList.add("js")' | openssl dgst -sha256 -binary | base64
```

`npm run check:a11y` reports any CSP violation on any page.

## 6. Mail: contact@dfxa.at

Documentation: <https://developers.cloudflare.com/email-service/>

An Email Routing rule can forward to only one destination; to deliver each
enquiry to both experts, the rule for `contact@dfxa.at` sends mail to the
Email Worker `dfxa-mail-forwarder`, which forwards it to both experts' own
mailboxes. The Worker is independent of the website: it is edited in the
dashboard (Workers & Pages → `dfxa-mail-forwarder`) and not deployed from
this repository.

- [x] Email Routing enabled for `dfxa.at`; MX, SPF and DKIM records present
      (see `docs/dns.md`).
- [x] Rule `contact@dfxa.at` → **Send to a Worker** → `dfxa-mail-forwarder`.
- [ ] Destination addresses: both experts' mailboxes added; each expert must
      confirm the verification email (Email Routing → Destination
      addresses). Forwarding to an unverified address fails.
- [x] Catch-all disabled: mail to other addresses is rejected.
- [ ] Test (see `docs/dns.md`, section 4).
