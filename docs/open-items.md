# Open items before launch

Status: 14 October 2026. `scripts/list-todos.sh` lists all `TODO` markers
in the repository. The production deployment refuses to publish while any
built file still contains `TODO` (`scripts/check-no-todo.sh` in the Workers
Builds deploy command, `docs/cloudflare.md`); previews may show drafts.

## Bernhard Haslhofer

- [ ] Background paragraph (DE and EN) and portrait: to be taken from
      bernhardhaslhofer.info once the session environment allows network
      access to that host, then confirmed by Bernhard Haslhofer.

## Johann Stockinger

Court data and profile details are to be taken from JustizOnline (W383379)
and stockinger.io once network access to these hosts is allowed, and
confirmed by Johann Stockinger in the PR review.

- [ ] Court certification (JustizOnline entry W383379): official name of
      field 68.60, any restrictions ("Nur für …") and the "Zertifiziert bis"
      dates of 68.60 and 68.62.
- [ ] Issuing body of the Certified Fraud Investigator (CFI) certification.
- [ ] Working languages and audiences (currently: German, English; all five
      audiences).
- [ ] Background paragraph (DE and EN) and portrait.
- [x] Mail forwarding provider: Cloudflare Email Routing (decided 16 October
      2026).
- [ ] Own mailbox addresses of both experts as forwarding targets: set in
      `dfxa-mail-forwarder`; destination address still to be verified by
      Bernhard Haslhofer.
- [x] robots.txt policy confirmed (all crawlers allowed, 16 October 2026).
- [ ] Cloudflare setup (`docs/cloudflare.md`) and DNS records (`docs/dns.md`).
- [ ] Approve the shared pages (home, about, legal notice, privacy) – required
      for all shared pages by the cooperation agreement.

## Legal review

Reviewed by both experts themselves; they remove the `TODO: legal review`
markers in the pull request once the texts are approved.

- [ ] Legal notice (whole text), including whether VAT identification
      numbers must be stated.
- [ ] Privacy policy (whole text), including Cloudflare, Inc.'s address,
      contracting entity, Data Processing Addendum (also for Email Routing)
      and its certification under the EU-US Data Privacy Framework, and the
      address of the Datenschutzbehörde.

## Repository and deployment

- [x] Create the GitHub organisation `dfxaorg` and transfer the repository
      (`dfxaorg/dfxa`).
- [x] Both experts are organisation owners; two-factor authentication
      required.
- [x] Branch `main` created.
- [ ] Set `main` as the default branch (Settings → General).
- [ ] Branch protection and required checks (`build`, `link check`,
      `accessibility`) as in `docs/repository-setup.md`.
- [ ] Connect Workers Builds and Email Routing (`docs/cloudflare.md`).
- [ ] Merge this branch into `main` via a pull request reviewed by the other
      expert; Workers Builds deploys on the push to `main`.
- [ ] Custom domain `dfxa.at`, Always Use HTTPS; redirect rules for
      `www.dfxa.at`, `dfxa.eu`, `dfxa.org`; zone settings without analytics,
      cookies or injected scripts (`docs/cloudflare.md`, `docs/dns.md`).

## After launch

- [ ] Validate structured data and register the site in Google Search
      Console and Bing Webmaster Tools (`docs/seo.md`).
- [ ] Link from the experts' own websites and profiles to their DFXA
      profiles (`docs/seo.md`).

## Acceptance checklist (from the brief)

| Item | Status |
| --- | --- |
| Disclaimer and "Network of Independent Experts" on every page | done |
| No wording presenting the network as a contracting party | done; to be confirmed in the experts' review |
| Court certifications only on profile pages, linked to JustizOnline | done (service-page cards show the court fields, as specified in section 5) |
| No contact form; all contact links to contact@dfxa.at with forwarding note | done |
| No third-party requests | done (tested in Chromium) |
| Everything in German and English; language-parity check in CI | done |
| hreflang, canonical URLs, language switcher point to equivalent pages | done |
| JSON-LD without errors; network never Organization/LocalBusiness | checked by `scripts/check-seo.mjs`; external validation after launch |
| Unique titles and descriptions; sitemap and robots.txt | done |
| llms.txt, llms-full.txt, Markdown alternates with disclaimer | done |
| robots.txt policy for AI training crawlers confirmed by the experts | done |
| Service finder with and without JavaScript; shareable filter URLs | done (`scripts/test-finder.cjs`) |
| Lighthouse mobile ≥ 95; no axe errors | done locally (100 / 0 violations) |
| Link check passes in CI | done locally; CI runs on the first pull request |
| https://dfxa.at with valid certificate; www, dfxa.eu, dfxa.org redirect | open (Cloudflare setup) |
| Branch protection and CODEOWNERS active | CODEOWNERS done; branch protection open |
| All `TODO: verify` items confirmed | open (this list) |
