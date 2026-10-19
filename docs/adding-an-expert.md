# Admitting and adding an expert

## 1. Admission checklist

- [ ] The candidate is registered in the Austrian list of court experts
      (Gerichtssachverständigenliste) as a sworn and court-certified expert
      in a field of digital forensics. Check the entry on JustizOnline and
      note the list number and the exact field names and numbers.
- [ ] All current experts of the network consent to the admission
      (in writing, e.g. by approving the pull request that adds the profile).
- [ ] The candidate has signed the cooperation agreement.
- [ ] The candidate has a GitHub account and has been added to the
      repository (later: the organisation) with write access.
- [ ] Portrait: the candidate provides a portrait and confirms the right to
      publish it (photographer's permission, if applicable).
- [ ] Legal notice and privacy policy are updated: the new expert is added
      as media owner / service provider and as joint controller for
      enquiries to contact@dfxa.at. These are shared pages and need the
      approval of all experts.
- [ ] Mail forwarding: contact@dfxa.at also forwards to the new expert's
      mailbox (see `docs/dns.md`).

## 2. Creating the profile

```sh
hugo new content experts/<given-name>-<family-name>
```

This creates `content/experts/<slug>/index.de.md` and `index.en.md` from
`archetypes/experts/`. Then:

1. Fill in the front matter in **both** files. Fields:

   | Field | Notes |
   | --- | --- |
   | `title` | Full name with academic titles, e.g. `DI Johann Stockinger` |
   | `slug` | Lowercase `given-family`; identical in both languages |
   | `description` | ≤ 155 characters, in the language of the file |
   | `weight` | Order by surname (10, 20, 30, …) |
   | `honorific_prefix`, `given_name`, `family_name` | Used for sorting, contact buttons and structured data |
   | `role` | Wording of the court list, in sentence case (DE: grammatical gender as appropriate) |
   | `court_certification` | `list_number`, `url` (JustizOnline entry), `fields` (`number`, `name`; EN file also `official_name` in German) |
   | `other_certifications` | List of `name`, optional `issuer`, optional `url` |
   | `address` | Business address; shown only in the legal notice and stored only here |
   | `languages` | Working languages as codes (`de`, `en`); each needs an i18n key `lang_<code>` |
   | `email`, `phone` | Optional; contact@dfxa.at is always shown |
   | `website`, `same_as` | Own website; further profiles (LinkedIn, ORCID, Google Scholar, GitHub) |
   | `services` | Keys of `content/services/<key>/` |
   | `audiences` | `courts`, `prosecution-police`, `lawyers`, `companies`, `authorities` |
   | `domains` | Keys of `content/domains/<key>/` |

2. Write the body in both languages: the main areas in full sentences, then
   a short professional background. No references to cases or clients, no
   testimonials, statistics or superlatives.
3. Add the portrait as `content/experts/<slug>/portrait.jpg` (or `.png`).
   Hugo converts it to WebP in several sizes.
4. Add the bundle to `.github/CODEOWNERS`:
   `/content/experts/<slug>/  @<new-expert> @<other experts>`.
5. Run `hugo server` and `node scripts/check-language-parity.mjs`, then open
   a pull request.
