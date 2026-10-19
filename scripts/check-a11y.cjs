#!/usr/bin/env node
// Runs axe-core (WCAG 2.0/2.1 A and AA plus best practices) on every HTML page
// in public/, in light and dark colour scheme at mobile width, and checks that
// no page violates the Content-Security-Policy from public/_headers.
// Exit code 1 if any violation is found.
// Usage: hugo && node scripts/check-a11y.cjs   (npm ci installs the dependencies)
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const { start } = require("./serve.cjs");

const root = path.resolve(__dirname, "..", "public");
const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

function htmlPages(dir) {
  return fs.readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) return htmlPages(p);
    return f.endsWith(".html") ? ["/" + path.relative(root, p).replace(/index\.html$/, "")] : [];
  });
}

(async () => {
  const { server, url } = await start(root);
  // Alias pages (meta refresh redirects) have no content to check.
  const pages = htmlPages(root).filter((p) => !fs.readFileSync(path.join(root, p.endsWith("/") ? p + "index.html" : p), "utf8").includes('http-equiv="refresh"'));
  const browser = await chromium.launch();
  let violations = 0;

  // 1. Every page under the site's Content-Security-Policy (from _headers):
  //    no violations may be reported.
  const strict = await browser.newContext();
  for (const p of pages) {
    const page = await strict.newPage();
    page.on("console", (m) => {
      if (/Content Security Policy|Refused to/i.test(m.text())) { violations++; console.error(`${p}: CSP: ${m.text()}`); }
    });
    await page.goto(url + p);
    await page.waitForTimeout(50);
    await page.close();
  }
  await strict.close();

  // 2. axe in light and dark mode. axe is injected as a script, so CSP is
  //    bypassed in this context only.
  for (const colorScheme of ["light", "dark"]) {
    const context = await browser.newContext({ colorScheme, viewport: { width: 390, height: 844 }, bypassCSP: true });
    for (const p of pages) {
      const page = await context.newPage();
      await page.goto(url + p);
      await page.addScriptTag({ content: axeSource });
      const result = await page.evaluate(() =>
        axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] }));
      for (const v of result.violations) {
        violations++;
        console.error(`${colorScheme} ${p}: ${v.id} (${v.impact}) – ${v.help}`);
        for (const n of v.nodes) console.error(`    ${n.target.join(" ")}`);
      }
      await page.close();
    }
    await context.close();
  }
  await browser.close();
  server.close();
  console.log(`axe and CSP: ${pages.length} pages × 2 colour schemes, ${violations} violation(s).`);
  process.exit(violations ? 1 : 0);
})();
