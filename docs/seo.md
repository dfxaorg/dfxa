# Search engines (SEO) and AI assistants (GEO)

## What the site does automatically

| Item | Where |
| --- | --- |
| `<title>` ≤ 60 characters (`<Page> – DFXA Digital Forensics Austria`, shortened to `<Page> – DFXA` if needed, or `seo_title` in front matter) | `layouts/_partials/head.html` |
| Meta description ≤ 155 characters from `description` in front matter; the build warns if it is missing or too long | `layouts/_partials/head.html` |
| Canonical URL on `https://dfxa.at/…`, `hreflang` de/en/x-default (x-default → German), identical in HTML head and sitemap | `layouts/_partials/hreflang.html`, `layouts/sitemap.xml` |
| Sitemap index `/sitemap.xml` with `/de/sitemap.xml` and `/en/sitemap.xml`; `robots.txt` references it | Hugo, `layouts/robots.txt` |
| Open Graph and Twitter Card tags; one self-hosted Open Graph image per page (title on a neutral background, generated at build time) | `layouts/_partials/og-image.html` |
| JSON-LD: `WebSite` (never `Organization`), `ProfilePage` + `Person` with `hasCredential`, `Service` with the experts as `provider`, `BreadcrumbList`, `FAQPage` | `layouts/_partials/jsonld.html`, `layouts/_partials/jsonld/person.html` |
| Visible breadcrumbs and "last updated" date (Git commit date, also `dateModified`) on profile and service pages | `layouts/_partials/breadcrumbs.html`, `last-updated.html` |
| FAQ section on every service page (front matter `faq`) | `content/services/*/_index.*.md` |
| `/llms.txt`, `/en/llms.txt`, `/llms-full.txt`, `/en/llms-full.txt` | `layouts/home.llms.txt`, `layouts/home.llmsfull.txt` |
| Markdown alternate `index.md` for every profile and service page, linked with `<link rel="alternate" type="text/markdown">` | `layouts/experts/page.markdown.md`, `layouts/services/term.markdown.md` |
| Public data file `/services.json`, `/en/services.json` | `layouts/home.services.json`, `docs/services-json.md` |

`scripts/check-seo.mjs` runs in CI and fails the build on: missing or too
long titles and descriptions, duplicate titles, not exactly one `<h1>`,
missing canonical or hreflang, JSON-LD that does not parse or types the
network as `Organization`/`LocalBusiness`/`ProfessionalService`, missing
Open Graph images, and machine-readable files without the disclaimer.

## robots.txt and AI crawlers

`layouts/robots.txt` allows all crawlers. Each AI crawler has its own block.
To opt out of AI **training** while staying findable in AI search and
answers, change `Allow: /` to `Disallow: /` for the training crawlers
`GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended` and `CCBot`,
and keep `OAI-SearchBot`, `ChatGPT-User`, `Claude-User`, `Claude-SearchBot`,
`PerplexityBot` and `Perplexity-User` allowed.

Decision 2026-10-14: **allow all crawlers**, including training crawlers;
confirmed by both experts (Bernhard Haslhofer, Johann Stockinger) on
16 October 2026.

## After launch (to be done by the experts, not automated)

### Validate structured data

- [ ] Check a profile page, a service page and the home page in both
      languages with the [Schema.org validator](https://validator.schema.org/)
      and Google's [Rich Results Test](https://search.google.com/test/rich-results).
      Expected: no errors; `Person`, `ProfilePage`, `Service`,
      `BreadcrumbList`, `FAQPage`, `WebSite`.

### Search consoles

- [ ] Google Search Console: add the domain property `dfxa.at` (DNS TXT
      verification by the domain holder, Johann Stockinger), submit
      `https://dfxa.at/sitemap.xml`, check that pages in both languages are
      indexed (Pages report) and that hreflang is recognised.
- [ ] Bing Webmaster Tools: add `dfxa.at` (import from Google Search Console
      or DNS verification), submit the sitemap. Several AI assistants use the
      Bing index.

### Links from the experts' own profiles

Each expert links to their DFXA profile page from:

- [ ] own website
- [ ] LinkedIn profile (website / contact info section)
- [ ] university or employer profile, if possible
- [ ] ORCID (Websites & social links) and Google Scholar (homepage field), where applicable

Additional profile URLs (LinkedIn, ORCID, Google Scholar, GitHub) can be
added to `same_as` in the expert's front matter; they then appear in the
`sameAs` of the structured data.

### Not to do

- Do not create a Google Business Profile (or similar business listings) for
  the network: it is not a business, and the experts contract individually.

## Monitoring: answers of AI assistants

Check periodically (e.g. quarterly) how assistants answer typical queries and
record the result below. Queries:

- "court-certified cryptocurrency forensics expert Austria"
- „Gerichtssachverständiger IT-Forensik Wien“
- „Wer erstellt ein Gutachten zu Kryptowährungen in Österreich?“
- "incident response expert witness Vienna"

| Date | Assistant | Query | DFXA / expert mentioned? | Correct (no network-as-company wording)? | Notes |
| --- | --- | --- | --- | --- | --- |
| | | | | | |
