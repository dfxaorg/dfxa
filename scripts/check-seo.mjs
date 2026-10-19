#!/usr/bin/env node
// SEO and structured-data checks on the built site (public/). No dependencies.
// Fails (exit 1) on any error:
//  - <title> missing, longer than 60 characters, or not unique per language
//  - meta description missing or longer than 155 characters
//  - not exactly one <h1>
//  - canonical URL missing or not on https://dfxa.at/
//  - translated pages without hreflang de, en and x-default
//  - JSON-LD that does not parse, or that types the network as a company
//    (Organization, ProfessionalService, LocalBusiness, Corporation; allowed
//    only as recognizedBy of a credential, e.g. the issuer of a certificate)
//  - og:image or Markdown alternate pointing to a file that does not exist
//  - llms.txt / llms-full.txt / Markdown alternates without the disclaimer
// Usage: hugo && node scripts/check-seo.mjs

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("../public/", import.meta.url).pathname;
const BASE = "https://dfxa.at/";
const FORBIDDEN = new Set(["Organization", "ProfessionalService", "LocalBusiness", "Corporation"]);
const DISCLAIMER = {
  de: "Digital Forensics Austria ist ein Zusammenschluss unabhängiger Sachverständiger.",
  en: "Digital Forensics Austria is a network of independent experts.",
};
const errors = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const files = walk(root);
const decode = (s) => s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const localFile = (url) => {
  if (!url.startsWith(BASE)) return null;
  let p = join(root, decodeURI(url.slice(BASE.length)));
  if (url.endsWith("/")) p = join(p, "index.html");
  return p;
};

// Collects all @type values, except inside "recognizedBy": the issuer of a
// credential (e.g. GIAC) may be an Organization; the network may not.
function collectTypes(node, out) {
  if (Array.isArray(node)) node.forEach((n) => collectTypes(n, out));
  else if (node && typeof node === "object") {
    if (node["@type"]) [].concat(node["@type"]).forEach((t) => out.add(t));
    for (const [k, v] of Object.entries(node)) if (k !== "recognizedBy") collectTypes(v, out);
  }
}

const titles = { de: new Map(), en: new Map() };
let pages = 0;
for (const file of files.filter((f) => f.endsWith(".html"))) {
  const rel = relative(root, file);
  const html = readFileSync(file, "utf8");
  if (html.includes('http-equiv="refresh"')) continue; // alias redirect
  pages++;
  const lang = (html.match(/<html lang="([a-z]+)"/) || [])[1];
  const is404 = rel.endsWith("404.html");

  const title = decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || "");
  if (!title) err(rel, "missing <title>");
  else if ([...title].length > 60) err(rel, `title longer than 60 characters (${[...title].length}): ${title}`);
  if (title && !is404) {
    if (titles[lang]?.has(title)) err(rel, `duplicate title "${title}" (also ${titles[lang].get(title)})`);
    titles[lang]?.set(title, rel);
  }

  const desc = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "");
  if (!desc) err(rel, "missing meta description");
  else if ([...desc].length > 155) err(rel, `description longer than 155 characters (${[...desc].length})`);

  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) err(rel, `${h1} <h1> elements`);

  if (!is404) {
    const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
    if (!canonical || !canonical.startsWith(BASE)) err(rel, `canonical missing or not on ${BASE}`);
    const hreflangs = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)"/g)].map((m) => m[1]);
    for (const h of ["de", "en", "x-default"]) if (!hreflangs.includes(h)) err(rel, `missing hreflang ${h}`);

    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    if (!blocks.length) err(rel, "no JSON-LD");
    for (const b of blocks) {
      try {
        const data = JSON.parse(b[1]);
        const types = new Set();
        collectTypes(data, types);
        for (const t of types) if (FORBIDDEN.has(t)) err(rel, `JSON-LD uses forbidden type ${t}`);
        if (!types.has("WebSite")) err(rel, "JSON-LD without WebSite");
      } catch (e) {
        err(rel, `JSON-LD does not parse: ${e.message}`);
      }
    }
  }

  const og = (html.match(/<meta property="og:image" content="([^"]+)"/) || [])[1];
  if (!og) err(rel, "missing og:image");
  else if (!existsSync(localFile(og) || "")) err(rel, `og:image not found: ${og}`);

  const md = (html.match(/<link rel="alternate" type="text\/markdown" href="([^"]+)"/) || [])[1];
  if (md && !existsSync(localFile(md) || "")) err(rel, `Markdown alternate not found: ${md}`);
}

for (const [lang, prefix] of [["de", ""], ["en", "en/"]]) {
  for (const f of ["llms.txt", "llms-full.txt"]) {
    const p = join(root, prefix, f);
    if (!existsSync(p)) err(prefix + f, "missing");
    else if (!readFileSync(p, "utf8").includes(DISCLAIMER[lang])) err(prefix + f, "disclaimer missing");
  }
}
for (const file of files.filter((f) => f.endsWith("index.md"))) {
  const rel = relative(root, file);
  const lang = rel.startsWith("en/") ? "en" : "de";
  if (!readFileSync(file, "utf8").includes(DISCLAIMER[lang])) err(rel, "disclaimer missing");
}

if (errors.length) {
  console.error(`SEO check failed (${errors.length}):`);
  errors.forEach((e) => console.error("  - " + e));
  process.exit(1);
}
console.log(`SEO check OK: ${pages} HTML pages, ${files.filter((f) => f.endsWith("index.md")).length} Markdown alternates.`);
