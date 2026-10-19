// Browser test of the service finder: no-JS fallback, filters, search,
// URL state, keyboard use, no third-party requests.
const { chromium } = require('playwright');
// Usage: hugo && node scripts/test-finder.cjs   (npm ci installs the dependencies)
const path = require('node:path');
const { start } = require('./serve.cjs');
let base;
const visible = (page) => page.$$eval('[data-service]', els => els.filter(e => !e.hidden && e.offsetParent !== null).map(e => e.dataset.service));
(async () => {
  const srv = await start(path.resolve(__dirname, '..', 'public'));
  base = srv.url;
  const b = await chromium.launch();
  let ok = true; const check = (name, cond, info) => { console.log((cond ? 'PASS ' : 'FAIL ') + name + (info ? ' ' + JSON.stringify(info) : '')); ok = ok && cond; };

  // No JS: full list, form hidden
  const ctxNo = await b.newContext({ javaScriptEnabled: false });
  const p0 = await ctxNo.newPage();
  await p0.goto(base + '/leistungen/?domain=cryptoassets');
  check('no-js: all 9 services visible', (await visible(p0)).length === 9);
  check('no-js: form hidden', !(await p0.isVisible('.finder__form')));

  const page = await b.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (/Content Security Policy|Refused to/i.test(m.text())) errors.push('CSP: ' + m.text()); });
  const ext = []; page.on('request', r => { if (!r.url().startsWith(base)) ext.push(r.url()); });

  await page.goto(base + '/leistungen/');
  await page.waitForFunction(() => document.querySelector('.finder__count')?.textContent);
  check('js: form shown, 9 visible', (await visible(page)).length === 9);
  check('js: count text', (await page.textContent('.finder__count')) === '9 Leistungen gefunden.', await page.textContent('.finder__count'));

  await page.goto(base + '/leistungen/?domain=cryptoassets&audience=companies');
  await page.waitForFunction(() => document.querySelector('.finder__count')?.textContent);
  let v = await visible(page);
  check('url state: cryptoassets+companies', JSON.stringify(v.sort()) === JSON.stringify(['cryptoasset-tracing','defi-smart-contract-analysis']), v);
  check('url state: checkboxes set', await page.isChecked('input[value=cryptoassets]') && await page.isChecked('input[value=companies]'));
  check('empty domain groups hidden', !(await page.isVisible('section[data-domain=malware]')));

  await page.click('button[type=reset]');
  await page.waitForTimeout(50);
  check('reset: 9 visible, clean URL', (await visible(page)).length === 9 && !page.url().includes('?'), page.url());

  await page.fill('#finder-q', 'kryptowahrung');
  await page.waitForTimeout(50);
  v = await visible(page);
  check('search without umlaut', v.length >= 1 && v.every(s => ['cryptoasset-tracing','dark-web-market-analysis','defi-smart-contract-analysis'].includes(s)), v);
  check('search in URL', page.url().includes('q=kryptowahrung'), page.url());

  await page.fill('#finder-q', 'stockinger ransomware');
  await page.waitForTimeout(50);
  v = await visible(page);
  check('search by expert name + term', JSON.stringify(v.sort()) === JSON.stringify(['incident-response','malware-analysis']), v);

  await page.fill('#finder-q', 'xyzxyz');
  await page.waitForTimeout(50);
  check('no results message', await page.isVisible('.finder__none') && (await visible(page)).length === 0);

  await page.goto(base + '/en/services/?audience=courts&q=forensic');
  await page.waitForFunction(() => document.querySelector('.finder__count')?.textContent);
  v = await visible(page);
  check('EN: courts + "forensic"', v.length > 0, v);
  check('EN count text', /services? found\.$/.test(await page.textContent('.finder__count')), await page.textContent('.finder__count'));

  // Keyboard: tab into checkbox and toggle with space
  await page.goto(base + '/en/services/');
  await page.waitForFunction(() => document.querySelector('.finder__count')?.textContent);
  await page.focus('input[value=lawyers]');
  await page.keyboard.press('Space');
  await page.waitForTimeout(50);
  check('keyboard toggles filter', page.url().includes('audience=lawyers'), page.url());

  // Home search form leads to finder with q
  await page.goto(base + '/');
  await page.fill('#home-q', 'malware');
  await Promise.all([page.waitForNavigation(), page.click('.home-search button')]);
  await page.waitForFunction(() => document.querySelector('.finder__count')?.textContent);
  v = await visible(page);
  check('home search -> finder filtered', v.includes('malware-analysis') && v.length < 9, v);

  check('no JS errors or CSP violations', errors.length === 0, errors);
  check('no external requests', ext.length === 0, ext);
  await b.close();
  srv.server.close();
  process.exit(ok ? 0 : 1);
})();
