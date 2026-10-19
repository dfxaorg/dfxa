# Data file `services.json`

The site publishes a machine-readable list of all services and the experts
who offer them, in both languages:

- German: <https://dfxa.at/services.json>
- English: <https://dfxa.at/en/services.json>

The file is generated at build time by `layouts/home.services.json` from the
expert profiles and the taxonomy term pages; it is never edited by hand. The
service finder (`/leistungen/`, `/en/services/`) uses it for client-side
filtering. It is also intended for search engines and AI assistants.

## Structure

| Key | Type | Content |
| --- | --- | --- |
| `name` | string | "Digital Forensics Austria – Network of Independent Experts" |
| `language` | string | `de` or `en` |
| `url` | string | Home page of this language |
| `contact` | string | `contact@dfxa.at` |
| `contact_note` | string | Note on how enquiries to the contact address are handled |
| `disclaimer` | string | The network's liability disclaimer |
| `domains[]` | array | `id`, `title`, `description`, `url` |
| `audiences[]` | array | `id`, `title`, `url` |
| `services[]` | array | `id`, `title`, `description`, `keywords[]`, `url`, `domain` (domain `id`), `audiences[]` (audience `id`s), `experts[]` (expert `id`s, alphabetical by surname) |
| `experts[]` | array | `id`, `name` (with academic titles), `given_name`, `family_name`, `url` (profile page), `court_certification_url` (JustizOnline entry), `services[]` (service `id`s), `contact` |

`id` values are language-independent and identical in both files. They are
also used in the service finder's query string, e.g.
`/leistungen/?audience=lawyers&domain=cryptoassets&q=bitcoin`.

## Notes

- Experts are listed alphabetically by surname, never by any ranking.
- Engagements are accepted only by the individual experts in their own name;
  the network is not a contracting party (see `disclaimer`).
