# DNS checklist for dfxa.at, dfxa.eu and dfxa.org

All three domains are registered with Cloudflare and their DNS zones are
managed in the Cloudflare dashboard. Responsible: the domain holder,
**Johann Stockinger**. Hosting and redirects are described in
`docs/cloudflare.md`; this list covers the DNS records and mail.

Record values for Email Routing checked against the Cloudflare documentation
source on 16 October 2026; Cloudflare creates most of them itself.

## 1. Before changing DNS

- [ ] Export or screenshot the existing records of all three zones, so that
      they can be restored if needed.
- [ ] Remove records that conflict with the setup below: existing `A`,
      `AAAA` or `CNAME` records for `dfxa.at`, `www.dfxa.at`, `dfxa.eu`,
      `www.dfxa.eu`, `dfxa.org`, `www.dfxa.org` (e.g. a parking page), and
      existing `MX` records of `dfxa.at` if mail is moved to Email Routing.
- [ ] Do not create wildcard records (`*.dfxa.at`).

## 2. dfxa.at – website

| Host | Type | Value | Proxy |
| --- | --- | --- | --- |
| `dfxa.at` | (created by the Worker custom domain) | Worker `dfxa` | proxied |
| `www` | AAAA | `100::` | proxied (only so that the redirect rule applies) |

- [ ] The custom domain `dfxa.at` is attached to the Worker `dfxa` (by the
      first deployment or in the dashboard, see `docs/cloudflare.md`,
      section 3); Cloudflare creates the DNS record and the certificate.
- [ ] `www` record created and the redirect rule `www.dfxa.at` → `dfxa.at`
      active.
- [ ] If CAA records exist, they must allow the certificate authorities that
      Cloudflare uses (simplest: no CAA records, or let Cloudflare manage
      them).

## 3. dfxa.eu and dfxa.org – redirect only

In each zone:

| Host | Type | Value | Proxy |
| --- | --- | --- | --- |
| `@` | AAAA | `100::` | proxied |
| `www` | AAAA | `100::` | proxied |
| `@` | TXT | `v=spf1 -all` | – (these domains send no mail) |
| `_dmarc` | TXT | `v=DMARC1; p=reject` | – |

- [ ] Records created; redirect rules to `https://dfxa.at/` active
      (`docs/cloudflare.md`, section 3).

## 4. dfxa.at – mail (Cloudflare Email Routing)

`contact@dfxa.at` is a forwarding address: each enquiry is delivered to both
experts' own mailboxes by the Email Worker `dfxa-mail-forwarder`
(`docs/cloudflare.md`, section 6); there is no shared mailbox (see the
privacy policy).

When Email Routing is enabled for `dfxa.at`, Cloudflare adds these records
(accept them in the dashboard):

| Host | Type | Value |
| --- | --- | --- |
| `@` | MX | three `*.mx.cloudflare.net` hosts with the priorities shown in the dashboard |
| `@` | TXT | `v=spf1 include:_spf.mx.cloudflare.net ~all` |

Add yourself:

| Host | Type | Value |
| --- | --- | --- |
| `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:<report address>` – start with `p=none`, tighten to `p=quarantine` after checking the reports for a few weeks |

Notes so that forwarded mail and replies are not marked as spam:

- **Forwarding:** Email Routing rewrites the envelope sender when forwarding
  (SRS), so SPF checks at the experts' mail servers refer to Cloudflare, not
  to the original sender.
- **Replies:** the experts answer enquiries from their **own** addresses
  (they accept engagements in their own name). The SPF/DMARC records of
  `dfxa.at` therefore only need to cover Cloudflare. Do not send mail *as*
  `contact@dfxa.at` from other servers unless they are added to the SPF
  record and sign with DKIM for `dfxa.at`.
- **Existing mail:** if `dfxa.at` already receives mail elsewhere, Email
  Routing replaces those MX records; move any other addresses first.

- [ ] Test: send an enquiry from an external address (e.g. Gmail) to
      `contact@dfxa.at`; check that it arrives in **both** mailboxes and that
      the headers show `spf=pass` (or `arc=pass`) and `dmarc=pass`.

## 5. Final checks

- [ ] `https://dfxa.at` shows the site with a valid certificate.
- [ ] `http://dfxa.at` → `https://dfxa.at/` (Always Use HTTPS).
- [ ] `https://www.dfxa.at/x/` → `https://dfxa.at/x/` (301).
- [ ] `https://dfxa.eu`, `https://www.dfxa.eu`, `https://dfxa.org`,
      `https://www.dfxa.org` → `https://dfxa.at/` (301).
- [ ] `curl -sI https://dfxa.at/` shows the `Content-Security-Policy` and
      `Strict-Transport-Security` headers.
- [ ] The Worker's `workers.dev` address is disabled (`"workers_dev": false`).
